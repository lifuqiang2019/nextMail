import { NextResponse } from "next/server";

import { ensureAdminApiAccess } from "@/lib/admin/guards";
import { prisma } from "@/lib/prisma";

function mapBody(body: Record<string, unknown>) {
  const filterOptionIds = Array.isArray(body.filterOptionIds)
    ? body.filterOptionIds.map((item) => String(item))
    : [];

  return {
    data: {
      name: String(body.name || ""),
      slug: body.slug ? String(body.slug) : null,
      sku: body.sku ? String(body.sku) : null,
      brand: String(body.brand || ""),
      categoryId: String(body.categoryId || ""),
      price: Number(body.price || 0),
      originalPrice: body.originalPrice ? Number(body.originalPrice) : null,
      badge: body.badge ? String(body.badge) : null,
      inventory: Number(body.inventory || 0),
      description: String(body.description || ""),
      imageUrl: String(body.imageUrl || ""),
      sizes: Array.isArray(body.sizes) ? body.sizes.join(",") : "",
      colorway: String(body.colorway || ""),
      featured: Boolean(body.featured ?? false),
      status: String(body.status || "ACTIVE"),
    },
    filterOptionIds,
  };
}

export async function POST(request: Request) {
  const access = await ensureAdminApiAccess();
  if (access.response) return access.response;

  const body = (await request.json()) as Record<string, unknown>;
  const { data, filterOptionIds } = mapBody(body);
  const productId = String(body.id || crypto.randomUUID());

  const product = await prisma.product.create({
    data: {
      id: productId,
      ...data,
      filterRefs: {
        createMany: {
          data: filterOptionIds.map((optionId) => ({ optionId })),
        },
      },
    },
  });
  return NextResponse.json(product);
}

export async function PATCH(request: Request) {
  const access = await ensureAdminApiAccess();
  if (access.response) return access.response;

  const body = (await request.json()) as Record<string, unknown>;
  const productId = String(body.id);
  const { data, filterOptionIds } = mapBody(body);

  await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data,
    }),
    prisma.productFilterOption.deleteMany({ where: { productId } }),
    prisma.productFilterOption.createMany({
      data: filterOptionIds.map((optionId) => ({ productId, optionId })),
    }),
  ]);

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const access = await ensureAdminApiAccess();
  if (access.response) return access.response;

  const { id } = (await request.json()) as { id: string };
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
