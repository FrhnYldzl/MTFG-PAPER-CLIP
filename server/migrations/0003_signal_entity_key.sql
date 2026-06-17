-- 0003_signal_entity_key.sql — Olay-bazlı sinyal idempotency (v0.2 / E7)
-- Sorun: (trigger_id, day) tekilliği olay-bazlı tetikleyicilerde (ör. Motor A
-- toplantıları) çok kaba kalıyor; aynı gün iki ayrı toplantı çakışıyordu.
-- Çözüm: opsiyonel entity_key (ör. toplantı id) ile tekilliği daraltmak.

ALTER TABLE signals ADD COLUMN IF NOT EXISTS entity_key TEXT;

-- Eski tekillik indeksini kaldır, COALESCE'li ifade indeksiyle değiştir.
-- entity_key NULL → '' (yokluk/eşik tetikleyicileri için davranış aynı: gün+tetikleyici başına tek).
DROP INDEX IF EXISTS uniq_open_signal_per_trigger_day;
CREATE UNIQUE INDEX IF NOT EXISTS uniq_open_signal_per_trigger_day
  ON signals (trigger_id, day, COALESCE(entity_key, ''))
  WHERE status = 'OPEN';

INSERT INTO audit_log (actor, action, entity, detail)
VALUES ('SYSTEM', 'SCHEMA_MIGRATE', 'database',
        '{"version": "0.2", "migration": "0003_signal_entity_key"}'::jsonb);
