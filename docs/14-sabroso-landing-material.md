# Material para Codex - Landing Sabroso (drafts)

Fuente: Claude, 29 de julio de 2026. Estado: borrador para revision cruzada.
Codex es dueño de Social Hub e integra/ajusta esto. No modifico su repo; entrego snippets.

Convenciones reutilizadas de docs/11-sabroso-pilot.md:
- URL entradas: `process.env.NEXT_PUBLIC_SABROSO_TICKET_URL` (Entradaweb).
- UTM: `utm_source=masalto`, `utm_medium=event_page`, `utm_campaign=sabroso_2026`.
- Landing: `https://eventos.masalto.com.ar/sabroso-san-juan-2026`.

Datos del evento (docs/09):
- Nombre: Sabroso en San Juan
- Inicio: 2026-08-28T23:00:00-03:00
- Venue: Hugo Espectaculos, San Juan
- Estado venta: preventa

## 1. Helper de URL de entradas con UTM

```ts
// lib/ticket-url.ts
export function buildTicketUrl(): string {
  const base = process.env.NEXT_PUBLIC_SABROSO_TICKET_URL;
  if (!base) return "#"; // sin URL configurada, no romper la pagina
  const u = new URL(base);
  u.searchParams.set("utm_source", "masalto");
  u.searchParams.set("utm_medium", "event_page");
  u.searchParams.set("utm_campaign", "sabroso_2026");
  return u.toString();
}
```

## 2. SEO (Next.js App Router metadata)

```ts
// app/sabroso-san-juan-2026/page.tsx  (o donde defina Codex la ruta)
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sabroso en San Juan - 28 de agosto de 2026",
  description:
    "Sabroso en vivo en Hugo Espectaculos, San Juan. Entradas en preventa. Del lado correcto de la noche.",
  alternates: { canonical: "https://eventos.masalto.com.ar/sabroso-san-juan-2026" },
  openGraph: {
    title: "Sabroso en San Juan - 28 de agosto de 2026",
    description: "Entradas en preventa para Sabroso en Hugo Espectaculos, San Juan.",
    url: "https://eventos.masalto.com.ar/sabroso-san-juan-2026",
    type: "website",
    images: [{ url: "https://eventos.masalto.com.ar/events/sabroso-2026/social.jpg" }],
  },
};
```

## 3. JSON-LD Schema.org/Event

```tsx
// componente server, renderizado dentro de la pagina
import { buildTicketUrl } from "@/lib/ticket-url";

export function SabrosoJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Sabroso en San Juan",
    startDate: "2026-08-28T23:00:00-03:00",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    image: ["https://eventos.masalto.com.ar/events/sabroso-2026/social.jpg"],
    description: "Sabroso en vivo en San Juan. Del lado correcto de la noche.",
    location: {
      "@type": "Place",
      name: "Hugo Espectaculos",
      address: {
        "@type": "PostalAddress",
        addressLocality: "San Juan",
        addressCountry: "AR",
      },
    },
    offers: {
      "@type": "Offer",
      url: buildTicketUrl(),
      availability: "https://schema.org/InStock", // preventa
      priceCurrency: "ARS",
      // price: definir cuando haya valor confirmado de Entradaweb
      validFrom: "2026-07-29T00:00:00-03:00",
    },
    organizer: {
      "@type": "Organization",
      name: "MasAlto",
      url: "https://www.masalto.com.ar",
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

Nota: Google pide `price` para rich results de Event con oferta. Mientras no haya precio
confirmado, el JSON-LD es valido sin `price` pero no dispara el snippet de precio.
Agregar `price` cuando Entradaweb confirme valor.

## 4. Medicion (Umami, candidato - sujeto a decision)

CTA con evento nombrado. Umami usa `data-umami-event`:

```tsx
<a
  href={buildTicketUrl()}
  data-umami-event="click_comprar"
  rel="noopener"
>
  Comprar entradas
</a>
```

Evento de vista de pagina `ver_evento`: si Umami ya trackea pageviews, no duplicar.
Solo agregar eventos custom para acciones (click_comprar). No cargar el script de Umami
hasta que la decision de analitica este aprobada (docs/06).

## 5. Smoke test (Playwright) para CI

```ts
// e2e/sabroso-landing.spec.ts
import { test, expect } from "@playwright/test";

const PATH = "/sabroso-san-juan-2026";

test("landing responde y renderiza", async ({ page }) => {
  const res = await page.goto(PATH);
  expect(res?.status()).toBe(200);
});

test("title correcto", async ({ page }) => {
  await page.goto(PATH);
  await expect(page).toHaveTitle(/Sabroso en San Juan/);
});

test("CTA de compra presente y con UTM a Entradaweb", async ({ page }) => {
  await page.goto(PATH);
  const cta = page.getByRole("link", { name: /comprar entradas/i });
  await expect(cta).toBeVisible();
  const href = await cta.getAttribute("href");
  expect(href).toContain("entradaweb.com.ar");
  expect(href).toContain("utm_campaign=sabroso_2026");
});

test("JSON-LD Event presente", async ({ page }) => {
  await page.goto(PATH);
  const ld = await page.locator('script[type="application/ld+json"]').first().textContent();
  expect(ld).toContain('"@type":"Event"');
  expect(ld).toContain("Sabroso en San Juan");
});
```

El tercer test asume que la URL configurada apunta a entradaweb.com.ar. En preview/CI sin
env, `buildTicketUrl` devuelve `#`; setear `NEXT_PUBLIC_SABROSO_TICKET_URL` en el entorno
de test con una URL de entradaweb de ejemplo para que el assert de UTM sea valido.

## Decisiones abiertas que afectan este material

- Precio de la oferta (Entradaweb): pendiente.
- Analitica (Umami u otra): pendiente (docs/06). No cargar script hasta aprobar.
- Asset OG real `og/sabroso.jpg`: pendiente de diseño.
