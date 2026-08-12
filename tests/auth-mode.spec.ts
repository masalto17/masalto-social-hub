import { expect, test } from "@playwright/test";
import { getAuthMode } from "@/lib/supabase/auth-mode";
import {
  createOwnerSession,
  hasMatchingOwnerAccessSecret,
  hasValidOwnerSession,
} from "@/lib/owner-session";

test("blocks every incomplete authentication environment by default", () => {
  expect(getAuthMode({})).toBe("blocked");
  expect(getAuthMode({ NODE_ENV: "production" })).toBe("blocked");
  expect(
    getAuthMode({ NODE_ENV: "production", ALLOW_PROTOTYPE_AUTH: "true" }),
  ).toBe("blocked");
});

test("allows prototype access only when local development opts in explicitly", () => {
  expect(
    getAuthMode({ NODE_ENV: "development", ALLOW_PROTOTYPE_AUTH: "true" }),
  ).toBe("prototype");
});

test("requires both public Supabase values", () => {
  expect(
    getAuthMode({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    }),
  ).toBe("blocked");

  expect(
    getAuthMode({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
    }),
  ).toBe("configured");
});

test("uses the one-owner mode only as a fallback before Supabase is configured", () => {
  expect(getAuthMode({ OWNER_ACCESS_SECRET: "private-owner-secret" })).toBe("owner");
  expect(
    getAuthMode({
      OWNER_ACCESS_SECRET: "private-owner-secret",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
    }),
  ).toBe("configured");
});

test("creates an expiring signed session only for the configured owner secret", async () => {
  const secret = "private-owner-secret";
  const now = Date.UTC(2026, 6, 30, 12, 0, 0);
  const session = await createOwnerSession(secret, now);

  expect(hasMatchingOwnerAccessSecret(secret, secret)).toBe(true);
  expect(hasMatchingOwnerAccessSecret("wrong", secret)).toBe(false);
  await expect(hasValidOwnerSession(session, secret, now)).resolves.toBe(true);
  await expect(hasValidOwnerSession(session, "wrong-secret", now)).resolves.toBe(false);
  await expect(hasValidOwnerSession(session, secret, now + 8 * 60 * 60 * 1000)).resolves.toBe(
    false,
  );
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
