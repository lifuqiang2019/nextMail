import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { isDatabaseConfigured } from "@/lib/database";
import { prisma } from "@/lib/prisma";
import type { Category, Product, StoreData } from "@/types/store";

const storeFilePath = path.join(process.cwd(), "data", "store.json");

const fallbackStore: StoreData = {
  settings: {
    storeName: "NextMail Mall",
    heroTitle: "品质好物，一站购齐",
    heroSubtitle: "一个同时包含商城前台、购物车和后台配置的 Next 项目模板。",
  },
  categories: [
    {
      id: "cat-default",
      name: "默认分类",
      description: "用于兜底的商品分类。",
    },
  ],
  products: [],
};

function sanitizeText(value: unknown, fallback = ""): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const nextValue = value.trim();
  return nextValue || fallback;
}

function sanitizeNumber(value: unknown, fallback = 0): number {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : fallback;
}

function sanitizeCategories(input: unknown): Category[] {
  if (!Array.isArray(input)) {
    return fallbackStore.categories;
  }

  const categories = input
    .map((item, index) => ({
      id: sanitizeText(item?.id, `cat-${index + 1}`),
      name: sanitizeText(item?.name, `分类 ${index + 1}`),
      description: sanitizeText(item?.description, "待补充分类描述。"),
    }))
    .filter((item, index, array) => array.findIndex((entry) => entry.id === item.id) === index);

  return categories.length > 0 ? categories : fallbackStore.categories;
}

function sanitizeProducts(input: unknown, categories: Category[]): Product[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const categoryIds = new Set(categories.map((item) => item.id));
  const defaultCategoryId = categories[0]?.id ?? fallbackStore.categories[0].id;

  return input
    .map((item, index) => {
      const price = sanitizeNumber(item?.price, 0);
      const originalPrice = sanitizeNumber(item?.originalPrice, price);
      const categoryId = sanitizeText(item?.categoryId, defaultCategoryId);

      return {
        id: sanitizeText(item?.id, `prod-${index + 1}`),
        name: sanitizeText(item?.name, `商品 ${index + 1}`),
        categoryId: categoryIds.has(categoryId) ? categoryId : defaultCategoryId,
        price: Math.max(price, 0),
        originalPrice: originalPrice > 0 ? Math.max(originalPrice, price) : undefined,
        badge: sanitizeText(item?.badge),
        inventory: Math.max(Math.round(sanitizeNumber(item?.inventory, 0)), 0),
        description: sanitizeText(item?.description, "待补充商品描述。"),
      } satisfies Product;
    })
    .filter((item, index, array) => array.findIndex((entry) => entry.id === item.id) === index);
}

function normalizeStoreData(input: Partial<StoreData> | null | undefined): StoreData {
  const categories = sanitizeCategories(input?.categories);

  return {
    settings: {
      storeName: sanitizeText(input?.settings?.storeName, fallbackStore.settings.storeName),
      heroTitle: sanitizeText(input?.settings?.heroTitle, fallbackStore.settings.heroTitle),
      heroSubtitle: sanitizeText(input?.settings?.heroSubtitle, fallbackStore.settings.heroSubtitle),
    },
    categories,
    products: sanitizeProducts(input?.products, categories),
  };
}

async function ensureStoreFile() {
  await mkdir(path.dirname(storeFilePath), { recursive: true });

  try {
    await readFile(storeFilePath, "utf8");
  } catch {
    await writeFile(storeFilePath, JSON.stringify(fallbackStore, null, 2), "utf8");
  }
}

async function readStoreDataFromFile() {
  await ensureStoreFile();

  const raw = await readFile(storeFilePath, "utf8");
  const parsed = JSON.parse(raw) as Partial<StoreData>;

  return normalizeStoreData(parsed);
}

async function writeStoreDataToFile(input: Partial<StoreData>) {
  const normalized = normalizeStoreData(input);

  await ensureStoreFile();
  await writeFile(storeFilePath, `${JSON.stringify(normalized, null, 2)}
`, "utf8");

  return normalized;
}

