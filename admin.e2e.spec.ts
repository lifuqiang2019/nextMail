import { expect, type Locator, type Page, test } from "@playwright/test";

import { cleanupAdminE2EData, fixtures } from "./admin.e2e.data";

const baseURL = process.env.PW_BASE_URL ?? "http://localhost:3010";

test.use({ channel: "msedge" });
test.setTimeout(180_000);

test.beforeAll(async () => {
  await cleanupAdminE2EData();
});

test.afterAll(async () => {
  await cleanupAdminE2EData();
});

test("admin full flow", async ({ page }) => {
  logStep("login as default admin");
  await login(page, "admin", "admin123");
  await expect(page.getByRole("heading", { name: "商品 CRUD" })).toBeVisible();

  logStep("verify settings");
  await verifySettingsFlow(page);
  logStep("verify categories");
  await verifyCategoryFlow(page);
  logStep("verify filters");
  await verifyFilterFlow(page);
  logStep("verify products");
  await verifyProductFlow(page);
  logStep("verify customers");
  await verifyCustomersView(page);
  logStep("verify admin users");
  await verifyAdminFlow(page);
});

async function verifySettingsFlow(page: Page) {
  await openMenu(page, "店铺配置", "店铺配置");

  const storeNameInput = page.getByLabel("店铺名称");
  const heroTitleInput = page.getByLabel("首页标题");
  const supportPhoneInput = page.getByLabel("联系电话");

  const originalStoreName = await storeNameInput.inputValue();
  const originalHeroTitle = await heroTitleInput.inputValue();
  const originalSupportPhone = await supportPhoneInput.inputValue();

  await storeNameInput.fill(`${originalStoreName} E2E`);
  await heroTitleInput.fill(`${originalHeroTitle} E2E`);
  await supportPhoneInput.fill("1234567890");

  await submitByApi(page, "/api/admin/settings", "PUT", page.getByRole("button", { name: "保存配置" }));
  await expect(storeNameInput).toHaveValue(`${originalStoreName} E2E`);
  await expect(heroTitleInput).toHaveValue(`${originalHeroTitle} E2E`);
  await expect(supportPhoneInput).toHaveValue("1234567890");

  await storeNameInput.fill(originalStoreName);
  await heroTitleInput.fill(originalHeroTitle);
  await supportPhoneInput.fill(originalSupportPhone);

  await submitByApi(page, "/api/admin/settings", "PUT", page.getByRole("button", { name: "保存配置" }));
  await expect(storeNameInput).toHaveValue(originalStoreName);
  await expect(heroTitleInput).toHaveValue(originalHeroTitle);
  await expect(supportPhoneInput).toHaveValue(originalSupportPhone);
}

async function verifyCategoryFlow(page: Page) {
  await openMenu(page, "分类 CRUD", "分类 CRUD");

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
  await openMenu(page, "过滤条件", "过滤条件 CRUD");

  await page.getByRole("button", { name: "新增过滤组" }).click();
  const dialog = page.getByRole("dialog", { name: "新增过滤组" });
  await dialog.getByLabel("过滤组名称").fill(fixtures.filter.name);
  await dialog.getByLabel("Slug").fill(fixtures.filter.slug);
  await dialog.getByLabel("描述").fill(fixtures.filter.description);
  await fillSpinButton(dialog.getByLabel("排序"), "93");
  await dialog.getByRole("button", { name: "新增选项" }).click();
  await dialog.getByLabel("显示文案").fill(fixtures.filter.optionLabel);
  await dialog.getByLabel("值").fill(fixtures.filter.optionValue);
  await fillSpinButton(dialog.getByLabel("排序").nth(1), "1");
  await submitByApi(page, "/api/admin/filters", "POST", dialog.getByRole("button", { name: "保存过滤组" }), {
    modal: dialog,
  });

  const createdRow = tableRow(page, fixtures.filter.name);
  await expect(createdRow).toBeVisible();

  await createdRow.getByRole("button", { name: "编辑" }).click();
  const editDialog = page.getByRole("dialog", { name: "编辑过滤组" });
  await editDialog.getByLabel("过滤组名称").fill(fixtures.filter.updatedName);
  await editDialog.getByLabel("描述").fill(fixtures.filter.updatedDescription);
  await editDialog.getByLabel("显示文案").fill(fixtures.filter.updatedOptionLabel);
  await editDialog.getByLabel("值").fill(fixtures.filter.updatedOptionValue);
  await submitByApi(page, "/api/admin/filters", "PATCH", editDialog.getByRole("button", { name: "保存过滤组" }), {
    modal: editDialog,
  });

  await expect(tableRow(page, fixtures.filter.updatedName)).toBeVisible();
}

