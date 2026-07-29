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
      price: 15000,
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

Precio confirmado por Hugo el 29 de julio de 2026: primeras 500 anticipadas a ARS
15.000. El JSON-LD integrado publica `price: 15000` y `priceCurrency: "ARS"`.

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

## 6. Meta Pixel + GA4 compartido (embudo completo con EntradaWeb)

Hallazgo clave (ver docs/15): EntradaWeb dispara Meta Pixel y GA4 en su propio checkout,
con los eventos estandar de ecommerce (Meta: PageView, AddToCart, InitiateCheckout,
Purchase; GA4: page_view, add_to_cart, begin_checkout, purchase). Si usamos el MISMO
Pixel/GA4 de MasAlto en esta landing Y en la config del evento en EntradaWeb, obtenemos
atribucion de embudo completo: anuncio -> landing (PageView/ViewContent) -> checkout
EntradaWeb (Purchase) atribuido al anuncio pago.

Requisitos previos (no bloquean el codigo, si bloquean el encendido):
- Crear un Meta Pixel de MasAlto y una propiedad GA4 de MasAlto. Sus IDs van por env.
- Cargar esos MISMOS IDs en EntradaWeb: Herramientas de Marketing -> Herramientas de
  Seguimiento -> evento -> Meta Pixel / GA4. (Accion de Hugo en el panel, no de Codex.)
- No encender hasta aprobar politica de privacidad y retencion (ley 25.326) y cumplir
  terminos de Meta/Google. Consentimiento de cookies si aplica.

Env vars sugeridas:
```
NEXT_PUBLIC_ANALYTICS_ENABLED=false
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_GA4_MEASUREMENT_ID=   # formato G-XXXXXXXXXX
NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL=
```

Estado integrado por Codex: el snippet siguiente queda como antecedente. La
implementacion vigente en `components/analytics/` agrega tres controles obligatorios:
feature flag apagado, correo de privacidad valido y consentimiento explicito. Ver
`docs/17-privacy-and-consent.md`.

Carga condicional propuesta originalmente:

```tsx
// components/analytics.tsx  (server component que inyecta los scripts)
import Script from "next/script";

export function Analytics() {
  const pixel = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const ga4 = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  return (
    <>
      {pixel && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${pixel}');fbq('track','PageView');`}
        </Script>
      )}
      {ga4 && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config','${ga4}');`}
          </Script>
        </>
      )}
    </>
  );
}
```

Evento de intencion de compra en el CTA (alinea con InitiateCheckout / begin_checkout que
EntradaWeb completa como Purchase del otro lado):

```tsx
<a
  href={buildTicketUrl()}
  data-umami-event="click_comprar"
  onClick={() => {
    if (typeof window !== "undefined") {
      window.fbq?.("track", "InitiateCheckout");
      window.gtag?.("event", "begin_checkout");
    }
  }}
  rel="noopener"
>
  Comprar entradas
</a>
```

Nota: la landing solo emite hasta InitiateCheckout/begin_checkout. El Purchase lo emite
EntradaWeb en su checkout. Por eso el ID debe ser el mismo en ambos lados.

El mismo ID es necesario pero no suficiente para GA4: se debe configurar medicion entre
dominios para `eventos.masalto.com.ar` y EntradaWeb, verificar que el checkout preserve
el parametro de vinculacion y completar una compra de prueba. Si EntradaWeb no permite
esa configuracion, GA4 puede dividir la sesion aunque reciba el evento `purchase`.

## Decisiones abiertas que afectan este material

- Precio: primeras 500 anticipadas a ARS 15.000.
- Analitica oficial: Meta Pixel + GA4. Umami queda como candidato complementario.
  Pendiente crear/confirmar IDs, completar la politica y validar medicion entre dominios.
- Asset OG real integrado: `/events/sabroso-2026/social.jpg`.
- Cargar los MISMOS Pixel/GA4 en EntradaWeb (accion de Hugo).
