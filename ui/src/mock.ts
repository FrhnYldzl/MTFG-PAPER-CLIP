/** Preview/demo verisi — backend bağlı değilken kullanılır. */
import type { SignalRow, TaskRow, NotificationRow } from "./api";

export const mockSignals: SignalRow[] = [
  { id: 1, ts: "2026-06-17T08:00:00Z", trigger_id: 13, org_slug: "juris", org_label: "Juris", source: "Tahsilat takibi", signal: "RED", reason: ">=14g gecikme", suggested_action: "Tahsilat görevi + uyarı", dashboard: "1_HARITA", status: "OPEN" },
  { id: 2, ts: "2026-06-17T08:00:00Z", trigger_id: 5, org_slug: "fevup", org_label: "Fevup", source: "Fevup Haftalık Özet", signal: "RED", reason: "+2g gelmedi", suggested_action: "İç bildirim taslağı", dashboard: "4_DENETIM", status: "OPEN" },
  { id: 3, ts: "2026-06-17T08:00:00Z", trigger_id: 9, org_slug: "juris", org_label: "Juris", source: "Network ritmi (Motor B)", signal: "YELLOW", reason: "1 görüşme (hedef altı)", suggested_action: "Network çek ve görev aç", dashboard: "3_NETWORK", status: "OPEN" },
  { id: 4, ts: "2026-06-17T08:00:00Z", trigger_id: 2, org_slug: "meridyen", org_label: "Meridyen", source: "Toplantı (Motor A)", signal: "YELLOW", reason: "50s follow-up yok", suggested_action: "İç hatırlatma + Odaka görev", dashboard: "5_ODAK", status: "OPEN" },
  { id: 5, ts: "2026-06-17T08:00:00Z", trigger_id: 14, org_slug: "juris", org_label: "Juris", source: "OPEX karşılama", signal: "GREEN", reason: ">=OPEX", suggested_action: "", dashboard: "1_HARITA", status: "OPEN" },
  { id: 6, ts: "2026-06-17T08:00:00Z", trigger_id: 23, org_slug: null, org_label: "Tümü", source: "Haftalık odak üretimi", signal: "GREEN", reason: "üretildi", suggested_action: "", dashboard: "5_ODAK", status: "OPEN" },
  { id: 7, ts: "2026-06-17T08:00:00Z", trigger_id: 19, org_slug: "arivon", org_label: "Arivon", source: "Arivon Product Hunt", signal: "GREEN", reason: "top 5", suggested_action: "", dashboard: "2_URUN_HIZMET_YATIRIM", status: "OPEN" },
];

export const mockTasks: TaskRow[] = [
  { id: 11, org_slug: "juris", function: "Finans", responsible_role: "İcracı Ortak", description: "Tahsilat takibi — gecikmiş fatura", expected_output: "Tahsilat planı", due_date: "2026-06-20", signal: "RED", status: "ACIK" },
  { id: 12, org_slug: "meridyen", function: "Operasyon", responsible_role: "İcracı Ortak", description: "Toplantı çıktısı gir: Tanışma görüşmesi", expected_output: null, due_date: null, signal: null, status: "TASLAK" },
  { id: 13, org_slug: "juris", function: "Pazarlama ve Satış", responsible_role: "İcracı Ortak", description: "Network görüşmesi: Ahmet K. (fintech)", expected_output: "Görüşme planla, fırsata bağla", due_date: null, signal: null, status: "TASLAK" },
  { id: 14, org_slug: "juris", function: "Satış", responsible_role: "İcracı Ortak", description: "Lead → teklif dönüşü", expected_output: "Teklif gönder", due_date: "2026-06-19", signal: "YELLOW", status: "ACIK" },
];

export const mockNotifications: NotificationRow[] = [
  { id: 1, ts: "2026-06-17T08:00:00Z", priority: "Yüksek", subject: "🔴 Juris · Tahsilat takibi", draft_text: "Tahsilat görevi + uyarı\n\nGerekçe: >=14g gecikme", trigger_id: 13, approved_by: null },
  { id: 2, ts: "2026-06-17T08:00:00Z", priority: "Yüksek", subject: "🔴 Fevup · Fevup Haftalık Özet", draft_text: "İç bildirim taslağı (gönderim yok)\n\nGerekçe: +2g gelmedi", trigger_id: 5, approved_by: null },
  { id: 3, ts: "2026-06-17T07:00:00Z", priority: "Orta", subject: "2026-W25 — MTFG Odak", draft_text: "# 2026-W25 — MTFG Odak\n\n🔴 Kırmızı (2) · 🟡 Sarı (2) · 📋 Açık görev (2)", trigger_id: 23, approved_by: null },
];
