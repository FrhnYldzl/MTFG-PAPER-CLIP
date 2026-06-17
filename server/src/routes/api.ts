import { Router, type Request, type Response } from "express";
import { pool } from "../db/pool.js";
import { listPendingNotifications, approveNotification } from "../engine/governance.js";
import { generateWeeklyFocus } from "../engine/focus.js";
import { intakeFromMail } from "../engine/intake.js";
import { JOBS, type JobName } from "../jobs/jobs.js";

/** v0.2 operasyon API'si — E14 dashboard ve preview bunları tüketir. */
export const apiRouter: Router = Router();

function fail(res: Response, err: unknown, code = 400) {
  res.status(code).json({ error: err instanceof Error ? err.message : String(err) });
}

/** Açık sinyaller (5+1 dashboard şeritleri için). */
apiRouter.get("/signals", async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT s.id, s.ts, s.trigger_id, s.org_slug, s.signal, s.reason,
            s.suggested_action, s.dashboard, s.status, s.entity_key,
            t.org_label, t.source
     FROM signals s JOIN triggers t ON t.id = s.trigger_id
     WHERE s.status = 'OPEN' ORDER BY s.ts DESC`
  );
  res.json(rows);
});

/** Görevler (Odak). status query ile filtrelenebilir. */
apiRouter.get("/tasks", async (req: Request, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : null;
  const { rows } = status
    ? await pool.query("SELECT * FROM tasks WHERE status = $1 ORDER BY id DESC", [status])
    : await pool.query("SELECT * FROM tasks ORDER BY id DESC");
  res.json(rows);
});

/** Bildirim Kutusu — onay bekleyen taslaklar. */
apiRouter.get("/notifications", async (_req, res) => {
  res.json(await listPendingNotifications());
});

/** İştirakler ve tetikleyici kütüğü (referans veriler). */
apiRouter.get("/orgs", async (_req, res) => {
  const { rows } = await pool.query("SELECT * FROM orgs ORDER BY slug");
  res.json(rows);
});
apiRouter.get("/triggers", async (_req, res) => {
  const { rows } = await pool.query("SELECT * FROM triggers ORDER BY id");
  res.json(rows);
});

/** Haftalık odağı üret (idempotent). */
apiRouter.post("/focus/:weekKey", async (req, res) => {
  try {
    res.json(await generateWeeklyFocus(req.params.weekKey));
  } catch (err) {
    fail(res, err);
  }
});

/** Gelen kutusunu tara ve intake et (Gmail readonly). Kimlik yoksa -1 döner. */
apiRouter.post("/intake/mail", async (_req, res) => {
  try {
    const count = await intakeFromMail();
    res.json({ processed: count, configured: count >= 0 });
  } catch (err) {
    fail(res, err, 500);
  }
});

/** Bir ritim job'unu manuel tetikle (daily|weekly|monthly|quarterly). */
apiRouter.post("/jobs/:name", async (req, res) => {
  const name = req.params.name as JobName;
  if (!(name in JOBS)) {
    fail(res, new Error(`Geçersiz job: ${name}`));
    return;
  }
  try {
    res.json(await JOBS[name]());
  } catch (err) {
    fail(res, err, 500);
  }
});

/** Bir taslağı onayla (yalnızca yetkili İNSAN). Body: { approver: "ferhan" } */
apiRouter.post("/notifications/:id/approve", async (req, res) => {
  try {
    const approver = String(req.body?.approver ?? "");
    const result = await approveNotification(Number(req.params.id), approver);
    res.json(result);
  } catch (err) {
    fail(res, err);
  }
});
