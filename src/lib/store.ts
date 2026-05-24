import type {
  Category,
  FilterGroup,
  Product,
  StoreData,
  StoreSettings,
} from "@/types/store";
import { prisma } from "@/lib/prisma";
import { fallbackStore } from "@/lib/store-defaults";

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

function sanitizeSizes(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => sanitizeText(item)).filter(Boolean);
}

function sanitizeSettings(input: Partial<StoreSettings> | null | undefined): StoreSettings {
  return {
    storeName: sanitizeText(input?.storeName, fallbackStore.settings.storeName),
    heroTitle: sanitizeText(input?.heroTitle, fallbackStore.settings.heroTitle),
    heroSubtitle: sanitizeText(input?.heroSubtitle, fallbackStore.settings.heroSubtitle),
    heroNotice: sanitizeText(input?.heroNotice, fallbackStore.settings.heroNotice),
    supportEmail: sanitizeText(input?.supportEmail, fallbackStore.settings.supportEmail),
    supportPhone: sanitizeText(input?.supportPhone, fallbackStore.settings.supportPhone),
    purchaseGuide: sanitizeText(input?.purchaseGuide, fallbackStore.settings.purchaseGuide),
    orderLink: sanitizeText(input?.orderLink, fallbackStore.settings.orderLink),
  };
}

function sanitizeCategories(input: unknown): Category[] {
  if (!Array.isArray(input)) {
    return fallbackStore.categories;
  }

  const categories = input
    .map((item, index) => ({
      id: sanitizeText(item?.id, `cat-${index + 1}`),
      name: sanitizeText(item?.name, `分类 ${index + 1}`),
      slug: sanitizeText(item?.slug),
      description: sanitizeText(item?.description, "待补充分类描述。"),
      sortOrder: Math.max(Math.round(sanitizeNumber(item?.sortOrder, index + 1)), 0),
      isActive: Boolean(item?.isActive ?? true),
    }))
    .filter((item, index, array) => array.findIndex((entry) => entry.id === item.id) === index);

  return categories.length > 0 ? categories : fallbackStore.categories;
}

function sanitizeFilterGroups(input: unknown): FilterGroup[] {
  if (!Array.isArray(input)) {
    return fallbackStore.filterGroups;
  }

  const groups = input
    .map((group, groupIndex) => {
      const groupId = sanitizeText(group?.id, `fg-${groupIndex + 1}`);
      const rawOptions = Array.isArray(group?.options) ? (group.options as Array<Record<string, unknown>>) : [];
      const options = rawOptions
            .map((option, optionIndex) => ({
              id: sanitizeText(option?.id, `${groupId}-opt-${optionIndex + 1}`),
              groupId,
              label: sanitizeText(option?.label, `选项 ${optionIndex + 1}`),
              value: sanitizeText(option?.value, `${optionIndex + 1}`),
              sortOrder: Math.max(Math.round(sanitizeNumber(option?.sortOrder, optionIndex + 1)), 0),
              isActive: Boolean(option?.isActive ?? true),
            }))
            .filter((item, index, array) => array.findIndex((entry) => entry.id === item.id) === index);

      return {
        id: groupId,
        name: sanitizeText(group?.name, `筛选组 ${groupIndex + 1}`),
        slug: sanitizeText(group?.slug),
        description: sanitizeText(group?.description, ""),
        sortOrder: Math.max(Math.round(sanitizeNumber(group?.sortOrder, groupIndex + 1)), 0),
        isActive: Boolean(group?.isActive ?? true),
        options,
      } satisfies FilterGroup;
    })
    .filter((item, index, array) => array.findIndex((entry) => entry.id === item.id) === index);

  return groups.length > 0 ? groups : fallbackStore.filterGroups;
}

