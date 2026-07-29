import { expect, test } from "@playwright/test";

test("separates the public catalog from the internal workspace", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Próximos eventos/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Próximos eventos" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sabroso en San Juan" })).toBeVisible();

  await page.getByRole("link", { name: "Panel" }).click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Panel de campañas y eventos" }),
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
});

test("creates an independent event without publishing it", async ({ page }) => {
  await page.goto("/app/eventos/nuevo");

  await page.getByLabel("Nombre público").fill("Festival Demo San Juan");
  await page.getByLabel("Fecha y hora").fill("2026-09-12T21:30");
  await page.getByLabel("Capacidad").fill("1200");
  await page.getByLabel("Lugar").fill("Predio Demo");
  await page.getByLabel("Ciudad").fill("San Juan");
  await page.getByLabel("Entradas").selectOption("none");
  await page.getByRole("button", { name: "Guardar borrador" }).click();

  await expect(page).toHaveURL(/\/app\/eventos$/);
  const event = page.getByRole("article").filter({ hasText: "Festival Demo San Juan" });
  await expect(event).toBeVisible();
  await expect(event).toContainText("Borrador local");

  await page.reload();
  await expect(
    page.getByRole("article").filter({ hasText: "Festival Demo San Juan" }),
  ).toBeVisible();
});

test("creates a campaign linked to the Sabroso event", async ({ page }) => {
  await page.goto("/app/campanas/nueva");

  await page.getByLabel("Nombre").fill("Campaña de conversión");
  await page.getByLabel("Evento asociado").selectOption("event_sabroso_2026");
  await page.getByLabel("Estado inicial").selectOption("planned");
  await page.getByLabel("Objetivo").fill("Vender entradas anticipadas");
  await page
    .getByLabel("Público")
    .fill("Personas de 25 a 55 años interesadas en cuarteto.");
  await page.getByLabel("Concepto creativo").fill("La noche se vive completa");
  await page.getByLabel("Inicio").fill("2026-08-01T09:00");
  await page.getByLabel("Cierre").fill("2026-08-28T23:00");
  await page.getByLabel("Presupuesto estimado (ARS)").fill("500000");
  await page.getByRole("button", { name: "Guardar campaña" }).click();

  await expect(page).toHaveURL(/\/app\/campanas$/);
  const campaign = page
    .getByRole("article")
    .filter({ hasText: "Campaña de conversión" });
  await expect(campaign).toContainText("Sabroso en San Juan");
  await expect(campaign).toContainText("Planificada");
});

test("rejects a campaign whose closing date is before its start", async ({
  page,
}) => {
  await page.goto("/app/campanas/nueva");

  await page.getByLabel("Nombre").fill("Campaña inválida");
  await page.getByLabel("Objetivo").fill("Validar fechas");
  await page.getByLabel("Público").fill("Audiencia de prueba");
  await page.getByLabel("Concepto creativo").fill("Control temporal");
  await page.getByLabel("Inicio").fill("2026-08-20T09:00");
  await page.getByLabel("Cierre").fill("2026-08-19T09:00");
  await page.getByRole("button", { name: "Guardar campaña" }).click();

  await expect(
    page.getByText("El cierre debe ser posterior al inicio de la campaña.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/app\/campanas\/nueva$/);
});

test("requires approval before preparing content for publication", async ({ page }) => {
  await page.goto("/app/contenido");

  const reel = page.getByRole("article").filter({ hasText: "Reel de clásicos" });
  await expect(
    reel.getByRole("button", { name: /Preparar publicación/ }),
  ).toHaveCount(0);

  await reel.getByRole("button", { name: /Aprobar Reel de clásicos/ }).click();
  await expect(reel).toContainText("Aprobado");

  await reel.getByRole("button", { name: /Preparar publicación/ }).click();
  await expect(reel).toContainText("Programado");
});

test("reschedules a publishing task and records the new date", async ({ page }) => {
  await page.goto("/app/calendario");

  const task = page.locator('[data-task-id="task_sabroso_instagram"]');
  const before = await task.getByRole("time").getAttribute("datetime");
  await task.getByRole("button", { name: /Mover Anuncio oficial un día/ }).click();
  const after = await task.getByRole("time").getAttribute("datetime");

  expect(before).toBeTruthy();
  expect(after).toBeTruthy();
  expect(new Date(after!).getTime() - new Date(before!).getTime()).toBe(86_400_000);

  await page.goto("/app");
  await expect(page.getByText(/Publicación reprogramada/)).toBeVisible();
});
