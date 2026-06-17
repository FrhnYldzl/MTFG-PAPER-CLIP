-- 0001_init.sql — MTFG Paperclip ilk şema (v0.1)
-- Tablolar: config (anahtar/değer), audit_log (append-only denetim izi)

-- ── config ────────────────────────────────────────────────
-- OPEX eşikleri, hedefler, ritim ayarları vb.
CREATE TABLE IF NOT EXISTS config (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Başlangıç yapılandırması (orijinal konseptten Config anahtarları)
INSERT INTO config (key, value) VALUES
  ('FevupHaftalikGun', 'Cuma'),
  ('TaskMaxGun', '90'),
  ('TahsilatSariGun', '7'),
  ('TahsilatKirmiziGun', '14'),
  ('NetworkHaftalikHedef', '1'),
  ('SariIzlemeSaat', '48')
ON CONFLICT (key) DO NOTHING;

-- ── audit_log ─────────────────────────────────────────────
-- Append-only. COWORK/İNSAN/CODE/SYSTEM olaylarının değiştirilemez izi.
CREATE TABLE IF NOT EXISTS audit_log (
  id        BIGSERIAL PRIMARY KEY,
  ts        TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor     TEXT NOT NULL CHECK (actor IN ('COWORK', 'INSAN', 'CODE', 'SYSTEM')),
  action    TEXT NOT NULL,
  entity    TEXT,
  entity_id TEXT,
  detail    JSONB
);

CREATE INDEX IF NOT EXISTS idx_audit_log_ts ON audit_log (ts DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON audit_log (actor);

-- Append-only güvencesi: UPDATE ve DELETE engellenir.
CREATE OR REPLACE FUNCTION audit_log_immutable()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_log append-only: UPDATE/DELETE yasak';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_log_no_update ON audit_log;
CREATE TRIGGER trg_audit_log_no_update
  BEFORE UPDATE OR DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION audit_log_immutable();

-- İlk kayıt: sistem kuruldu
INSERT INTO audit_log (actor, action, entity, detail)
VALUES ('SYSTEM', 'SCHEMA_INIT', 'database',
        '{"version": "0.1", "migration": "0001_init"}'::jsonb);
