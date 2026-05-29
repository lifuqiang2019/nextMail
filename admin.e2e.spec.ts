import path from "node:path";

import { expect, type APIRequestContext, type Locator, type Page, test } from "@playwright/test";

import { cleanupAdminE2EData, fixtures } from "./admin.e2e.data";

const baseURL = process.env.PW_BASE_URL ?? "http://localhost:3000";

test.use({ channel: "msedge" });
test.setTimeout(180_000);

test("admin access is gated for unauthenticated users", async ({ page, request }) => {
  await page.goto(`${baseURL}/admin`, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole("heading", { name: "Admin Sign In" })).toBeVisible();

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

  test("admin CRUD flow is repeatable", async ({ page, request }) => {
    logStep("register customer for customer-list verification");
    await registerCustomer(request);

    logStep("login as default admin");
    await login(page, "admin", "admin123");
    await expect(page.getByRole("heading", { name: "Admin Console" })).toBeVisible();

    logStep("verify customers list");
    await verifyCustomerListFlow(page);

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

async function verifyCustomerListFlow(page: Page) {
  await openModule(page, "用户管理", "客户列表");

  const customerRow = tableRow(page, fixtures.customer.email);
  await expect(customerRow).toBeVisible();
  await expect(customerRow).toContainText(fixtures.customer.name);
  await expect(customerRow).toContainText("启用");
}

async function verifyCategoryFlow(page: Page) {
  await openModule(page, "Categories");

  await page.getByRole("button", { name: "Add Category" }).click();
  const dialog = page.getByRole("dialog", { name: "Add Category" });
  await dialog.getByLabel("Category Name").fill(fixtures.category.name);
  await dialog.getByLabel("Slug").fill(fixtures.category.slug);
  await dialog.getByLabel("Description").fill(fixtures.category.description);
  await fillSpinButton(dialog.getByLabel("Sort Order"), "91");
  await submitByApi(page, "/api/admin/categories", "POST", dialog.getByRole("button", { name: "Save Category" }), {
    modal: dialog,
  });

  const createdRow = tableRow(page, fixtures.category.name);
  await expect(createdRow).toBeVisible();

  await createdRow.getByRole("button", { name: "Edit" }).click();
  const editDialog = page.getByRole("dialog", { name: "Edit Category" });
  await editDialog.getByLabel("Category Name").fill(fixtures.category.updatedName);
  await editDialog.getByLabel("Description").fill(fixtures.category.updatedDescription);
  await fillSpinButton(editDialog.getByLabel("Sort Order"), "92");
  await submitByApi(page, "/api/admin/categories", "PATCH", editDialog.getByRole("button", { name: "Save Category" }), {
    modal: editDialog,
  });

  await expect(tableRow(page, fixtures.category.updatedName)).toBeVisible();
}

async function verifyFilterFlow(page: Page) {
  await openModule(page, "Filters");

  await page.getByRole("button", { name: "Add Filter Group" }).click();
  const dialog = page.getByRole("dialog", { name: "Add Filter Group" });
  await dialog.getByLabel("Filter Group Name").fill(fixtures.filter.name);
  await dialog.getByLabel("Slug").fill(fixtures.filter.slug);
  await dialog.getByLabel("Description").fill(fixtures.filter.description);
  await fillSpinButton(dialog.getByLabel("Sort Order"), "93");
  await dialog.getByRole("button", { name: "Add Option" }).click();
  await dialog.locator("#options_0_label").fill(fixtures.filter.optionLabel);
  await dialog.locator("#options_0_value").fill(fixtures.filter.optionValue);
  await fillSpinButton(dialog.locator("#options_0_sortOrder"), "1");
  await submitByApi(page, "/api/admin/filters", "POST", dialog.getByRole("button", { name: "Save Filter Group" }), {
    modal: dialog,
  });

  const createdRow = tableRow(page, fixtures.filter.name);
  await expect(createdRow).toBeVisible();
  await expect(createdRow).toContainText("1");

  await createdRow.getByRole("button", { name: "Edit" }).click();
  const editDialog = page.getByRole("dialog", { name: "Edit Filter Group" });
  await editDialog.getByLabel("Filter Group Name").fill(fixtures.filter.updatedName);
  await editDialog.getByLabel("Description").fill(fixtures.filter.updatedDescription);
  await editDialog.locator("#options_0_label").fill(fixtures.filter.updatedOptionLabel);
  await editDialog.locator("#options_0_value").fill(fixtures.filter.updatedOptionValue);
  await editDialog.getByRole("button", { name: "Add Option" }).click();
  await editDialog.locator("#options_1_label").fill(`${fixtures.filter.updatedOptionLabel} 2`);
  await editDialog.locator("#options_1_value").fill(`${fixtures.filter.updatedOptionValue}-2`);
  await fillSpinButton(editDialog.locator("#options_1_sortOrder"), "2");
  await submitByApi(page, "/api/admin/filters", "PATCH", editDialog.getByRole("button", { name: "Save Filter Group" }), {
    modal: editDialog,
  });

  const updatedRow = tableRow(page, fixtures.filter.updatedName);
  await expect(updatedRow).toBeVisible();
  await expect(updatedRow).toContainText("2");
}

async function verifyProductFlow(page: Page) {
  await openModule(page, "Products");

  await page.getByRole("button", { name: "Add Product" }).click();
  const dialog = page.getByRole("dialog", { name: "Add Product" });

  await dialog.getByLabel("Product Name").fill(fixtures.product.name);
  await dialog.getByLabel("Brand").fill(fixtures.product.brand);
  await dialog.getByLabel("Slug").fill(fixtures.product.slug);
  await dialog.getByLabel("SKU").fill(fixtures.product.sku);
  await dialog.getByLabel("Badge").fill(fixtures.product.badge);
  await fillSpinButton(dialog.locator("#price"), fixtures.product.price);
  await fillSpinButton(dialog.locator("#originalPrice"), fixtures.product.originalPrice);
  await fillSpinButton(dialog.locator("#inventory"), fixtures.product.inventory);
  await dialog.getByLabel("Colorway").fill(fixtures.product.colorway);
  await dialog.getByLabel("Sizes (comma separated)").fill(fixtures.product.sizes);
  await dialog.getByLabel("Description").fill(fixtures.product.description);

  await selectAntdOption(dialog, "Category", fixtures.category.updatedName);
  await selectAntdOption(dialog, "Status", "ACTIVE");
  await selectAntdOption(
    dialog,
    "Filter Bindings",
    `${fixtures.filter.updatedName} / ${fixtures.filter.updatedOptionLabel}`,
  );
  await uploadProductImage(page, dialog);

  await submitByApi(page, "/api/admin/products", "POST", dialog.getByRole("button", { name: "Save Product" }), {
    modal: dialog,
  });

  const createdRow = tableRow(page, fixtures.product.name);
  await expect(createdRow).toBeVisible();

  await createdRow.getByRole("button", { name: "Edit" }).click();
  const editDialog = page.getByRole("dialog", { name: "Edit Product" });
  await editDialog.getByLabel("Product Name").fill(fixtures.product.updatedName);
  await editDialog.getByLabel("Brand").fill(fixtures.product.updatedBrand);
  await editDialog.getByLabel("Badge").fill(fixtures.product.updatedBadge);
  await fillSpinButton(editDialog.locator("#price"), fixtures.product.updatedPrice);
  await fillSpinButton(editDialog.locator("#originalPrice"), fixtures.product.updatedOriginalPrice);
  await fillSpinButton(editDialog.locator("#inventory"), fixtures.product.updatedInventory);
  await editDialog.getByLabel("Colorway").fill(fixtures.product.updatedColorway);
  await editDialog.getByLabel("Sizes (comma separated)").fill(fixtures.product.updatedSizes);
  await editDialog.getByLabel("Description").fill(fixtures.product.updatedDescription);
  await submitByApi(page, "/api/admin/products", "PATCH", editDialog.getByRole("button", { name: "Save Product" }), {
    modal: editDialog,
  });

  const updatedRow = tableRow(page, fixtures.product.updatedName);
  await expect(updatedRow).toBeVisible();

  await confirmByApi(page, "/api/admin/products", "DELETE", updatedRow.getByRole("button", { name: "Delete" }));
  await expect(tableRow(page, fixtures.product.updatedName)).toHaveCount(0);
}

async function cleanupCategoryAndFilter(page: Page) {
  await openModule(page, "Categories");
  const categoryRow = tableRow(page, fixtures.category.updatedName);
  await confirmByApi(page, "/api/admin/categories", "DELETE", categoryRow.getByRole("button", { name: "Delete" }));
  await expect(tableRow(page, fixtures.category.updatedName)).toHaveCount(0);

  await openModule(page, "Filters");
  const filterRow = tableRow(page, fixtures.filter.updatedName);
  await confirmByApi(page, "/api/admin/filters", "DELETE", filterRow.getByRole("button", { name: "Delete" }));
  await expect(tableRow(page, fixtures.filter.updatedName)).toHaveCount(0);
}

async function verifyAdminFlow(page: Page) {
  await openModule(page, "Admin Users");

  await page.getByRole("button", { name: "Add Admin User" }).click();
  const dialog = page.getByRole("dialog", { name: "Admin User" });
  await dialog.getByLabel("Username").fill(fixtures.admin.username);
  await dialog.getByLabel("Display Name").fill(fixtures.admin.displayName);
  await dialog.getByLabel("Email").fill(fixtures.admin.email);
  await dialog.getByLabel("Password (leave blank when editing to keep unchanged)").fill(fixtures.admin.password);
  await submitByApi(page, "/api/admin/admin-users", "POST", dialog.getByRole("button", { name: "Save Admin User" }), {
    modal: dialog,
  });

  const createdRow = tableRow(page, fixtures.admin.username);
  await expect(createdRow).toBeVisible();
  await expect(createdRow).toContainText(fixtures.admin.displayName);

  await createdRow.getByRole("button", { name: "Edit Admin" }).click();
  const editDialog = page.getByRole("dialog", { name: "Admin User" });
  await editDialog.getByLabel("Display Name").fill(fixtures.admin.updatedDisplayName);
  await editDialog.getByLabel("Email").fill(fixtures.admin.updatedEmail);
  await editDialog.getByLabel("Password (leave blank when editing to keep unchanged)").fill(fixtures.admin.updatedPassword);
  await submitByApi(page, "/api/admin/admin-users", "PATCH", editDialog.getByRole("button", { name: "Save Admin User" }), {
    modal: editDialog,
  });

  await expect(tableRow(page, fixtures.admin.username)).toContainText(fixtures.admin.updatedDisplayName);

  await logout(page);
  await login(page, fixtures.admin.username, fixtures.admin.updatedPassword);
  await expect(page.getByText(fixtures.admin.updatedDisplayName)).toBeVisible();

  await logout(page);
  await login(page, "admin", "admin123");
  await openModule(page, "Admin Users");

  const updatedRow = tableRow(page, fixtures.admin.username);
  await updatedRow.getByRole("button", { name: "Edit Admin" }).click();
  const disableDialog = page.getByRole("dialog", { name: "Admin User" });
  await disableDialog.getByLabel("Display Name").fill(fixtures.admin.updatedDisplayName);
  await disableDialog.getByLabel("Email").fill(fixtures.admin.updatedEmail);
  await toggleSwitch(disableDialog.getByLabel("Active"), false);
  await submitByApi(
    page,
    "/api/admin/admin-users",
    "PATCH",
    disableDialog.getByRole("button", { name: "Save Admin User" }),
    { modal: disableDialog },
  );

  await expect(tableRow(page, fixtures.admin.username)).toContainText("Inactive");

  await logout(page);
  await loginExpectFailure(page, fixtures.admin.username, fixtures.admin.updatedPassword, 404);
  await login(page, "admin", "admin123");
}

async function login(page: Page, username: string, password: string) {
  await page.goto(`${baseURL}/admin`, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  const loginResponsePromise = waitForApi(page, "/api/admin/auth/login", "POST");
  await page.getByRole("button", { name: "Sign In to Admin" }).click();
  const loginResponse = await loginResponsePromise;
  await expectApiSuccess(loginResponse, "POST", "/api/admin/auth/login");
  await expect(page).toHaveURL(/\/admin$/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Admin Console" })).toBeVisible();
}

async function registerCustomer(request: APIRequestContext) {
  const response = await request.post(`${baseURL}/api/auth/register`, {
    data: fixtures.customer,
  });

  const bodyText = await response.text().catch(() => "[response body unavailable]");
  expect(
    response.ok(),
    `POST /api/auth/register failed with ${response.status()} ${response.statusText()}\n${bodyText}`,
  ).toBeTruthy();
}

async function loginExpectFailure(page: Page, username: string, password: string, status: number) {
  await page.goto(`${baseURL}/admin/login`, { waitUntil: "domcontentloaded" });
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);

  const responsePromise = waitForApi(page, "/api/admin/auth/login", "POST");
  await page.getByRole("button", { name: "Sign In to Admin" }).click();
  const response = await responsePromise;

  expect(response.status()).toBe(status);
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole("heading", { name: "Admin Sign In" })).toBeVisible();
}

async function logout(page: Page) {
  await page.getByRole("button", { name: "Sign Out" }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
}

async function openModule(
  page: Page,
  moduleName: "Products" | "Categories" | "Filters" | "用户管理" | "Admin Users",
  headingName: string = moduleName,
) {
  await page.locator(".ant-menu-item").filter({ hasText: moduleName }).first().click();
  await expect(page.locator("h3").filter({ hasText: headingName })).toBeVisible();
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
