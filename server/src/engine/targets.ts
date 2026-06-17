import { Signal } from "@paperclip/shared";
import { pool } from "../db/pool.js";
import { evaluate } from "./signalEngine.js";

/**
 * HEDEF TAKİBİ (E15)
 * İştirak/fonksiyon hedeflerinin gerçekleşme yüzdesi ve sinyali.
 * <%70 🔴 · %70-100 🟡 · ≥%100 🟢 (danışmanlık eşiği mantığı).
 */

/** Saf: gerçekleşme yüzdesi (0+, hedef 0 ise 100). */
export function achievementPct(current: number, target: number): number {
  if (target <= 0) return 100;
  return Math.round((current / target) * 1000) / 10;
}

/** Saf: gerçekleşmeye göre sinyal. */
export function targetSignal(pct: number): Signal {
  return evaluate({ kind: "ratio", value: pct, target: 100, yellowBelowPct: 100, redBelowPct: 70 });
}

export interface TargetRow {
  id: number;
  org_slug: string | null;
  metric: string;
  period: string | null;
  target_value: number;
  current_value: number;
  unit: string | null;
  dashboard: string;
}

/** Tüm hedefler + gerçekleşme % + sinyal. */
export async function listTargets(): Promise<
  (TargetRow & { pct: number; signal: Signal })[]
> {
  const { rows } = await pool.query<TargetRow>(
    "SELECT id, org_slug, metric, period, target_value::float8 AS target_value, current_value::float8 AS current_value, unit, dashboard FROM targets ORDER BY org_slug, metric"
  );
  return rows.map((r) => {
    const pct = achievementPct(r.current_value, r.target_value);
    return { ...r, pct, signal: targetSignal(pct) };
  });
}

/** Bir hedefin gerçekleşmesini günceller; yeni % ve sinyal döner. */
export async function setTargetProgress(
  id: number,
  current: number
): Promise<{ id: number; pct: number; signal: Signal }> {
  const { rows } = await pool.query<TargetRow>(
    "UPDATE targets SET current_value = $1, updated_at = now() WHERE id = $2 RETURNING target_value::float8 AS target_value, current_value::float8 AS current_value, id, org_slug, metric, period, unit, dashboard",
    [current, id]
  );
  if (!rows[0]) throw new Error(`Hedef bulunamadı: ${id}`);
  const pct = achievementPct(rows[0].current_value, rows[0].target_value);
  return { id, pct, signal: targetSignal(pct) };
}
