# Carril piloto Sabroso

## Objetivo

Publicar una landing confiable para Sabroso el 28 de agosto de 2026 sin depender de
Accred, backend, datos personales ni publicacion automatica multired.

## URL prevista

`https://eventos.masalto.com.ar/sabroso-san-juan-2026`

## Venta

- Proveedor: Entradaweb.
- URL provisional: `https://www.entradaweb.com.ar/hugo_de_bernardo`.
- La URL exacta del evento se configura con `NEXT_PUBLIC_SABROSO_TICKET_URL`.
- Social Hub agrega `utm_source=masalto`, `utm_medium=event_page` y
  `utm_campaign=sabroso_2026`.
- El piloto no procesa pagos ni copia compradores.

## Entregable inicial

- Landing estatica responsive.
- SEO y `Schema.org/Event`.
- CTA verificable hacia Entradaweb.
- Sin formularios ni PII.
- Smoke Playwright en desktop y movil.
- Publicacion manual asistida como respaldo.

## Material visual

- Logo oficial: `public/brand/masalto-producciones.trimmed.png`.
- Flyer oficial: `public/events/sabroso-2026/flyer.webp`.
- Hero web derivado del flyer: `public/events/sabroso-2026/hero.webp`.
- Imagen social derivada del flyer: `public/events/sabroso-2026/social.jpg`.

Los originales permanecen fuera del repositorio y no se modifican.

## Multiples eventos

Los eventos comparten la misma plataforma publica, no una unica ficha:

- `eventos.masalto.com.ar/`: catalogo de eventos publicados.
- `eventos.masalto.com.ar/{slug}`: pagina individual, SEO, metricas y venta por evento.
- Social Hub: panel interno para administrar el catalogo y cada ficha.

La landing de Sabroso es la primera plantilla individual. El catalogo se implementa
cuando exista un segundo evento confirmado.

## Fuera del camino critico

- Accred real.
- Bety.
- Supabase.
- Leads y sorteos.
- Postiz, Metricool o APIs sociales directas.
- Umami u otro proveedor de analitica.

## DNS y despliegue

- Hosting previsto: Vercel.
- DNS: Netlify DNS para `masalto.com.ar`.
- Solo se agrega el CNAME `eventos` con el target exacto entregado por Vercel.
- No se modifican apex, `www`, MX, SPF, verificaciones de correo ni NIC Argentina.

## Puertas pendientes

1. URL directa del evento en Entradaweb; mientras tanto se usa el perfil del productor.
2. Revision visual Hugo/Ivo.
3. Aprobacion para crear GitHub y desplegar Vercel.
4. Target DNS exacto mostrado por Vercel.