async function verifyProductFlow(page: Page) {
  await openMenu(page, "商品 CRUD", "商品 CRUD");

  await page.getByRole("button", { name: "新增商品" }).click();
  const dialog = page.getByRole("dialog", { name: "新增商品" });

  await dialog.getByLabel("商品名称").fill(fixtures.product.name);
  await dialog.getByLabel("品牌").fill(fixtures.product.brand);
  await dialog.getByLabel("Slug").fill(fixtures.product.slug);
  await dialog.getByLabel("SKU").fill(fixtures.product.sku);
  await dialog.getByLabel("标签").fill(fixtures.product.badge);
  await fillSpinButton(dialog.getByLabel("售价"), fixtures.product.price);
  await fillSpinButton(dialog.getByLabel("划线价"), fixtures.product.originalPrice);
  await fillSpinButton(dialog.getByLabel("库存"), fixtures.product.inventory);
  await dialog.getByLabel("配色").fill(fixtures.product.colorway);
  await dialog.getByLabel("封面图 URL").fill(fixtures.product.imageUrl);
  await dialog.getByLabel("尺码，逗号分隔").fill(fixtures.product.sizes);
  await dialog.getByLabel("描述").fill(fixtures.product.description);

  logStep("select product relations");
  await selectAntdOption(dialog, "所属分类", fixtures.category.updatedName);
  await selectAntdOption(dialog, "状态", "ACTIVE");
  await selectAntdOption(dialog, "过滤条件绑定", `${fixtures.filter.updatedName} / ${fixtures.filter.updatedOptionLabel}`);

  await submitByApi(page, "/api/admin/products", "POST", dialog.getByRole("button", { name: "保存商品" }), {
    modal: dialog,
  });

  const createdRow = tableRow(page, fixtures.product.name);
  await expect(createdRow).toBeVisible();

  await createdRow.getByRole("button", { name: "编辑" }).click();
  const editDialog = page.getByRole("dialog", { name: "编辑商品" });
  await editDialog.getByLabel("商品名称").fill(fixtures.product.updatedName);
  await editDialog.getByLabel("品牌").fill(fixtures.product.updatedBrand);
  await editDialog.getByLabel("标签").fill(fixtures.product.updatedBadge);
  await fillSpinButton(editDialog.getByLabel("售价"), fixtures.product.updatedPrice);
  await fillSpinButton(editDialog.getByLabel("划线价"), fixtures.product.updatedOriginalPrice);
  await fillSpinButton(editDialog.getByLabel("库存"), fixtures.product.updatedInventory);
  await editDialog.getByLabel("配色").fill(fixtures.product.updatedColorway);
  await editDialog.getByLabel("封面图 URL").fill(fixtures.product.updatedImageUrl);
  await editDialog.getByLabel("尺码，逗号分隔").fill(fixtures.product.updatedSizes);
  await editDialog.getByLabel("描述").fill(fixtures.product.updatedDescription);

  await submitByApi(page, "/api/admin/products", "PATCH", editDialog.getByRole("button", { name: "保存商品" }), {
    modal: editDialog,
  });

  const updatedRow = tableRow(page, fixtures.product.updatedName);
  await expect(updatedRow).toBeVisible();

  await confirmByApi(page, "/api/admin/products", "DELETE", updatedRow.getByRole("button", { name: "删除" }));
  await expect(tableRow(page, fixtures.product.updatedName)).toHaveCount(0);

  await openMenu(page, "分类 CRUD", "分类 CRUD");
  const categoryRow = tableRow(page, fixtures.category.updatedName);
  await confirmByApi(page, "/api/admin/categories", "DELETE", categoryRow.getByRole("button", { name: "删除" }));
  await expect(tableRow(page, fixtures.category.updatedName)).toHaveCount(0);

  await openMenu(page, "过滤条件", "过滤条件 CRUD");
  const filterRow = tableRow(page, fixtures.filter.updatedName);
  await confirmByApi(page, "/api/admin/filters", "DELETE", filterRow.getByRole("button", { name: "删除" }));
  await expect(tableRow(page, fixtures.filter.updatedName)).toHaveCount(0);
}

