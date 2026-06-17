import { Actor } from "@paperclip/shared";
import { pool } from "../db/pool.js";
import { recordAudit } from "../db/audit.js";

/**
 * GOVERNANCE — Onay akışı.
 *
 * Bildirim Kutusu'ndaki taslaklar yalnızca onay yetkili (can_approve=true) İNSAN
 * tarafından onaylanır. Onay = insanın kararını kayda geçirir; sistem hiçbir
 * koşulda dışarıya GÖNDERMEZ (gönderim yeteneği yok). Onay sonrası gönderimi
 * insan kendi araçlarıyla yapar.
 */

export interface NotificationRow {
  id: number;
  ts: string;
  priority: string;
  subject: string;
  to_suggestion: string | null;
  draft_text: string | null;
  trigger_id: number | null;
  read: boolean;
  approved_by: string | null;
  approved_at: string | null;
}

/** Onay bekleyen (henüz onaylanmamış) taslakları döner. */
export async function listPendingNotifications(): Promise<NotificationRow[]> {
  const { rows } = await pool.query<NotificationRow>(
    "SELECT * FROM notifications WHERE approved_at IS NULL ORDER BY ts DESC"
  );
  return rows;
}

/**
 * Bir bildirim taslağını onaylar. Yalnızca can_approve=true rol onaylayabilir.
 * @throws onaylayan yetkisizse veya bildirim yoksa.
 */
export async function approveNotification(
  notificationId: number,
  approverSlug: string
): Promise<NotificationRow> {
  const role = await pool.query<{ can_approve: boolean }>(
    "SELECT can_approve FROM roles WHERE slug = $1",
    [approverSlug]
  );
  if (!role.rows[0]) {
    throw new Error(`Rol bulunamadı: ${approverSlug}`);
  }
  if (!role.rows[0].can_approve) {
    throw new Error(`Yetkisiz: '${approverSlug}' onay veremez (yalnızca İNSAN).`);
  }

  const { rows } = await pool.query<NotificationRow>(
    `UPDATE notifications
       SET approved_by = $1, approved_at = now(), read = true
     WHERE id = $2 AND approved_at IS NULL
     RETURNING *`,
    [approverSlug, notificationId]
  );
  if (!rows[0]) {
    throw new Error(`Bildirim bulunamadı veya zaten onaylanmış: ${notificationId}`);
  }

  await recordAudit({
    actor: Actor.HUMAN,
    action: "APPROVE_NOTIFICATION",
    entity: "notification",
    entityId: String(notificationId),
    detail: { approvedBy: approverSlug },
  });

  return rows[0];
}
