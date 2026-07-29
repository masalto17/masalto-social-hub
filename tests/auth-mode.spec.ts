import { expect, test } from "@playwright/test";
import { getAuthMode } from "@/lib/supabase/auth-mode";

test("allows prototype mode only outside production", () => {
  expect(getAuthMode({ VERCEL_ENV: "preview" })).toBe("prototype");
  expect(getAuthMode({})).toBe("prototype");
});

test("blocks production when Supabase is missing", () => {
  expect(getAuthMode({ VERCEL_ENV: "production" })).toBe("blocked");
});

test("requires both public Supabase values", () => {
  expect(
    getAuthMode({
      VERCEL_ENV: "production",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    }),
  ).toBe("blocked");

  expect(
    getAuthMode({
      VERCEL_ENV: "production",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
    }),
  ).toBe("configured");
});

test("shows a closed login screen before Supabase is configured", async ({
  page,
}) => {
  await page.goto("/login");

  await expect(
    page.getByRole("heading", { name: "Acceso privado" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "La autenticación todavía no está configurada en este ambiente.",
    ),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Ingresar" })).toHaveCount(0);
});

test("does not expose a logout operation in prototype mode", async ({
  request,
}) => {
  const response = await request.post("/logout", { maxRedirects: 0 });

  expect(response.status()).toBe(303);
  expect(new URL(response.headers().location).pathname).toBe("/");
});
