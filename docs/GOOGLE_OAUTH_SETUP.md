# Google OAuth Kurulumu (READONLY) — E13

> Mail/Calendar intake için **yalnızca okuma** yetkisi. `gmail.send` ASLA istenmez.
> Sistem dışarıya hiçbir şey göndermez; sadece okur ve taslak üretir.

## Neye ihtiyaç var?
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`

Bunlar `.env` (lokal) veya Railway değişkenlerine konur. **Asla repo'ya commit edilmez.**

## Adım adım

### 1. Google Cloud projesi + API'leri aç
1. https://console.cloud.google.com → proje oluştur (ör. "mtfg-paperclip").
2. **APIs & Services → Library**: "Gmail API" ve "Google Calendar API" → **Enable**.

### 2. OAuth consent screen
1. **APIs & Services → OAuth consent screen** → External (veya Workspace ise Internal).
2. Uygulama adı, destek e-postası vb. doldur.
3. **Scopes** ekle:
   - `.../auth/gmail.readonly`
   - `.../auth/calendar.readonly`
4. **Test users**: kendi Google hesabını ekle (yayında değilken gerekli).

### 3. OAuth client oluştur
1. **APIs & Services → Credentials → Create credentials → OAuth client ID**.
2. Tür: **Desktop app** (en kolay) — ya da **Web application** seçersen
   "Authorized redirect URIs" listesine `http://localhost:53682/` ekle.
3. Client ID + Client Secret'i kopyala.

### 4. Refresh token üret
Repo kökünde:

```bash
GOOGLE_CLIENT_ID="...apps.googleusercontent.com" \
GOOGLE_CLIENT_SECRET="..." \
node server/scripts/get-refresh-token.mjs
```

- Çıkan URL'i tarayıcıda aç, hesabınla onayla.
- "Google bu uygulamayı doğrulamadı" uyarısı çıkarsa: Advanced → Continue (test user olduğun için güvenli).
- Script `http://localhost:53682/`'de yakalar ve **REFRESH TOKEN**'i terminale basar.

### 5. .env'i doldur
```
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=1//0g...
```

### 6. Doğrula
```bash
pnpm migrate
pnpm dev
# başka terminalde:
curl -X POST http://localhost:3000/api/intake/mail
# → işlenen mail sayısı döner (kimlik bilgisi yoksa -1)
```

## Railway'de
Aynı üç değişkeni Railway servis **Variables** bölümüne ekle. `DATABASE_URL`'i Railway
Postgres otomatik sağlar. Kod değişikliği gerekmez.

## Güvenlik
- Kapsamlar readonly; `gmail.send` yok.
- Sırlar yalnızca env'de; repo/Drive'a yazılmaz (`.gitignore` korur).
- Refresh token sızarsa: Google Hesap → Güvenlik → Üçüncü taraf erişimi → kaldır, yeniden üret.
