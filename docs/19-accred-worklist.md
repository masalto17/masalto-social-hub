# Accred - worklist para sesion dedicada (Claude Code en repo Accred)

Fuente: analisis de esta sesion (repo MASH), 29 de julio de 2026. Autor: Claude.
Destino: una sesion de Claude Code abierta DENTRO del repo Accred, trabajando en paralelo.
Estado: propuesta; Hugo aprueba prioridades, merges y deploys.

Referencias en el repo MASH (docs/): 04 (contratos), 08 (modelo datos), 12 (readiness),
13 (conector), 15 (entradaweb features), 18 (ecosistema). La sesion de Accred no las tiene;
por eso el prompt de arranque (abajo) es autocontenido.

## Guardrails (obligatorios)

- Rama `claude/<tarea>`, PR siempre, sin push directo a `main`, sin deploy. Hugo aprueba
  merge y deploy.
- Accred es PRODUCCION con pagos reales. Leer antes de escribir. No romper lo que funciona.
- Fase 1 es auditoria read-only: no tocar produccion ni datos.
- No modificar el flujo de pago sin tests que lo cubran.
- Revision cruzada con la sesion de MASH (Codex). Esta sesion solo toca el repo Accred.

## Fase 1 - Seguridad / due diligence (NECESARIO antes de escalar dinero real)

1. Auditar cobertura de RLS tabla por tabla. Entregable: matriz tabla -> RLS on/off ->
   politicas -> gaps. Foco en PII (persons, orders, payments) y aislamiento multi-tenant.
2. Clave de cifrado de credenciales de pago (multi-cuenta): confirmar que la master key NO
   esta en el repo, vive en secreto gestionado, y definir rotacion.
3. Secretos en el repo: revisar historia de git y que .gitignore cubra .env*.
4. Prueba de transaccion real end-to-end (sandbox o produccion controlada): compra ->
   firma webhook -> re-consulta a MP -> orden paid -> emision -> control de acceso.
   Documentar el resultado.
5. Webhooks entrantes: confirmar verificacion de firma en TODOS (mercadopago ya la tiene;
   revisar meta-whatsapp, resend, twilio) y rate limits en endpoints publicos.

## Fase 2 - Capa partner para el ecosistema (post-Sabroso, detras de feature flag)

6. Webhook SALIENTE firmado hacia MASH: event.published, event.updated, order.paid,
   checkin.created, canteen.summary. HMAC + idempotency key + versionado + reintentos +
   registro de entrega.
7. API partner de lectura: catalogo de evento (precios, sectores, stock, branding, fecha,
   venue). Auth por API-key u OAuth client-credentials, scope de solo lectura.
8. (Opcional) Exponer la accion de compra como API partner para checkout headless desde la
   landing de MASH.
9. Contratos versionados; alinear payloads con docs/04 del repo MASH.

## Fase 3 - Simplificar creacion de evento (mejora, opcional)

10. Modo "Express": alta de evento vendible en una sola pantalla.
11. Duplicar evento / plantillas.
12. QR interoperable en el POS + emision inmediata.
13. Config de pixel/GA4 y link de vendedor dentro del wizard de alta.
14. Defaults sanos y estados claros (nace en borrador/preventa, un clic a "En venta").

## Orden recomendado

Fase 1 primero (auditoria, no bloquea nada y protege el dinero). Fase 2 cuando se decida
activar el ecosistema Accred<->MASH. Fase 3 cuando haya aire.
