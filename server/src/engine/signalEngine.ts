import { Signal } from "@paperclip/shared";

/**
 * Sinyal Motoru — saf (DB'siz) değerlendirme mantığı.
 * Beklenen ile gerçekleşeni karşılaştırıp 🟢/🟡/🔴 üretir.
 *
 * Altın kural: erken sinyal > geç gösterge. Kırmızıya dönmeden sarıyken yakala.
 */

/** Değerlendirme girdisi (4 tetikleyici tipini kapsayan discriminated union). */
export type Observation =
  /** Gün eşiği (ABSENCE/THRESHOLD): ör. tahsilat 5/9/15 gün. */
  | { kind: "dayThreshold"; days: number; yellowAt: number; redAt: number }
  /** Varlık (ABSENCE): rapor/çıktı geldi mi? */
  | { kind: "presence"; state: "present" | "late" | "absent" }
  /** Adet/kadans (CADENCE): hedefe göre kaç adet (ör. haftalık network). */
  | { kind: "count"; value: number; target: number }
  /** Oran (THRESHOLD): değer/hedef yüzdesi (ör. OPEX karşılama). */
  | {
      kind: "ratio";
      value: number;
      target: number;
      /** Bu yüzdenin altı SARI (varsayılan 100). */
      yellowBelowPct?: number;
      /** Bu yüzdenin altı KIRMIZI (varsayılan 80). */
      redBelowPct?: number;
    };

/** Bir gözlemi 🟢/🟡/🔴 sinyaline çevirir. */
export function evaluate(obs: Observation): Signal {
  switch (obs.kind) {
    case "dayThreshold": {
      if (obs.days >= obs.redAt) return Signal.RED;
      if (obs.days >= obs.yellowAt) return Signal.YELLOW;
      return Signal.GREEN;
    }
    case "presence": {
      if (obs.state === "present") return Signal.GREEN;
      if (obs.state === "late") return Signal.YELLOW;
      return Signal.RED;
    }
    case "count": {
      if (obs.value >= obs.target) return Signal.GREEN;
      if (obs.value > 0) return Signal.YELLOW;
      return Signal.RED;
    }
    case "ratio": {
      const yellowBelow = obs.yellowBelowPct ?? 100;
      const redBelow = obs.redBelowPct ?? 80;
      const pct = obs.target === 0 ? 100 : (obs.value / obs.target) * 100;
      if (pct < redBelow) return Signal.RED;
      if (pct < yellowBelow) return Signal.YELLOW;
      return Signal.GREEN;
    }
  }
}

/** Kırmızı/Sarı sinyaller eskalasyon (aksiyon) gerektirir; yeşil gerektirmez. */
export function needsAction(signal: Signal): boolean {
  return signal !== Signal.GREEN;
}

/** Sadece kırmızı sinyaller acil eskalasyon (Bildirim + acil görev) gerektirir. */
export function isCritical(signal: Signal): boolean {
  return signal === Signal.RED;
}
