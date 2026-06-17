-- 0004_targets_routines.sql — Hedef takibi (E15) + Rutin keşfi (E16)

-- ── targets (Hedef Gerçekleşme) ───────────────────────────
CREATE TABLE IF NOT EXISTS targets (
  id            BIGSERIAL PRIMARY KEY,
  org_slug      TEXT REFERENCES orgs(slug),
  metric        TEXT NOT NULL,
  period        TEXT,                       -- yıllık / aylık
  target_value  NUMERIC NOT NULL,
  current_value NUMERIC NOT NULL DEFAULT 0,
  unit          TEXT,                       -- TL / USD / adet / sıra
  dashboard     TEXT NOT NULL DEFAULT '1_HARITA',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO targets (org_slug, metric, period, target_value, unit, dashboard) VALUES
  ('juris',    'Danışmanlık geliri',  'yıllık', 600000,  'TL',  '1_HARITA'),
  ('juris',    'İçerik üretimi',      'yıllık', 60,      'adet','2_URUN_HIZMET_YATIRIM'),
  ('juris',    'Network görüşmesi',   'yıllık', 20,      'adet','3_NETWORK'),
  ('fevup',    'Ciro',                'yıllık', 5376041, 'USD', '1_HARITA'),
  ('marqby',   'Hedef değer',         'yıllık', 502919,  'USD', '4_DENETIM'),
  ('meridyen', 'İlk işlem',           'çeyrek', 10000,   'USD', '1_HARITA'),
  ('arivon',   'Product Hunt sıra',   'milestone', 1,    'sıra','2_URUN_HIZMET_YATIRIM')
ON CONFLICT DO NOTHING;

-- ── routine_suggestions (Rutin Keşfi) ─────────────────────
CREATE TABLE IF NOT EXISTS routine_suggestions (
  id            BIGSERIAL PRIMARY KEY,
  pattern       TEXT NOT NULL,
  source        TEXT,                       -- mail / takvim
  freq_estimate TEXT,                       -- günlük / haftalık / aylık
  detected_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  status        TEXT NOT NULL DEFAULT 'öneri' CHECK (status IN ('öneri','onaylı','reddedildi')),
  approved_by   TEXT REFERENCES roles(slug)
);

-- Aynı desen için tek öneri (idempotency)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_routine_pattern ON routine_suggestions (pattern);

INSERT INTO audit_log (actor, action, entity, detail)
VALUES ('SYSTEM', 'SCHEMA_MIGRATE', 'database',
        '{"version": "0.3", "migration": "0004_targets_routines"}'::jsonb);
