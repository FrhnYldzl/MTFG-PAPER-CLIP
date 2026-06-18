import { Router } from "express";
import { Actor } from "@paperclip/shared";
import {
  READONLY_SCOPES,
  getFlowClient,
  redirectUri,
  saveRefreshToken,
  googleConfigured,
} from "../google/auth.js";
import { recordAudit } from "../db/audit.js";

/**
 * Tarayıcıdan Gmail/Calendar bağlama akışı (tek seferlik).
 *   GET /auth/google           → Google onay ekranına yönlendirir
 *   GET /auth/google/callback  → refresh token'ı alır ve DB'ye kaydeder
 *
 * Uygulama "Testing" modunda olduğundan yalnızca eklenmiş test kullanıcıları
 * onaylayabilir — bu, kimin bağlanabileceğini Google tarafında sınırlar.
 */
export const authRouter: Router = Router();

function page(title: string, body: string, status = 200): string {
  void status;
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="font-family:system-ui,-apple-system,sans-serif;max-width:540px;margin:64px auto;padding:0 20px;color:#111;line-height:1.5">
<h2 style="margin-bottom:8px">${title}</h2><div style="color:#374151">${body}</div></body></html>`;
}

/** Bağlanma durumunu kontrol et (debug/kolaylık). */
authRouter.get("/status", async (_req, res) => {
  res.json({ connected: await googleConfigured() });
});

/** 1) Onay ekranına yönlendir. */
authRouter.get("/google", (req, res) => {
  try {
    const client = getFlowClient(redirectUri(req));
    const url = client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent", // refresh_token gelmesini garanti eder
      scope: [...READONLY_SCOPES],
    });
    res.redirect(url);
  } catch (err) {
    res
      .status(500)
      .send(page("Yapılandırma eksik", String(err instanceof Error ? err.message : err)));
  }
});

/** 2) Dönüş: kodu refresh token ile değiştir, kaydet. */
authRouter.get("/google/callback", async (req, res) => {
  const code = typeof req.query.code === "string" ? req.query.code : null;
  const error = typeof req.query.error === "string" ? req.query.error : null;
  if (error) {
    res.status(400).send(page("İzin verilmedi", `Google hata döndürdü: <code>${error}</code>`));
    return;
  }
  if (!code) {
    res.status(400).send(page("Eksik kod", "Yetkilendirme kodu gelmedi."));
    return;
  }
  try {
    const client = getFlowClient(redirectUri(req));
    const { tokens } = await client.getToken(code);
    if (!tokens.refresh_token) {
      res.status(400).send(
        page(
          "Refresh token gelmedi",
          "Google hesabında bu uygulamanın erişimini kaldırıp tekrar deneyin " +
            "(<b>prompt=consent</b> zorunlu). Hesap → Güvenlik → Üçüncü taraf erişimi."
        )
      );
      return;
    }
    await saveRefreshToken(tokens.refresh_token);
    await recordAudit({
      actor: Actor.HUMAN,
      action: "GOOGLE_CONNECTED",
      entity: "google_oauth",
      detail: { scopes: READONLY_SCOPES, source: "browser_flow" },
    });
    res.send(
      page(
        "✅ Gmail bağlandı",
        "Token güvenle kaydedildi. Artık günlük intake gelen kutunu okuyup görev/sinyal üretecek.<br><br>" +
          "Hemen tetiklemek için: panele dönüp intake çalıştır ya da <code>POST /api/intake/mail</code>.<br><br>" +
          "<a href='/'>← Panele dön</a>"
      )
    );
  } catch (err) {
    res
      .status(500)
      .send(page("Hata", String(err instanceof Error ? err.message : err)));
  }
});