async function verifyCustomersView(page: Page) {
  await openMenu(page, "前台用户", "前台会员列表");
  await expect(page.locator(".ant-table")).toBeVisible();
}

async function verifyAdminFlow(page: Page) {
  await openMenu(page, "后台账号", "后台账号管理");

  logStep("create temp admin");
  await page.getByRole("button", { name: "新增管理员" }).click();
  const dialog = page.getByRole("dialog", { name: "管理员账号" });
  await dialog.getByLabel("账号").fill(fixtures.admin.username);
  await dialog.getByLabel("显示名").fill(fixtures.admin.displayName);
  await dialog.getByLabel("邮箱").fill(fixtures.admin.email);
  await dialog.getByLabel("密码（编辑时留空表示不改）").fill(fixtures.admin.password);
  await submitByApi(page, "/api/admin/admin-users", "POST", dialog.getByRole("button", { name: "保存管理员" }), {
    modal: dialog,
  });

  const createdRow = tableRow(page, fixtures.admin.username);
  await expect(createdRow).toBeVisible();

  logStep("edit temp admin");
  await createdRow.getByRole("button", { name: "编辑账号" }).click();
  const editDialog = page.getByRole("dialog", { name: "管理员账号" });
  await editDialog.getByLabel("显示名").fill(fixtures.admin.updatedDisplayName);
  await editDialog.getByLabel("邮箱").fill(fixtures.admin.updatedEmail);
  await editDialog.getByLabel("密码（编辑时留空表示不改）").fill(fixtures.admin.updatedPassword);
  await submitByApi(page, "/api/admin/admin-users", "PATCH", editDialog.getByRole("button", { name: "保存管理员" }), {
    modal: editDialog,
  });

  await expect(tableRow(page, fixtures.admin.username)).toContainText(fixtures.admin.updatedDisplayName);

  logStep("logout default admin");
  await logout(page);
  logStep("login temp admin");
  await login(page, fixtures.admin.username, fixtures.admin.updatedPassword);
  await expect(page.getByText(fixtures.admin.updatedDisplayName)).toBeVisible();
  logStep("logout temp admin");
  await logout(page);
}

async function login(page: Page, username: string, password: string) {
  await page.goto(`${baseURL}/admin`, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.getByLabel("账号").fill(username);
  await page.getByLabel("密码").fill(password);
  const loginResponsePromise = waitForApi(page, "/api/admin/auth/login", "POST");
  await page.getByLabel("密码").press("Enter");
  const loginResponse = await loginResponsePromise;
  await expectApiSuccess(loginResponse, "POST", "/api/admin/auth/login");
  await expect(page).toHaveURL(/\/admin$/, { timeout: 15_000 });
  await expect(page.getByText("后台管理")).toBeVisible();
}

async function logout(page: Page) {
  await page.getByRole("button", { name: "退出后台" }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
}

async function openMenu(page: Page, menuLabel: string, heading: string) {
  await page.getByRole("menuitem", { name: new RegExp(menuLabel) }).click();
  await expect(page.getByRole("heading", { name: heading })).toBeVisible();
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
  const bodyText = await response
    .text()
    .catch(() => "[response body unavailable]");
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

