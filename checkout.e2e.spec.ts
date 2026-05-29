import { expect, test } from "@playwright/test";

const baseURL = process.env.PW_BASE_URL ?? "http://localhost:3000";

type StoreProduct = {
  id: string;
  name: string;
  price: number;
  badge?: string;
  categoryId: string;
  imageUrl?: string;
  inventory: number;
};

test.setTimeout(180_000);

test("checkout can submit an order", async ({ page }) => {
  const logStep = (step: string) => console.log(`[checkout-e2e] ${step}`);
  const runId = Date.now().toString(36);
  const email = `checkout-e2e-${runId}@example.com`;
  const password = "TempOrder123";
  const name = `Checkout E2E ${runId}`;

  await page.context().addCookies([
    {
      name: "nextmail-locale",
      value: "zh-CN",
      url: baseURL,
    },
  ]);

  logStep("load store products");
  const storeResponse = await page.request.get(`${baseURL}/api/store`);
  expect(storeResponse.ok()).toBeTruthy();
  const store = (await storeResponse.json()) as { products: StoreProduct[] };
  const product = store.products.find((item) => item.inventory > 0);
  expect(product, "No in-stock product available for checkout E2E.").toBeTruthy();

  logStep("register temporary customer through shared request context");
  const registerResponse = await page.request.post(`${baseURL}/api/auth/register`, {
    data: {
      name,
      email,
      password,
    },
  });
  const registerText = await registerResponse.text();
  expect(
    registerResponse.ok(),
    `POST /api/auth/register failed with ${registerResponse.status()} ${registerResponse.statusText()}\n${registerText}`,
  ).toBeTruthy();

  logStep("seed cart with a real product");
  await page.evaluate((cartItem) => {
    window.localStorage.setItem("nextmail-cart", JSON.stringify([cartItem]));
    window.dispatchEvent(new Event("nextmail-cart-updated"));
  }, {
    id: product!.id,
    name: product!.name,
    price: product!.price,
    badge: product!.badge,
    categoryId: product!.categoryId,
    imageUrl: product!.imageUrl,
    inventory: product!.inventory,
    quantity: 1,
  });

  logStep("open checkout page");
  await page.goto(`${baseURL}/cart`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "收货信息" })).toBeVisible();

  logStep("fill checkout form");
  await page.getByLabel("收货人").fill(name);
  await page.getByLabel("联系电话").fill("13800138000");
  await page.getByLabel("联系邮箱").fill(email);
  await page.getByLabel("收货地址").fill("上海市浦东新区 Playwright 路 100 号");
  await page.getByLabel("订单备注").fill("checkout e2e note");

  const createOrderPromise = page.waitForResponse((response) => {
    return response.url().includes("/api/orders") && response.request().method() === "POST";
  });

  logStep("submit order from payment modal");
  await page.getByRole("button", { name: "提交订单" }).click();
  await expect(page.getByRole("dialog", { name: "收款信息" })).toBeVisible();
  await page.getByRole("button", { name: "我已知晓并提交订单" }).click();

  const createOrderResponse = await createOrderPromise;
  const responseText = await createOrderResponse.text();
  logStep(`received order response ${createOrderResponse.status()}`);
  expect(
    createOrderResponse.ok(),
    `POST /api/orders failed with ${createOrderResponse.status()} ${createOrderResponse.statusText()}\n${responseText}`,
  ).toBeTruthy();

  logStep("verify redirect to orders page");
  await expect(page).toHaveURL(/\/orders$/, { timeout: 20_000 });
  await expect(page.getByText(product!.name)).toBeVisible();
});
