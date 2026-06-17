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

/** Task durumu — 3 zorunlu alan dolana kadar TASLAK. */
export enum TaskStatus {
  TASLAK = "TASLAK",
  ACIK = "ACIK",
  KAPALI = "KAPALI",
}

/** Sinyal kaydının açık/kapalı durumu (idempotency için). */
export enum SignalStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
}

/** Bildirim önceliği. */
export enum Priority {
  YUKSEK = "Yüksek",
  ORTA = "Orta",
  DUSUK = "Düşük",
}

export interface AuditEntry {
  id: number;
  ts: string;
  actor: Actor;
  action: string;
  entity?: string;
  entityId?: string;
  detail?: Record<string, unknown>;
}

/** İştirak (Rol Matrisi). */
export interface Org {
  slug: string;
  name: string;
  role: string;
  functions?: string;
  target?: string;
  isAnchor: boolean;
  auditOnly: boolean;
  notes?: string;
}

/** Tetikleyici kütüğü kaydı. */
export interface Trigger {
  id: number;
  source: string;
  orgSlug?: string;
  orgLabel: string;
  function?: string;
  responsibleRole?: string;
  rhythm?: string;
  triggerType: TriggerType;
  rule?: string;
  green?: string;
  yellow?: string;
  red?: string;
  action?: string;
  dashboard: Dashboard;
  phase: Phase;
  active: boolean;
}

/** Sinyal log kaydı. */
export interface SignalRecord {
  id: number;
  ts: string;
  triggerId: number;
  orgSlug?: string;
  signal: Signal;
  reason?: string;
  suggestedAction?: string;
  dashboard: Dashboard;
  status: SignalStatus;
  day: string;
}

/** İş kalemi (Odak). */
export interface Task {
  id: number;
  createdAt: string;
  source?: string;
  orgSlug?: string;
  function?: string;
  responsibleRole?: string;
  description?: string;
  expectedOutput?: string;
  dueDate?: string;
  linkedGoal?: string;
  leadOffer?: string;
  signal?: Signal;
  triggerId?: number;
  status: TaskStatus;
  updatedAt: string;
}

/** Bildirim Kutusu kaydı — dış gönderim yok, İNSAN onaylar. */
export interface Notification {
  id: number;
  ts: string;
  priority: Priority;
  subject: string;
  toSuggestion?: string;
  draftText?: string;
  triggerId?: number;
  read: boolean;
  approvedBy?: string;
  approvedAt?: string;
}
