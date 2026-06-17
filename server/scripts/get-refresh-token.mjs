#!/usr/bin/env node
/**
 * Google OAuth refresh token üretici (readonly: gmail + calendar).
 *
 * Kullanım:
 *   GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... node server/scripts/get-refresh-token.mjs
 *
 * 1) Çıkan URL'i tarayıcıda aç, hesabınla onayla.
 * 2) Script localhost:53682'de yakalar, REFRESH TOKEN'i ekrana basar.
 * 3) Bu değeri .env'deki GOOGLE_REFRESH_TOKEN'a yaz.
 *
 * Not: OAuth client'ın "Authorized redirect URI" listesine
 *      http://localhost:53682/ eklenmiş olmalı (Web client) ya da Desktop client kullan.
 */
import http from "node:http";
import { google } from "googleapis";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const PORT = 53682;
const REDIRECT = `http://localhost:${PORT}/`;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("HATA: GOOGLE_CLIENT_ID ve GOOGLE_CLIENT_SECRET env değişkenleri gerekli.");
  process.exit(1);
}

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/calendar.readonly",
];

const oauth2 = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT);
const url = oauth2.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: SCOPES,
});

console.log("\n1) Şu URL'i tarayıcıda aç ve onayla:\n");
console.log(url + "\n");

const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, REDIRECT);
    const code = u.searchParams.get("code");
    if (!code) {
      res.writeHead(400).end("code yok");
      return;
    }
    const { tokens } = await oauth2.getToken(code);
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h2>Tamam! Terminale dönebilirsin. Bu sekmeyi kapatabilirsin.</h2>");
    console.log("\n✅ REFRESH TOKEN (bunu .env'deki GOOGLE_REFRESH_TOKEN'a yaz):\n");
    console.log(tokens.refresh_token + "\n");
    if (!tokens.refresh_token) {
      console.log("⚠️  refresh_token gelmedi. Google hesabında bu uygulamanın erişimini kaldırıp tekrar dene (prompt=consent zorunlu).");
    }
    server.close();
    process.exit(0);
  } catch (e) {
    res.writeHead(500).end("hata");
    console.error(e);
    process.exit(1);
  }
});

server.listen(PORT, () => console.log(`2) ${REDIRECT} dinleniyor — onay sonrası otomatik yakalanacak...`));
