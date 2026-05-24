import { NextResponse } from "next/server";

import { ensureAdminApiAccess } from "@/lib/admin/guards";
import { readStoreData, writeStoreData } from "@/lib/store";
import type { StoreData } from "@/types/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await ensureAdminApiAccess();
  if (access.response) return access.response;

  const store = await readStoreData();
  return NextResponse.json(store);
}

export async function PUT(request: Request) {
  const access = await ensureAdminApiAccess();
  if (access.response) return access.response;

  const payload = (await request.json()) as Partial<StoreData>;
  const nextData = await writeStoreData(payload);
  return NextResponse.json(nextData);
}
