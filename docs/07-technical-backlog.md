# Backlog tecnico

Fuente: Documento Funcional Maestro del MVP, version 1.0, 29 de julio de 2026.

## Epica E1 - Fundacion de aplicacion

### MSH-001 - Scaffold PWA

Como administrador tecnico quiero una base Next.js PWA para iniciar el desarrollo con una estructura mantenible.

Criterios:

- Existe una aplicacion Next.js con TypeScript.
- Existe layout responsive con navegacion principal.
- Existe pantalla inicial de dashboard.
- `npm run build` completa sin errores.

Prioridad: P0

### MSH-002 - Autenticacion y roles

Como administrador quiero controlar acceso por usuario y rol.

Criterios:

- Login habilitado.
- Roles base: administrador, director, marketing, diseno, community manager, prensa, operador y analista.
- Las acciones criticas registran usuario, fecha y entidad afectada.
- Los usuarios externos solo ven eventos autorizados.

Prioridad: P0

### MSH-003 - Auditoria base

Como director quiero trazabilidad de acciones relevantes.

Criterios:

- Cambios de evento, campana, contenido, automatizacion y publicacion generan registros.
- Cada registro incluye actor, accion, timestamp, entidad y payload resumido.
- La UI muestra historial minimo por evento.

Prioridad: P0

## Epica E2 - Eventos

### MSH-010 - Crear evento independiente

Como usuario de marketing quiero crear un evento que no use Accred.

Criterios:

- El evento permite modo `independent`.
- No requiere `accred_event_id`.
- Permite ticketera externa, venta fisica, evento gratuito o sin entradas.
- Puede publicarse o no en `masalto.com.ar`.

Prioridad: P0
Relacion CA: CA-01

### MSH-011 - Crear evento vinculado con Accred

Como administrador quiero crear un evento con vinculacion opcional a Accred.

Criterios:

- El evento permite modo `accred`.
- Se pueden activar modulos: ticketera, acreditaciones, accesos, invitaciones y cantina.
- Puede quedar en estado `configured` sin conexion real.
- La falta de Accred no bloquea campanas ni contenido.

Prioridad: P0
Relacion CA: CA-02

### MSH-012 - Estados de venta y visibilidad

Como marketing quiero controlar como se comunica el evento.

Criterios:

- Estados publicos: proximamente, preventa, disponible, ultimas, agotado, reprogramado, cancelado y finalizado.
- Modos web: publico, programado, borrador, privado y no publicar.
- El dashboard distingue estado operativo y estado publico.

Prioridad: P0

## Epica E3 - Campanas

### MSH-020 - CRUD de campanas

Como marketing quiero crear campanas vinculadas a eventos o marcas.

Criterios:

- Campos: objetivo, publico, concepto, presupuesto, fases, fechas y responsables.
- Estados: borrador, planificada, activa, pausada, finalizada y archivada.
- Una campana puede pertenecer a un evento.
- Un evento puede tener varias campanas.

Prioridad: P0

### MSH-021 - Fases de campana

Como director quiero ver el plan por etapas.

Criterios:

- Permite definir fases como intriga, anuncio, deseo, conversion y urgencia.
- Cada fase tiene fechas, canales, piezas y objetivo.
- El dashboard alerta si una fase activa no tiene contenido suficiente.

Prioridad: P1

## Epica E4 - Contenido y calendario

### MSH-030 - Pieza maestra y variantes

Como disenador o marketing quiero crear una pieza maestra y adaptarla por red.

Criterios:

- Se registran assets, copy base y formato.
- Se crean variantes por Instagram, Facebook, TikTok, YouTube, WhatsApp, LinkedIn y web.
- Cada variante conserva estado y responsable.
- La IA solo propone; el usuario aprueba.

Prioridad: P0
Relacion CA: CA-05

### MSH-031 - Flujo de aprobacion

Como director quiero aprobar publicaciones antes de que salgan.

Criterios:

- Estados: borrador, en revision, aprobado, programado, publicado, fallido y archivado.
- Publicar requiere estado aprobado.
- Se registra aprobador y fecha.

Prioridad: P0
Relacion CA: CA-06

### MSH-032 - Calendario editorial

Como community manager quiero visualizar y mover publicaciones.

Criterios:

- Vista semanal.
- Vista mensual.
- Filtro por campana, canal y estado.
- Cambio de fecha conserva historial.

Prioridad: P0

### MSH-033 - Biblioteca de marcas

Como diseñador o marketing quiero administrar identidades visuales reutilizables.

Criterios:

- Registra logo principal, negativo, monocromatico y variantes autorizadas.
- Registra paleta, tipografias, area de respeto, tamaños minimos y usos incorrectos.
- Conserva version, responsable y archivos maestros de cada marca.
- Diferencia MasAlto, MasAlto Producciones, venues, artistas y marcas de terceros.
- Una actualizacion de marca no modifica piezas ya publicadas sin aprobacion.

Prioridad: P1

### MSH-034 - Plantillas recurrentes

Como diseñador quiero reutilizar composiciones aprobadas para eventos y espacios frecuentes.

