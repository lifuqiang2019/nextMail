import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";
import { getDatabaseUrl } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const databaseUrl = getDatabaseUrl();

function createMissingConfigProxy() {
  return new Proxy(
    {},
    {
      get() {
        throw new Error(
          "Database connection is not configured. Set NEXTMAIL_DATABASE_URL / DATABASE_URL, or provide NEXTMAIL_DATABASE_HOST, NEXTMAIL_DATABASE_USER, NEXTMAIL_DATABASE_PASSWORD, and NEXTMAIL_DATABASE_NAME.",
        );
      },
    },
  ) as PrismaClient;
}

function parseDatabaseUrl(url: string) {
  const parsedUrl = new URL(url);
  return {
    host: parsedUrl.hostname,
    port: parseInt(parsedUrl.port) || 3306,
    user: decodeURIComponent(parsedUrl.username),
    password: decodeURIComponent(parsedUrl.password),
    database: parsedUrl.pathname.replace(/^\/+/, ""),
  };
}

function createPrismaClient() {
  if (!databaseUrl) {
    return createMissingConfigProxy();
  }

  const { host, port, user, password, database } = parseDatabaseUrl(databaseUrl);
  
  const adapter = new PrismaMariaDb(
    {
      host,
      port,
      user,
      password,
      connectTimeout: 30000,
      socketTimeout: 60000,
      poolTimeout: 30000,
      connectionLimit: 10,
    },
    {
      database,
    }
  );

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
