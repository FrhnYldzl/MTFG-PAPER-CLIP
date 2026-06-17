import { Actor } from "@paperclip/shared";
import { pool } from "./pool.js";

/** audit_log'a append-only kayıt yazar. İhlal edilemez denetim izi. */
export async function recordAudit(params: {
  actor: Actor;
  action: string;
  entity?: string;
  entityId?: string;
  detail?: Record<string, unknown>;
}): Promise<void> {
  await pool.query(
    `INSERT INTO audit_log (actor, action, entity, entity_id, detail)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      params.actor,
      params.action,
      params.entity ?? null,
      params.entityId ?? null,
      params.detail ? JSON.stringify(params.detail) : null,
    ]
  );
}
