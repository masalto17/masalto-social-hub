# MasAlto Social Hub

MasAlto Social Hub es el panel central para planificar, producir, aprobar, publicar y medir campanas sociales de eventos y marcas del ecosistema MasAlto.

El producto debe funcionar de forma independiente, pero puede vincularse por evento con Accred cuando el evento use ticketera, acreditaciones, accesos, invitaciones o cantina dentro del ecosistema.

## Fuente funcional vigente

La fuente principal del proyecto es el documento:

`MasAlto Social Hub - Documento Funcional Maestro del MVP`, version 1.0, fecha 29 de julio de 2026.

Estado del documento: auditado y recortado para el piloto Sabroso. Las integraciones
futuras requieren decisiones separadas.

## Objetivo del MVP

Crear una PWA operativa para:

- Gestionar campanas por evento o marca.
- Crear y adaptar contenido para redes sociales.
- Programar publicaciones multicanal.
- Automatizar respuestas, leads y sorteos.
- Publicar eventos en `masalto.com.ar`.
- Integrarse opcionalmente con Accred por evento.
- Medir campana, ventas, asistencia y consumos cuando existan datos integrados.

## Principios

- Social Hub no depende de que Accred este funcionando.
- Accred no queda acoplado a la logica interna de Social Hub.
- Cada evento define si esta o no vinculado al ecosistema.
- `masalto.com.ar` debe ser la pagina publica principal cuando un evento se publique oficialmente.
- Para eventos con Accred, la venta debe sentirse como parte de la misma pagina publica de MasAlto.
- Los datos compartidos se mueven por APIs, webhooks y contratos versionados.

## Documentos

- [Producto y alcance](docs/01-product-brief.md)
- [Documento funcional MVP](docs/02-functional-mvp.md)
- [Arquitectura](docs/03-architecture.md)
- [Contratos de integracion](docs/04-integration-contracts.md)
- [Backlog inicial](docs/05-backlog.md)
- [Decisiones registradas](docs/06-decisions.md)
- [Backlog tecnico](docs/07-technical-backlog.md)
- [Modelo de datos MVP](docs/08-data-model.md)
- [Plan del prototipo](docs/09-prototype-plan.md)
- [Coordinacion de agentes](docs/10-agent-coordination.md)
- [Carril piloto Sabroso](docs/11-sabroso-pilot.md)
- [Accred - readiness de integracion](docs/12-accred-readiness.md)
- [Conector Accred - diseno](docs/13-accred-connector.md)
- [Material landing Sabroso (para Codex)](docs/14-sabroso-landing-material.md)
- [EntradaWeb - funciones del panel de productor](docs/15-entradaweb-features.md)
- [Import de compradores web - especificacion](docs/16-buyers-import-spec.md)
- [Privacidad y consentimiento](docs/17-privacy-and-consent.md)
- [Ecosistema MASH <-> Accred <-> masalto.com.ar](docs/18-ecosystem-interconnection.md)
- [Accred - worklist para sesion dedicada](docs/19-accred-worklist.md)
- [Base segura de Supabase](docs/20-supabase-foundation.md)
- [Base de autenticacion](docs/21-auth-foundation.md)
- [Importacion agregada de EntradaWeb](docs/22-entradaweb-import.md)

El backlog contempla una futura biblioteca de marcas, plantillas recurrentes y skills
de validacion visual. Estas funciones no forman parte del carril critico de Sabroso.

## Estado

Prototipo navegable con catálogo público, eventos, campañas, contenido, aprobación y
calendario con persistencia local. La base Supabase y sus políticas RLS están
preparadas en una rama separada, pero todavía no fueron aplicadas a un proyecto remoto.

El primer entregable es la landing estatica de Sabroso. Meta Pixel y GA4 estan
preparados pero apagados; Supabase, proveedor de publicacion y cuentas reales se
conectan solo despues de sus puertas de aprobacion.
