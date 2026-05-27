export function getDatabaseUrl() {
  return process.env.NEXTMAIL_DATABASE_URL || process.env.DATABASE_URL || "";
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

export function getDatabaseName() {
  const databaseUrl = getDatabaseUrl();
  return (
    process.env.NEXTMAIL_DATABASE_NAME ||
    process.env.DATABASE_NAME ||
    inferDatabaseName(databaseUrl)
  );
}
