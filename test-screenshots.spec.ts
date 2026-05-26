import { mkdirSync } from "node:fs";
import path from "node:path";

import { test, expect } from "@playwright/test";

test.use({
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  viewport: { width: 1280, height: 720 },
});

function ensureScreenshotsDir() {
  mkdirSync(path.resolve(process.cwd(), "screenshots"), { recursive: true });
}

const BASE_URL = process.env.PW_BASE_URL ?? "http://localhost:3000";

async function switchLocale(page: import("@playwright/test").Page, target: "zh-CN" | "en-US") {
  await page.locator("button.locale-switcher").click();

  if (target === "zh-CN") {
    await page.getByRole("menuitem", { name: /中文|Chinese/i }).click();
    await expect(page.locator(".locale-switcher__value")).toHaveText("中");
    await expect(page.getByRole("heading", { name: "关于我们" })).toBeVisible();
    return;
  }

  await page.getByRole("menuitem", { name: /英文|English/i }).click();
  await expect(page.locator(".locale-switcher__value")).toHaveText("EN");
  await expect(page.getByRole("heading", { name: "About" })).toBeVisible();
}

test("language switcher updates UI + screenshots (EN -> ZH -> EN)", async ({ page }) => {
  ensureScreenshotsDir();

  await page.goto(`${BASE_URL}/`);
  await page.waitForLoadState("networkidle");

  await expect(page.locator(".store-hero__title")).toBeVisible();
  await page.screenshot({ path: "screenshots/home-en.png", fullPage: true });

  const heroTitleEn = (await page.locator(".store-hero__title").innerText()).trim();
  await test.info().attach("hero-title-en.txt", { body: Buffer.from(heroTitleEn, "utf8") });

  await switchLocale(page, "zh-CN");
  await page.waitForLoadState("networkidle");

  await page.screenshot({ path: "screenshots/home-zh.png", fullPage: true });

  const heroTitleZh = (await page.locator(".store-hero__title").innerText()).trim();
  await test.info().attach("hero-title-zh.txt", { body: Buffer.from(heroTitleZh, "utf8") });

  await switchLocale(page, "en-US");
  await page.waitForLoadState("networkidle");

  await page.screenshot({ path: "screenshots/home-en-again.png", fullPage: true });
});
