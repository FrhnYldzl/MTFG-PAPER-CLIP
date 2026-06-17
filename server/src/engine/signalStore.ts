import { Actor, Signal } from "@paperclip/shared";
import { pool } from "../db/pool.js";
import { recordAudit } from "../db/audit.js";
import { evaluate, isCritical, type Observation } from "./signalEngine.js";

interface TriggerRow {
  id: number;
  source: string | null;
  org_slug: string | null;
  org_label: string;
  function: string | null;
  responsible_role: string | null;
  green: string | null;
  yellow: string | null;
  red: string | null;
  action: string | null;
  dashboard: string;
}

/**
 * Sinyali idempotent yazar: bir tetikleyici için aynı gün zaten AÇIK sinyal
 * varsa yeni kayıt eklenmez (partial unique index garantisi).
 * @returns eklenen sinyalin id'si veya null (zaten açık sinyal vardı).
 */
export async function writeSignal(params: {
  triggerId: number;
  orgSlug?: string | null;
  signal: Signal;
  reason?: string;
  suggestedAction?: string;
  dashboard: string;
  /** Olay-bazlı tetikleyiciler için (ör. toplantı id). Yoksa gün+tetikleyici başına tek. */
  entityKey?: string | null;
}): Promise<number | null> {
  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO signals (trigger_id, org_slug, signal, reason, suggested_action, dashboard, entity_key)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (trigger_id, day, COALESCE(entity_key, '')) WHERE status = 'OPEN'
     DO NOTHING
     RETURNING id`,
    [
      params.triggerId,
      params.orgSlug ?? null,
      params.signal,
      params.reason ?? null,
      params.suggestedAction ?? null,
      params.dashboard,
      params.entityKey ?? null,
    ]
  );
  return rows[0]?.id ?? null;
}

/**
 * Kırmızı sinyalde eskalasyon: Bildirim Kutusu'na taslak + Odak'a acil görev.
 * DIŞ GÖNDERİM YOK — taslak İNSAN onayını bekler.
 */
export async function escalate(trigger: TriggerRow): Promise<{
  notificationId: number;
  taskId: number;
}> {
  const subject = `🔴 ${trigger.org_label} · ${trigger.source ?? "Tetikleyici #" + trigger.id}`;
  const draft = trigger.action
    ? `${trigger.action}\n\nGerekçe: ${trigger.red ?? "kırmızı eşik aşıldı"}`
    : (trigger.red ?? "Kırmızı sinyal — aksiyon gerekli.");

  const notif = await pool.query<{ id: number }>(
    `INSERT INTO notifications (priority, subject, draft_text, trigger_id)
     VALUES ('Yüksek', $1, $2, $3) RETURNING id`,
    [subject, draft, trigger.id]
  );

  const task = await pool.query<{ id: number }>(
    `INSERT INTO tasks
       (source, org_slug, function, responsible_role, description,
        expected_output, due_date, signal, trigger_id, status)
     VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE, 'RED', $7, 'ACIK')
     RETURNING id`,
    [
      `Tetikleyici #${trigger.id}`,
      trigger.org_slug,
      trigger.function,
      trigger.responsible_role,
      trigger.action ?? "Acil aksiyon",
      trigger.red ?? "Kırmızı eşik aşıldı",
      trigger.id,
    ]
  );

  await recordAudit({
    actor: Actor.SYSTEM,
    action: "ESCALATE",
    entity: "trigger",
    entityId: String(trigger.id),
    detail: { notificationId: notif.rows[0]!.id, taskId: task.rows[0]!.id },
  });

  return { notificationId: notif.rows[0]!.id, taskId: task.rows[0]!.id };
}

/**
 * Uçtan uca: gözlemi değerlendir → idempotent sinyal yaz → kırmızıysa eskale et.
 */
export async function processObservation(
  triggerId: number,
  obs: Observation,
  entityKey?: string | null
): Promise<{ signal: Signal; signalId: number | null; escalated: boolean }> {
  const { rows } = await pool.query<TriggerRow>(
    `SELECT id, source, org_slug, org_label, function, responsible_role,
            green, yellow, red, action, dashboard
     FROM triggers WHERE id = $1 AND active = true`,
    [triggerId]
  );
  const trigger = rows[0];
  if (!trigger) throw new Error(`Aktif tetikleyici bulunamadı: ${triggerId}`);

  const signal = evaluate(obs);
  const reason =
    signal === Signal.RED
      ? (trigger.red ?? undefined)
      : signal === Signal.YELLOW
        ? (trigger.yellow ?? undefined)
        : (trigger.green ?? undefined);

  const signalId = await writeSignal({
    triggerId: trigger.id,
    orgSlug: trigger.org_slug,
    signal,
    reason: reason ?? undefined,
    suggestedAction: trigger.action ?? undefined,
    dashboard: trigger.dashboard,
    entityKey: entityKey ?? null,
  });

  // Eskalasyon yalnızca yeni KIRMIZI sinyal yazıldıysa (idempotent)
  let escalated = false;
  if (signalId !== null && isCritical(signal)) {
    await escalate(trigger);
    escalated = true;
  }

  return { signal, signalId, escalated };
}
