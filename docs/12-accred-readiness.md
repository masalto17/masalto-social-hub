# Accred - Readiness de integracion (evaluacion)

Fuente: revision read-only del repo masalto17/Accred, 29 de julio de 2026.
Autor: Claude (area Accred). Estado: evaluacion, no compromiso de implementacion.

## Estado verificado

- Stack: Next.js + TypeScript + Supabase, con RLS, storage y Sentry. Mismo stack que Social Hub.
- Madurez: baseline de ~20 tablas mas 42 migraciones. Cubre eventos, personas, ticketing,
  ordenes y pagos (MercadoPago), seating, POS, promociones, loyalty, consentimiento de
  marketing y outbox omnicanal. Es una aplicacion en produccion, no un prototipo.

## Superficie de integracion actual

Lo que HAY:
- Webhooks ENTRANTES de proveedores: mercadopago, meta-whatsapp, resend, twilio.
- API admin interna: exports (ventas, roster, reportes), prints/PDF de credenciales e
  invitaciones, sync de access-logs.
- Cron: expiracion de ordenes, recordatorios, procesamiento de outbox de mensajes.

Lo que NO HAY (necesario para los contratos de docs/04):
- API partner para Social Hub (autenticacion por API-key o similar).
- Endpoint de catalogo/lectura de eventos, precios, sectores y stock.
- Webhook SALIENTE hacia Social Hub para orden creada, check-in y resumen de cantina.
- Contrato versionado, firma de webhook saliente e idempotencia hacia un tercero.

Conclusion: los contratos de docs/04-integration-contracts.md son un diseño deseado,
NO reflejan lo que Accred expone hoy. Correcto mantener Accred fuera del camino critico
de Sabroso.

## Gap para integrar (post-Sabroso, area Claude)

Para que Social Hub mida el recorrido completo con Accred, faltan del lado Accred:

1. Auth partner (API-key o OAuth client-credentials) con scope de solo lectura + eventos.
2. GET de catalogo de evento: disponibilidad, precios, sectores, stock.
3. Webhook saliente firmado: order-created, check-in-created, canteen-summary.
4. Idempotency key en cada emision + reintentos + registro de entrega.
5. Mapa de identidad: exponer solo IDs opacos y hashes (email/phone), no PII cruda,
   alineado con docs/04 seccion Privacidad.

Estimacion: es trabajo del lado Accred, desacoplado de Social Hub. No bloquea Sabroso.

## Riesgo de duplicacion de datos

Accred ya posee persons, marketing_consent, loyalty y outbox. El Data Core de Social Hub
(docs/08) re-modela personas y consentimiento. Riesgo de dos fuentes de verdad de
identidad.

Recomendacion: a largo plazo, Accred es la fuente de verdad de persona/consentimiento
de compradores; Social Hub mantiene solo leads sociales y los concilia por ID opaco
cuando exista la API partner. Para Sabroso, duplicacion minima (solo leads sociales) es
aceptable.

## Pendiente de investigar

- entradaweb.com.ar: verificar si ofrece API o export de ventas para el import CSV
  (MSH-071) y la medicion de conversion de Sabroso.
