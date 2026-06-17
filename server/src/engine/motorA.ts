import { Signal } from "@paperclip/shared";
import { pool } from "../db/pool.js";
import { evaluate } from "./signalEngine.js";
import { processObservation } from "./signalStore.js";

/**
 * MOTOR A — Toplantı → Follow-up → İş
 *
 * Her takvim hareketinden sonra zorunlu iş girişi (Odak'a TASLAK görev);
 * girilene kadar günlük hatırlatma. Follow-up 48s'te kapanmazsa SARI;
 * leadsiz (fırsata bağlanmamış) KIRMIZI.
 *
 * Tetikleyici #2 (Toplantı / Motor A). DIŞ GÖNDERİM YOK.
 */

const TRIGGER_ID = 2;

export interface MeetingObservation {
  /** Takvim olayının benzersiz kimliği (idempotency anahtarı). */
  meetingId: string;
  title: string;
  orgSlug?: string | null;
  /** Toplantı bittiğinden bu yana geçen saat. */
  hoursSinceEnd: number;
  /** Çıktı/iştirak/tarih girişi yapıldı mı? */
  followUpEntered: boolean;
  /** Bir fırsata/lead'e bağlandı mı? */
  hasLead: boolean;
}

/**
 * Saf karar mantığı (DB'siz, test edilebilir):
 * - leadsiz → KIRMIZI
 * - follow-up girildi → YEŞİL
 * - aksi halde saat eşiği: <48 🟢 · 48-72 🟡 · >=72 🔴
 */
export function meetingSignal(m: {
  hoursSinceEnd: number;
  followUpEntered: boolean;
  hasLead: boolean;
}): Signal {
  if (!m.hasLead) return Signal.RED;
  if (m.followUpEntered) return Signal.GREEN;
  return evaluate({
    kind: "dayThreshold",
    days: m.hoursSinceEnd,
    yellowAt: 48,
    redAt: 72,
  });
}

/**
 * Toplantı için zorunlu iş girişi taslağını (Odak) idempotent oluşturur.
 * Aynı toplantı için ikinci kez çağrılırsa yeni görev açılmaz.
 * @returns oluşturulan görev id'si veya null (zaten vardı).
 */
async function ensureIntakeTask(m: MeetingObservation): Promise<number | null> {
  const source = `Toplantı:${m.meetingId}`;
  const exists = await pool.query<{ id: number }>(
    "SELECT id FROM tasks WHERE trigger_id = $1 AND source = $2 LIMIT 1",
    [TRIGGER_ID, source]
  );
  if (exists.rows[0]) return null;

  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO tasks (source, org_slug, function, responsible_role, description, trigger_id, status)
     VALUES ($1, $2, 'Operasyon', 'İcracı Ortak', $3, $4, 'TASLAK')
     RETURNING id`,
    [
      source,
      m.orgSlug ?? null,
      `Toplantı çıktısı gir: "${m.title}" — çıktı / iştirak / hedef tarih zorunlu`,
      TRIGGER_ID,
    ]
  );
  return rows[0]?.id ?? null;
}

/**
 * Uçtan uca Motor A: zorunlu iş girişi taslağı + follow-up/lead sinyali.
 * Sinyal toplantı-bazlı idempotenttir (entity_key = meetingId).
 */
export async function processMeeting(m: MeetingObservation): Promise<{
  signal: Signal;
  signalId: number | null;
  escalated: boolean;
  intakeTaskId: number | null;
}> {
  const intakeTaskId = await ensureIntakeTask(m);

  // Gözlemi meetingSignal ile aynı sonucu verecek şekilde kur:
  // leadsiz → presence(absent)=KIRMIZI; aksi halde saat eşiği (follow-up varsa 0=YEŞİL).
  const obs = !m.hasLead
    ? ({ kind: "presence", state: "absent" } as const)
    : ({
        kind: "dayThreshold",
        days: m.followUpEntered ? 0 : m.hoursSinceEnd,
        yellowAt: 48,
        redAt: 72,
      } as const);

  const res = await processObservation(TRIGGER_ID, obs, m.meetingId);
  return { ...res, intakeTaskId };
}
