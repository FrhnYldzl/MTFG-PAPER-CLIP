-- 0002_data_model.sql — MTFG Paperclip veri modeli (v0.2 / E5)
-- Tablolar: orgs (6 iştirak), roles (kişi/kimlik), triggers (23 seed),
--           signals (idempotent log), tasks (Odak), notifications (Bildirim Kutusu)

-- ── orgs (İştirakler / Rol Matrisi) ───────────────────────
CREATE TABLE IF NOT EXISTS orgs (
  slug       TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  role       TEXT NOT NULL,           -- YK Üyesi / İcracı | Ortak vb.
  functions  TEXT,                    -- işletme fonksiyonları
  target     TEXT,                    -- hedef açıklaması
  is_anchor  BOOLEAN NOT NULL DEFAULT false,  -- Juris = çapa/lokomotif
  audit_only BOOLEAN NOT NULL DEFAULT false,  -- icra üretilmez (ör. Marqby)
  notes      TEXT
);

INSERT INTO orgs (slug, name, role, functions, target, is_anchor, audit_only) VALUES
  ('fevup',       'Fevup Brands',             'YK Üyesi',                'Denetim + Operasyon',      '5.376.041 USD ciro',                                false, false),
  ('juris',       'Juris Avukatlık Ortaklığı','İcracı | Ortak',          'Tüm fonksiyonlar',         '600.000 TL danışmanlık (10x60K) · 60 içerik · 20 network', true,  false),
  ('marqby',      'Marqby',                   'YK Üyesi',                'Sadece Denetim',           '502.919 USD · Exit / aylık nakit',                  false, true),
  ('meridyen',    'Meridyen',                 'İcracı Gel. | Pot. Ortak','Pazarlama + Satış + Finans','10.000 USD · ilk işlem',                            false, false),
  ('inforexpect', 'Inforexpect',              'İcracı Gel. | Pot. Ortak','İş Geliştirme önceliği',   'İG tamamlanıp faaliyete geçiş',                     false, false),
  ('arivon',      'Arivon',                   'İcracı Gel. | Pot. Ortak','İş Geliştirme önceliği',   'Product Hunt 1. sıra',                              false, false)
ON CONFLICT (slug) DO NOTHING;

-- ── roles (Kişi / Kimlik — governance) ────────────────────
CREATE TABLE IF NOT EXISTS roles (
  slug        TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT,
  kind        TEXT NOT NULL CHECK (kind IN ('INSAN', 'COWORK')),
  can_approve BOOLEAN NOT NULL DEFAULT false   -- onay yetkisi yalnızca İNSAN'da
);

INSERT INTO roles (slug, name, email, kind, can_approve) VALUES
  ('ferhan', 'Ferhan Yıldızlı', 'f.yildizli@jurishukuk.com', 'INSAN',  true),
  ('gulsah', 'Gülşah Algın',    'g.algin@jurishukuk.com',    'INSAN',  true),
  ('cowork', 'Cowork (Claude)', NULL,                        'COWORK', false)
ON CONFLICT (slug) DO NOTHING;

-- ── triggers (Tetikleyici Kütüğü — 23 seed) ───────────────
CREATE TABLE IF NOT EXISTS triggers (
  id               INTEGER PRIMARY KEY,        -- No (1..23)
  source           TEXT NOT NULL,              -- Kaynak / Kanal
  org_slug         TEXT REFERENCES orgs(slug), -- İştirak (NULL = Tümü / İlgili)
  org_label        TEXT NOT NULL,              -- görüntüleme etiketi
  function         TEXT,                       -- İşletme Fonksiyonu
  responsible_role TEXT,                       -- Sorumlu Rol
  rhythm           TEXT,                       -- Ritim / Frekans
  trigger_type     TEXT NOT NULL CHECK (trigger_type IN ('ABSENCE','THRESHOLD','EVENT','CADENCE')),
  rule             TEXT,                       -- Tetikleyici Kuralı
  green            TEXT,
  yellow           TEXT,
  red              TEXT,
  action           TEXT,
  dashboard        TEXT NOT NULL CHECK (dashboard IN
                     ('0_STRATEJI','1_HARITA','2_URUN_HIZMET_YATIRIM','3_NETWORK','4_DENETIM','5_ODAK')),
  phase            TEXT NOT NULL CHECK (phase IN ('Faz -1','Faz 0','Faz 1')),
  active           BOOLEAN NOT NULL DEFAULT true
);

