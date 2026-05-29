import path from "node:path";

import { expect, type Locator, type Page, test } from "@playwright/test";

import { cleanupAdminE2EData, fixtures } from "./admin.e2e.data";
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, normalizeLocale, type AppLocale } from "./src/lib/i18n/config";
import { getFallbackStore } from "./src/lib/store-defaults";

const baseURL = process.env.PW_BASE_URL ?? "http://localhost:3000";

const settingsFieldConfigs = [
  { key: "storeName", label: "店铺名称" },
  { key: "orderLink", label: "订单链接" },
  { key: "supportEmail", label: "客服邮箱" },
  { key: "supportPhone", label: "客服电话" },
  { key: "paymentAccountName", label: "收款户名" },
  { key: "paymentAccountNumber", label: "收款账号" },
  { key: "paymentBankName", label: "收款银行" },
  { key: "heroTitle", label: "首页主标题" },
  { key: "heroSubtitle", label: "首页副标题" },
  { key: "heroNotice", label: "首页公告" },
  { key: "purchaseGuide", label: "购买说明" },
] as const;

type SettingsFieldKey = (typeof settingsFieldConfigs)[number]["key"];
type SettingsSnapshot = Record<SettingsFieldKey, string>;

test.setTimeout(180_000);

test("admin access is gated for unauthenticated users", async ({ page, request }) => {
  await page.goto(`${baseURL}/admin`, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole("heading", { name: "管理员登录" })).toBeVisible();

  const response = await request.post(`${baseURL}/api/admin/products`, {
    data: { id: "unauth-test" },
  });

  expect(response.status()).toBe(401);
});

test.describe("admin CRUD flow", () => {
  test.beforeAll(async () => {
    await cleanupAdminE2EData();
  });

  test.afterAll(async () => {
    await cleanupAdminE2EData();
  });

  test("admin settings page can save and restore values", async ({ page }) => {
    await login(page, "admin", "admin123");
    await verifySettingsFlow(page);
  });

  test("admin CRUD flow is repeatable", async ({ page }) => {
    logStep("login as default admin");
    await login(page, "admin", "admin123");
    await expect(page.getByRole("heading", { name: "管理后台" })).toBeVisible();

    logStep("register customer and verify it appears in Customers module");
    await registerCustomerViaApi(page);
    await page.goto(`${baseURL}/admin`, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "管理后台" })).toBeVisible();
    await openModule(page, "用户");
    await expect(tableRow(page, fixtures.customer.email)).toBeVisible();

    logStep("verify categories CRUD");
    await verifyCategoryFlow(page);

    logStep("verify filters CRUD");
    await verifyFilterFlow(page);

    logStep("verify products CRUD");
    await verifyProductFlow(page);

    logStep("cleanup category and filter through UI");
    await cleanupCategoryAndFilter(page);

    logStep("verify admin users create/view/update/login/disable");
    await verifyAdminFlow(page);
  });
});

async function verifySettingsFlow(page: Page) {
  await openModule(page, "设置");

  const saveButton = page.getByRole("button", { name: "保存设置" });
  const originalValues = await readSettingsSnapshot(page);
  const locale = await readCurrentLocale(page);
  const fallbackSettings = getFallbackStore(locale).settings;

  const runId = Date.now().toString(36);
  const nextValues: SettingsSnapshot = {
    storeName: `${originalValues.storeName} E2E ${runId}`,
    orderLink: `https://e2e.example.com/orders/${runId}`,
    supportEmail: `admin-settings-${runId}@example.com`,
    supportPhone: `400-${runId.slice(-4).padStart(4, "0")}`,
    paymentAccountName: `E2E 户名 ${runId}`,
    paymentAccountNumber: `E2E-ACC-${runId}`,
    paymentBankName: `E2E 支行 ${runId}`,
    heroTitle: `E2E Hero ${runId}`,
    heroSubtitle: `E2E subtitle ${runId}\nLine 2`,
    heroNotice: `E2E notice ${runId}`,
    purchaseGuide: `E2E guide ${runId}\nStep 1`,
  };
  const clearedValues: SettingsSnapshot = {
    ...nextValues,
    orderLink: fallbackSettings.orderLink,
    supportEmail: fallbackSettings.supportEmail,
    supportPhone: fallbackSettings.supportPhone,
    paymentAccountName: fallbackSettings.paymentAccountName ?? "",
    paymentAccountNumber: fallbackSettings.paymentAccountNumber ?? "",
    paymentBankName: fallbackSettings.paymentBankName ?? "",
    heroTitle: fallbackSettings.heroTitle,
    heroSubtitle: fallbackSettings.heroSubtitle,
    heroNotice: fallbackSettings.heroNotice,
    purchaseGuide: fallbackSettings.purchaseGuide,
  };

  try {
    await fillSettingsForm(page, nextValues);
    await submitByApi(page, "/api/admin/settings", "PUT", saveButton, { refresh: false });
    await expectSettingsSnapshot(page, nextValues);

    await reopenSettings(page);
    await expectSettingsSnapshot(page, nextValues);

    await fillSettingsForm(page, {
      ...nextValues,
      orderLink: "",
      supportEmail: "",
      supportPhone: "",
      paymentAccountName: "",
      paymentAccountNumber: "",
      paymentBankName: "",
      heroTitle: "",
      heroSubtitle: "",
      heroNotice: "",
      purchaseGuide: "",
    });
    await submitByApi(page, "/api/admin/settings", "PUT", saveButton, { refresh: false });

    await reopenSettings(page);
    await expectSettingsSnapshot(page, clearedValues);
  } finally {
    await reopenSettings(page);
    await fillSettingsForm(page, originalValues);
    await submitByApi(page, "/api/admin/settings", "PUT", page.getByRole("button", { name: "保存设置" }), {
      refresh: false,
    });
    await reopenSettings(page);
    await expectSettingsSnapshot(page, originalValues);
  }
}

