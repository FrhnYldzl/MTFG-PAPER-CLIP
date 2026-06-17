import express from "express";
import cron from "node-cron";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";
import { apiRouter } from "./routes/api.js";
import { dailyRun, weeklyRun, monthlyRun, quarterlyRun } from "./jobs/jobs.js";

const app: express.Express = express();
app.use(express.json());

/** Health endpoint — Railway healthcheck buraya bakar. */
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "mtfg-paperclip",
    version: "0.3.0",
    phase: "Faz 0+ — Tam Kütük & 5+1 Dashboard",
    time: new Date().toISOString(),
  });
});

// API
app.use("/api", apiRouter);

/**
 * Tek servis: derlenmiş React paneli (ui/dist) sunucudan servis edilir.
 * Böylece Railway'de UI + API aynı origin/serviste çalışır (CORS/iki-servis derdi yok).
 * server/dist/index.js → ../../ui/dist
 */
const __dirname = dirname(fileURLToPath(import.meta.url));
const uiDist = join(__dirname, "..", "..", "ui", "dist");
if (existsSync(uiDist)) {
  app.use(express.static(uiDist));
  // SPA fallback (API/health hariç tüm yollar index.html'e)
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path === "/health") return next();
    res.sendFile(join(uiDist, "index.html"));
  });
  console.log(`[server] UI servis ediliyor: ${uiDist}`);
} else {
  app.get("/", (_req, res) => {
    res.json({
      name: "MTFG Paperclip — Canlı Kalp",
      chain: "RİTİM → RUTİN → TETİKLEYİCİ → SİNYAL → DASHBOARD + ODAK",
      note: "UI build bulunamadı (ui/dist). 'pnpm build' çalıştırın.",
      health: "/health",
    });
  });
}

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
