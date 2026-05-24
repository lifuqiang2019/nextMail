import { PrismaClient } from "@prisma/client";

declare global {
  var __nextmailPrisma__: PrismaClient | undefined;
}

export const prisma =
  globalThis.__nextmailPrisma__ ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__nextmailPrisma__ = prisma;
}