async function reopenSettings(page: Page) {
  await page.goto(`${baseURL}/admin`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "管理后台" })).toBeVisible();
  await openModule(page, "设置");
}

async function readCurrentLocale(page: Page): Promise<AppLocale> {
  const cookies = await page.context().cookies(baseURL);
  const localeCookie = cookies.find((cookie) => cookie.name === LOCALE_COOKIE_NAME)?.value;
  return normalizeLocale(localeCookie ?? DEFAULT_LOCALE);
}

async function readSettingsSnapshot(page: Page): Promise<SettingsSnapshot> {
  const entries = await Promise.all(
    settingsFieldConfigs.map(async ({ key, label }) => {
      return [key, await page.getByLabel(label).inputValue()] as const;
    }),
  );
  return Object.fromEntries(entries) as SettingsSnapshot;
}

async function fillSettingsForm(page: Page, values: SettingsSnapshot) {
  for (const { key, label } of settingsFieldConfigs) {
    await page.getByLabel(label).fill(values[key]);
  }
}

async function expectSettingsSnapshot(page: Page, values: SettingsSnapshot) {
  for (const { key, label } of settingsFieldConfigs) {
    await expect(page.getByLabel(label)).toHaveValue(values[key]);
  }
}

async function verifyCategoryFlow(page: Page) {
  await openModule(page, "分类");

  await page.getByRole("button", { name: "新增分类" }).click();
  const dialog = page.getByRole("dialog", { name: "新增分类" });
  await dialog.getByLabel("分类名称").fill(fixtures.category.name);
  await dialog.getByLabel("Slug").fill(fixtures.category.slug);
  await dialog.getByLabel("描述").fill(fixtures.category.description);
  await fillSpinButton(dialog.getByLabel("排序"), "91");
  await submitByApi(page, "/api/admin/categories", "POST", dialog.getByRole("button", { name: "保存分类" }), {
    modal: dialog,
  });

  const createdRow = tableRow(page, fixtures.category.name);
  await expect(createdRow).toBeVisible();

  await createdRow.getByRole("button", { name: "编辑" }).click();
  const editDialog = page.getByRole("dialog", { name: "编辑分类" });
  await editDialog.getByLabel("分类名称").fill(fixtures.category.updatedName);
  await editDialog.getByLabel("描述").fill(fixtures.category.updatedDescription);
  await fillSpinButton(editDialog.getByLabel("排序"), "92");
  await submitByApi(page, "/api/admin/categories", "PATCH", editDialog.getByRole("button", { name: "保存分类" }), {
    modal: editDialog,
  });

  await expect(tableRow(page, fixtures.category.updatedName)).toBeVisible();
}

