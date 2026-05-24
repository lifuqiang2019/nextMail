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

export async function destroyAdminSession() {
  const token = await getCookieToken(ADMIN_SESSION_COOKIE);

  if (token) {
    await prisma.adminSession.deleteMany({
      where: { token },
    });
  }

  await clearAuthCookie(ADMIN_SESSION_COOKIE);
}

export async function getCurrentAdminProfile(): Promise<AdminProfile | null> {
  const token = await getCookieToken(ADMIN_SESSION_COOKIE);
  if (!token) {
    return null;
  }

  const session = await prisma.adminSession.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date() || !session.user.isActive) {
    await destroyAdminSession();
    return null;
  }

  return {
    id: session.user.id,
    username: session.user.username,
    displayName: session.user.displayName,
    email: session.user.email,
  };
}

export async function requireAdminProfile() {
  const user = await getCurrentAdminProfile();
  if (!user) {
    redirect("/admin/login");
  }
  return user;
}
