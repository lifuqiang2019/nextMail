import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

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

export async function readStoreData(): Promise<StoreData> {
  await ensureStoreFile();

  const raw = await readFile(storeFilePath, "utf8");
  const parsed = JSON.parse(raw) as Partial<StoreData>;

  return normalizeStoreData(parsed);
}

export async function writeStoreData(input: Partial<StoreData>): Promise<StoreData> {
  const normalized = normalizeStoreData(input);

  await ensureStoreFile();
  await writeFile(storeFilePath, `${JSON.stringify(normalized, null, 2)}
`, "utf8");

  return normalized;
}
