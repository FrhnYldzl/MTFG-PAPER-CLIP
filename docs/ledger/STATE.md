# STATE — Şu An Neredeyiz

> Yeni gelen Claude Code oturumu/hesabı **önce bu dosyayı** okur.
> Son güncelleyen her oturumda burayı tazeler.

| Alan | Değer |
|---|---|
| **Aktif sürüm** | ✅ v0.3 — Tam Kütük & 5+1 Dashboard TAMAMLANDI (E12–E16) · 🚀 Railway deploy (tek servis, main) |
| **Aktif branch** | `claude/laughing-volta-89nze9` |
| **Son güncelleme** | 2026-06-17 |
| **Genel durum** | ✅ v0.1 + v0.2 bitti. 🚧 v0.3: E14 dashboard + preview hazır; E13 Gmail/Calendar readonly OAuth + mail intake kodu + refresh-token script + kurulum kılavuzu hazır (canlı bağlama için İNSAN: Google Cloud kimlik bilgileri `.env`'e). Sırada E12 Scheduler, E15 Config/Hedef, E16 Rutin Keşfi. |
| **İNSAN aksiyonu bekleyen** | `docs/GOOGLE_OAUTH_SETUP.md` izleyip GOOGLE_CLIENT_ID/SECRET/REFRESH_TOKEN üret → mail intake canlanır. |
| **Drive defteri** | [00. Cowork–İnsan–Code Defteri](https://docs.google.com/spreadsheets/d/1kI5U9ekNNdxWv60EEyLNsPNL5u90bFhFSblHkq0Lk-o) |

## Tamamlananlar
- [x] **E1** Monorepo iskeleti (package.json, workspaces, tsconfig, .gitignore, .env.example)
- [x] **E3** Railway (`railway.json`, `nixpacks.toml`) + CI (`.github/workflows/ci.yml`) + health endpoint
- [x] **E4** Devir defteri (repo `docs/ledger/` + Drive ["00. Cowork–İnsan–Code Defteri"](https://docs.google.com/spreadsheets/d/1kI5U9ekNNdxWv60EEyLNsPNL5u90bFhFSblHkq0Lk-o))
- [x] **E2** Postgres bağlantısı + migration runner + `0001_init.sql` (config + audit_log)
- [x] **E5** Veri Modeli — `0002_data_model.sql`: orgs (6), roles (3), triggers (23 seed),
      signals (idempotent partial-unique), tasks (varsayılan TASLAK), notifications (Bildirim Kutusu).
- [x] **E6** Sinyal Motoru — `engine/signalEngine.ts` (saf `evaluate`), `engine/signalStore.ts`
      (idempotent `writeSignal`, `escalate`, `processObservation`), `db/configStore.ts`.
- [x] **E7** Motor A (Toplantı → Follow-up → İş) — `engine/motorA.ts`: saf `meetingSignal`
      (leadsiz→🔴, follow-up→🟢, saat eşiği 48/72), `processMeeting` (zorunlu intake TASLAK görevi +
      sinyal). `0003`: signals.entity_key → olay-bazlı idempotency (aynı gün çok toplantı ayrı izlenir).
      Pool lazy yapıldı (saf testler DB istemez). Entegrasyon testi geçti.
- [x] **E8** Motor B (Network Çekme & Aktivasyon) — `engine/motorB.ts`: saf `networkSignal`
      (0→🔴, hedef altı→🟡, hedef+→🟢), `processNetworkWeek` (hafta-bazlı idempotent görüşme görevleri +
      sinyal; hedef config'ten). Entegrasyon testi geçti (dolu hafta 🟢, network'süz hafta 🔴+eskalasyon).
- [x] **E9** Motor C (Rol-Bazlı Denetim) — `engine/motorC.ts`: `auditSignal` (yokluk),
      `opexSignal` (eşik), `processAuditAbsence`, `processOpex` (dönem-bazlı idempotent).
      **Guardrail sistemik:** `escalate` artık icra üretmeme kuralına uyar (audit_only org veya
      "icra etme" aksiyonu → görev YOK, sadece yorum+revizyon taslağı). Entegrasyon: Fevup yokluk→görev,
      Marqby denetim→görev yok (yalnız taslak), OPEX %75→görev.
- [x] **E10** Governance — `engine/governance.ts`: `approveNotification` (yalnız can_approve İNSAN,
      audit kaydı), `listPendingNotifications`. Sistem hiçbir koşulda dışarı GÖNDERMEZ.
- [x] **E11** Haftalık Odak Üreteci — `engine/focus.ts`: saf `buildFocusDraft` + `generateWeeklyFocus`
      (açık 🔴/🟡 + ≤90g açık görev → "XX. Hafta MTFG Odak" taslağı, idempotent; tetikleyici #23 GREEN).
- [x] **API** — `routes/api.ts`: GET signals/tasks/notifications/orgs/triggers, POST focus, POST approve.
      Canlı sunucu smoke testi geçti (curl).
- [x] **Tasarım (E14 hazırlık):** `docs/DESIGN.md` + `ui/src/styles/tokens.css` (Ariwon ailesinden, ADR-0004).

## Sıradaki Adım — v1.0 (Ajan Katmanı) veya deploy
- v0.3 tamamlandı (E12 Scheduler, E13 Mail Intake, E14 Dashboard, E15 Hedef Takibi, E16 Rutin Keşfi).
- **Deploy:** Tek servis (server, `ui/dist`'i de sunar) → Railway. `main` dalı oluşturuldu; build/start/healthcheck `railway.json`'da. Kılavuz: `docs/DEPLOY.md`.
- **İNSAN aksiyonu (canlı için):** (a) Railway'de Postgres ekle + `DATABASE_URL` referansla, (b) `NODE_ENV=production`, `TZ=Europe/Istanbul`, `SCHEDULER_ENABLED=true`, (c) Gmail OAuth (opsiyonel, `docs/GOOGLE_OAUTH_SETUP.md`).
- **v1.0 epic'leri:** E17 Ajan Çerçevesi, E18 AI Analiz Pipeline, E19 Çok-kullanıcı/Kimlik, E20 Portability.
- UI onaylandı (Ariwon dili + font sadakati).

## Açık Sorular / Bekleyenler
- Railway proje/Postgres bağlantı bilgileri (İNSAN sağlayacak).
- Google OAuth readonly kimlik bilgileri (v0.3'te gerekli).
