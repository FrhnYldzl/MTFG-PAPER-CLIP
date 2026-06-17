/**
 * @paperclip/shared — Ortak tipler ve sabitler
 * MTFG Paperclip kavram zinciri: RİTİM → RUTİN → TETİKLEYİCİ → SİNYAL → DASHBOARD + ODAK
 */

/** 3 sinyal: yeşil (sağlıklı), sarı (izle/uyar), kırmızı (aksiyon). */
export enum Signal {
  GREEN = "GREEN",
  YELLOW = "YELLOW",
  RED = "RED",
}

/** 4 tetikleyici tipi. */
export enum TriggerType {
  ABSENCE = "ABSENCE", // Yokluk/Gecikme
  THRESHOLD = "THRESHOLD", // Eşik
  EVENT = "EVENT", // Olay
  CADENCE = "CADENCE", // Kadans
}

/** 5+1 Dashboard panelleri. */
export enum Dashboard {
  STRATEGY = "0_STRATEJI",
  MAP = "1_HARITA",
  PRODUCT = "2_URUN_HIZMET_YATIRIM",
  NETWORK = "3_NETWORK",
  AUDIT = "4_DENETIM",
  FOCUS = "5_ODAK",
}

/** Denetim izi (audit_log) için aktör tipleri. */
export enum Actor {
  COWORK = "COWORK", // Claude / AI
  HUMAN = "INSAN", // Ferhan / Gülşah — tek karar yetkilisi
  CODE = "CODE", // repo / otomasyon
  SYSTEM = "SYSTEM", // sistem olayları
}

/** Faz etiketleri (orijinal konseptten). */
export type Phase = "Faz -1" | "Faz 0" | "Faz 1";

export interface AuditEntry {
  id: number;
  ts: string;
  actor: Actor;
  action: string;
  entity?: string;
  entityId?: string;
  detail?: Record<string, unknown>;
}
