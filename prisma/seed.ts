import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

import { PrismaClient } from "../src/generated/prisma/client";
import { getDatabaseName, getDatabaseUrl } from "../src/lib/env";
import { fallbackStoreEn, fallbackStoreZh } from "../src/lib/store-defaults";

const databaseUrl = getDatabaseUrl();
const databaseName = getDatabaseName();

if (!databaseUrl) {
  throw new Error("Missing NEXTMAIL_DATABASE_URL / DATABASE_URL for seeding.");
}

const url = new URL(databaseUrl);
const adapter = new PrismaMariaDb(
  {
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    connectTimeout: 30000,
    socketTimeout: 60000,
    connectionLimit: 1,
  },
  { database: databaseName || url.pathname.replace(/^\/+/, "") },
);

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
  const storeSettingI18n = (prisma as unknown as { storeSettingI18n?: { deleteMany: () => Promise<unknown>; createMany: (args: unknown) => Promise<unknown> } })
    .storeSettingI18n;
  if (storeSettingI18n) {
    await storeSettingI18n.deleteMany();
  }

  await prisma.storeSetting.upsert({
    where: { id: 1 },
    update: fallbackStoreEn.settings,
    create: {
      id: 1,
      ...fallbackStoreEn.settings,
    },
  });

  if (storeSettingI18n) {
    await storeSettingI18n.createMany({
      data: [
        {
          storeId: 1,
          locale: "en-US",
          heroTitle: fallbackStoreEn.settings.heroTitle,
          heroSubtitle: fallbackStoreEn.settings.heroSubtitle,
          heroNotice: fallbackStoreEn.settings.heroNotice,
          purchaseGuide: fallbackStoreEn.settings.purchaseGuide,
        },
        {
          storeId: 1,
          locale: "zh-CN",
          heroTitle: fallbackStoreZh.settings.heroTitle,
          heroSubtitle: fallbackStoreZh.settings.heroSubtitle,
          heroNotice: fallbackStoreZh.settings.heroNotice,
          purchaseGuide: fallbackStoreZh.settings.purchaseGuide,
        },
      ],
    });
  }

  await prisma.category.createMany({
    data: fallbackStoreEn.categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      sortOrder: category.sortOrder ?? 0,
      isActive: category.isActive ?? true,
    })),
  });

  for (const group of fallbackStoreEn.filterGroups) {
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

  for (const product of fallbackStoreEn.products) {
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
      displayName: "System Admin",
      email: "admin@shoemall.local",
      passwordHash: adminPasswordHash,
      isActive: true,
    },
    create: {
      id: crypto.randomUUID(),
      username: "admin",
      displayName: "System Admin",
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
