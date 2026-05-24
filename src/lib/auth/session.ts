import crypto from "node:crypto";

import { cookies } from "next/headers";

export const CUSTOMER_SESSION_COOKIE = "shoemall_customer_session";
export const ADMIN_SESSION_COOKIE = "shoemall_admin_session";
const SESSION_DURATION_DAYS = 14;

export function createSessionToken() {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
}

export function createSessionExpiry() {
  return new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);
}

export async function setAuthCookie(name: string, token: string, expiresAt: Date) {
  const cookieStore = await cookies();
  cookieStore.set(name, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearAuthCookie(name: string) {
  const cookieStore = await cookies();
  cookieStore.delete(name);
}

export async function getCookieToken(name: string) {
  const cookieStore = await cookies();
  return cookieStore.get(name)?.value;
}
