# Tasarım Sistemi — MTFG Paperclip Dashboard

> **Kaynak (gerçek):** ARIWON marka tasarım dosyaları (zip → HTML):
> `01LogoSystem`, `02BrandFoundation`, `04PhysicalIdentity`, `05DigitalAssets`,
> `AppStoreListing`. Önceki "koyu/mor SaaS" varsayımı **yanlıştı** ve düzeltildi (ADR-0006).
>
> **Kural:** Ariwon'un *editoryal* dilini benimse (kâğıt + navy + kiremit kırmızı,
> serif + mono), ama içerik MTFG Paperclip'e özgü.

## 1. Dil / His
Editoryal, basılı-yayın hissi: bol beyaz alan, **Playfair serif** başlıklar,
**JetBrains Mono** etiketler, sakin ve premium. Neon/glow YOK. Aksan çok ölçülü
kiremit kırmızı. "Say less, mean more."

## 2. Renk Paleti (Ariwon)
| Token | Hex | Kullanım |
|---|---|---|
| `--ink` | `#0A2240` | Sidebar, vurgu (insight) kartları, metin |
| `--ink-2` | `#13305C` | İkincil koyu |
| `--paper` | `#F3EFE7` | Ana zemin (cream) |
| `--paper-2` | `#E7E0D2` | İkincil zemin |
| `--stone` | `#8F897B` | Nötr/ikincil metin |
| `--red` | `#BC2F2C` | Aksan: CTA, aktif öğe, kritik |
| `--live` | `#4E8C6A` | Pozitif/yeşil |
| `--line-ink` | `rgba(10,34,64,.14)` | Açık zeminde ayraç |
| `--line-paper` | `rgba(243,239,231,.16)` | Koyu zeminde ayraç |

### Sinyal renkleri (palete uyarlanmış)
- 🟢 YEŞİL → `--sig-green #4E8C6A` (live)
- 🟡 SARI → `--sig-yellow #C68A30` (ochre — cream üzerinde okunur)
- 🔴 KIRMIZI → `--sig-red #BC2F2C` (brand red)

## 3. Tipografi
- **Başlık:** Playfair Display (500), italik vurgu kırmızı (ör. "Komuta *Paneli*").
- **Gövde:** Hanken Grotesk (400/500/600/700).
- **Etiket/eyebrow/mono:** JetBrains Mono, UPPERCASE, letter-spacing ~0.2em.
- (Preview render'da DejaVu Serif/Sans/Mono fallback kullanılır.)

## 4. Bileşenler (Ariwon Digital Assets app ekranından)
- **Sidebar:** `--ink` zemin, cream metin; aktif öğe `rgba(paper,.10)` + kırmızı
  numara çipi/nokta; pasif öğe opacity .62.
- **Ana alan:** `--paper` zemin, ink metin.
- **Kartlar:** beyaz/paper, `--line-ink` ince kenar, yumuşak gölge, radius 14-16.
- **Insight bandı:** `--ink` koyu kart + serif metin + italik `#e9b3ad` vurgu +
  mono "● ..." satırı (Ariwon AI insight kartının birebir karşılığı).
- **Sinyal:** küçük renkli nokta (badge değil) + başlık + meta; panel no çipi (mono, pill).
- **Bildirim Kutusu:** paper kart, mono öncelik pill'i, kırmızı "İNSAN olarak onayla"
  butonu, yeşil mono "dış gönderim yok" guardrail satırı.
- **Tablo:** mono başlıklar, ink satırlar, durum çipleri (pill).
- **Marka:** halka (arc) + kırmızı tohum (seed/bee) "hive" sembolü.

## 5. Teknik
`ui/src/styles/tokens.css` (token'lar) + `ui/src/global.css` (düzen). React+Vite.
Fontlar Google Fonts'tan (Playfair Display, Hanken Grotesk, JetBrains Mono).
Preview PNG: `tools/render-preview.mjs` (resvg).

## 6. MTFG'ye uyarlama
Ariwon görsel dili korunur; "WIN/HUNT/FLOW" sloganları ve Ariwon logosu kullanılmaz.
Marka adı "Paperclip · MTFG · Canlı Kalp". Aynı *his*, farklı *kimlik*.
