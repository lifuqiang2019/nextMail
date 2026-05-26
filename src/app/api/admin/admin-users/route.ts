import { NextResponse } from "next/server";

import { ensureAdminApiAccess } from "@/lib/admin/guards";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const access = await ensureAdminApiAccess();
  if (access.response) return access.response;

  const body = await request.json();
  if (!body.username || !body.displayName || !body.password) {
    return NextResponse.json({ message: "Please provide username, display name, and password." }, { status: 400 });
  }

  const admin = await prisma.adminUser.create({
    data: {
      id: crypto.randomUUID(),
      username: body.username,
      displayName: body.displayName,
      email: body.email || null,
      isActive: Boolean(body.isActive ?? true),
      passwordHash: await hashPassword(body.password),
    },
  });
  return NextResponse.json(admin);
}

export async function PATCH(request: Request) {
  const access = await ensureAdminApiAccess();
  if (access.response) return access.response;

  const body = await request.json();
  const updateData: Record<string, unknown> = {
    username: body.username,
    displayName: body.displayName,
    email: body.email || null,
    isActive: Boolean(body.isActive ?? true),
  };

  if (body.password) {
    updateData.passwordHash = await hashPassword(body.password);
  }

  const admin = await prisma.adminUser.update({
    where: { id: body.id },
    data: updateData,
  });
  return NextResponse.json(admin);
}
