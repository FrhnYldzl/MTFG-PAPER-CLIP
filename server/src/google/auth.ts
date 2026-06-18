import { google, type Auth } from "googleapis";
import { getConfig, setConfig } from "../db/configStore.js";

/**
 * Google OAuth2 — YALNIZCA READONLY.
 * Kapsamlar: gmail.readonly, calendar.readonly. `gmail.send` ASLA istenmez.
 *
 * İki yol desteklenir:
 *  1) Tarayıcıdan bağlama akışı (/auth/google) → refresh token DB config'e kaydedilir.
 *  2) Env değişkeni (GOOGLE_REFRESH_TOKEN) ile lokal/CLI üretilmiş token.
 *
 * Client ID/Secret her zaman env'den gelir (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET).
 * Bkz. docs/GOOGLE_OAUTH_SETUP.md
 */

export const READONLY_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/calendar.readonly",
] as const;

const REFRESH_TOKEN_KEY = "GOOGLE_REFRESH_TOKEN";

export function clientCredentials(): { id?: string; secret?: string } {
  return {
    id: process.env.GOOGLE_CLIENT_ID,
    secret: process.env.GOOGLE_CLIENT_SECRET,
  };
}

/** Onay sonrası dönüş adresi: env override ya da gelen isteğin host'undan türet. */
export function redirectUri(req?: {
  protocol: string;
  get(name: string): string | undefined;
}): string {
  if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI;
  if (req) {
    const proto = req.get("x-forwarded-proto") ?? req.protocol;
    const host = req.get("host");
    if (host) return `${proto}://${host}/auth/google/callback`;
  }
  return "";
}

/** Refresh token: önce DB config (tarayıcı akışı), sonra env (CLI). */
export async function getRefreshToken(): Promise<string | undefined> {
  return (await getConfig(REFRESH_TOKEN_KEY)) ?? process.env.GOOGLE_REFRESH_TOKEN;
}

/** Tarayıcı akışından gelen refresh token'ı kalıcı saklar. */
export async function saveRefreshToken(token: string): Promise<void> {
  await setConfig(REFRESH_TOKEN_KEY, token);
}

/** Bağlı mı: client id/secret (env) + refresh token (DB veya env) var mı. */
export async function googleConfigured(): Promise<boolean> {
  const { id, secret } = clientCredentials();
  if (!id || !secret) return false;
  return Boolean(await getRefreshToken());
}

/** API çağrıları için yetkili istemci (refresh token'lı). */
export async function getOAuthClient(): Promise<Auth.OAuth2Client> {
  const { id, secret } = clientCredentials();
  const refresh = await getRefreshToken();
  if (!id || !secret || !refresh) {
    throw new Error(
      "Google bağlı değil. /auth/google ile bağlanın ya da env'de GOOGLE_CLIENT_ID/SECRET/REFRESH_TOKEN tanımlayın (bkz. docs/GOOGLE_OAUTH_SETUP.md)."
    );
  }
  const client = new google.auth.OAuth2(id, secret);
  client.setCredentials({ refresh_token: refresh });
  return client;
}

/** OAuth onay akışı için istemci (redirect URI'li; henüz refresh token yok). */
export function getFlowClient(redirect: string): Auth.OAuth2Client {
  const { id, secret } = clientCredentials();
  if (!id || !secret) {
    throw new Error(
      "GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET tanımlı değil. Railway Variables'a ekleyin."
    );
  }
  return new google.auth.OAuth2(id, secret, redirect);
}