Criterios:

- Plantillas por venue, marca, formato y canal.
- Zonas editables para artista, fecha, hora, precio, CTA, logos y legales.
- Variantes para feed, historia, reel, pantalla, via publica, prensa y web.
- Previsualizacion antes de generar archivos.
- Exportacion conserva version y trazabilidad de la plantilla.

Prioridad: P1

### MSH-035 - Skill de identidad visual

Como director quiero que la IA proponga piezas respetando reglas de marca verificables.

Criterios:

- La skill lee una guia estructurada y versionada, no interpreta solo una imagen.
- Valida logo, colores, contraste, area de respeto, tipografia y formato de salida.
- Informa incumplimientos antes de aprobar o exportar.
- La IA propone; Hugo, Ivo o un aprobador autorizado decide.
- La skill no altera archivos maestros ni publica automaticamente.

Prioridad: P1

## Epica E5 - Publicacion multired

### MSH-040 - Adaptador de publicacion

Como sistema quiero publicar mediante una capa reemplazable.

Criterios:

- Existe una interfaz `PublishingProvider`.
- Primera implementacion puede ser mock/manual.
- Se conserva proveedor, request, respuesta y error.
- Permite reintentar publicaciones fallidas.

Prioridad: P0

### MSH-041 - Integracion Metricool

Como community manager quiero programar publicaciones usando Metricool.

Criterios:

- Token seguro en servidor.
- Crear publicacion programada.
- Consultar estado.
- Registrar publicacion confirmada o fallida.

Prioridad: P1

## Epica E6 - masalto.com.ar

### MSH-050 - Publicar pagina de evento

Como marketing quiero publicar el evento en `masalto.com.ar`.

Criterios:

- Genera slug unico.
- Crea o actualiza pagina individual.
- Publica en listado de proximos eventos si corresponde.
- Incluye SEO y `Schema.org/Event`.

Prioridad: P0
Relacion CA: CA-03, CA-04

### MSH-051 - Pagina unica con Accred

Como comprador quiero comprar sin sentir que salgo de MasAlto.

Criterios:

- Si el evento usa Accred, la pagina consulta precios, sectores y stock desde Accred.
- No usa iframe para checkout.
- Si checkout headless no esta listo, deriva a subdominio con marca MasAlto.

Prioridad: P1

## Epica E7 - Automatizaciones, inbox y sorteos

### MSH-060 - Regla por palabra clave

Como community manager quiero responder consultas repetidas.

Criterios:

- Palabra clave por campana.
- Respuesta publica aprobada.
- DM con link trazable.
- Registro de touchpoint y lead.

Prioridad: P0
Relacion CA: CA-07

### MSH-061 - Clasificacion de inbox

Como operador quiero priorizar consultas.

Criterios:

- Clasifica precio, entrada, horario, ubicacion, prensa, proveedor, reclamo, spam y otros.
- Reclamos, devoluciones y problemas de compra se derivan a humano.
- La IA no confirma precio, stock ni condiciones sin consultar la fuente vigente.

Prioridad: P1

### MSH-062 - Sorteo auditable

Como marketing quiero ejecutar sorteos con evidencia.

Criterios:

- Define premio, reglas, fecha, elegibilidad y consentimiento.
- Elimina duplicados.
- Selecciona ganador y suplentes.
- Guarda evidencia del resultado.

Prioridad: P0
Relacion CA: CA-08

## Epica E8 - Datos, analitica e integraciones

### MSH-070 - MasAlto Data Core MVP

Como sistema quiero un modelo comun de identidad, eventos y consentimiento.

Criterios:

- Tablas base creadas.
- IDs comunes: `person_id`, `event_id`, `campaign_id`, `content_id`, `organization_id`.
- Fuses ambiguas de identidad quedan en revision.

Prioridad: P0

### MSH-071 - Importacion CSV

Como analista quiero cargar ventas o datos externos.

Criterios:

- Importa CSV por evento.
- Valida columnas requeridas.
- Genera errores descargables.
- No duplica ordenes ya importadas.

Prioridad: P0
Relacion CA: CA-09

### MSH-072 - Dashboard basico

Como director quiero ver estado de campana y evento.

Criterios:

- Muestra campanas activas, publicaciones, leads, sorteos, clicks y ventas informadas.
- Distingue datos sociales, datos manuales y datos Accred.
- Muestra alertas operativas.

Prioridad: P1
Relacion CA: CA-10

### MSH-073 - Conector Accred preparado

Como sistema quiero una integracion desacoplada lista para activarse.

Criterios:

- Contratos versionados.
- Webhooks firmados.
- Idempotency key en escrituras.
- Cola de pendientes y reintentos.
- Fallas no bloquean la app.

Prioridad: P0
Relacion CA: CA-11

## Primer sprint recomendado

1. Scaffold PWA, layout y dashboard mock.
2. Modelo de evento y campana.
3. Selector de modo independiente/vinculado.
4. Pantalla de publicacion web.
5. Biblioteca de contenido mock.
6. Backlog SQL inicial.
7. Contratos API v0.
8. Build validado.