function sanitizeProducts(input: unknown, categories: Category[], filterGroups: FilterGroup[]): Product[] {
  if (!Array.isArray(input)) {
    return fallbackStore.products;
  }

  const categoryIds = new Set(categories.map((item) => item.id));
  const filterOptionIds = new Set(filterGroups.flatMap((group) => group.options.map((option) => option.id)));
  const defaultCategoryId = categories[0]?.id ?? fallbackStore.categories[0].id;

  return input
    .map((item, index) => {
      const price = sanitizeNumber(item?.price, 0);
      const originalPrice = sanitizeNumber(item?.originalPrice, price);
      const categoryId = sanitizeText(item?.categoryId, defaultCategoryId);
      const rawFilterOptionIds = Array.isArray(item?.filterOptionIds)
        ? (item.filterOptionIds as unknown[])
        : [];
      const normalizedFilterOptionIds = rawFilterOptionIds
            .map((value) => sanitizeText(value))
            .filter((value) => filterOptionIds.has(value))
;

      return {
        id: sanitizeText(item?.id, `prod-${index + 1}`),
        name: sanitizeText(item?.name, `商品 ${index + 1}`),
        slug: sanitizeText(item?.slug),
        sku: sanitizeText(item?.sku),
        brand: sanitizeText(item?.brand, "Unknown"),
        categoryId: categoryIds.has(categoryId) ? categoryId : defaultCategoryId,
        price: Math.max(price, 0),
        originalPrice: originalPrice > 0 ? Math.max(originalPrice, price) : undefined,
        badge: sanitizeText(item?.badge),
        inventory: Math.max(Math.round(sanitizeNumber(item?.inventory, 0)), 0),
        description: sanitizeText(item?.description, "待补充商品描述。"),
        imageUrl: sanitizeText(item?.imageUrl, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80"),
        sizes: sanitizeSizes(item?.sizes),
        colorway: sanitizeText(item?.colorway, "默认配色"),
        featured: Boolean(item?.featured ?? false),
        status: sanitizeText(item?.status, "ACTIVE"),
        filterOptionIds: normalizedFilterOptionIds,
      } satisfies Product;
    })
    .filter((item, index, array) => array.findIndex((entry) => entry.id === item.id) === index);
}

function normalizeStoreData(input: Partial<StoreData> | null | undefined): StoreData {
  const categories = sanitizeCategories(input?.categories);
  const filterGroups = sanitizeFilterGroups(input?.filterGroups);

  return {
    settings: sanitizeSettings(input?.settings),
    categories,
    filterGroups,
    products: sanitizeProducts(input?.products, categories, filterGroups),
  };
}

function decimalToNumber(value: { toNumber(): number } | null | undefined) {
  return value ? value.toNumber() : undefined;
}

export async function readStoreData(): Promise<StoreData> {
  try {
    const [settings, categories, filterGroups, products] = await Promise.all([
      prisma.storeSetting.findUnique({ where: { id: 1 } }),
      prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
      prisma.filterGroup.findMany({
        include: { options: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.product.findMany({
        include: { filterRefs: true },
        orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
      }),
    ]);

    if (!settings || categories.length === 0 || products.length === 0) {
      return normalizeStoreData(fallbackStore);
    }

    return normalizeStoreData({
      settings: {
        storeName: settings.storeName,
        heroTitle: settings.heroTitle,
        heroSubtitle: settings.heroSubtitle,
        heroNotice: settings.heroNotice,
        supportEmail: settings.supportEmail,
        supportPhone: settings.supportPhone,
        purchaseGuide: settings.purchaseGuide,
        orderLink: settings.orderLink,
      },
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug ?? undefined,
        description: category.description,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
      })),
      filterGroups: filterGroups.map((group) => ({
        id: group.id,
        name: group.name,
        slug: group.slug ?? undefined,
        description: group.description,
        sortOrder: group.sortOrder,
        isActive: group.isActive,
        options: group.options.map((option) => ({
          id: option.id,
          groupId: option.groupId,
          label: option.label,
          value: option.value,
          sortOrder: option.sortOrder,
          isActive: option.isActive,
        })),
      })),
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug ?? undefined,
        sku: product.sku ?? undefined,
        brand: product.brand,
        categoryId: product.categoryId,
        price: decimalToNumber(product.price) ?? 0,
        originalPrice: decimalToNumber(product.originalPrice),
        badge: product.badge ?? undefined,
        inventory: product.inventory,
        description: product.description,
        imageUrl: product.imageUrl,
        sizes: product.sizes ? product.sizes.split(",").filter(Boolean) : [],
        colorway: product.colorway,
        featured: product.featured,
        status: product.status,
        filterOptionIds: product.filterRefs.map((ref) => ref.optionId),
      })),
    });
  } catch (error) {
    console.warn("readStoreData fallback:", error);
    return normalizeStoreData(fallbackStore);
  }
}

export async function writeStoreData(input: Partial<StoreData>): Promise<StoreData> {
  const normalized = normalizeStoreData(input);

  await prisma.storeSetting.upsert({
    where: { id: 1 },
    update: normalized.settings,
    create: {
      id: 1,
      ...normalized.settings,
    },
  });

  await prisma.productFilterOption.deleteMany();
  await prisma.product.deleteMany();
  await prisma.filterOption.deleteMany();
  await prisma.filterGroup.deleteMany();
  await prisma.category.deleteMany();

  await prisma.category.createMany({
    data: normalized.categories.map((category, index) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      sortOrder: category.sortOrder ?? index + 1,
      isActive: category.isActive ?? true,
    })),
  });

  for (const group of normalized.filterGroups) {
    await prisma.filterGroup.create({
      data: {
        id: group.id,
        name: group.name,
        slug: group.slug,
        description: group.description,
        sortOrder: group.sortOrder ?? 0,
        isActive: group.isActive ?? true,
        options: {
          create: group.options.map((option, index) => ({
            id: option.id,
            label: option.label,
            value: option.value,
            sortOrder: option.sortOrder ?? index + 1,
            isActive: option.isActive ?? true,
          })),
        },
      },
    });
  }

  for (const product of normalized.products) {
    await prisma.product.create({
      data: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        brand: product.brand,
        categoryId: product.categoryId,
        price: product.price,
        originalPrice: product.originalPrice,
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

  return normalized;
}

export async function readAdminDashboardData() {
  const [store, customers, admins] = await Promise.all([
    readStoreData(),
    prisma.customerUser.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, isActive: true, createdAt: true },
    }),
    prisma.adminUser.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, username: true, displayName: true, email: true, isActive: true, createdAt: true },
    }),
  ]);

  return { store, customers, admins };
}
