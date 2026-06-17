# STATE — Şu An Neredeyiz

> Yeni gelen Claude Code oturumu/hesabı **önce bu dosyayı** okur.
> Son güncelleyen her oturumda burayı tazeler.

| Alan | Değer |
|---|---|
| **Aktif sürüm** | v0.2 — Üç Motor & Sinyal (Faz -1) · E5–E8 tamam |
| **Aktif branch** | `claude/laughing-volta-89nze9` |
| **Son güncelleme** | 2026-06-17 |
| **Genel durum** | ✅ v0.1 (E1–E4) + v0.2/E5 veri modeli tamam. Yerel Postgres'te migrate + idempotency + immutability + sinyal tekilliği test edildi. Railway deploy doğrulaması bekliyor. |
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
- [x] **Tasarım (E14 hazırlık):** `docs/DESIGN.md` + `ui/src/styles/tokens.css` (Ariwon ailesinden, ADR-0004).

## Sıradaki Adım
1. Railway'de servis + Postgres bağlanıp ilk deploy (health yeşil) — İNSAN tarafı.
2. v0.2 devam: **E9 Motor C** (Rol-bazlı denetim: Fevup/Marqby yokluk + OPEX eşik).
3. Ardından E10 Governance, E11 Haftalık Odak.

## Açık Sorular / Bekleyenler
- Railway proje/Postgres bağlantı bilgileri (İNSAN sağlayacak).
- Google OAuth readonly kimlik bilgileri (v0.3'te gerekli).
