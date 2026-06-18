import { pool } from "./pool.js";

/** config tablosundan değer okur. */
export async function getConfig(key: string): Promise<string | undefined> {
  const { rows } = await pool.query<{ value: string }>(
    "SELECT value FROM config WHERE key = $1",
    [key]
  );
  return rows[0]?.value;
}

/** config tablosuna değer yazar (upsert). */
export async function setConfig(key: string, value: string): Promise<void> {
  await pool.query(
    `INSERT INTO config (key, value, updated_at) VALUES ($1, $2, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [key, value]
  );
}

/** config tablosundan sayısal değer okur (yoksa fallback). */
export async function getConfigInt(
  key: string,
  fallback: number
): Promise<number> {
  const v = await getConfig(key);
  if (v === undefined) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
