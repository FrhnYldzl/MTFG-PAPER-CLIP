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
  /** İlgili iştirak sadece denetim rolünde mi (icra üretilmez)? */
  audit_only: boolean;
}

/** Bu tetikleyici icra (görev) üretmez mi? audit_only org veya "icra etme" aksiyonu. */
function isNoExecution(trigger: TriggerRow): boolean {
  return trigger.audit_only || (trigger.action?.includes("icra etme") ?? false);
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
  taskId: number | null;
}> {
  const noExec = isNoExecution(trigger);
  const subject = `🔴 ${trigger.org_label} · ${trigger.source ?? "Tetikleyici #" + trigger.id}`;
  const draftBase = trigger.action
    ? `${trigger.action}\n\nGerekçe: ${trigger.red ?? "kırmızı eşik aşıldı"}`
    : (trigger.red ?? "Kırmızı sinyal — aksiyon gerekli.");
  // Denetim rolü: yorum + revizyon önerisi, icra üretilmez.
  const draft = noExec
    ? `Yorum + revizyon önerisi (icra üretilmez):\n${draftBase}`
    : draftBase;

  const notif = await pool.query<{ id: number }>(
    `INSERT INTO notifications (priority, subject, draft_text, trigger_id)
     VALUES ('Yüksek', $1, $2, $3) RETURNING id`,
    [subject, draft, trigger.id]
  );

  // Denetim rolünde (audit_only / "icra etme") görev açılmaz.
  let taskId: number | null = null;
  if (!noExec) {
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
    taskId = task.rows[0]!.id;
  }

  await recordAudit({
    actor: Actor.SYSTEM,
    action: "ESCALATE",
    entity: "trigger",
    entityId: String(trigger.id),
    detail: { notificationId: notif.rows[0]!.id, taskId, noExecution: noExec },
  });

  return { notificationId: notif.rows[0]!.id, taskId };
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
    `SELECT t.id, t.source, t.org_slug, t.org_label, t.function, t.responsible_role,
            t.green, t.yellow, t.red, t.action, t.dashboard,
            COALESCE(o.audit_only, false) AS audit_only
     FROM triggers t
     LEFT JOIN orgs o ON o.slug = t.org_slug
     WHERE t.id = $1 AND t.active = true`,
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
