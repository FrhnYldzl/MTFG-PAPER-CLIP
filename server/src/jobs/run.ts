import { JOBS, type JobName } from "./jobs.js";
import { closePool } from "../db/pool.js";

/**
 * CLI job çalıştırıcı (Railway cron için).
 * Kullanım: node dist/jobs/run.js daily|weekly|monthly|quarterly
 */
const name = process.argv[2] as JobName | undefined;

if (!name || !(name in JOBS)) {
  console.error(`Geçersiz job. Kullanım: run.js <${Object.keys(JOBS).join("|")}>`);
  process.exit(1);
}

JOBS[name]()
  .then((res) => {
    console.log(`[job:${name}]`, JSON.stringify(res));
    return closePool();
  })
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`[job:${name}] HATA:`, err);
    return closePool().finally(() => process.exit(1));
  });