async function verifyFilterFlow(page: Page) {
  await openModule(page, "筛选");

  await page.getByRole("button", { name: "新增筛选组" }).click();
  const dialog = page.getByRole("dialog", { name: "新增筛选组" });
  await dialog.getByLabel("筛选组名称").fill(fixtures.filter.name);
  await dialog.getByLabel("Slug").fill(fixtures.filter.slug);
  await dialog.getByLabel("描述").fill(fixtures.filter.description);
  await fillSpinButton(dialog.getByLabel("排序"), "93");
  await dialog.getByRole("button", { name: "新增选项" }).click();
  await dialog.locator("#options_0_label").fill(fixtures.filter.optionLabel);
  await dialog.locator("#options_0_value").fill(fixtures.filter.optionValue);
  await fillSpinButton(dialog.locator("#options_0_sortOrder"), "1");
  await submitByApi(page, "/api/admin/filters", "POST", dialog.getByRole("button", { name: "保存筛选组" }), {
    modal: dialog,
  });

  const createdRow = tableRow(page, fixtures.filter.name);
  await expect(createdRow).toBeVisible();
  await expect(createdRow).toContainText("1");

  await createdRow.getByRole("button", { name: "编辑" }).click();
  const editDialog = page.getByRole("dialog", { name: "编辑筛选组" });
  await editDialog.getByLabel("筛选组名称").fill(fixtures.filter.updatedName);
  await editDialog.getByLabel("描述").fill(fixtures.filter.updatedDescription);
  await editDialog.locator("#options_0_label").fill(fixtures.filter.updatedOptionLabel);
  await editDialog.locator("#options_0_value").fill(fixtures.filter.updatedOptionValue);
  await editDialog.getByRole("button", { name: "新增选项" }).click();
  await editDialog.locator("#options_1_label").fill(`${fixtures.filter.updatedOptionLabel} 2`);
  await editDialog.locator("#options_1_value").fill(`${fixtures.filter.updatedOptionValue}-2`);
  await fillSpinButton(editDialog.locator("#options_1_sortOrder"), "2");
  await submitByApi(page, "/api/admin/filters", "PATCH", editDialog.getByRole("button", { name: "保存筛选组" }), {
    modal: editDialog,
  });

  const updatedRow = tableRow(page, fixtures.filter.updatedName);
  await expect(updatedRow).toBeVisible();
  await expect(updatedRow).toContainText("2");
}

async function verifyProductFlow(page: Page) {
  await openModule(page, "商品");

  await page.getByRole("button", { name: "新增商品" }).click();
  const dialog = page.getByRole("dialog", { name: "新增商品" });

  await dialog.getByLabel("商品名称").fill(fixtures.product.name);
  await dialog.getByLabel("品牌").fill(fixtures.product.brand);
  await dialog.getByLabel("Slug").fill(fixtures.product.slug);
  await dialog.getByLabel("SKU").fill(fixtures.product.sku);
  await dialog.getByLabel("角标").fill(fixtures.product.badge);
  await fillSpinButton(dialog.locator("#price"), fixtures.product.price);
  await fillSpinButton(dialog.locator("#originalPrice"), fixtures.product.originalPrice);
  await fillSpinButton(dialog.locator("#inventory"), fixtures.product.inventory);
  await dialog.getByLabel("配色").fill(fixtures.product.colorway);
  await dialog.getByLabel("尺码（逗号分隔）").fill(fixtures.product.sizes);
  await dialog.getByLabel("描述").fill(fixtures.product.description);

  await selectAntdOption(dialog, "分类", fixtures.category.updatedName);
  await selectAntdOption(dialog, "状态", "ACTIVE");
  await selectAntdOption(dialog, "筛选绑定", `${fixtures.filter.updatedName} / ${fixtures.filter.updatedOptionLabel}`);
  await uploadProductImage(page, dialog);

  await submitByApi(page, "/api/admin/products", "POST", dialog.getByRole("button", { name: "保存商品" }), {
    modal: dialog,
  });

  const createdRow = tableRow(page, fixtures.product.name);
  await expect(createdRow).toBeVisible();

  await createdRow.getByRole("button", { name: "编辑" }).click();
  const editDialog = page.getByRole("dialog", { name: "编辑商品" });
  await editDialog.getByLabel("商品名称").fill(fixtures.product.updatedName);
  await editDialog.getByLabel("品牌").fill(fixtures.product.updatedBrand);
  await editDialog.getByLabel("角标").fill(fixtures.product.updatedBadge);
  await fillSpinButton(editDialog.locator("#price"), fixtures.product.updatedPrice);
  await fillSpinButton(editDialog.locator("#originalPrice"), fixtures.product.updatedOriginalPrice);
  await fillSpinButton(editDialog.locator("#inventory"), fixtures.product.updatedInventory);
  await editDialog.getByLabel("配色").fill(fixtures.product.updatedColorway);
  await editDialog.getByLabel("尺码（逗号分隔）").fill(fixtures.product.updatedSizes);
  await editDialog.getByLabel("描述").fill(fixtures.product.updatedDescription);
  await submitByApi(page, "/api/admin/products", "PATCH", editDialog.getByRole("button", { name: "保存商品" }), {
    modal: editDialog,
  });

  const updatedRow = tableRow(page, fixtures.product.updatedName);
  await expect(updatedRow).toBeVisible();

  await confirmByApi(page, "/api/admin/products", "DELETE", updatedRow.getByRole("button", { name: "删除" }));
  await expect(tableRow(page, fixtures.product.updatedName)).toHaveCount(0);
}

