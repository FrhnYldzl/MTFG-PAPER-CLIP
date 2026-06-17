# Yol Haritası — MTFG Paperclip

Versiyonlama: **SemVer + Faz**. `v0.x` = MVP (Faz -1/0), `v1.0` = ajan katmanı (Faz 1).

| Sürüm | Faz | Tema | Durum |
|---|---|---|---|
| **v0.1** | Faz 0 | İskelet & Defter (foundation) | 🚧 Devam ediyor |
| v0.2 | Faz -1 | Üç Motor & Sinyal (Living Heart MVP) | 🚧 Devam ediyor (E5 ✅) |
| v0.3 | Faz 0+ | Tam Kütük & 5+1 Dashboard | ⏳ Planlandı |
| v1.0 | Faz 1 | Ajan Katmanı (semi-autonomous) | ⏳ Planlandı |

---

## v0.1 — İskelet & Defter
- **E1** Repo & İskelet (monorepo, TS, lint)
- **E2** Postgres & Migration (config + audit_log)
- **E3** Railway Deploy + CI + health endpoint
- **E4** ⭐ COWORK/İNSAN/CODE Defteri (repo + Drive)
- **Exit:** Boş ama deploy edilmiş, dokümante, devredilebilir sistem.

## v0.2 — Üç Motor & Sinyal
- **E5** ✅ Veri Modeli (triggers 23 seed, signals, tasks, roles/orgs, notifications)
- **E6** ✅ Sinyal Motoru (yeşil/sarı/kırmızı, idempotent, escalate)
- **E7** ✅ Motor A — Toplantı → Follow-up → İş
- **E8** Motor B — Network Çekme & Aktivasyon
- **E9** Motor C — Rol-Bazlı Denetim Sinyali
- **E10** Governance (taslak → İNSAN onayı, send scope yok)
- **E11** Haftalık Odak Üreteci
- **Exit:** Sistem ilk kez kendi haftalık odağını üretir ve sinyal verir.

## v0.3 — Tam Kütük & 5+1 Dashboard
- **E12** Scheduler (cron ritimleri)
- **E13** Mail Intake (Gmail readonly)
- **E14** 5+1 React Dashboard — **Ariwon ailesinden tasarım dili** (bkz. `docs/DESIGN.md`, `ui/src/styles/tokens.css`)
- **E15** Config & Hedef Takibi
- **E16** Rutin Keşfi (light)
- **Exit:** Tüm 23 tetikleyici canlı, panellerden izlenir, haftalık otomatik odak.

## v1.0 — Ajan Katmanı
- **E17** Ajan Çerçevesi (rol bazlı, Claude API ile AI Analizi)
- **E18** AI Analiz Pipeline (rapor karşılaştırma)
- **E19** Çok-kullanıcı & Kimlik
- **E20** Portability (Company Import/Export)
- **Exit:** Yarı-otonom işleyen "şirket".

---

### COWORK / İNSAN / CODE — Sorumluluk Matrisi

| | COWORK (Claude) | İNSAN (Ferhan/Gülşah) | CODE (repo) |
|---|---|---|---|
| Karar | Öneri üretir | **Onaylar** (tek yetkili) | — |
| Dış gönderim | Taslak yazar | **Onaylar/gönderir** | scope'ta `send` yok |
| Kanıt | Defter'e yazar | İmza/onay satırı | commit/PR linki |
