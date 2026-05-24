import { NextResponse } from "next/server";

import { getCurrentAdminProfile } from "@/lib/auth/admin";

export async function ensureAdminApiAccess() {
  const admin = await getCurrentAdminProfile();

  if (!admin) {
    return {
      admin: null,
      response: NextResponse.json({ message: "未登录或登录已过期" }, { status: 401 }),
    };
  }

  return { admin, response: null };
}
