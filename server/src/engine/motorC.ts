import { Signal } from "@paperclip/shared";
import { evaluate } from "./signalEngine.js";
import { processObservation } from "./signalStore.js";

/**
 * MOTOR C — Rol-Bazlı Denetim Sinyali
 *
 * Yokluk: Fevup Haftalık Özet / Aylık YK, Marqby Aylık YK gelmedi → 🔴 iç taslak.
 * Eşik: Juris OPEX danışmanlık geliriyle karşılanamadı.
 *
 * GUARDRAIL: Denetim rolünde icra üretilmez (audit_only org veya "icra etme"
 * aksiyonu). Bu kural sistemik olarak `signalStore.escalate` içinde uygulanır —
 * Marqby/Fevup denetim kırmızılarında görev DEĞİL, yorum+revizyon taslağı çıkar.
 */

export type ReportState = "present" | "late" | "absent";

/** Rapor yokluğu sinyali: geldi 🟢 · gecikti 🟡 · gelmedi 🔴. */
export function auditSignal(state: ReportState): Signal {
  return evaluate({ kind: "presence", state });
}

/** OPEX karşılama oranı (%) sinyali: ≥%100 🟢 · %80-100 🟡 · <%80 🔴. */
export function opexSignal(coveragePct: number): Signal {
  return evaluate({
    kind: "ratio",
    value: coveragePct,
    target: 100,
    yellowBelowPct: 100,
    redBelowPct: 80,
  });
}

/**
 * Denetim yokluk kontrolü (Fevup/Marqby rapor geldi mi).
 * Dönem-bazlı idempotent (entity_key = periodKey, ör. "2026-W25" / "2026-06").
 */
export async function processAuditAbsence(params: {
  triggerId: number;
  state: ReportState;
  periodKey: string;
}): Promise<{ signal: Signal; signalId: number | null; escalated: boolean }> {
  return processObservation(
    params.triggerId,
    { kind: "presence", state: params.state },
    params.periodKey
  );
}

/**
 * Juris OPEX eşik kontrolü (tetikleyici #14).
 * Dönem-bazlı idempotent (entity_key = periodKey, ör. "2026-06").
 */
export async function processOpex(params: {
  coveragePct: number;
  periodKey: string;
}): Promise<{ signal: Signal; signalId: number | null; escalated: boolean }> {
  return processObservation(
    14,
    {
      kind: "ratio",
      value: params.coveragePct,
      target: 100,
      yellowBelowPct: 100,
      redBelowPct: 80,
    },
    params.periodKey
  );
}
