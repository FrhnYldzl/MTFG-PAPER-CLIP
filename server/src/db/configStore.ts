import { pool } from "./pool.js";

/** config tablosundan değer okur. */
export async function getConfig(key: string): Promise<string | undefined> {
  const { rows } = await pool.query<{ value: string }>(
    "SELECT value FROM config WHERE key = $1",
    [key]
  );
  return rows[0]?.value;
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
