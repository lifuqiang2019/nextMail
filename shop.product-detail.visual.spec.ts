import { expect, type Page, test } from "@playwright/test";

const baseURL = process.env.PW_BASE_URL ?? "http://localhost:3010";

test.use({ channel: "msedge" });
test.setTimeout(180_000);

const TRANSPARENT_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/6X9l9kAAAAASUVORK5CYII=",
  "base64",
);

async function mockRemoteImages(page: Page) {
  await page.route(/https:\/\/images\.unsplash\.com\/.*/i, async (route) => {
    await route.fulfill({ status: 200, contentType: "image/png", body: TRANSPARENT_PNG });
  });
  await page.route(/https:\/\/via\.placeholder\.com\/.*/i, async (route) => {
    await route.fulfill({ status: 200, contentType: "image/png", body: TRANSPARENT_PNG });
  });
}

async function disableAnimations(page: Page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        scroll-behavior: auto !important;
        caret-color: transparent !important;
      }
    `,
  });
}

async function openFirstProductDetail(page: Page) {
  await page.goto(`${baseURL}/`, { waitUntil: "domcontentloaded" });

  const firstCard = page.locator(".product-grid a.product-card").first();
  await expect(firstCard).toBeVisible();
  await firstCard.click();

  await expect(page.locator('[data-testid="product-detail"]')).toBeVisible();
  await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
}

test("product detail visual - desktop", async ({ page }) => {
  await mockRemoteImages(page);
  await openFirstProductDetail(page);
  await disableAnimations(page);
  await expect(page).toHaveScreenshot("product-detail-desktop.png", { fullPage: true });
});

test.describe("product detail visual - mobile", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    hasTouch: true,
    isMobile: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
  });

  test("product detail visual - mobile", async ({ page }) => {
    await mockRemoteImages(page);
    await openFirstProductDetail(page);
    await disableAnimations(page);
    await expect(page).toHaveScreenshot("product-detail-mobile.png", { fullPage: true });
  });
});