INSERT INTO triggers
  (id, source, org_slug, org_label, function, responsible_role, rhythm, trigger_type, rule, green, yellow, red, action, dashboard, phase) VALUES
  (1,  'Mail (intake)',              'juris',       'Juris',            'Operasyon / Intake', 'İcracı Ortak',     'Olay bazlı',                'EVENT',     'Gelen maile rol atanmadı',                 '<=24s rol atandı',  '24-48s bekliyor', '>=48s atanmadı',      'Role ata, Odaka taslak görev',         '5_ODAK',                'Faz -1'),
  (2,  'Toplantı (Motor A)',         NULL,          'İlgili iştirak',   'Operasyon',          'İcracı Ortak',     'Olay bazlı',                'EVENT',     'Toplantı sonrası follow-up / lead yok',    '<=48s girildi',     '48-72s yok',      '>=72s veya leadsiz',  'İç hatırlatma + Odaka görev',          '5_ODAK',                'Faz -1'),
  (3,  'CRM / Network',              NULL,          'Tümü',             'Pazarlama ve Satış', 'İcracı Ortak',     'Olay bazlı',                'EVENT',     'Network görüşme görevi oluşmadı',          'görev açıldı',      '1g açılmadı',     '>=2g açılmadı',       'Network görevi oluştur',               '3_NETWORK',             'Faz -1'),
  (4,  'Manuel giriş',               NULL,          'Tümü',             'Operasyon',          'İcracı Ortak',     'Olay bazlı',                'EVENT',     'İş çıktısı tanımsız',                      '3 zorunlu alan dolu','biri eksik',     'çıktı tanımsız',      'Eksik alanları tamamlat',              '5_ODAK',                'Faz -1'),
  (5,  'Fevup Haftalık Özet',        'fevup',       'Fevup',            'Denetim',            'YK Üyesi',         'Haftalık (Cuma)',           'ABSENCE',   'Haftalık operasyon raporu gelmedi',        'gün içinde geldi',  '+1g gecikti',     '+2g gelmedi',         'İç bildirim taslağı (gönderim yok)',   '4_DENETIM',             'Faz -1'),
  (6,  'Fevup Aylık YK Raporu',      'fevup',       'Fevup',            'Denetim',            'YK Üyesi',         'Aylık',                     'ABSENCE',   'Aylık YK raporu gelmedi',                  'ay içinde geldi',   '+2g gecikti',     'ay bitti gelmedi',    'İç bildirim taslağı',                  '4_DENETIM',             'Faz -1'),
  (7,  'Fevup Aylık Faaliyet Raporu','fevup',       'Fevup',            'Denetim',            'YK Üyesi',         'Aylık',                     'ABSENCE',   'Aylık faaliyet raporu gelmedi',            'geldi',             'gecikti',         'gelmedi',             'İç bildirim taslağı',                  '4_DENETIM',             'Faz -1'),
  (8,  'Marqby Aylık YK Raporu',     'marqby',      'Marqby',           'Denetim',            'YK Üyesi',         'Aylık',                     'ABSENCE',   'Marqby faaliyet raporu gelmedi',           'geldi',             'gecikti',         'gelmedi',             'Yorum + revizyon (icra etme)',         '4_DENETIM',             'Faz -1'),
  (9,  'Network ritmi (Motor B)',    'juris',       'Juris',            'Pazarlama ve Satış', 'İcracı Ortak',     'Haftalık',                  'CADENCE',   'Haftalık network görüşmesi',               '>=hedef',           '1 görüşme',       '0 görüşme',           'Network çek ve görev aç',              '3_NETWORK',             'Faz -1'),
  (10, 'Aylık müşteri toplantısı',   'juris',       'Juris',            'Satış',              'İcracı Ortak',     'Aylık',                     'CADENCE',   'Aylık müşteri toplantısı',                 'yapıldı',           'gecikti',         'yapılmadı',           'Toplantı planla',                      '5_ODAK',                'Faz -1'),
  (11, 'Masabaşı günlük çıktı',      'juris',       'Juris',            'Operasyon',          'İcracı Ortak',     'Günlük (Pzt-Cmt)',          'CADENCE',   'Günlük çıktı bloğu',                       'girildi',           'kısmi',           'girilmedi',           'Günlük hatırlatma',                    '5_ODAK',                'Faz 0'),
  (12, 'Haftalık içerik',            'juris',       'Juris',            'Pazarlama',          'İcracı Ortak',     'Haftalık (~1.2/hafta)',     'CADENCE',   'Haftalık içerik üretimi (60/yıl)',         'hedefte',           'altında',         'üretilmedi',          'İçerik görevi aç',                     '2_URUN_HIZMET_YATIRIM', 'Faz 0'),
  (13, 'Tahsilat takibi',            'juris',       'Juris',            'Finans',             'İcracı Ortak',     'Sürekli',                   'THRESHOLD', 'Tahsilat gecikmesi',                       '<7g',               '7-14g',           '>=14g',               'Tahsilat görevi + uyarı',              '1_HARITA',              'Faz -1'),
  (14, 'OPEX karşılama',             'juris',       'Juris',            'Finans',             'İcracı Ortak',     'Aylık',                     'THRESHOLD', 'OPEX danışmanlık geliriyle karşılanma',    '>=OPEX',            '%80-100',         '<%80',                'Finans aksiyonu',                      '1_HARITA',              'Faz 0'),
  (15, 'Danışmanlık satış hedefi',   'juris',       'Juris',            'Satış',              'İcracı Ortak',     'Yıllık (600K TL)',          'THRESHOLD', 'Danışmanlık satış hedefi',                 'hedefte',           '%70-100',         '<%70',                'Satış pipeline aksiyonu',              '1_HARITA',              'Faz 0'),
  (16, 'Fevup ROI / satış eşiği',    'fevup',       'Fevup',            'Denetim',            'YK Üyesi',         'Aylık',                     'THRESHOLD', 'ROI / satış eşiği altı',                   'eşik üstü',         'sınırda',         'eşik altı',           'Yorum + revizyon (icra etme)',         '4_DENETIM',             'Faz 0'),
  (17, 'Lead -> teklif',             'juris',       'Juris',            'Satış',              'İcracı Ortak',     'Olay / Eşik',               'EVENT',     'Leadden teklife dönüş',                    'verildi',           '2-4g',            '>=5g',                'Teklif görevi aç',                     '1_HARITA',              'Faz -1'),
  (18, 'Inforexpect İG milestone',   'inforexpect', 'Inforexpect',      'İş Geliştirme',      'İcracı Gel. Ortak','Çeyreklik',                 'CADENCE',   'İG milestone ilerleme',                    '1 ilerledi',        'yavaş',           '0 ilerleme',          'Milestone gözden geçir',               '1_HARITA',              'Faz 0'),
  (19, 'Arivon Product Hunt',        'arivon',      'Arivon',           'İş Geliştirme',      'İcracı Gel. Ortak','Milestone',                 'EVENT',     'Product Hunt hedefi',                      '1. sıra',           'top 5',           'sıralama yok',        'Lansman aksiyonu',                     '2_URUN_HIZMET_YATIRIM', 'Faz 0'),
  (20, 'Meridyen ilk işlem',         'meridyen',    'Meridyen',         'Satış',              'İcracı Gel. Ortak','Milestone',                 'EVENT',     'İlk işlem gerçekleşti mi',                 'gerçekleşti',       'görüşmede',       'yok',                 'İlk işlem aksiyonu',                   '1_HARITA',              'Faz -1'),
  (21, 'Öncelik çatışması',          NULL,          'Tümü',             'Strateji',           'Ortak',            'Olay bazlı',                'THRESHOLD', 'Kaynak / öncelik çatışması',               'çatışma yok',       'potansiyel',      'aktif çatışma',       'Juris önceliğiyle çöz',                '0_STRATEJI',            'Faz 0'),
  (22, 'Task yaş sınırı',            NULL,          'Tümü',             'Operasyon',          'İcracı Ortak',     'Çeyreklik',                 'THRESHOLD', 'Açık task yaşı',                           '<60g',              '60-90g',          '>=90g',               'Task gözden geçir / kapat',            '5_ODAK',                'Faz 0'),
  (23, 'Haftalık odak üretimi',      NULL,          'Tümü',             'Operasyon',          'İcracı Ortak',     'Haftalık (Pzt)',            'ABSENCE',   'Haftalık odak üretildi mi',                'üretildi',          'gecikti',         'üretilmedi',          'Haftalık Odak üret',                   '5_ODAK',                'Faz -1')
