# DECISIONS — Mimari & Ürün Kararları (ADR)

> Her önemli karar buraya kısa bir ADR olarak yazılır.
> Format: bağlam → karar → gerekçe → durum.

---

## ADR-0001 — Stack: Railway + Postgres + Node/TS (Apps Script yerine)
- **Tarih:** 2026-06-17
- **Bağlam:** Drive konsept dokümanları sistemi Google Apps Script + Sheets üzerine kurguluyordu. İNSAN ise Railway + Postgres kullanıyor ve domaine taşıyabiliyor; ayrıca devredilebilirlik ve ölçeklenebilirlik isteniyor.
- **Karar:** Motor ve dashboard **Railway + PostgreSQL + Node/TypeScript + React** üzerine kurulur. Google Workspace yalnızca **readonly** veri kaynağı ve kanıt deposu olarak kalır.
- **Gerekçe:** Hesap-bağımsız devredilebilirlik, kalıcı/denetlenebilir veri (DB seviyesinde idempotency & audit), mevcut altyapı uyumu.
- **Durum:** ✅ Kabul (İNSAN onayı: AskUserQuestion, 2026-06-17).

## ADR-0002 — Devir Defteri: Hem Drive hem repo
- **Tarih:** 2026-06-17
- **Bağlam:** Farklı Claude Code hesabından gelindiğinde COWORK/İNSAN/CODE iletişimi ve kanıtları yazılı izlenebilmeli.
- **Karar:** Çift katman — repo içi `docs/ledger/*.md` + Drive'da "00. Cowork–İnsan–Code Defteri". Her oturum sonu senkron.
- **Gerekçe:** Repo kod kanıtını, Drive hesap-bağımsız kalıcı izi sağlar.
- **Durum:** ✅ Kabul (İNSAN onayı: AskUserQuestion, 2026-06-17).

## ADR-0003 — Dış gönderim kalıcı yasak (governance guardrail)
- **Tarih:** 2026-06-17
- **Bağlam:** Orijinal tasarımın mutlak kuralı: gönderme kararı her zaman insandadır.
- **Karar:** `gmail.send` scope'u hiçbir fazda istenmez; tüm dış aksiyonlar Bildirim Kutusu'na taslak olarak yazılır, İNSAN onaylar/gönderir.
- **Gerekçe:** Güven, kontrol, kaygıyı sisteme yükleme ilkesi.
- **Durum:** ✅ Kabul (orijinal konsept guardrail'i).
