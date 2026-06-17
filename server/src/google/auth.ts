import { google, type Auth } from "googleapis";

/**
 * Google OAuth2 istemcisi — YALNIZCA READONLY.
 * Kapsamlar: gmail.readonly, calendar.readonly. `gmail.send` ASLA istenmez.
 * Kimlik bilgileri env'den gelir (GOOGLE_CLIENT_ID / SECRET / REFRESH_TOKEN).
 * Bkz. docs/GOOGLE_OAUTH_SETUP.md
 */

export const READONLY_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/calendar.readonly",
] as const;

export function googleConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN
  );
}

/** Yapılandırılmış OAuth2 istemcisi döner. Kimlik bilgisi yoksa hata fırlatır. */
export function getOAuthClient(): Auth.OAuth2Client {
  if (!googleConfigured()) {
    throw new Error(
      "Google kimlik bilgileri eksik. .env'de GOOGLE_CLIENT_ID/SECRET/REFRESH_TOKEN tanımlayın (bkz. docs/GOOGLE_OAUTH_SETUP.md)."
    );
  }
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return client;
}
