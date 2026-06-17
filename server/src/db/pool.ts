import pg from "pg";
import { requireDatabaseUrl } from "../config.js";

/**
 * Tembel (lazy) PostgreSQL bağlantı havuzu.
 * Havuz ilk kullanımda oluşturulur; böylece modülü içe aktarmak (ör. saf birim
 * testlerde) DATABASE_URL gerektirmez. Çağrı yerleri `pool.query(...)` kullanmaya devam eder.
 */
let _pool: pg.Pool | null = null;

/**
 * SSL yalnızca gerektiğinde açılır:
 * - PGSSL=require  → açık
 * - DATABASE_URL içinde sslmode=require → açık
 * - PGSSL=disable veya varsayılan → kapalı (Railway iç bağlantısı SSL istemez)
 */
function sslConfig(): { rejectUnauthorized: boolean } | undefined {
  const url = requireDatabaseUrl();
  if (process.env.PGSSL === "disable") return undefined;
  if (process.env.PGSSL === "require" || /sslmode=require/i.test(url)) {
    return { rejectUnauthorized: false };
  }
  return undefined;
}

function ensurePool(): pg.Pool {
  if (!_pool) {
    _pool = new pg.Pool({
      connectionString: requireDatabaseUrl(),
      ssl: sslConfig(),
    });
  }
  return _pool;
}

export const pool: pg.Pool = new Proxy({} as pg.Pool, {
  get(_target, prop, _receiver) {
    const real = ensurePool() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === "function"
      ? (value as (...a: unknown[]) => unknown).bind(real)
      : value;
  },
});

export async function closePool(): Promise<void> {
  if (_pool) {
    await _pool.end();
    _pool = null;
  }
}
