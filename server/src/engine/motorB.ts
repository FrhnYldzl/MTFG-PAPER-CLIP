import { Signal } from "@paperclip/shared";
import { pool } from "../db/pool.js";
import { evaluate } from "./signalEngine.js";
import { processObservation } from "./signalStore.js";
import { getConfigInt } from "../db/configStore.js";

/**
 * MOTOR B — Network Çekme & Aktivasyon
 *
 * Haftalık kadans (Hafta 1 dahil): "05. Network" listesinden N kişi çekilir,
 * keyword/sorunla eşlenir, Odak'a görüşme görevi açılır. Network'süz hafta → 🔴.
 * Yıllık hedef 20; haftalık hedef config(NetworkHaftalikHedef), varsayılan 1.
 *
 * Tetikleyici #9 (Network ritmi / Motor B), dashboard 3_NETWORK. DIŞ GÖNDERİM YOK.
 */

const TRIGGER_ID = 9;

export interface NetworkCandidate {
  name: string;
  keyword?: string;
  problem?: string;
  orgSlug?: string | null;
}

export interface NetworkWeekObservation {
  /** Hafta anahtarı, ör. "2026-W25" (idempotency anahtarı). */
  weekKey: string;
  candidates: NetworkCandidate[];
  /** Haftalık hedef override; verilmezse config'ten okunur. */
  target?: number;
}

/**
 * Saf karar mantığı: görüşme sayısı hedefe göre 🟢/🟡/🔴.
 * >=hedef 🟢 · 1..hedef-1 🟡 · 0 🔴 (network'süz hafta).
 */
export function networkSignal(count: number, target: number): Signal {
  return evaluate({ kind: "count", value: count, target });
}

/** Hafta+aday başına idempotent network görüşme görevi (Odak / 3_NETWORK). */
async function ensureNetworkTask(
  weekKey: string,
  candidate: NetworkCandidate
): Promise<number | null> {
  const source = `Network:${weekKey}:${candidate.name}`;
  const exists = await pool.query<{ id: number }>(
    "SELECT id FROM tasks WHERE trigger_id = $1 AND source = $2 LIMIT 1",
    [TRIGGER_ID, source]
  );
  if (exists.rows[0]) return null;

  const desc = candidate.keyword
    ? `Network görüşmesi: ${candidate.name} (${candidate.keyword})`
    : `Network görüşmesi: ${candidate.name}`;

  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO tasks
       (source, org_slug, function, responsible_role, description, expected_output, trigger_id, status)
     VALUES ($1, $2, 'Pazarlama ve Satış', 'İcracı Ortak', $3, $4, $5, 'TASLAK')
     RETURNING id`,
    [
      source,
      candidate.orgSlug ?? "juris",
      desc,
      candidate.problem ?? "Görüşme planla, fırsata bağla",
      TRIGGER_ID,
    ]
  );
  return rows[0]?.id ?? null;
}

/**
 * Uçtan uca Motor B: haftalık adaylar için görevler + network sinyali.
 * Sinyal hafta-bazlı idempotenttir (entity_key = weekKey).
 */
export async function processNetworkWeek(obs: NetworkWeekObservation): Promise<{
  signal: Signal;
  signalId: number | null;
  escalated: boolean;
  taskIds: number[];
}> {
  const target = obs.target ?? (await getConfigInt("NetworkHaftalikHedef", 1));

  const taskIds: number[] = [];
  for (const candidate of obs.candidates) {
    const id = await ensureNetworkTask(obs.weekKey, candidate);
    if (id !== null) taskIds.push(id);
  }

  const count = obs.candidates.length;
  const res = await processObservation(
    TRIGGER_ID,
    { kind: "count", value: count, target },
    obs.weekKey
  );

  return { ...res, taskIds };
}
