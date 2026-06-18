import { Signal } from "@paperclip/shared";
import { pool } from "../db/pool.js";
import { evaluate } from "./signalEngine.js";
import { processObservation } from "./signalStore.js";
import { fetchRecentMail, type MailSummary } from "../google/gmail.js";
import { googleConfigured } from "../google/auth.js";

/**
 * INTAKE — Mail kanalı (tetikleyici #1)
 *
 * Gelen maile rol atanmadıysa Odak'a TASLAK görev açılır. Atanma süresi:
 * <=24s 🟢 · 24-48s 🟡 · >=48s 🔴. Idempotent (mail id başına tek görev/sinyal).
 * Gmail READONLY; dış gönderim yok.
 */

const TRIGGER_ID = 1;

/** Saf: maile rol atanmadığında geçen saate göre sinyal. */
export function mailSignal(hoursSinceArrival: number, assigned: boolean): Signal {
  if (assigned) return Signal.GREEN;
  return evaluate({ kind: "dayThreshold", days: hoursSinceArrival, yellowAt: 24, redAt: 48 });
}

/** Saf: maili görev açıklamasına çevirir. */
export function mailToTaskDescription(mail: MailSummary): string {
  return `Mail: "${mail.subject || "(konu yok)"}" — ${mail.from} · role ata, çıktı/tarih gir`;
}

function hoursSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 36e5;
}

/** Tek mail için idempotent TASLAK görev + sinyal. */
export async function processMail(mail: MailSummary): Promise<{
  signal: Signal;
  signalId: number | null;
  escalated: boolean;
  taskId: number | null;
}> {
  const source = `Mail:${mail.id}`;
  const existing = await pool.query<{ id: number; status: string }>(
    "SELECT id, status FROM tasks WHERE trigger_id = $1 AND source = $2 LIMIT 1",
    [TRIGGER_ID, source]
  );

  let taskId: number | null = null;
  const assigned = existing.rows[0] ? existing.rows[0].status !== "TASLAK" : false;
  if (!existing.rows[0]) {
    const ins = await pool.query<{ id: number }>(
      `INSERT INTO tasks (source, function, responsible_role, description, trigger_id, status)
       VALUES ($1, 'Operasyon / Intake', 'İcracı Ortak', $2, $3, 'TASLAK')
       RETURNING id`,
      [source, mailToTaskDescription(mail), TRIGGER_ID]
    );
    taskId = ins.rows[0]?.id ?? null;
  }

  const hours = hoursSince(mail.date);
  const obs = assigned
    ? ({ kind: "presence", state: "present" } as const)
    : ({ kind: "dayThreshold", days: hours, yellowAt: 24, redAt: 48 } as const);
  const res = await processObservation(TRIGGER_ID, obs, mail.id);

  return { ...res, taskId };
}

/**
 * Gelen kutusunu tarar, her maili intake eder. Kimlik bilgisi yoksa atlanır.
 * @returns işlenen mail sayısı (kimlik bilgisi yoksa -1).
 */
export async function intakeFromMail(maxResults = 10): Promise<number> {
  if (!(await googleConfigured())) return -1;
  const mails = await fetchRecentMail(maxResults);
  for (const mail of mails) await processMail(mail);
  return mails.length;
}
