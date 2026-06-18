import { google } from "googleapis";
import { getOAuthClient } from "./auth.js";

/** Normalize edilmiş mail özeti (readonly). */
export interface MailSummary {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  /** ISO tarih. */
  date: string;
}

/** From başlığından e-posta adresini ayıklar (saf). */
export function parseSender(fromHeader: string): string {
  const m = fromHeader.match(/<([^>]+)>/);
  return (m ? m[1] : fromHeader).trim().toLowerCase();
}

function header(headers: { name?: string | null; value?: string | null }[], name: string): string {
  return headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";
}

/**
 * Son gelen mailleri çeker (readonly). Varsayılan: gelen kutusu, son N.
 * Canlı çalışması için Google kimlik bilgileri gerekir.
 */
export async function fetchRecentMail(maxResults = 10): Promise<MailSummary[]> {
  const auth = await getOAuthClient();
  const gmail = google.gmail({ version: "v1", auth });

  const list = await gmail.users.messages.list({
    userId: "me",
    maxResults,
    q: "in:inbox",
  });
  const ids = (list.data.messages ?? []).map((m) => m.id!).filter(Boolean);

  const out: MailSummary[] = [];
  for (const id of ids) {
    const msg = await gmail.users.messages.get({
      userId: "me",
      id,
      format: "metadata",
      metadataHeaders: ["From", "Subject", "Date"],
    });
    const headers = msg.data.payload?.headers ?? [];
    const internal = msg.data.internalDate
      ? new Date(Number(msg.data.internalDate)).toISOString()
      : new Date().toISOString();
    out.push({
      id,
      from: parseSender(header(headers, "From")),
      subject: header(headers, "Subject"),
      snippet: msg.data.snippet ?? "",
      date: internal,
    });
  }
  return out;
}
