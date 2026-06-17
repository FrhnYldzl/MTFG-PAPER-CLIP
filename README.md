# MTFG Paperclip — Canlı Kalp

> Statik dashboard'ları, her sapmayı renge (yeşil/sarı/kırmızı) ve aksiyona çeviren **canlı bir panele** dönüştüren orkestrasyon sistemi.
>
> _"Bana denetimden problem gelsin ki harekete geçeyim — kaygı bende kalmasın."_

## Kavram Zinciri

```
RİTİM (ne zaman) → RUTİN (kim/neyi) → TETİKLEYİCİ (eşik aşıldı mı)
   → SİNYAL (renk+aksiyon) → DASHBOARD + ODAK (göster + iş ata)
```

- **4 tetikleyici tipi:** Yokluk/Gecikme · Eşik · Olay · Kadans
- **3 sinyal:** 🟢 YEŞİL (sağlıklı) · 🟡 SARI (izle/uyar, 48s) · 🔴 KIRMIZI (aksiyon)
- **5+1 Dashboard:** Strateji · Harita · Ürün-Hizmet-Yatırım · Network · Denetim · Odak

## Mutlak Kurallar (Guardrails)

1. **Dış gönderim YASAK** — sistem üçüncü taraflara otomatik mail/mesaj atmaz. Tüm uyarılar iç **Bildirim Kutusu**'na *taslak* olarak düşer; **gönderme kararı her zaman insandadır.**
2. **Önce manuel/yarı-otomatik** — ölçülebilir veri yoksa otomatikleştirme.
3. **Rolün dışına çıkma** — denetim rolündeki iştiraklerde icra üretilmez.
4. **Sadelik** — az ve doğru sinyal, çok ve gürültülü sinyalden iyidir.
5. **Idempotent çalış** — tekrarlı tetiklemeler sinyal/görev kopyalamaz.

## Mimari

```
Google Workspace (Gmail/Calendar/Drive/Sheets · READONLY intake + kanıt)
        │
        ▼
Railway ── Node.js/TypeScript API ── PostgreSQL
        ├── scheduler (cron: ritimler)
        ├── trigger + signal engine
        ├── governance / approvals
        ▼
   React Dashboard (5+1)   +   Drive & repo "Cowork–İnsan–Code" Defteri
```

## Monorepo Yapısı

| Dizin | İçerik |
|---|---|
| `server/` | Node/TS API, sinyal motoru, scheduler, migration'lar |
| `ui/` | React dashboard (5+1 panel) |
| `packages/shared/` | Ortak tipler ve sabitler |
| `docs/` | Mimari, yol haritası ve **devir defteri** (`docs/ledger/`) |

## Kurulum (lokal)

```bash
pnpm install
cp .env.example .env        # DATABASE_URL'i doldur
pnpm migrate                # şemayı kur
pnpm dev                    # API'yi başlat (http://localhost:3000/health)
```

## Devredilebilirlik (önemli)

Bu proje **hesap-bağımsız devredilebilir** olacak şekilde tasarlandı. Yeni bir
Claude Code oturumu/hesabı geldiğinde önce şunu okur:

- `docs/ledger/STATE.md` — şu an neredeyiz, sıradaki adım ne
- `docs/ledger/HANDOVER.md` — devir kılavuzu
- `docs/ledger/DECISIONS.md` — alınmış kararlar
- `docs/ledger/SESSION-LOG.md` — oturum oturum COWORK/İNSAN/CODE kaydı

Aynı kayıt Google Drive'daki **"00. Cowork–İnsan–Code Defteri"** ile senkronize tutulur.

## Yol Haritası

Bkz. [`docs/ROADMAP.md`](docs/ROADMAP.md). Mevcut sürüm: **v0.1 — İskelet & Defter (Faz 0)**.

## Lisans

MIT
