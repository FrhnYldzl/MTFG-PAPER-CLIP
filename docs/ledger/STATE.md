# STATE — Şu An Neredeyiz

> Yeni gelen Claude Code oturumu/hesabı **önce bu dosyayı** okur.
> Son güncelleyen her oturumda burayı tazeler.

| Alan | Değer |
|---|---|
| **Aktif sürüm** | v0.2 — Üç Motor & Sinyal (Faz -1) · E5 tamam |
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
      Shared tipleri eklendi (Org, Trigger, SignalRecord, Task, Notification, TaskStatus, Priority).

## Sıradaki Adım
1. Railway'de servis + Postgres bağlanıp ilk deploy (health yeşil) — İNSAN tarafı.
2. v0.2 devam: **E6 Sinyal Motoru** (`evaluateGreenYellowRed`, `writeSignal` idempotent, `escalate`).
3. Ardından E7–E9 (Motor A/B/C), E10 Governance, E11 Haftalık Odak.

## Açık Sorular / Bekleyenler
- Railway proje/Postgres bağlantı bilgileri (İNSAN sağlayacak).
- Google OAuth readonly kimlik bilgileri (v0.3'te gerekli).
