import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
  clearAuthCookie,
  createSessionExpiry,
  createSessionToken,
  CUSTOMER_SESSION_COOKIE,
  getCookieToken,
  setAuthCookie,
} from "@/lib/auth/session";
import type { CustomerProfile } from "@/types/store";

export function isRecoverableCustomerAuthError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const fullMessage = `${error.name}\n${error.message}\n${String((error as { cause?: unknown }).cause ?? "")}`;
  return /DriverAdapterError|pool timeout|max_connections_per_hour|failed to retrieve a connection/i.test(fullMessage);
}

export async function createCustomerSession(userId: string) {
  const token = createSessionToken();
  const expiresAt = createSessionExpiry();

  await prisma.customerSession.create({
    data: {
      id: crypto.randomUUID(),
      token,
      userId,
      expiresAt,
    },
  });

  await setAuthCookie(CUSTOMER_SESSION_COOKIE, token, expiresAt);
}

export async function destroyCustomerSession() {
  const token = await getCookieToken(CUSTOMER_SESSION_COOKIE);

  try {
    if (token) {
      await prisma.customerSession.deleteMany({
        where: { token },
      });
    }
  } catch (error) {
    if (!isRecoverableCustomerAuthError(error)) {
      throw error;
    }
  } finally {
    await clearAuthCookie(CUSTOMER_SESSION_COOKIE);
  }
}

export async function getCurrentCustomerProfile(): Promise<CustomerProfile | null> {
  const token = await getCookieToken(CUSTOMER_SESSION_COOKIE);
  if (!token) {
    return null;
  }

  try {
    const session = await prisma.customerSession.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date() || !session.user.isActive) {
      await destroyCustomerSession();
      return null;
    }

    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
    };
  } catch (error) {
    if (isRecoverableCustomerAuthError(error)) {
      return null;
    }

    throw error;
  }
}

export async function requireCustomerProfile() {
  const user = await getCurrentCustomerProfile();
  if (!user) {
    redirect("/auth");
  }
  return user;
}
