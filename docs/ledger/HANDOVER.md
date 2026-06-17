# HANDOVER — Devir Kılavuzu

> Bu proje, kredi/hesap değişse bile **farklı bir Claude Code oturumunun**
> kaldığı yerden devam edebilmesi için tasarlandı. Devir bu protokolle yürür.

## Yeni Oturum Başlangıç Rutini (5 dakika)

1. `docs/ledger/STATE.md` → şu an neredeyiz, sıradaki adım ne.
2. `docs/ledger/DECISIONS.md` → alınmış mimari/ürün kararları (ADR'ler).
3. `docs/ledger/SESSION-LOG.md` → en son oturumlar ne yaptı.
4. `docs/ROADMAP.md` → faz/versiyon ve epic'ler.
5. Drive **"00. Cowork–İnsan–Code Defteri"** → İNSAN onayları ve kanıt linkleri.

## Roller

- **COWORK (Claude):** araştırır, önerir, kod yazar, defteri günceller. **Karar vermez.**
- **İNSAN (Ferhan Yıldızlı / Gülşah Algın):** onaylar, yön verir, dış gönderimi yapar. **Tek yetkili.**
- **CODE (repo):** kanıt kaynağı — commit/PR'lar her değişikliğin izidir.

## Her Oturum Sonu Rutini (devir garantisi)

1. Yapılan işi commit + push et.
2. `SESSION-LOG.md`'ye yeni satır ekle (tarih · COWORK ne yaptı · İNSAN kararı · CODE commit/PR linki).
3. `STATE.md`'yi güncelle (durum + sıradaki adım).
4. Karar alındıysa `DECISIONS.md`'ye ADR ekle.
5. Drive defterine aynı satırı yaz (repo ↔ Drive senkron).

## Mutlak Kurallar (ihlal edilmez)

1. **Dış gönderim YASAK** — `gmail.send` scope'u istenmez; tüm uyarı = taslak.
2. **İNSAN onayı** olmadan dış aksiyon yok.
3. **Idempotent** çalış; **sadelik**ten şaşma; **rolün dışına** çıkma.
4. Sırlar (token, key) **asla** repo'ya veya Drive'a yazılmaz; sadece Railway env.

## Önemli Kaynaklar (Drive)

- `06. Paperclip Sistem Tasarımı` (konsept klasörü)
- `Paperclip_ClaudeCode_Promt.md` (orijinal build spec)
- `MTFG Paper Clip Sistem Tasarımı 2. Aşama` (sunum, v2.0)
- `11. PaperClip Sistem Tasarımı Rutin Ritim ve Trigger` (operasyonel registry)
