import express from "express";
import cron from "node-cron";
import { config } from "./config.js";
import { apiRouter } from "./routes/api.js";
import { dailyRun, weeklyRun, monthlyRun, quarterlyRun } from "./jobs/jobs.js";

const app: express.Express = express();
app.use(express.json());

app.use("/api", apiRouter);

/** Scheduler — SCHEDULER_ENABLED=true ise ritimleri kurar (Europe/Istanbul). */
function startScheduler() {
  if (!config.schedulerEnabled) {
    console.log("[scheduler] kapalı (SCHEDULER_ENABLED!=true)");
    return;
  }
  const tz = config.tz;
  const wrap = (name: string, fn: () => Promise<unknown>) => () => {
    fn()
      .then((r) => console.log(`[scheduler:${name}]`, JSON.stringify(r)))
      .catch((e) => console.error(`[scheduler:${name}] HATA:`, e));
  };
  cron.schedule("0 8 * * *", wrap("daily", dailyRun), { timezone: tz });
  cron.schedule("30 8 * * 1", wrap("weekly", weeklyRun), { timezone: tz });
  cron.schedule("0 9 1 * *", wrap("monthly", monthlyRun), { timezone: tz });
  cron.schedule("0 9 1 1,4,7,10 *", wrap("quarterly", quarterlyRun), { timezone: tz });
  console.log(`[scheduler] aktif (tz=${tz}): günlük 08:00 · haftalık Pzt 08:30 · aylık 1. 09:00 · çeyreklik`);
}

/** Health endpoint — Railway healthcheck buraya bakar. */
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "mtfg-paperclip",
    version: "0.2.0",
    phase: "Faz -1 — Üç Motor & Sinyal",
    time: new Date().toISOString(),
  });
});

/** Kök bilgi ucu. */
app.get("/", (_req, res) => {
  res.json({
    name: "MTFG Paperclip — Canlı Kalp",
    chain: "RİTİM → RUTİN → TETİKLEYİCİ → SİNYAL → DASHBOARD + ODAK",
    docs: "/health",
  });
});

const server = app.listen(config.port, () => {
  console.log(
    `[server] MTFG Paperclip ${config.nodeEnv} modunda :${config.port} portunda dinliyor`
  );
  startScheduler();
});

// Düzgün kapanış
for (const sig of ["SIGINT", "SIGTERM"] as const) {
  process.on(sig, () => {
    console.log(`[server] ${sig} alındı, kapanıyor...`);
    server.close(() => process.exit(0));
  });
}

export { app };
