import { NextResponse } from "next/server";

import { ensureAdminApiAccess } from "@/lib/admin/guards";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  const access = await ensureAdminApiAccess();
  if (access.response) return access.response;

  const body = await request.json();
  const settings = await prisma.storeSetting.upsert({
    where: { id: 1 },
    update: body,
    create: {
      id: 1,
      ...body,
    },
  });

  return NextResponse.json(settings);
}
