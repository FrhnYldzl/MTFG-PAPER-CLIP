# STATE — Şu An Neredeyiz

> Yeni gelen Claude Code oturumu/hesabı **önce bu dosyayı** okur.
> Son güncelleyen her oturumda burayı tazeler.

| Alan | Değer |
|---|---|
| **Aktif sürüm** | v0.1 — İskelet & Defter (Faz 0) |
| **Aktif branch** | `claude/laughing-volta-89nze9` |
| **Son güncelleme** | 2026-06-17 |
| **Genel durum** | 🚧 v0.1 iskeleti kuruldu (E1–E4). Deploy & DB doğrulaması bekliyor. |

## Tamamlananlar
- [x] **E1** Monorepo iskeleti (package.json, workspaces, tsconfig, .gitignore, .env.example)
- [x] **E3** Railway (`railway.json`, `nixpacks.toml`) + CI (`.github/workflows/ci.yml`) + health endpoint
- [x] **E4** Devir defteri (repo `docs/ledger/` — Drive defteri senkronu bekliyor)
- [x] **E2** Postgres bağlantısı + migration runner + `0001_init.sql` (config + audit_log)

## Sıradaki Adım
1. `pnpm install` + `pnpm build` ile yerel/CI doğrulaması.
2. Railway'de servis + Postgres bağlanıp ilk deploy (health yeşil).
3. Drive'da **"00. Cowork–İnsan–Code Defteri"** sheet'ini oluşturup repo ledger ile senkronlama.
4. v0.2'ye geçiş: **E5 Veri Modeli** (triggers 23 seed, signals, tasks, roles, notifications).

## Açık Sorular / Bekleyenler
- Railway proje/Postgres bağlantı bilgileri (İNSAN sağlayacak).
- Google OAuth readonly kimlik bilgileri (v0.3'te gerekli).
