import { Actor } from "@paperclip/shared";
import { pool } from "../db/pool.js";
import { recordAudit } from "../db/audit.js";

/**
 * RUTİN KEŞFİ (E16, light)
 * Mail/takvim desenlerinden rutin ADAYLARI üretir (öneri). İNSAN onaylar;
 * onaylanan rutinler sonradan tetikleyiciye dönüştürülebilir. Dış gönderim yok.
 */

/** Saf: gün aralığı ortalamasından frekans tahmini. */
export function estimateFrequency(avgIntervalDays: number): string {
  if (avgIntervalDays <= 1.5) return "günlük";
  if (avgIntervalDays <= 9) return "haftalık";
  if (avgIntervalDays <= 45) return "aylık";
  return "çeyreklik";
}

/** Saf: zaman damgalarından ortalama aralık (gün). En az 2 nokta gerekir. */
export function avgIntervalDays(timestamps: string[]): number | null {
  if (timestamps.length < 2) return null;
  const ms = timestamps.map((t) => new Date(t).getTime()).sort((a, b) => a - b);
  let total = 0;
  for (let i = 1; i < ms.length; i++) total += ms[i] - ms[i - 1];
  return total / (ms.length - 1) / 86400000;
}

/** Bir rutin adayını idempotent kaydeder (desen başına tek). */
export async function suggestRoutine(params: {
  pattern: string;
  source?: string;
  freqEstimate?: string;
}): Promise<number | null> {
  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO routine_suggestions (pattern, source, freq_estimate)
     VALUES ($1, $2, $3)
     ON CONFLICT (pattern) DO NOTHING
     RETURNING id`,
    [params.pattern, params.source ?? null, params.freqEstimate ?? null]
  );
  return rows[0]?.id ?? null;
}

/** Gözlemlenen olaylardan (desen → zaman damgaları) aday üretir. */
export async function discoverRoutines(
  observations: { pattern: string; source?: string; timestamps: string[] }[]
): Promise<number> {
  let created = 0;
  for (const o of observations) {
    const avg = avgIntervalDays(o.timestamps);
    if (avg === null) continue; // tek seferlik → rutin değil
    const id = await suggestRoutine({
      pattern: o.pattern,
      source: o.source,
      freqEstimate: estimateFrequency(avg),
    });
    if (id !== null) created++;
  }
  return created;
}

export interface RoutineRow {
  id: number;
  pattern: string;
  source: string | null;
  freq_estimate: string | null;
  status: string;
  approved_by: string | null;
}

export async function listRoutineSuggestions(): Promise<RoutineRow[]> {
  const { rows } = await pool.query<RoutineRow>(
    "SELECT id, pattern, source, freq_estimate, status, approved_by FROM routine_suggestions ORDER BY detected_at DESC"
  );
  return rows;
}

/** Rutin adayını onaylar (yalnız can_approve İNSAN). */
export async function approveRoutine(id: number, approverSlug: string): Promise<RoutineRow> {
  const role = await pool.query<{ can_approve: boolean }>(
    "SELECT can_approve FROM roles WHERE slug = $1",
    [approverSlug]
  );
  if (!role.rows[0]?.can_approve) {
    throw new Error(`Yetkisiz: '${approverSlug}' onay veremez (yalnızca İNSAN).`);
  }
  const { rows } = await pool.query<RoutineRow>(
    `UPDATE routine_suggestions SET status = 'onaylı', approved_by = $1
     WHERE id = $2 AND status = 'öneri' RETURNING id, pattern, source, freq_estimate, status, approved_by`,
    [approverSlug, id]
  );
  if (!rows[0]) throw new Error(`Rutin önerisi bulunamadı veya zaten işlenmiş: ${id}`);
  await recordAudit({
    actor: Actor.HUMAN, action: "APPROVE_ROUTINE", entity: "routine_suggestion",
    entityId: String(id), detail: { approvedBy: approverSlug },
  });
  return rows[0];
}
