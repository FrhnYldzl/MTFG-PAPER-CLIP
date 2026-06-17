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

## ADR-0004 — UI/UX tasarım dili: Ariwon ailesinden ilham (birebir değil)
- **Tarih:** 2026-06-17
- **Bağlam:** İNSAN, dashboard'un Ariwon tasarım dili ve SaaS mantığına büyük oranda benzemesini ama birebir aynı olmamasını istedi (Drive: ARIWON & Sirius Wave/Orion Design Brief).
- **Karar:** Premium koyu mod + elektrik aksan + "canlı kalp" sinyal estetiği benimsenir. Sinyal renkleri Ariwon paletiyle hizalanır (Flow Teal→🟢, WIN Gold→🟡, Vibe Coral→🔴). Primary hue ayrıştırılır (`#5B3FFF`→`#5B47FF` "Signal Indigo"), isimlendirme MTFG'ye özgü; WIN/HUNT/FLOW sloganları kullanılmaz. Spec `docs/DESIGN.md`, token'lar `ui/src/styles/tokens.css`.
- **Gerekçe:** Aynı aileden his, özgün kimlik; telif/özgünlük güvencesi. E14'te uygulanır.
- **Durum:** ✅ Kabul (İNSAN talebi, 2026-06-17). Uygulama: v0.3 / E14.

## ADR-0005 — "İcra üretmeme" guardrail'ı sistemik
- **Tarih:** 2026-06-17
- **Bağlam:** Denetim rolündeki iştiraklerde (Marqby; Fevup denetim tetikleyicileri) sistem icra üretmemeli; yalnızca yorum + revizyon önerisi vermeli.
- **Karar:** `escalate` rol-duyarlı: `org.audit_only = true` VEYA tetikleyici aksiyonu "icra etme" içeriyorsa görev açılmaz, sadece "icra üretilmez" ön ekli yorum+revizyon taslağı (Bildirim Kutusu) oluşur.
- **Gerekçe:** Rolün dışına çıkmama guardrail'i; tek noktada (escalate) uygulanınca tüm motorlar için tutarlı.
- **Durum:** ✅ Kabul. Entegrasyonla doğrulandı (Marqby denetim → görev yok).
