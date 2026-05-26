import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storeFilePath = path.join(__dirname, "..", "data", "store.json");

function sanitizeText(value, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }

  const nextValue = value.trim();
  return nextValue || fallback;
}

function sanitizeNumber(value, fallback = 0) {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : fallback;
}

async function readSeedSource() {
  const raw = await readFile(storeFilePath, "utf8");
  const parsed = JSON.parse(raw);
  const rawCategories = Array.isArray(parsed?.categories) ? parsed.categories : [];
  const categories = rawCategories
    .map((category, index) => ({
      id: sanitizeText(category?.id, `cat-${index + 1}`),
      name: sanitizeText(category?.name, `Category ${index + 1}`),
      description: sanitizeText(category?.description, "Category description coming soon."),
    }))
    .filter((category, index, list) => list.findIndex((item) => item.id === category.id) === index);

  const defaultCategoryId = categories[0]?.id ?? "cat-default";
  const products = (Array.isArray(parsed?.products) ? parsed.products : [])
    .map((product, index) => {
      const price = Math.max(sanitizeNumber(product?.price, 0), 0);
      const originalPrice = sanitizeNumber(product?.originalPrice, price);
      const categoryId = sanitizeText(product?.categoryId, defaultCategoryId);

      return {
        id: sanitizeText(product?.id, `prod-${index + 1}`),
        name: sanitizeText(product?.name, `Product ${index + 1}`),
        categoryId: categories.some((category) => category.id === categoryId)
          ? categoryId
          : defaultCategoryId,
        price,
        originalPrice: originalPrice > 0 ? Math.max(originalPrice, price) : null,
        badge: sanitizeText(product?.badge) || null,
        inventory: Math.max(Math.round(sanitizeNumber(product?.inventory, 0)), 0),
        description: sanitizeText(product?.description, "Product description coming soon."),
      };
    })
    .filter((product, index, list) => list.findIndex((item) => item.id === product.id) === index);

  return {
    settings: {
      storeName: sanitizeText(parsed?.settings?.storeName, "NextMail Mall"),
      heroTitle: sanitizeText(parsed?.settings?.heroTitle, "Great picks, all in one place"),
      heroSubtitle: sanitizeText(
        parsed?.settings?.heroSubtitle,
        "A single Next project that includes the storefront, cart, and an admin dashboard.",
      ),
    },
    categories: categories.length > 0
      ? categories
      : [
          {
            id: "cat-default",
            name: "Default Category",
            description: "A fallback category used when no category data is provided.",
          },
        ],
    products,
  };
}

async function main() {
  const seedData = await readSeedSource();
  const categoryIds = seedData.categories.map((category) => category.id);
  const productIds = seedData.products.map((product) => product.id);

  await prisma.$transaction(async (tx) => {
    await tx.storeSetting.upsert({
      where: { id: "store" },
      create: {
        id: "store",
        ...seedData.settings,
      },
      update: seedData.settings,
    });

    await Promise.all(
      seedData.categories.map((category) =>
        tx.category.upsert({
          where: { id: category.id },
          create: category,
          update: {
            name: category.name,
            description: category.description,
          },
        }),
      ),
    );

    await Promise.all(
      seedData.products.map((product) =>
        tx.product.upsert({
          where: { id: product.id },
          create: product,
          update: {
            name: product.name,
            categoryId: product.categoryId,
            price: product.price,
            originalPrice: product.originalPrice,
            badge: product.badge,
            inventory: product.inventory,
            description: product.description,
          },
        }),
      ),
    );

    await tx.product.deleteMany({
      where: {
        id: {
          notIn: productIds.length > 0 ? productIds : ["__never__"],
        },
      },
    });

    await tx.category.deleteMany({
      where: {
        id: {
          notIn: categoryIds,
        },
      },
    });
  });

  console.log(`Seed completed: ${seedData.categories.length} categories, ${seedData.products.length} products.`);
}

main()
  .catch((error) => {
    console.error("Seed failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
