# Backlog inicial

## Fase 0 - Preparacion

- [ ] Confirmar repositorios involucrados: Social Hub, Accred y web MasAlto.
- [ ] Confirmar si `masalto.com.ar` actual sera modificado o si se trabajara en preview.
- [ ] Definir quien aprueba publicaciones y respuestas automaticas.
- [ ] Definir alcance de datos personales y consentimiento.
- [ ] Validar estado real de Accred antes de cualquier integracion.

## Fase 1 - Base del producto

- [ ] Scaffold Next.js PWA.
- [ ] Configurar TypeScript, lint, test y build.
- [ ] Configurar Supabase local/proyecto.
- [ ] Crear autenticacion y roles.
- [ ] Crear entidades `events`, `campaigns`, `content_assets`, `publishing_tasks`.
- [ ] Crear dashboard inicial.
- [ ] Crear CRUD de eventos.
- [ ] Crear selector: evento independiente o vinculado con Accred.
- [ ] Crear configuracion modular Accred por evento.

## Fase 2 - Contenido y calendario

- [ ] Crear biblioteca de assets.
- [ ] Crear formulario de pieza/copy base.
- [ ] Generar variantes por red con IA.
- [ ] Crear flujo de aprobacion.
- [ ] Crear calendario semanal/mensual.
- [ ] Crear estados de publicacion.
- [ ] Agregar export manual para publicaciones.

## Fase 3 - Web publica

- [ ] Definir contrato con `masalto.com.ar`.
- [ ] Crear preview de pagina de evento.
- [ ] Generar slug y SEO.
- [ ] Generar datos `Schema.org/Event`.
- [ ] Implementar estados de venta.
- [ ] Implementar publicacion programada.

## Fase 4 - Automatizaciones

- [ ] Integrar ManyChat o definir flujo manual inicial.
- [ ] Integrar n8n para leads y reportes.
- [ ] Crear reglas de palabras clave.
- [ ] Crear registro de leads.
- [ ] Crear motor inicial de sorteos.
- [ ] Exportar participantes para AppSorteos.

## Fase 5 - Accred opcional

- [ ] Definir contrato minimo con Accred.
- [ ] Crear conector desacoplado.
- [ ] Vincular evento existente.
- [ ] Crear evento en Accred desde Social Hub solo cuando este aprobado.
- [ ] Recibir ventas.
- [ ] Recibir check-ins.
- [ ] Recibir resumen de cantina.
- [ ] Mostrar dashboard integral.

## Fase 6 - Operacion real

- [ ] Crear campana piloto Sabroso 28/08/2026.
- [ ] Cargar assets oficiales.
- [ ] Crear calendario de contenidos.
- [ ] Configurar pagina publica.
- [ ] Configurar automatizaciones.
- [ ] Configurar sorteos.
- [ ] Medir resultados diarios.

## Criterios de aceptacion MVP

- Un usuario puede crear un evento independiente.
- Un usuario puede crear un evento vinculado con Accred sin que la integracion real este activa.
- Un usuario puede cargar contenido y calendarizar publicaciones.
- Un usuario puede generar variantes de copy por red.
- Un usuario puede publicar o dejar listo un evento para `masalto.com.ar`.
- Un usuario puede registrar leads y participantes de sorteo.
- El sistema no se bloquea si Accred esta caido o no configurado.
- El dashboard distingue datos sociales, ventas informadas y datos Accred.
- Las acciones externas importantes requieren confirmacion.
