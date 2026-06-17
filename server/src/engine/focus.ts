import { Priority } from "@paperclip/shared";
import { pool } from "../db/pool.js";
import { processObservation } from "./signalStore.js";
import { getConfigInt } from "../db/configStore.js";

/**
 * HAFTALIK ODAK ÜRETECİ (E11)
 *
 * Açık 🔴/🟡 sinyaller + son ≤90 gün açık görevler → "XX. Hafta — MTFG Odak"
 * taslağı (Bildirim Kutusu). Kapanmayan kalemler bir sonraki haftaya taşınır
 * (henüz açık oldukları için doğal olarak tekrar listelenir).
 * Üretim tetikleyici #23'e GREEN (üretildi) sinyali yazar.
 */

export interface FocusSignalItem {
  triggerId: number;
  orgLabel: string;
  signal: "YELLOW" | "RED";
  reason?: string | null;
  dashboard: string;
  suggestedAction?: string | null;
}

export interface FocusTaskItem {
  id: number;
  description?: string | null;
  responsibleRole?: string | null;
  dueDate?: string | null;
}

/** Saf: odak taslağının metnini ve önceliğini üretir (DB'siz, test edilebilir). */
export function buildFocusDraft(
  weekKey: string,
  signals: FocusSignalItem[],
  tasks: FocusTaskItem[]
): { subject: string; text: string; priority: Priority } {
  const reds = signals.filter((s) => s.signal === "RED");
  const yellows = signals.filter((s) => s.signal === "YELLOW");

  const lines: string[] = [`# ${weekKey} — MTFG Odak`, ""];

  lines.push(`🔴 Kırmızı (${reds.length}) · 🟡 Sarı (${yellows.length}) · 📋 Açık görev (${tasks.length})`, "");

  if (reds.length) {
    lines.push("## 🔴 Acil (Kırmızı)");
    for (const s of reds) {
      lines.push(`- [${s.dashboard}] ${s.orgLabel}: ${s.reason ?? ""} → ${s.suggestedAction ?? ""}`);
    }
    lines.push("");
  }
  if (yellows.length) {
    lines.push("## 🟡 İzle (Sarı)");
    for (const s of yellows) {
      lines.push(`- [${s.dashboard}] ${s.orgLabel}: ${s.reason ?? ""}`);
    }
    lines.push("");
  }
  if (tasks.length) {
    lines.push("## 📋 Açık Görevler (≤90 gün)");
    for (const t of tasks) {
      const role = t.responsibleRole ? ` (${t.responsibleRole})` : "";
      const due = t.dueDate ? ` — hedef: ${t.dueDate}` : "";
      lines.push(`- #${t.id} ${t.description ?? ""}${role}${due}`);
    }
    lines.push("");
  }
  if (!reds.length && !yellows.length && !tasks.length) {
    lines.push("_Bu hafta açık sinyal veya görev yok — sistem yeşil._");
  }

  const priority = reds.length ? Priority.YUKSEK : yellows.length ? Priority.ORTA : Priority.DUSUK;
  return { subject: `${weekKey} — MTFG Odak`, text: lines.join("\n"), priority };
}

/**
 * Haftalık odağı üretir ve Bildirim Kutusu'na taslak olarak yazar (idempotent:
 * aynı hafta için ikinci kez üretmez). Tetikleyici #23'e GREEN sinyali yazar.
 */
export async function generateWeeklyFocus(weekKey: string): Promise<{
  notificationId: number;
  created: boolean;
  redCount: number;
  yellowCount: number;
  taskCount: number;
}> {
  const maxAge = await getConfigInt("TaskMaxGun", 90);

  const sigRes = await pool.query<FocusSignalItem & { signal: "YELLOW" | "RED" }>(
    `SELECT s.trigger_id AS "triggerId", t.org_label AS "orgLabel", s.signal,
            s.reason, s.dashboard, s.suggested_action AS "suggestedAction"
     FROM signals s JOIN triggers t ON t.id = s.trigger_id
     WHERE s.status = 'OPEN' AND s.signal IN ('RED','YELLOW')
     ORDER BY CASE s.signal WHEN 'RED' THEN 0 ELSE 1 END, s.trigger_id`
  );

  const taskRes = await pool.query<FocusTaskItem>(
    `SELECT id, description, responsible_role AS "responsibleRole",
            to_char(due_date, 'YYYY-MM-DD') AS "dueDate"
     FROM tasks
     WHERE status = 'ACIK' AND created_at >= now() - ($1 || ' days')::interval
     ORDER BY due_date NULLS LAST, id`,
    [maxAge]
  );

  const signals = sigRes.rows;
  const tasks = taskRes.rows;
  const draft = buildFocusDraft(weekKey, signals, tasks);

  // İdempotent: bu hafta için zaten taslak var mı?
  const existing = await pool.query<{ id: number }>(
    "SELECT id FROM notifications WHERE trigger_id = 23 AND subject = $1 LIMIT 1",
    [draft.subject]
  );

  let notificationId: number;
  let created: boolean;
  if (existing.rows[0]) {
    notificationId = existing.rows[0].id;
    created = false;
  } else {
    const ins = await pool.query<{ id: number }>(
      `INSERT INTO notifications (priority, subject, draft_text, trigger_id)
       VALUES ($1, $2, $3, 23) RETURNING id`,
      [draft.priority, draft.subject, draft.text]
    );
    notificationId = ins.rows[0]!.id;
    created = true;
  }

  // Tetikleyici #23: haftalık odak üretildi → GREEN (hafta-bazlı idempotent)
  await processObservation(23, { kind: "presence", state: "present" }, weekKey);

  return {
    notificationId,
    created,
    redCount: signals.filter((s) => s.signal === "RED").length,
    yellowCount: signals.filter((s) => s.signal === "YELLOW").length,
    taskCount: tasks.length,
  };
}
