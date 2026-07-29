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
  expect(ticketUrl.pathname).toBe("/hugo_de_bernardo");
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
});