function mapDatabaseStoreToStoreData(input: {
  settings: {
    storeName: string;
    heroTitle: string;
    heroSubtitle: string;
  } | null;
  categories: Category[];
  products: Product[];
}): StoreData {
  return normalizeStoreData({
    settings: input.settings ?? fallbackStore.settings,
    categories: input.categories,
    products: input.products,
  });
}

async function seedDatabaseStore(seedData: StoreData) {
  await prisma.$transaction(async (tx) => {
    await tx.orderItem.deleteMany();
    await tx.order.deleteMany();
    await tx.product.deleteMany();
    await tx.category.deleteMany();

    await tx.storeSetting.upsert({
      where: { id: "store" },
      create: {
        id: "store",
        storeName: seedData.settings.storeName,
        heroTitle: seedData.settings.heroTitle,
        heroSubtitle: seedData.settings.heroSubtitle,
      },
      update: {
        storeName: seedData.settings.storeName,
        heroTitle: seedData.settings.heroTitle,
        heroSubtitle: seedData.settings.heroSubtitle,
      },
    });

    if (seedData.categories.length > 0) {
      await tx.category.createMany({ data: seedData.categories });
    }

    if (seedData.products.length > 0) {
      await tx.product.createMany({
        data: seedData.products.map((product) => ({
          id: product.id,
          name: product.name,
          categoryId: product.categoryId,
          price: product.price,
          originalPrice: product.originalPrice,
          badge: product.badge,
          inventory: product.inventory,
          description: product.description,
        })),
      });
    }
  });
}

async function readStoreDataFromDatabase() {
  const [settings, categories, products] = await Promise.all([
    prisma.storeSetting.findUnique({ where: { id: "store" } }),
    prisma.category.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.product.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  if (!settings || categories.length === 0) {
    const seedData = await readStoreDataFromFile();
    await seedDatabaseStore(seedData);
    return seedData;
  }

  return mapDatabaseStoreToStoreData({
    settings,
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
    })),
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      categoryId: product.categoryId,
      price: product.price,
      originalPrice: product.originalPrice ?? undefined,
      badge: product.badge ?? undefined,
      inventory: product.inventory,
      description: product.description,
    })),
  });
}

async function writeStoreDataToDatabase(input: Partial<StoreData>) {
  const normalized = normalizeStoreData(input);

  await prisma.$transaction(async (tx) => {
    await tx.storeSetting.upsert({
      where: { id: "store" },
      create: {
        id: "store",
        storeName: normalized.settings.storeName,
        heroTitle: normalized.settings.heroTitle,
        heroSubtitle: normalized.settings.heroSubtitle,
      },
      update: {
        storeName: normalized.settings.storeName,
        heroTitle: normalized.settings.heroTitle,
        heroSubtitle: normalized.settings.heroSubtitle,
      },
    });

    await tx.product.deleteMany();
    await tx.category.deleteMany();

    if (normalized.categories.length > 0) {
      await tx.category.createMany({ data: normalized.categories });
    }

    if (normalized.products.length > 0) {
      await tx.product.createMany({
        data: normalized.products.map((product) => ({
          id: product.id,
          name: product.name,
          categoryId: product.categoryId,
          price: product.price,
          originalPrice: product.originalPrice,
          badge: product.badge,
          inventory: product.inventory,
          description: product.description,
        })),
      });
    }
  });

  return normalized;
}

export async function readStoreData(): Promise<StoreData> {
  if (!isDatabaseConfigured()) {
    return readStoreDataFromFile();
  }

  try {
    return await readStoreDataFromDatabase();
  } catch {
    return readStoreDataFromFile();
  }
}

export async function writeStoreData(input: Partial<StoreData>): Promise<StoreData> {
  if (!isDatabaseConfigured()) {
    return writeStoreDataToFile(input);
  }

  try {
    return await writeStoreDataToDatabase(input);
  } catch {
    return writeStoreDataToFile(input);
  }
}
