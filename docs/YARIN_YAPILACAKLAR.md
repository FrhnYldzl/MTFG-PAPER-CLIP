# Yapılacaklar — Devam Listesi

> Son durum (2026-06-17): Kod ve build tamamen hazır, `main`'e push edildi. Tek servis
> mimarisi (UI + API) doğrulandı. Kalan iş **Railway deploy + Gmail bağlama** — hepsi
> dashboard/console işi, kod değişikliği gerekmiyor.

---

## A. Railway Deploy (tek servis)
- [ ] Eski iki bozuk servisi sil: `@paperclip/server` ve `@paperclip/ui` (her birinde Settings → Delete Service)
- [ ] Yeni tek servis: **+ New → GitHub Repo → `mtfg-paper-clip`**
  - [ ] Root Directory: `/`
  - [ ] Branch: `main`
- [ ] Postgres ekle (**+ New → Database → PostgreSQL**)
- [ ] Servis **Variables**'a gir:
  - [ ] `DATABASE_URL=${{Postgres.DATABASE_URL}}`
  - [ ] `NODE_ENV=production`
  - [ ] `TZ=Europe/Istanbul`
  - [ ] `SCHEDULER_ENABLED=true`
- [ ] Deploy bitince doğrula:
  - [ ] `GET /health` → `status: ok`
  - [ ] `GET /` → UI açılıyor
  - [ ] `GET /api/triggers` → tetikleyici listesi dolu (referans veri çalışıyor demek)

> Bu noktada paneller hâlâ BOŞ olacak — normal. Sinyal üretmek için B adımı şart.

---

## B. Gmail Intake Bağla (panelleri doldurur)
> Hepsi SENİN kendi Google hesabınla, Google Cloud Console üzerinden. Detay: `docs/GOOGLE_OAUTH_SETUP.md`

- [ ] Google Cloud Console → yeni proje (`mtfg-paperclip`)
- [ ] APIs & Services → Library → **Gmail API** + **Google Calendar API** → Enable
- [ ] OAuth consent screen → External → uygulama adı/e-posta → **Test users**'a kendi Gmail'ini ekle
- [ ] Scope ekle: `gmail.readonly` + `calendar.readonly`
- [ ] Credentials → Create credentials → **OAuth client ID → Desktop app** → Client ID + Secret kopyala
- [ ] Lokalde refresh token üret:
  ```bash
  GOOGLE_CLIENT_ID="..." GOOGLE_CLIENT_SECRET="..." \
    node server/scripts/get-refresh-token.mjs
  ```
- [ ] Railway Variables'a 3 değişkeni ekle:
  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `GOOGLE_CLIENT_SECRET`
  - [ ] `GOOGLE_REFRESH_TOKEN`
- [ ] Intake'i tetikle (08:00 cron'unu beklemeden):
  ```bash
  curl -X POST https://<railway-domain>/api/intake/mail
  # → {"processed": N, "configured": true}
  ```
- [ ] Paneller doldu mu kontrol et 🎉

---

## Sorun Giderme Notları
- `/api/intake/mail` → `"configured": false` veya `-1`: 3 Google env değişkeninden biri eksik/yanlış.
- Paneller boş ama `/api/triggers` dolu: sinyal yok demek → B adımını tamamla veya görev oluştur.
- `refresh_token` gelmedi: Google hesabından uygulama erişimini kaldırıp script'i tekrar çalıştır (consent zorunlu).
- Build'de `tsc: not found`: çözüldü (`railway.json` → `--prod=false`). Tekrar çıkarsa env'de eski cache olabilir, redeploy.

## Açık/Ertelenen
- [ ] Boştaki remote branch `claude/laughing-volta-89nze9` silinecek (zararsız, kozmetik)
- [ ] (Opsiyonel) UI'a "Intake'i çalıştır" butonu — şu an sadece curl ile tetikleniyor
