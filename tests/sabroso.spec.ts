import { expect, test } from "@playwright/test";

const eventPath = "/sabroso-san-juan-2026";

test("renders the Sabroso event landing", async ({ page }) => {
  const response = await page.goto(eventPath);

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Sabroso en San Juan/);
  await expect(page.getByRole("heading", { level: 1, name: "Sabroso" })).toBeVisible();
  await expect(page.getByText("28 de agosto de 2026").first()).toBeVisible();
});

test("exposes the Entradaweb CTA with campaign attribution", async ({ page }) => {
  await page.goto(eventPath);

  const cta = page.getByRole("link", { name: /comprar entradas/i }).first();
  await expect(cta).toBeVisible();

  const href = await cta.getAttribute("href");
  expect(href).toBeTruthy();

  const ticketUrl = new URL(href!);
  expect(ticketUrl.hostname).toBe("www.entradaweb.com.ar");
  expect(ticketUrl.pathname).toBe("/evento/sabroso-test/step/1");
  expect(ticketUrl.searchParams.get("utm_source")).toBe("masalto");
  expect(ticketUrl.searchParams.get("utm_medium")).toBe("event_page");
  expect(ticketUrl.searchParams.get("utm_campaign")).toBe("sabroso_2026");
});

test("publishes Event structured data", async ({ page }) => {
  await page.goto(eventPath);

  const jsonLd = page.locator('script[type="application/ld+json"]');
  const event = JSON.parse((await jsonLd.textContent()) ?? "{}");

  expect(event["@type"]).toBe("Event");
  expect(event.startDate).toBe("2026-08-28T23:00:00-03:00");
  expect(event.location.name).toBe("Hugo Espectáculos");
  expect(event.offers.url).toContain("entradaweb.com.ar");
  expect(event.offers.price).toBe(15000);
  expect(event.offers.priceCurrency).toBe("ARS");
});

test("keeps optional analytics disabled until the visitor consents", async ({ page }) => {
  await page.route("**/googletagmanager.com/**", (route) => route.abort());
  await page.route("**/connect.facebook.net/**", (route) => route.abort());
  await page.goto(eventPath);

  await expect(page.locator("#meta-pixel")).toHaveCount(0);
  await expect(page.locator("#ga4")).toHaveCount(0);
  await expect(page.locator('script[src*="googletagmanager.com"]')).toHaveCount(0);
  await expect(page.getByLabel("Preferencias de privacidad")).toBeVisible();

  await page.getByRole("button", { name: "Aceptar medición" }).click();

  await expect(page.locator("#meta-pixel")).toHaveCount(1);
  await expect(page.locator("#ga4")).toHaveCount(1);
  await expect(page.locator('script[src*="googletagmanager.com"]')).toHaveCount(1);
});

test("publishes the approved privacy route without indexing it", async ({ page }) => {
  const response = await page.goto("/privacidad");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Privacidad/);
  await expect(page.getByRole("heading", { name: "Política de privacidad" })).toBeVisible();
  await expect(page.getByText("Política vigente desde el 19 de agosto de 2026")).toBeVisible();
  await expect(page.getByRole("link", { name: "info@masalto.com.ar" })).toHaveAttribute(
    "href",
    "mailto:info@masalto.com.ar",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
});