async function cleanupCategoryAndFilter(page: Page) {
  await openModule(page, "分类");
  const categoryRow = tableRow(page, fixtures.category.updatedName);
  await confirmByApi(page, "/api/admin/categories", "DELETE", categoryRow.getByRole("button", { name: "删除" }));
  await expect(tableRow(page, fixtures.category.updatedName)).toHaveCount(0);

  await openModule(page, "筛选");
  const filterRow = tableRow(page, fixtures.filter.updatedName);
  await confirmByApi(page, "/api/admin/filters", "DELETE", filterRow.getByRole("button", { name: "删除" }));
  await expect(tableRow(page, fixtures.filter.updatedName)).toHaveCount(0);
}

async function verifyAdminFlow(page: Page) {
  await openModule(page, "管理员");

  await page.getByRole("button", { name: "新增管理员" }).click();
  const dialog = page.getByRole("dialog", { name: "管理员" });
  await dialog.getByLabel("用户名").fill(fixtures.admin.username);
  await dialog.getByLabel("显示名").fill(fixtures.admin.displayName);
  await dialog.getByLabel("邮箱").fill(fixtures.admin.email);
  await dialog.getByLabel("密码（编辑时留空则不修改）").fill(fixtures.admin.password);
  await submitByApi(page, "/api/admin/admin-users", "POST", dialog.getByRole("button", { name: "保存管理员" }), {
    modal: dialog,
  });

  const createdRow = tableRow(page, fixtures.admin.username);
  await expect(createdRow).toBeVisible();
  await expect(createdRow).toContainText(fixtures.admin.displayName);

  await createdRow.getByRole("button", { name: "编辑" }).click();
  const editDialog = page.getByRole("dialog", { name: "管理员" });
  await editDialog.getByLabel("显示名").fill(fixtures.admin.updatedDisplayName);
  await editDialog.getByLabel("邮箱").fill(fixtures.admin.updatedEmail);
  await editDialog.getByLabel("密码（编辑时留空则不修改）").fill(fixtures.admin.updatedPassword);
  await submitByApi(page, "/api/admin/admin-users", "PATCH", editDialog.getByRole("button", { name: "保存管理员" }), {
    modal: editDialog,
  });

  await expect(tableRow(page, fixtures.admin.username)).toContainText(fixtures.admin.updatedDisplayName);

  await logout(page);
  await login(page, fixtures.admin.username, fixtures.admin.updatedPassword);
  await expect(page.getByText(fixtures.admin.updatedDisplayName)).toBeVisible();

  await logout(page);
  await login(page, "admin", "admin123");
  await openModule(page, "管理员");

  const updatedRow = tableRow(page, fixtures.admin.username);
  await updatedRow.getByRole("button", { name: "编辑" }).click();
  const disableDialog = page.getByRole("dialog", { name: "管理员" });
  await disableDialog.getByLabel("显示名").fill(fixtures.admin.updatedDisplayName);
  await disableDialog.getByLabel("邮箱").fill(fixtures.admin.updatedEmail);
  await toggleSwitch(disableDialog.getByLabel("启用"), false);
  await submitByApi(
    page,
    "/api/admin/admin-users",
    "PATCH",
    disableDialog.getByRole("button", { name: "保存管理员" }),
    { modal: disableDialog },
  );

  await expect(tableRow(page, fixtures.admin.username)).toContainText("停用");

  await logout(page);
  await loginExpectFailure(page, fixtures.admin.username, fixtures.admin.updatedPassword, 404);
  await login(page, "admin", "admin123");
}

async function login(page: Page, username: string, password: string) {
  await page.goto(`${baseURL}/admin`, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.getByLabel("用户名").fill(username);
  await page.getByLabel("密码").fill(password);
  const loginResponsePromise = waitForApi(page, "/api/admin/auth/login", "POST");
  await page.getByRole("button", { name: "登录管理后台" }).click();
  const loginResponse = await loginResponsePromise;
  await expectApiSuccess(loginResponse, "POST", "/api/admin/auth/login");
  await expect(page).toHaveURL(/\/admin$/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "管理后台" })).toBeVisible();
}

