import { NextResponse } from "next/server";

import { ensureAdminApiAccess } from "@/lib/admin/guards";
import { readAdminDashboardData } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await ensureAdminApiAccess();
  if (access.response) {
    return access.response;
  }

  const data = await readAdminDashboardData();
  return NextResponse.json(data);
}
