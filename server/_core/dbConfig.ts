// Turns a standard MySQL URL (for example Aiven's Service URI) into mysql2 options.
// mysql2 does not understand "ssl-mode=REQUIRED", so SSL is configured here instead.
export type MysqlConnectionOptions = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: { ca?: string; rejectUnauthorized: boolean };
};

function readCaCertificate(): string | undefined {
  const raw = process.env.DATABASE_CA_CERT?.trim();
  if (!raw) return undefined;
  // Accept the PEM pasted into a single-line env var with literal \n sequences.
  return raw.includes("BEGIN CERTIFICATE") ? raw.replace(/\\n/g, "\n") : Buffer.from(raw, "base64").toString("utf8");
}

export function mysqlOptionsFromUrl(rawUrl: string): MysqlConnectionOptions {
  const url = new URL(rawUrl);
  const mode = (url.searchParams.get("ssl-mode") ?? url.searchParams.get("sslmode") ?? "").toUpperCase();
  const ca = readCaCertificate();
  const options: MysqlConnectionOptions = {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, "")) || "defaultdb",
  };
  if (ca) {
    // CA supplied: encrypt AND verify the server certificate (recommended).
    options.ssl = { ca, rejectUnauthorized: true };
  } else if (mode && mode !== "DISABLED") {
    // No CA supplied: still encrypted, but the server identity is not verified.
    options.ssl = { rejectUnauthorized: false };
  }
  return options;
}
