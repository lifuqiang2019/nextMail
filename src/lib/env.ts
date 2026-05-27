function getFirstDefinedEnv(keys: string[]) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) {
      return value;
    }
  }

  return "";
}

function inferDatabaseName(databaseUrl: string) {
  try {
    const url = new URL(databaseUrl);
    const name = url.pathname.replace(/^\/+/, "");
    return name ? decodeURIComponent(name) : "";
  } catch {
    return "";
  }
}

function buildDatabaseUrlFromParts() {
  const protocol =
    getFirstDefinedEnv(["NEXTMAIL_DATABASE_PROTOCOL", "DATABASE_PROTOCOL", "DB_PROTOCOL"]) || "mysql";
  const host = getFirstDefinedEnv(["NEXTMAIL_DATABASE_HOST", "DATABASE_HOST", "DB_HOST"]);
  const port = getFirstDefinedEnv(["NEXTMAIL_DATABASE_PORT", "DATABASE_PORT", "DB_PORT"]);
  const username = getFirstDefinedEnv(["NEXTMAIL_DATABASE_USER", "DATABASE_USER", "DB_USER"]);
  const password = getFirstDefinedEnv([
    "NEXTMAIL_DATABASE_PASSWORD",
    "DATABASE_PASSWORD",
    "DB_PASSWORD",
  ]);
  const databaseName = getFirstDefinedEnv([
    "NEXTMAIL_DATABASE_NAME",
    "DATABASE_NAME",
    "DB_NAME",
  ]);
  const query = getFirstDefinedEnv(["NEXTMAIL_DATABASE_QUERY", "DATABASE_QUERY", "DB_QUERY"]);

  if (!host || !username || !databaseName) {
    return "";
  }

  const auth = password
    ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}`
    : encodeURIComponent(username);
  const normalizedQuery = query ? `?${query.replace(/^\?+/, "")}` : "";
  const normalizedPort = port ? `:${port}` : "";

  return `${protocol}://${auth}@${host}${normalizedPort}/${encodeURIComponent(databaseName)}${normalizedQuery}`;
}

export function getDatabaseUrl() {
  return (
    getFirstDefinedEnv(["NEXTMAIL_DATABASE_URL", "DATABASE_URL", "MYSQL_URL", "MARIADB_URL"]) ||
    buildDatabaseUrlFromParts()
  );
}

export function getDatabaseName() {
  const databaseUrl = getDatabaseUrl();
  return (
    getFirstDefinedEnv(["NEXTMAIL_DATABASE_NAME", "DATABASE_NAME", "DB_NAME"]) ||
    inferDatabaseName(databaseUrl)
  );
}
