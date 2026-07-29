# Documento funcional MVP

## 1. Campanas

Cada campana representa una accion comunicacional asociada a un evento, producto o marca.

Campos minimos:

- Nombre.
- Tipo: evento, marca, institucional, producto, prensa.
- Objetivo: awareness, venta, leads, asistencia, prensa, fidelizacion.
- Fechas de inicio y cierre.
- Presupuesto estimado.
- Responsable.
- Estado: borrador, planificada, activa, pausada, finalizada, archivada.

## 2. Eventos

Cada evento puede existir sin campana o tener una o mas campanas.

Campos minimos:

- Nombre publico.
- Fecha y hora.
- Venue.
- Ciudad.
- Organizador.
- Artistas o participantes.
- Capacidad.
- Restriccion de edad.
- Estado publico: proximamente, preventa, disponible, ultimas entradas, agotado, reprogramado, cancelado, finalizado.
- Modo de ecosistema: independiente o vinculado con Accred.
- Publicacion web: no publicar, borrador, programado, publicado, enlace privado.

## 3. Configuracion Accred por evento

El evento debe permitir activar modulos:

- Ticketera.
- Acreditaciones.
- Accesos QR.
- Cantina.
- Invitaciones y cortesias.
- Reporte de ventas.
- Fidelizacion posterior.

Estados de vinculacion:

- No vinculado.
- Configurado.
- Sincronizando.
- Vinculado.
- Error de conexion.
- Archivado.

Si Accred no esta disponible, Social Hub debe seguir funcionando y dejar sincronizaciones pendientes.

## 4. Contenido

Social Hub debe permitir crear, almacenar y adaptar piezas:

- Imagen maestra.
- Video maestro.
- Copy base.
- Version Instagram Feed.
- Version Reels/Stories.
- Version Facebook.
- Version TikTok.
- Version YouTube Shorts.
- Version WhatsApp Status.
- Gacetilla de prensa.
- Guion de radio.
- Guion de TV.

Estados:

- Borrador.
- En revision.
- Aprobado.
- Programado.
- Publicado.
- Fallido.
- Archivado.

## 5. Calendario editorial

Vista semanal y mensual con:

- Publicaciones programadas.
- Red de destino.
- Campana asociada.
- Estado.
- Responsable.
- Formato.
- Resultado despues de publicado.

Debe permitir mover fechas, duplicar piezas y crear variantes.

## 6. Publicacion multired

Primera etapa recomendada:

- Integrar con Metricool para programacion y publicacion.
- Mantener fallback manual con estado y enlaces.

Redes objetivo:

- Instagram.
- Facebook.
- TikTok.
- YouTube.
- WhatsApp.
- LinkedIn cuando corresponda.

Las publicaciones deben adaptarse por red. No se debe forzar el mismo texto exacto en todos los canales.

## 7. Automatizaciones y respuestas

El sistema debe poder definir reglas por campana:

- Palabra clave en comentario.
- Respuesta publica.
- DM automatico.
- Link de compra.
- Link de acreditacion.
- Preguntas frecuentes.
- Derivacion a humano.
- Etiquetas de lead.

Primera etapa recomendada:

- ManyChat para Instagram, Facebook y WhatsApp.
- n8n para guardar datos y disparar reportes.

## 8. Sorteos

Funciones del MVP:

- Crear sorteo asociado a una campana.
- Definir reglas.
- Palabra clave.
- Fecha de cierre.
- Cantidad de ganadores y suplentes.
- Validar participantes.
- Evitar duplicados.
- Registrar evidencia.
- Exportar participantes.
- Registrar ganador.

Primera etapa puede apoyarse en AppSorteos. Luego se puede incorporar motor propio con auditoria.

## 9. Leads y audiencias

Social Hub debe registrar personas e interacciones sin convertir todo contacto en receptor comercial automatico.

Datos minimos:

- Nombre disponible.
- Usuario de red social.
- Email opcional.
- Telefono opcional.
- Fuente.
- Campana.
- Evento.
- Consentimientos.
- Etiquetas.
- Historial de interacciones.

Segmentos iniciales:

- Interesado.
- Compro.
- Participo en sorteo.
- Prensa.
- Proveedor.
- Invitado.
- Staff.
- No comercial.

## 10. masalto.com.ar

Social Hub debe poder publicar eventos en la web oficial.

Funciones:

- Crear pagina publica del evento.
- Generar slug.
- Controlar visibilidad.
- Definir imagen principal.
- Definir texto SEO.
- Definir estado de venta.
- Enlace de compra o registro.
- Datos estructurados `Schema.org/Event`.
- Cambio automatico a finalizado despues del evento.

Cuando el evento use Accred:

- La pagina debe consultar disponibilidad, precios y sectores desde Accred.
- La compra idealmente ocurre dentro de la experiencia de MasAlto.
- Transitoriamente puede abrir un subdominio de entradas con marca MasAlto.

## 11. Dashboard

Vista principal:

- Eventos activos.
- Campanas activas.
- Publicaciones proximas.
- Consultas sin responder.
- Leads captados.
- Sorteos activos.
- Clicks a compra.
- Ventas informadas.
- Inversion estimada.
- Costo por lead.
- Costo por venta cuando haya datos.

Vista de evento vinculado con Accred:

- Entradas vendidas.
- Facturacion.
- Sectores.
- Check-ins.
- Acreditaciones.
- Invitaciones.
- Cantina.
- Conversion desde campana.

## 12. IA

La IA debe ayudar como asistente, no operar sin reglas.

Usos permitidos en MVP:

- Generar variantes de copy.
- Adaptar contenido por red.
- Sugerir cronograma.
- Clasificar consultas.
- Proponer respuestas desde plantillas aprobadas.
- Resumir rendimiento.

Requiere aprobacion humana para:

- Publicar.
- Enviar mensajes masivos.
- Ocultar comentarios sensibles.
- Crear promociones.
- Cambiar precios, stock o datos operativos de Accred.

## 13. Diseño y gobierno de marca futuro

Social Hub debe incorporar una biblioteca de marcas y plantillas para los lugares,
productoras y artistas que se comunican repetidamente.

La guia de cada marca se representa con reglas estructuradas y versionadas:

- Logos y variantes autorizadas.
- Paleta y tipografias.
- Area de respeto y tamaños minimos.
- Usos incorrectos.
- Plantillas por canal y formato.

Una skill de identidad visual puede generar propuestas y validar incumplimientos, pero
no reemplaza la aprobacion humana ni modifica archivos maestros.
