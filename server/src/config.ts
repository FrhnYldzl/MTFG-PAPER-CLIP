import "dotenv/config";

/** Ortam değişkenlerinden türetilen uygulama yapılandırması. */
export const config = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  databaseUrl: process.env.DATABASE_URL ?? "",
  tz: process.env.TZ ?? "Europe/Istanbul",
} as const;

export function requireDatabaseUrl(): string {
  if (!config.databaseUrl) {
    throw new Error(
      "DATABASE_URL tanımlı değil. .env dosyasını veya Railway değişkenlerini kontrol edin."
    );
  }
  return config.databaseUrl;
}
