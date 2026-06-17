import { readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pool, closePool } from "./pool.js";

/**
 * Basit, idempotent SQL migration runner.
 * - migrations/*.sql dosyalarını ada göre sıralı uygular.
 * - schema_migrations tablosunda uygulanmış olanları izler.
 * - Her migration tek transaction içinde çalışır.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
// dist/db/migrate.js -> ../../migrations  (server/migrations)
const migrationsDir = join(__dirname, "..", "..", "migrations");

async function ensureMigrationsTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name       TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

async function appliedMigrations(): Promise<Set<string>> {
  const { rows } = await pool.query<{ name: string }>(
    "SELECT name FROM schema_migrations"
  );
  return new Set(rows.map((r) => r.name));
}

export async function migrate(): Promise<void> {
  await ensureMigrationsTable();
  const applied = await appliedMigrations();

  const files = (await readdir(migrationsDir))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  let count = 0;
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = await readFile(join(migrationsDir, file), "utf8");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [
        file,
      ]);
      await client.query("COMMIT");
      console.log(`[migrate] uygulandı: ${file}`);
      count++;
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(`[migrate] HATA (${file}):`, err);
      throw err;
    } finally {
      client.release();
    }
  }

  console.log(
    count === 0
      ? "[migrate] güncel — uygulanacak yeni migration yok."
      : `[migrate] ${count} migration uygulandı.`
  );
}

// CLI olarak doğrudan çalıştırıldığında
migrate()
  .then(() => closePool())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    return closePool().finally(() => process.exit(1));
  });
