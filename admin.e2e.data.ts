import { config as loadEnv } from "dotenv";
import * as mariadb from "mariadb";

import { getDatabaseUrl } from "./src/lib/env";

loadEnv({ path: ".env.local", override: false });
loadEnv({ path: ".env.production.local", override: false });
loadEnv({ override: false });
  
const runId = Date.now().toString(36);

export const fixtures = {
  category: {
    slug: `e2e-category-${runId}`,
    name: `E2E 分类 ${runId} A`,
    updatedName: `E2E 分类 ${runId} B`,
    description: "E2E 分类描述 A",
    updatedDescription: "E2E 分类描述 B",
  },
  filter: {
    slug: `e2e-filter-group-${runId}`,
    name: `E2E 过滤组 ${runId} A`,
    updatedName: `E2E 过滤组 ${runId} B`,
    description: "E2E 过滤组描述 A",
    updatedDescription: "E2E 过滤组描述 B",
    optionLabel: "E2E 选项 A",
    updatedOptionLabel: "E2E 选项 B",
    optionValue: `e2e-option-${runId}-a`,
    updatedOptionValue: `e2e-option-${runId}-b`,
  },
  product: {
    slug: `e2e-product-${runId}`,
    name: `E2E 商品 ${runId} A`,
    updatedName: `E2E 商品 ${runId} B`,
    brand: "E2E Brand",
    updatedBrand: "E2E Brand 2",
    sku: `E2E-SKU-${runId}`,
    price: "199",
    updatedPrice: "299",
    originalPrice: "299",
    updatedOriginalPrice: "399",
    inventory: "15",
    updatedInventory: "25",
    badge: "E2E",
    updatedBadge: "E2E-NEW",
    colorway: "Black/White",
    updatedColorway: "Blue/White",
    sizes: "39,40,41",
    updatedSizes: "40,41,42",
    imageUrl: `https://example.com/e2e-product-${runId}-a.png`,
    updatedImageUrl: `https://example.com/e2e-product-${runId}-b.png`,
    description: "E2E 商品描述 A",
    updatedDescription: "E2E 商品描述 B",
  },
  admin: {
    username: `e2e_admin_temp_${runId}`,
    displayName: `E2E 管理员 ${runId} A`,
    updatedDisplayName: `E2E 管理员 ${runId} B`,
    email: `e2e-admin-${runId}-a@example.com`,
    updatedEmail: `e2e-admin-${runId}-b@example.com`,
    password: "TempAdmin123",
    updatedPassword: "TempAdmin456",
  },
};

export async function cleanupAdminE2EData() {
  const connection = await createDatabaseConnection();

  try {
    const tempAdmins = await connection.query<Array<{ id: string }>>(
      "SELECT id FROM `AdminUser` WHERE username LIKE ?",
      ["e2e_admin_temp_%"],
    );

    const adminIds = tempAdmins.map((admin) => admin.id);
    if (adminIds.length > 0) {
      await connection.query("DELETE FROM `AdminSession` WHERE userId IN (?)", [adminIds]);
      await connection.query("DELETE FROM `AdminUser` WHERE id IN (?)", [adminIds]);
    }

    await connection.query("DELETE FROM `Product` WHERE slug LIKE ? OR name LIKE ?", ["e2e-product-%", "E2E 商品 %"]);
    await connection.query("DELETE FROM `FilterGroup` WHERE slug LIKE ? OR name LIKE ?", [
      "e2e-filter-group-%",
      "E2E 过滤组 %",
    ]);
    await connection.query("DELETE FROM `Category` WHERE slug LIKE ? OR name LIKE ?", ["e2e-category-%", "E2E 分类 %"]);
  } finally {
    await connection.end();
  }
}

async function createDatabaseConnection() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    throw new Error(
      "Missing database config for E2E cleanup. Set NEXTMAIL_DATABASE_URL / DATABASE_URL, or provide NEXTMAIL_DATABASE_HOST, NEXTMAIL_DATABASE_USER, NEXTMAIL_DATABASE_PASSWORD, and NEXTMAIL_DATABASE_NAME.",
    );
  }

  const url = new URL(databaseUrl);

  return mariadb.createConnection({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
  });
}
