import { NextResponse } from "next/server";

import { ensureAdminApiAccess } from "@/lib/admin/guards";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const access = await ensureAdminApiAccess();
  if (access.response) return access.response;

  const body = await request.json();
  const category = await prisma.category.create({
    data: {
      id: body.id || crypto.randomUUID(),
      name: body.name,
      slug: body.slug || null,
      description: body.description,
      sortOrder: Number(body.sortOrder || 0),
      isActive: Boolean(body.isActive ?? true),
    },
  });
  return NextResponse.json(category);
}

export async function PATCH(request: Request) {
  const access = await ensureAdminApiAccess();
  if (access.response) return access.response;

  const body = await request.json();
  const category = await prisma.category.update({
    where: { id: body.id },
    data: {
      name: body.name,
      slug: body.slug || null,
      description: body.description,
      sortOrder: Number(body.sortOrder || 0),
      isActive: Boolean(body.isActive ?? true),
    },
  });
  return NextResponse.json(category);
}

export async function DELETE(request: Request) {
  const access = await ensureAdminApiAccess();
  if (access.response) return access.response;

  const { id } = (await request.json()) as { id: string };
  const linkedCount = await prisma.product.count({ where: { categoryId: id } });
  if (linkedCount > 0) {
    return NextResponse.json({ message: "Please remove products from this category first." }, { status: 400 });
  }
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
