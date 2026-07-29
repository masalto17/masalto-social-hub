# Contratos de integracion futura

Este documento contiene propuestas para revision conjunta con Claude y Accred. No
implica que las APIs existan ni autoriza su implementacion.

## Estado verificado (2026-07-29)

Revision read-only del repo Accred (ver docs/12-accred-readiness.md). Clasificacion de
cada contrato de este documento segun lo que Accred expone HOY:

| Contrato | Estado en Accred | Nota |
|---|---|---|
| Social Hub -> masalto.com.ar (publicar/actualizar/archivar evento) | No aplica a Accred | Depende del despliegue Netlify, no de Accred. |
| Social Hub -> Accred: vincular / crear evento | NO existe | Accred no expone API partner de escritura. |
| Accred -> Social Hub: venta creada | NO existe | Accred no emite webhook saliente hacia terceros. |
| Accred -> Social Hub: check-in | NO existe | Idem. |
| Accred -> Social Hub: resumen de cantina | NO existe | Idem. |
| Social Hub -> n8n (eventos internos) | Fuera de Accred | Interno de Social Hub. |

Lo que Accred SI tiene hoy: webhooks entrantes de proveedores (mercadopago,
meta-whatsapp, resend, twilio), API admin interna (exports, prints, roster) y cron. No
hay auth partner ni webhooks salientes. Por lo tanto los contratos de las secciones
"Social Hub -> Accred" y "Accred -> Social Hub" de abajo son DISENO DESEADO, pendientes
de construccion del lado Accred. No usar para Sabroso.

## Principio

Social Hub, Accred y `masalto.com.ar` deben integrarse por contratos versionados.

No se deben compartir tablas internas ni depender de detalles privados de implementacion.

## Social Hub -> masalto.com.ar

### Publicar evento

```http
POST /api/social-hub/events
```

Payload inicial:

```json
{
  "event_id": "evt_123",
  "slug": "sabroso-san-juan-2026",
  "title": "Sabroso en San Juan",
  "starts_at": "2026-08-28T23:00:00-03:00",
  "venue": {
    "name": "Hugo Espectaculos",
    "city": "San Juan"
  },
  "status": "available",
  "visibility": "published",
  "hero_image_url": "https://...",
  "description": "Show completo de Sabroso.",
  "seo": {
    "title": "Sabroso en San Juan - 28 de agosto de 2026",
    "description": "Entradas para Sabroso en Hugo Espectaculos, San Juan."
  },
  "ticketing": {
    "provider": "accred",
    "url": "https://masalto.com.ar/eventos/sabroso-san-juan-2026"
  }
}
```

### Actualizar evento

```http
PATCH /api/social-hub/events/{event_id}
```

Debe actualizar solo campos enviados.

### Archivar evento

```http
POST /api/social-hub/events/{event_id}/archive
```

## Social Hub -> Accred

### Vincular evento existente

```http
POST /api/accred/events/link
```

```json
{
  "social_hub_event_id": "evt_123",
  "accred_event_id": "acc_evt_456",
  "modules": {
    "ticketing": true,
    "accreditation": true,
    "access_control": true,
    "canteen": true,
    "invitations": true
  }
}
```

### Crear evento en Accred

```http
POST /api/accred/events
```

```json
{
  "social_hub_event_id": "evt_123",
  "name": "Sabroso en San Juan",
  "starts_at": "2026-08-28T23:00:00-03:00",
  "venue_name": "Hugo Espectaculos",
  "modules": {
    "ticketing": true,
    "accreditation": true,
    "access_control": true,
    "canteen": false,
    "invitations": true
  }
}
```

## Accred -> Social Hub

### Venta creada

```http
POST /api/social-hub/webhooks/accred/ticket-order-created
```

```json
{
  "event_id": "evt_123",
  "accred_event_id": "acc_evt_456",
  "order_id": "ord_789",
  "person": {
    "external_person_id": "acc_person_001",
    "email_hash": "sha256:...",
    "phone_hash": "sha256:..."
  },
  "source": {
    "utm_campaign": "sabroso_2026",
    "utm_source": "instagram",
    "utm_medium": "paid_social"
  },
  "total_amount": 45000,
  "currency": "ARS",
  "items": [
    {
      "sector": "General",
      "quantity": 2,
      "unit_amount": 22500
    }
  ],
  "created_at": "2026-08-01T15:30:00-03:00"
}
```

### Check-in realizado

```http
POST /api/social-hub/webhooks/accred/check-in-created
```

```json
{
  "event_id": "evt_123",
  "accred_event_id": "acc_evt_456",
  "ticket_id": "tkt_001",
  "person_id": "acc_person_001",
  "checked_in_at": "2026-08-28T22:34:00-03:00",
  "gate": "Ingreso principal"
}
```

### Resumen de cantina

```http
POST /api/social-hub/webhooks/accred/canteen-summary
```

```json
{
  "event_id": "evt_123",
  "gross_revenue": 1200000,
  "currency": "ARS",
  "orders_count": 320,
  "average_order_value": 3750,
  "period_start": "2026-08-28T20:00:00-03:00",
  "period_end": "2026-08-29T04:00:00-03:00"
}
```

## Social Hub -> n8n

Eventos internos que pueden disparar flujos:

- Nuevo lead.
- Nuevo participante de sorteo.
- Publicacion aprobada.
- Venta recibida.
- Evento con baja conversion.
- Error de sincronizacion.
- Resumen diario.

## Versionado

Todo contrato debe incluir:

- Version.
- Idempotency key en escrituras.
- Firma de webhook.
- Timestamp.
- Id externo.
- Estado de procesamiento.

## Privacidad

Social Hub no necesita datos personales completos para todas las metricas.

Cuando solo se mide conversion, preferir:

- Hash de email.
- Hash de telefono.
- IDs externos opacos.
- Agregados por evento, campana o canal.
