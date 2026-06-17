import pg from "pg";
import { requireDatabaseUrl, config } from "../config.js";

/**
 * Tembel (lazy) PostgreSQL bağlantı havuzu.
 * Havuz ilk kullanımda oluşturulur; böylece modülü içe aktarmak (ör. saf birim
 * testlerde) DATABASE_URL gerektirmez. Çağrı yerleri `pool.query(...)` kullanmaya devam eder.
 */
let _pool: pg.Pool | null = null;

function ensurePool(): pg.Pool {
  if (!_pool) {
    _pool = new pg.Pool({
      connectionString: requireDatabaseUrl(),
      // Railway yönetilen Postgres TLS gerektirir; lokalde gerektirmez.
      ssl:
        config.nodeEnv === "production"
          ? { rejectUnauthorized: false }
          : undefined,
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