ON CONFLICT (id) DO NOTHING;

-- ── signals (Sinyal Log — idempotent) ─────────────────────
CREATE TABLE IF NOT EXISTS signals (
  id               BIGSERIAL PRIMARY KEY,
  ts               TIMESTAMPTZ NOT NULL DEFAULT now(),
  trigger_id       INTEGER NOT NULL REFERENCES triggers(id),
  org_slug         TEXT REFERENCES orgs(slug),
  signal           TEXT NOT NULL CHECK (signal IN ('GREEN','YELLOW','RED')),
  reason           TEXT,
  suggested_action TEXT,
  dashboard        TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','CLOSED')),
  day              DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Idempotency: bir tetikleyici için günde yalnızca tek AÇIK sinyal
CREATE UNIQUE INDEX IF NOT EXISTS uniq_open_signal_per_trigger_day
  ON signals (trigger_id, day) WHERE status = 'OPEN';
CREATE INDEX IF NOT EXISTS idx_signals_status ON signals (status);

-- ── tasks (Is_Kalemleri / Odak) ───────────────────────────
-- 3 zorunlu alan dolana kadar Durum = TASLAK
CREATE TABLE IF NOT EXISTS tasks (
  id               BIGSERIAL PRIMARY KEY,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  source           TEXT,
  org_slug         TEXT REFERENCES orgs(slug),
  function         TEXT,
  responsible_role TEXT,
  description      TEXT,
  expected_output  TEXT,                          -- zorunlu (çıktı)
  due_date         DATE,                          -- zorunlu (tarih)
  linked_goal      TEXT,
  lead_offer       TEXT,
  signal           TEXT CHECK (signal IN ('GREEN','YELLOW','RED')),
  trigger_id       INTEGER REFERENCES triggers(id),
  status           TEXT NOT NULL DEFAULT 'TASLAK' CHECK (status IN ('TASLAK','ACIK','KAPALI')),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks (due_date);

-- ── notifications (Bildirim Kutusu) ───────────────────────
-- Dış gönderim YOK. Her uyarı taslak; İNSAN onaylar/gönderir.
CREATE TABLE IF NOT EXISTS notifications (
  id            BIGSERIAL PRIMARY KEY,
  ts            TIMESTAMPTZ NOT NULL DEFAULT now(),
  priority      TEXT NOT NULL DEFAULT 'Orta' CHECK (priority IN ('Yüksek','Orta','Düşük')),
  subject       TEXT NOT NULL,
  to_suggestion TEXT,                  -- Kime (öneri)
  draft_text    TEXT,                  -- Taslak Metin (asla otomatik gönderilmez)
  trigger_id    INTEGER REFERENCES triggers(id),
  read          BOOLEAN NOT NULL DEFAULT false,
  approved_by   TEXT REFERENCES roles(slug),  -- İNSAN onayı
  approved_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications (read);

-- Denetim izi
INSERT INTO audit_log (actor, action, entity, detail)
VALUES ('SYSTEM', 'SCHEMA_MIGRATE', 'database',
        '{"version": "0.2", "migration": "0002_data_model", "seed": {"orgs": 6, "triggers": 23, "roles": 3}}'::jsonb);
