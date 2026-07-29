# Conector Accred - diseno (apagado por defecto)

Fuente: area Accred (Claude), 29 de julio de 2026. Estado: diseño, no implementacion.
No se activa para Sabroso. Requiere API partner de Accred (ver docs/12) y aprobacion
de Hugo antes de encenderse.

## Objetivo

Dejar especificado un conector desacoplado para que, cuando Accred exponga API partner,
Social Hub pueda leer eventos y recibir ventas/check-ins/cantina sin acoplarse a las
tablas internas de Accred, y sin que una falla de Accred bloquee campanas ni contenido.

## Principios

- Apagado por defecto. Feature flag por evento: `accred_enabled = false`.
- Si el flag esta apagado, Social Hub ignora todo lo de Accred y funciona normal.
- Nunca escribe tablas internas de Accred. Solo consume su API partner.
- Toda escritura entrante se procesa por cola con idempotencia (tabla `sync_jobs`, docs/08).
- Ningun dato de pago se almacena en Social Hub. Solo IDs opacos, hashes y agregados.

## Interface (borrador)

```ts
// integrations/accred/connector.ts  (a implementar cuando exista API partner)
export interface AccredConnector {
  // Lectura
  getEventCatalog(accredEventId: string): Promise<EventCatalog>; // precios, sectores, stock

  // Vinculacion (escritura hacia Accred, requiere auth partner)
  linkEvent(input: LinkEventInput): Promise<LinkResult>;

  // Verificacion de webhooks entrantes
  verifySignature(rawBody: string, signature: string): boolean;
}

export interface AccredWebhookHandler {
  onOrderCreated(payload: OrderCreated): Promise<void>;   // enfila en sync_jobs
  onCheckInCreated(payload: CheckInCreated): Promise<void>;
  onCanteenSummary(payload: CanteenSummary): Promise<void>;
}
```

## Flujo de webhook entrante (cuando se active)

```text
Accred -> POST /api/social-hub/webhooks/accred/<evento>
  1. verifySignature(rawBody, header)  -> si falla, 401 y se descarta.
  2. Validar idempotency_key.           -> si ya existe en sync_jobs, 200 y no reprocesa.
  3. Insertar en sync_jobs (status=pending).
  4. Responder 200 rapido.
  5. Worker procesa la cola con reintentos y backoff.
```

## Estados de resiliencia (ya en docs/03)

- Falla Accred: se mantienen publicaciones, campanas y captura de leads. Se registran
  intentos de sincronizacion. Se alerta al operador. Se reintenta al volver la conexion.

## Requisitos del lado Accred antes de encender (gap, docs/12)

1. Auth partner (API-key u OAuth client-credentials), scope de lectura + eventos.
2. GET de catalogo de evento (precios, sectores, stock).
3. Webhooks salientes firmados con idempotency: order-created, check-in-created,
   canteen-summary.
4. Solo IDs opacos y hashes de email/telefono, sin PII cruda.

## No hacer

- No implementar este conector para Sabroso.
- No abrir endpoints de webhook en produccion sin firma verificada.
- No activar `accred_enabled` sin API partner confirmada y contrato aprobado.
