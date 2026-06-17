import pg from "pg";
import { requireDatabaseUrl, config } from "../config.js";

/** Paylaşılan PostgreSQL bağlantı havuzu. */
export const pool = new pg.Pool({
  connectionString: requireDatabaseUrl(),
  // Railway yönetilen Postgres TLS gerektirir; lokalde gerektirmez.
  ssl:
    config.nodeEnv === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

export async function closePool(): Promise<void> {
  await pool.end();
}
