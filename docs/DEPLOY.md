# Railway Deploy Kılavuzu — MTFG Paperclip

Tek servis: derlenmiş React paneli (`ui/dist`) + Node API aynı serviste.

## 1. Branch
Railway servisinin **Settings → Source → Branch** ayarını deploy edilen dala getir:
`claude/laughing-volta-89nze9` (veya bu dal `main`'e merge edilirse `main`).

## 2. Postgres
Railway projesine **New → Database → PostgreSQL** ekle. Otomatik `DATABASE_URL` sağlar.

## 3. Servis Değişkenleri (Variables)
| Anahtar | Değer | Not |
|---|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | Postgres servisinden referansla |
| `NODE_ENV` | `production` | |
| `TZ` | `Europe/Istanbul` | ritim saatleri |
| `SCHEDULER_ENABLED` | `true` | in-process cron ritimleri (günlük/haftalık/aylık/çeyreklik) |
| `PGSSL` | *(boş bırak)* | İç bağlantı SSL istemez. Public proxy URL kullanırsan `require` yap |
| `GOOGLE_CLIENT_ID` / `_SECRET` / `_REFRESH_TOKEN` | *(opsiyonel)* | mail intake için, bkz. `GOOGLE_OAUTH_SETUP.md` |

> `PORT` Railway tarafından otomatik verilir; kod onu kullanır.

## 4. Build & Start (otomatik)
`railway.json` / `nixpacks.toml`:
- **Build:** `pnpm install --frozen-lockfile && pnpm build` (shared → ui → server)
- **Start:** `pnpm migrate && pnpm start` (önce şema migrate, sonra sunucu)
- **Healthcheck:** `/health`

## 5. Doğrulama
Deploy bitince:
- `https://<servis>.up.railway.app/health` → `{"status":"ok",...}`
- `https://<servis>.up.railway.app/` → dashboard (5+1 panel)
- `.../api/triggers` → 23 tetikleyici (DB seed çalıştı demektir)

## 6. Sık sorun
- **Boş/404:** Railway yanlış branch'e bakıyor → adım 1.
- **DB SSL hatası ("server does not support SSL"):** `PGSSL` değişkenini sil (iç bağlantı SSL istemez).
- **Build'de tsc/vite yok:** devDependencies kurulmamış → Railway'de `NODE_ENV` install'dan sonra set edilmeli; nixpacks varsayılanı devDeps'i kurar.
- **migrate hatası:** `DATABASE_URL` referansı yanlış; Postgres servisini bağla.
