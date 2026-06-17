/** API tipleri + fetch yardımcıları. Backend yoksa mock'a düşer (preview için). */
import { mockSignals, mockTasks, mockNotifications } from "./mock";

export type SignalColor = "GREEN" | "YELLOW" | "RED";

export interface SignalRow {
  id: number;
  ts: string;
  trigger_id: number;
  org_slug: string | null;
  org_label: string;
  source: string | null;
  signal: SignalColor;
  reason: string | null;
  suggested_action: string | null;
  dashboard: string;
  status: string;
}

export interface TaskRow {
  id: number;
  org_slug: string | null;
  function: string | null;
  responsible_role: string | null;
  description: string | null;
  expected_output: string | null;
  due_date: string | null;
  signal: SignalColor | null;
  status: "TASLAK" | "ACIK" | "KAPALI";
}

export interface NotificationRow {
  id: number;
  ts: string;
  priority: "Yüksek" | "Orta" | "Düşük";
  subject: string;
  draft_text: string | null;
  trigger_id: number | null;
  approved_by: string | null;
}

async function get<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(path, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()) as T;
  } catch {
    // Backend yok → preview/mock verisi
    return fallback;
  }
}

export const api = {
  signals: () => get<SignalRow[]>("/api/signals", mockSignals),
  tasks: () => get<TaskRow[]>("/api/tasks", mockTasks),
  notifications: () =>
    get<NotificationRow[]>("/api/notifications", mockNotifications),
  approve: async (id: number, approver: string) => {
    const res = await fetch(`/api/notifications/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approver }),
    });
    if (!res.ok) throw new Error((await res.json()).error ?? "Onay başarısız");
    return res.json();
  },
};

/** 5+1 dashboard tanımları. */
export const DASHBOARDS = [
  { key: "0_STRATEJI", no: "0", label: "Strateji" },
  { key: "1_HARITA", no: "1", label: "Harita" },
  { key: "2_URUN_HIZMET_YATIRIM", no: "2", label: "Ürün · Hizmet · Yatırım" },
  { key: "3_NETWORK", no: "3", label: "Network" },
  { key: "4_DENETIM", no: "4", label: "Denetim" },
  { key: "5_ODAK", no: "5", label: "Odak" },
] as const;
