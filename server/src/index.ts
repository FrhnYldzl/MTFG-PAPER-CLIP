import express from "express";
import { config } from "./config.js";
import { apiRouter } from "./routes/api.js";

const app: express.Express = express();
app.use(express.json());

app.use("/api", apiRouter);

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
});

// Düzgün kapanış
for (const sig of ["SIGINT", "SIGTERM"] as const) {
  process.on(sig, () => {
    console.log(`[server] ${sig} alındı, kapanıyor...`);
    server.close(() => process.exit(0));
  });
}

export { app };
