import { Actor } from "@paperclip/shared";
import { pool } from "../db/pool.js";
import { recordAudit } from "../db/audit.js";
import { processObservation } from "../engine/signalStore.js";
import { generateWeeklyFocus } from "../engine/focus.js";
import { intakeFromMail } from "../engine/intake.js";

/**
 * RİTİM JOB'LARI (E12) — Günlük / Haftalık / Aylık / Çeyreklik koşular.
 * Scheduler (node-cron) veya CLI (jobs/run.ts) ya da API ile tetiklenir.
 * Hepsi idempotent çalışır.
 */

/** ISO hafta anahtarı, ör. "2026-W25" (saf). */
export function weekKey(d = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((date.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7
    );
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/** Ay anahtarı, ör. "2026-06" (saf). */
export function monthKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Açık görevlerin yaşına göre tetikleyici #22 sinyali (<60g 🟢 · 60-90g 🟡 · ≥90g 🔴). */
export async function taskAgeSweep(): Promise<number> {
  const { rows } = await pool.query<{ id: number; age_days: number }>(
    `SELECT id, EXTRACT(DAY FROM now() - created_at)::int AS age_days
     FROM tasks WHERE status IN ('TASLAK','ACIK')`
  );
  for (const r of rows) {
    await processObservation(
      22,
      { kind: "dayThreshold", days: r.age_days, yellowAt: 60, redAt: 90 },
      `task:${r.id}`
    );
  }
  return rows.length;
}

/** Günlük 08:00 — mail intake + task yaş taraması. */
export async function dailyRun(): Promise<Record<string, number>> {
  const mail = await intakeFromMail();
  const aged = await taskAgeSweep();
  const summary = { mail, agedTasks: aged };
  await recordAudit({ actor: Actor.SYSTEM, action: "JOB_DAILY", detail: summary });
  return summary;
}

/** Haftalık Pzt 08:30 — haftalık odak üretimi. */
export async function weeklyRun(): Promise<Record<string, unknown>> {
  const focus = await generateWeeklyFocus(weekKey());
  await recordAudit({ actor: Actor.SYSTEM, action: "JOB_WEEKLY", detail: { focus } });
  return { focus };
}

/** Aylık 1. gün 09:00 — denetim dönemini işaretle (girdi geldikçe motorlar besler). */
export async function monthlyRun(): Promise<Record<string, string>> {
  const period = monthKey();
  await recordAudit({ actor: Actor.SYSTEM, action: "JOB_MONTHLY", detail: { period } });
  return { period };
}

/** Çeyreklik — task yaş gözden geçirme (genişletilmiş tarama). */
export async function quarterlyRun(): Promise<Record<string, number>> {
  const aged = await taskAgeSweep();
  await recordAudit({ actor: Actor.SYSTEM, action: "JOB_QUARTERLY", detail: { agedTasks: aged } });
  return { agedTasks: aged };
}

export const JOBS = {
  daily: dailyRun,
  weekly: weeklyRun,
  monthly: monthlyRun,
  quarterly: quarterlyRun,
} as const;

export type JobName = keyof typeof JOBS;