async function loginExpectFailure(page: Page, username: string, password: string, status: number) {
  await page.goto(`${baseURL}/admin/login`, { waitUntil: "domcontentloaded" });
  await page.getByLabel("用户名").fill(username);
  await page.getByLabel("密码").fill(password);

  const responsePromise = waitForApi(page, "/api/admin/auth/login", "POST");
  await page.getByRole("button", { name: "登录管理后台" }).click();
  const response = await responsePromise;

  expect(response.status()).toBe(status);
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole("heading", { name: "管理员登录" })).toBeVisible();
}

async function logout(page: Page) {
  await page.getByRole("button", { name: "退出登录" }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
}

async function openModule(page: Page, moduleName: "设置" | "用户" | "商品" | "分类" | "筛选" | "管理员") {
  await page.locator(".ant-menu-item").filter({ hasText: moduleName }).first().click();
  await expect(page.locator("h3").filter({ hasText: moduleName })).toBeVisible();
}

async function submitByApi(
  page: Page,
  path: string,
  method: string,
  button: Locator,
  options: { modal?: Locator; refresh?: boolean } = {},
) {
  await triggerApiAction(page, path, method, () => button.click(), options);
}

async function confirmByApi(page: Page, path: string, method: string, trigger: Locator) {
  await triggerApiAction(page, path, method, async () => {
    await trigger.click();
    await confirmPopconfirm(page);
  });
}

async function uploadProductImage(page: Page, dialog: Locator) {
  const uploadResponsePromise = waitForApi(page, "/api/admin/upload", "POST");
  await dialog.locator('input[type="file"]').setInputFiles(path.resolve("d:\\monad\\nextMail\\public\\next.svg"));
  const response = await uploadResponsePromise;
  await expectApiSuccess(response, "POST", "/api/admin/upload");
  await expect(dialog.locator('input[id="imageUrl"]')).toHaveValue(/^https?:\/\//, { timeout: 20_000 });
}

async function registerCustomerViaApi(page: Page) {
  const response = await page.request.post(`${baseURL}/api/auth/register`, {
    data: {
      name: fixtures.customer.name,
      email: fixtures.customer.email,
      password: fixtures.customer.password,
    },
  });
  expect(
    response.ok(),
    `POST /api/auth/register failed with ${response.status()} ${response.statusText()}\n${await response.text()}`,
  ).toBeTruthy();
}

async function triggerApiAction(
  page: Page,
  path: string,
  method: string,
  trigger: () => Promise<void>,
  options: { modal?: Locator; refresh?: boolean } = {},
) {
  const responsePromise = waitForApi(page, path, method);
  const refreshPromise = options.refresh === false ? null : waitForApi(page, "/api/admin/bootstrap", "GET");

  await trigger();

  const response = await responsePromise;
  await expectApiSuccess(response, method, path);

  const pendingChecks: Array<Promise<unknown>> = [];
  if (refreshPromise) {
    pendingChecks.push(refreshPromise);
  }
  if (options.modal) {
    pendingChecks.push(expect(options.modal).toBeHidden());
  }

  await Promise.all(pendingChecks);
}

async function waitForApi(page: Page, path: string, method: string) {
  return page.waitForResponse((response) => {
    return response.url().includes(path) && response.request().method() === method;
  });
}

async function expectApiSuccess(response: Awaited<ReturnType<Page["waitForResponse"]>>, method: string, path: string) {
  const bodyText = await response.text().catch(() => "[response body unavailable]");
  expect(
    response.ok(),
    `${method} ${path} failed with ${response.status()} ${response.statusText()}\n${bodyText}`,
  ).toBeTruthy();
}

async function selectAntdOption(container: Locator, labelText: string, optionText: string) {
  const field = container.locator(".ant-form-item").filter({ hasText: labelText }).first();
  await field.locator(".ant-select").click();
  const dropdown = container.page().locator(".ant-select-dropdown:visible").last();
  await dropdown.locator(".ant-select-item-option-content").filter({ hasText: optionText }).first().click();
}

async function toggleSwitch(locator: Locator, checked: boolean) {
  const current = (await locator.getAttribute("aria-checked")) === "true";
  if (current !== checked) {
    await locator.click();
  }
}

async function fillSpinButton(locator: Locator, value: string) {
  await locator.click();
  await locator.fill("");
  await locator.type(value);
}

async function confirmPopconfirm(page: Page) {
  const confirmButton = page.locator(".ant-popconfirm-buttons .ant-btn-primary");
  await expect(confirmButton).toBeVisible();
  await confirmButton.click();
}

function tableRow(page: Page, text: string) {
  return page.locator(".ant-table-row").filter({ hasText: text }).first();
}

function logStep(step: string) {
  console.log(`[admin-e2e] ${step}`);
}
