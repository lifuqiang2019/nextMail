import "dotenv/config";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

import { PrismaClient } from "../src/generated/prisma/client";
import { getDatabaseName, getDatabaseUrl } from "../src/lib/env";
import { fallbackStore } from "../src/lib/store-defaults";

const databaseUrl = getDatabaseUrl();
const databaseName = getDatabaseName();

const adapter = new PrismaMariaDb(databaseUrl, { database: databaseName });

const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPasswordHash = await bcrypt.hash("admin123", 10);

  await prisma.customerSession.deleteMany();
  await prisma.adminSession.deleteMany();
  await prisma.productFilterOption.deleteMany();
  await prisma.product.deleteMany();
  await prisma.filterOption.deleteMany();
  await prisma.filterGroup.deleteMany();
  await prisma.category.deleteMany();

  await prisma.storeSetting.upsert({
    where: { id: 1 },
    update: fallbackStore.settings,
    create: {
      id: 1,
      ...fallbackStore.settings,
    },
  });

  await prisma.category.createMany({
    data: fallbackStore.categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      sortOrder: category.sortOrder ?? 0,
      isActive: category.isActive ?? true,
    })),
  });

  for (const group of fallbackStore.filterGroups) {
    await prisma.filterGroup.create({
      data: {
        id: group.id,
        name: group.name,
        slug: group.slug,
        description: group.description,
        sortOrder: group.sortOrder ?? 0,
        isActive: group.isActive ?? true,
        options: {
          create: group.options.map((option) => ({
            id: option.id,
            label: option.label,
            value: option.value,
            sortOrder: option.sortOrder ?? 0,
            isActive: option.isActive ?? true,
          })),
        },
      },
    });
  }

  for (const product of fallbackStore.products) {
    await prisma.product.create({
      data: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        brand: product.brand,
        categoryId: product.categoryId,
        price: product.price,
        originalPrice: product.originalPrice ?? null,
        badge: product.badge,
        inventory: product.inventory,
        description: product.description,
        imageUrl: product.imageUrl,
        sizes: product.sizes.join(","),
        colorway: product.colorway,
        featured: product.featured ?? false,
        status: product.status ?? "ACTIVE",
        filterRefs: {
          createMany: {
            data: product.filterOptionIds.map((optionId) => ({ optionId })),
          },
        },
      },
    });
  }

  await prisma.adminUser.upsert({
    where: { username: "admin" },
    update: {
      displayName: "系统管理员",
      email: "admin@shoemall.local",
      passwordHash: adminPasswordHash,
      isActive: true,
    },
    create: {
      id: crypto.randomUUID(),
      username: "admin",
      displayName: "系统管理员",
      email: "admin@shoemall.local",
      passwordHash: adminPasswordHash,
      isActive: true,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
