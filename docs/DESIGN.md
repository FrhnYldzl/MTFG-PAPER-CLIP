# Tasarım Sistemi — MTFG Paperclip Dashboard

> **Durum:** Spesifikasyon (E14 / v0.3'te uygulanacak).
> **İlham:** ARIWON marka dili ve SaaS estetiği (Drive: "ARIWON — Marka Kimliği &
> Claude Design Brief", "Sirius Wave & Orion Design Brief").
>
> **Kural:** Ariwon'un dili birebir kopyalanmaz; aynı *aileden* hissettiren, ama
> MTFG Paperclip'e özgü bir kimlik kurulur (premium, koyu, elektrik aksanlı,
> yukarı/ileri hareket eden "canlı kalp").

## 1. Tasarım Felsefesi (Ariwon'dan devralınan)

- **Visual DNA:** WAVE (sinyal/frekans) · ASCENT (yukarı momentum) · PRECISION (AI titizliği).
- **Stil:** Modern + premium, geometric+organic hibrit, **bold whitespace**, yüksek kontrast.
- **Koyu mod birincil:** Void arkaplan + elektrik aksanlar + hafif "glow".
- **Hareket:** Her zaman yukarı/ileri; hiçbir şey aşağı düşmez (kazanma narratifi).
  Geçişler hızlı ama akıcı (`0.3s ease-out`); aktif sinyallerde "pulse".

## 2. Renk Sistemi

### Marka (Ariwon ailesinden, MTFG'ye uyarlanmış)
| Token | Hex | Kullanım |
|---|---|---|
| `--bg` (Void) | `#0A0A0F` | Ana arkaplan (dark) |
| `--surface` | `#14141C` | Kart / panel |
| `--surface-2` | `#1E1E29` | Yükseltilmiş katman, hover |
| `--text` (Signal White) | `#F5F5FF` | Birincil metin |
| `--text-muted` (Data Gray) | `#8A8A9E` | İkincil/teknik metin |
| `--border` | `rgba(245,245,255,0.08)` | İnce ayraçlar |
| `--primary` (Signal Indigo) | `#5B47FF` | CTA, vurgu, marka (Ariwon Electric `#5B3FFF`'ten ayrıştırıldı) |
| `--primary-2` | `#7A5CFF` | Gradient bitiş / hover |

### ⭐ Sinyal renkleri (sistemin kalbi — Ariwon paletiyle hizalı)
| Sinyal | Token | Hex | Ariwon kaynağı |
|---|---|---|---|
| 🟢 YEŞİL (sağlıklı) | `--signal-green` | `#00C9B8` | Flow Teal (akış/momentum) |
| 🟡 SARI (izle/uyar) | `--signal-yellow` | `#FFB800` | WIN Gold (uyarı/eşik) |
| 🔴 KIRMIZI (aksiyon) | `--signal-red` | `#FF5C5C` | Vibe Coral (acil/enerji) |

> Her sinyal renginin bir "soft" (arkaplan, %12 opaklık) ve bir "solid" (rozet/metin) varyantı olur.

### Gradient & efekt
- **Pulse Gradient:** `#5B47FF → #7A5CFF` (CTA, aktif kart kenarı).
- **Glow:** aktif/kritik elementlerde `box-shadow` ile renkli hafif ışıma.

## 3. Tipografi
- **Başlık:** Space Grotesk (Bold/Heavy) — alternatif Satoshi/Neue Montreal.
- **Gövde:** Inter (Regular/Medium).
- **Sayılar (metrik/KPI):** Inter veya Space Grotesk tabular-nums.
- Skala (rem): `12 · 14 · 16 · 20 · 24 · 32 · 48`. Başlıklar tek satırda güçlü.

## 4. Layout & Bileşenler (SaaS mantığı)
- **Shell:** Sol daraltılabilir **sidebar** (5+1 dashboard navigasyonu) + üst **topbar**
  (arama, bildirim kutusu rozeti, kullanıcı). İçerik alanı kart ızgarası.
- **5+1 Dashboard** her panel bir route:
  `0 Strateji · 1 Harita · 2 Ürün-Hizmet-Yatırım · 3 Network · 4 Denetim · 5 Odak`.
- **Sinyal Şeridi (Signal Strip):** her panelin üstünde yeşil/sarı/kırmızı dağılımını
  gösteren yatay şerit (canlı kalp hissi).
- **Kartlar:** `--surface`, `--radius-lg` (16px), ince border, hover'da hafif yükselme.
- **Sinyal Rozeti (Badge):** renk + ikon + sayı; kritikte hafif pulse.
- **Bildirim Kutusu (Inbox):** sağ panel/drawer; taslaklar + **"İNSAN onayı bekliyor"**
  durumu (dış gönderim yok vurgusu UI'da net görünür).
- **Task/Odak listesi:** durum çipleri (TASLAK / AÇIK / KAPALI), sorumlu rol, hedef tarih.

## 5. Marka tonu (UI metinleri)
- Bold, sıcak, enerjik; "kazanma" değil ama "kontrol/sükunet" tonu:
  *"Problem sistemde, kaygı sende değil."* Kısa, net, Türkçe.

## 6. Teknik (E14'te)
- React + Vite + TypeScript; CSS değişkenleri (`tokens.css`) + hafif util (CSS Modules
  veya Tailwind — E14'te karar). Token'lar `ui/src/styles/tokens.css`'te hazır.
- Tema: dark birincil; light varyant token'ları sonradan eklenir.

## 7. Ariwon'dan ayrışma (telif/özgünlük)
- Primary hue kaydırıldı (`#5B3FFF` → `#5B47FF`), isimlendirme MTFG'ye özgü
  ("Signal Indigo", "Signal Strip", "Canlı Kalp").
- "WIN/HUNT/FLOW" sloganları kullanılmaz; MTFG tonu (denetim + sükunet) esas alınır.
- Aynı *his* (premium dark + elektrik + sinyal), farklı *kimlik*.
