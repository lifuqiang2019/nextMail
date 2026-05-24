import { NextResponse } from "next/server";

import { ensureAdminApiAccess } from "@/lib/admin/guards";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const access = await ensureAdminApiAccess();
  if (access.response) return access.response;

  const body = await request.json();
  const groupId = body.id || crypto.randomUUID();

  const group = await prisma.filterGroup.create({
    data: {
      id: groupId,
      name: body.name,
      slug: body.slug || null,
      description: body.description || "",
      sortOrder: Number(body.sortOrder || 0),
      isActive: Boolean(body.isActive ?? true),
      options: {
        create: Array.isArray(body.options)
          ? body.options.map((option: Record<string, unknown>, index: number) => ({
              id: String(option.id || crypto.randomUUID()),
              label: String(option.label || `选项 ${index + 1}`),
              value: String(option.value || index + 1),
              sortOrder: Number(option.sortOrder || index + 1),
              isActive: Boolean(option.isActive ?? true),
            }))
          : [],
      },
    },
    include: { options: true },
  });

  return NextResponse.json(group);
}

export async function PATCH(request: Request) {
  const access = await ensureAdminApiAccess();
  if (access.response) return access.response;

  const body = await request.json();

  await prisma.filterGroup.update({
    where: { id: body.id },
    data: {
      name: body.name,
      slug: body.slug || null,
      description: body.description || "",
      sortOrder: Number(body.sortOrder || 0),
      isActive: Boolean(body.isActive ?? true),
    },
  });

  await prisma.filterOption.deleteMany({ where: { groupId: body.id } });
  await prisma.filterOption.createMany({
    data: Array.isArray(body.options)
      ? body.options.map((option: Record<string, unknown>, index: number) => ({
          id: String(option.id || crypto.randomUUID()),
          groupId: String(body.id),
          label: String(option.label || `选项 ${index + 1}`),
          value: String(option.value || index + 1),
          sortOrder: Number(option.sortOrder || index + 1),
          isActive: Boolean(option.isActive ?? true),
        }))
      : [],
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const access = await ensureAdminApiAccess();
  if (access.response) return access.response;

  const { id } = (await request.json()) as { id: string };
  await prisma.filterGroup.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
