import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
  ADMIN_SESSION_COOKIE,
  clearAuthCookie,
  createSessionExpiry,
  createSessionToken,
  getCookieToken,
  setAuthCookie,
} from "@/lib/auth/session";
import type { AdminProfile } from "@/types/store";

export function isRecoverableAdminAuthError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const fullMessage = `${error.name}\n${error.message}\n${String((error as { cause?: unknown }).cause ?? "")}`;
  return /DriverAdapterError|pool timeout|max_connections_per_hour|failed to retrieve a connection|does not exist|doesn't exist|P2021/i.test(
    fullMessage,
  );
}

export async function createAdminSession(userId: string) {
  const token = createSessionToken();
  const expiresAt = createSessionExpiry();

  await prisma.adminSession.create({
    data: {
      id: crypto.randomUUID(),
      token,
      userId,
      expiresAt,
    },
  });

  await setAuthCookie(ADMIN_SESSION_COOKIE, token, expiresAt);
}

async function deleteAdminSessionRecord(token: string | undefined) {
  if (!token) {
    return;
  }

  await prisma.adminSession.deleteMany({
    where: { token },
  });
}

export async function destroyAdminSession() {
  const token = await getCookieToken(ADMIN_SESSION_COOKIE);

  try {
    await deleteAdminSessionRecord(token);
  } catch (error) {
    if (!isRecoverableAdminAuthError(error)) {
      throw error;
    }
  } finally {
    await clearAuthCookie(ADMIN_SESSION_COOKIE);
  }
}

export async function getCurrentAdminProfile(): Promise<AdminProfile | null> {
  const token = await getCookieToken(ADMIN_SESSION_COOKIE);
  if (!token) {
    return null;
  }

  try {
    const session = await prisma.adminSession.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date() || !session.user.isActive) {
      // Reading auth state during page render must stay read-only for cookies.
      await deleteAdminSessionRecord(token);
      return null;
    }

    return {
      id: session.user.id,
      username: session.user.username,
      displayName: session.user.displayName,
      email: session.user.email,
    };
  } catch (error) {
    if (isRecoverableAdminAuthError(error)) {
      return null;
    }

    throw error;
  }
}

export async function requireAdminProfile() {
  const user = await getCurrentAdminProfile();
  if (!user) {
    redirect("/admin/login");
  }
  return user;
}
