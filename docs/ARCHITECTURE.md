# Mimari — MTFG Paperclip

## Genel Bakış

Sistem, **Google Workspace**'i okuma-amaçlı veri kaynağı ve kanıt deposu;
**Railway + PostgreSQL** üzerinde çalışan bir Node/TypeScript servisini de karar
ve sinyal motoru olarak kullanır. Sunum katmanı React tabanlı 5+1 dashboard'tur.

```
┌──────────────────────────────────────────────────────────┐
│ Google Workspace (READONLY)                                │
│  Gmail · Calendar · Drive · Sheets                         │
└───────────────┬──────────────────────────────────────────┘
                │ sync jobs (intake + evidence)
                ▼
┌──────────────────────────────────────────────────────────┐
│ Railway · Node.js/TypeScript API                          │
│  ┌────────────┐ ┌──────────────┐ ┌───────────────────┐    │
│  │ scheduler  │ │ trigger +    │ │ governance /      │    │
│  │ (cron)     │ │ signal engine│ │ approvals         │    │
│  └────────────┘ └──────────────┘ └───────────────────┘    │
│                      │                                     │
│                      ▼                                     │
│                 PostgreSQL                                 │
│  config · audit_log · triggers · signals · tasks ·        │
│  roles · orgs · notifications                              │
└───────────────┬──────────────────────────────────────────┘
                │
        ┌───────┴────────┐
        ▼                ▼
  React Dashboard    Drive & repo "Cowork–İnsan–Code" Defteri
   (5+1 panel)        (devir + izlenebilirlik)
```

## Katmanlar

### 1. Veri Kaynağı (Workspace, readonly)
- Gmail (`gmail.readonly`), Calendar (`calendar.readonly`), Drive, Sheets.
- **Dış gönderim scope'u (`gmail.send`) hiçbir zaman istenmez.**

### 2. Veri Tabanı (PostgreSQL)
- `config` — anahtar/değer yapılandırma (OPEX eşikleri, hedefler vb.).
- `audit_log` — değiştirilemez (append-only) denetim izi; her COWORK/İNSAN/CODE/SYSTEM olayı.
- (v0.2+) `triggers`, `signals`, `tasks`, `roles`, `orgs`, `notifications`.

### 3. Motor (v0.2+)
- **Sinyal Motoru:** `evaluateGreenYellowRed()` → eşik/yokluk/olay/kadans değerlendirir.
- **Üç Motor:** A (Toplantı→Follow-up), B (Network), C (Denetim).
- **Idempotency:** tetikleyici+gün başına tek açık kayıt.

### 4. Governance
- Tüm dış aksiyonlar **taslak** olarak `notifications` (Bildirim Kutusu) tablosuna yazılır.
- İNSAN onayı olmadan hiçbir şey gönderilmez.

## Devir & İzlenebilirlik

`docs/ledger/` dizini ve Drive'daki defter her oturumda senkron tutulur.
Detay: [`ledger/HANDOVER.md`](ledger/HANDOVER.md).

## Stack Kararı

Drive dokümanları başlangıçta Apps Script + Sheets öneriyordu. Devredilebilirlik,
ölçeklenebilirlik ve mevcut Railway/Postgres altyapısı nedeniyle motor
**Railway + Postgres + Node/TS**'e taşındı; Workspace yalnızca readonly kaynak
olarak kaldı. Bkz. `ledger/DECISIONS.md` (ADR-0001).
