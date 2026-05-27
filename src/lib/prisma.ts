import { PrismaMariaDb } from "@prisma/adapter-mariadb";

import { PrismaClient } from "@/generated/prisma/client";
import { getDatabaseName, getDatabaseUrl } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const databaseUrl = getDatabaseUrl();
const databaseName = getDatabaseName();
const canInitializePrisma = Boolean(databaseUrl && databaseName);

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

function createPrismaClient() {
  if (!canInitializePrisma) {
    return createMissingConfigProxy();
  }

  const adapter = new PrismaMariaDb(databaseUrl, { database: databaseName });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
