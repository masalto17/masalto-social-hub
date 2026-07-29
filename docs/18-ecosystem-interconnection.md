# Ecosistema MASH <-> Accred <-> masalto.com.ar - diseno

Fuente: revision read-only del repo Accred, 29 de julio de 2026. Autor: Claude.
Estado: propuesta para revision conjunta (Codex/Accred) y aprobacion de Hugo.

## Estado real de Accred (verificado en codigo)

Accred NO es un plan: es una plataforma de ticketing completa y funcional.

- Pagos: integracion MercadoPago por REST, multi-cuenta, con credenciales cifradas por
  cuenta (src/lib/mercadopago.ts, services/payment-accounts.ts).
- Checkout publico: src/app/e/[eventId] (page + buy-form + actions). Selecciona butacas
  por sector/precio, toma datos del comprador, emite la orden.
- Emision y acceso: entrada/[token], invitacion/[qrToken], cortesias/[token],
  transferencia/[token], control/scan (QR), portal del comprador.
- Branding por evento: v1.3.0_event_branding (banner propio por evento).
- Atribucion en checkout: parametros ref / promoter / rrpp normalizados; referrer
  sanitizado; hash de IP como evidencia.
- Consentimiento de marketing en la compra (whatsapp/sms explicito) + version de terminos:
  alineado a ley 25.326.
- Reportes, loyalty, comisiones de vendedores, POS/kiosk, encuestas post-evento.

## 1. Salir a la venta con Accred + pagos hoy

Tecnicamente SI. Accred tiene pagina publica de evento, checkout, MercadoPago, emision de
entradas y control de acceso. Para Sabroso NO se uso por decision (entradaweb) y tiempo,
no por falta de capacidad.

Antes de vender dinero real con Accred, due diligence (no bloqueante hoy, si antes de ir
live con un evento nuevo):
- Confirmar que hay una cuenta MercadoPago productiva conectada y credenciales cargadas.
- Prueba de transaccion real end-to-end (compra -> pago -> emision -> acceso).
- Revisar cobertura de RLS en TODAS las tablas y la gestion de la clave de cifrado de
  credenciales (fuera del repo, con rotacion).

## 2. Seguridad (evaluacion)

Notablemente por encima del promedio en el camino de pago:
- Webhook MP con firma HMAC obligatoria (timingSafeEqual). Invalida -> 401.
- NUNCA acredita por el payload del webhook ni por el redirect del navegador: re-consulta
  el pago a la API de MP (fuente de verdad).
- Idempotencia por indice unico payments.mp_payment_id. Manejo de contracargos.
- Auth por middleware (Supabase), role-guard + guard de escalacion de rol, RLS
  (rls_v1.1/1.2 + tenant_isolation_fixes), rate limits publicos, Sentry.
- No almacena datos de tarjeta (MercadoPago los maneja) -> menor alcance PCI.

Pendientes recomendados: auditoria de cobertura RLS tabla por tabla, manejo/rotacion de la
clave de cifrado, y una revision de seguridad focalizada antes de escalar volumen.

## 3. Interconexion para un ecosistema funcional

Roles del ecosistema:
- Accred = motor de comercio. Fuente de verdad de venta, entradas, acceso e identidad del
  comprador.
- MASH = demanda y marketing: landing de evento, medicion (pixel/GA4/UTM), leads,
  calendario y aprobaciones.
- masalto.com.ar = shell de marca (home). Eslabon debil: Netlify sin repo. Las landings de
  evento se sirven desde MASH bajo eventos.masalto.com.ar; a futuro se puede unificar el
  home dentro de MASH/Next.

Dos modelos de venta con marca MasAlto:

MODELO A - pagina de Accred con marca, bajo dominio MasAlto (rapido, casi listo)
- Accred ya renderiza /e/[eventId] con branding por evento.
- Mapear un subdominio (ej. entradas.masalto.com.ar) hacia Accred.
- "Crear el evento en Accred ya genera su pagina publica": es intrinseco. Solo falta el
  mapeo de dominio + branding cargado.
- Contra: URL, SEO y estructura son de Accred, no una landing de marketing rica.

MODELO B - MASH renderiza la landing (headless; mejor SEO/marketing/medicion)
- Accred emite webhook event.published -> MASH.
- MASH genera la landing en eventos.masalto.com.ar/<slug>: hero, copy, SEO, Schema.org,
  pixel/GA4, contenido de campana.
- La landing lee catalogo (precios/sectores/stock) desde la API de Accred y: (i) enlaza al
  checkout de Accred (deep-link a /e/[eventId] branded), o (ii) checkout headless in-page
  cuando Accred exponga buyTicketsAction como API partner.

## 4. Crear evento en Accred -> landing propia en MasAlto (flujo objetivo, Modelo B)

```text
1. Se publica el evento en Accred (estado published).
2. Accred emite webhook firmado event.published a MASH, con payload publico:
   slug, titulo, fecha, venue, hero, resumen de precios/sectores, checkout_url.
3. MASH valida firma + idempotencia, hace upsert en core.events y genera la landing en
   eventos.masalto.com.ar/<slug> (SEO + Schema.org/Event + pixel/GA4 + copy de campana).
4. CTA de compra -> checkout de Accred (in-page si hay API headless; si no, deep-link a la
   pagina /e/[eventId] con marca).
5. event.updated -> webhook de invalidacion de cache (revalidate del slug).
```

Requisitos del lado Accred (area Claude, gap de docs/12/13):
- Webhook SALIENTE firmado: event.published, event.updated (+ order.paid, checkin, canteen
  para el dashboard).
- API partner de lectura del catalogo (precios/sectores/stock).
- Exponer la accion de compra como API para checkout headless (opcional, Modelo B-ii).
La logica ya existe (buy-form/actions, event-branding, ticketing); falta la capa partner.

Requisitos del lado MASH (area Codex):
- Endpoint receptor de webhooks (firma + idempotencia).
- Renderer de landing por slug con revalidate.
- Modo de checkout por evento (deep-link Accred / headless / externo como entradaweb).

## Recomendacion de fasing

- Corto plazo: Modelo A. entradas.masalto.com.ar -> Accred con branding. Da venta con marca
  ya, sin construir nada nuevo salvo el mapeo de dominio.
- Mediano: Modelo B. Construir el webhook saliente + API partner en Accred (Claude) y el
  renderer de landing en MASH (Codex). Esto logra "evento en Accred = landing en MasAlto"
  automatica, con SEO y medicion propias.
- masalto.com.ar: no tocar hasta ubicar el proyecto Netlify; luego decidir unificacion del
  home dentro de MASH.
