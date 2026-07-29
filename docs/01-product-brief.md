# MasAlto Social Hub - Producto y alcance

## Vision

MasAlto Social Hub sera el panel unificado para operar campanas digitales y comunicacion de eventos, conectado a redes sociales, pagina oficial, automatizaciones y, cuando corresponda, a Accred.

El sistema debe permitir que la informacion del evento se cargue una vez y se reutilice en:

- Publicaciones sociales.
- Calendario editorial.
- Automatizaciones de respuestas.
- Sorteos y captacion de leads.
- Paginas publicas en `masalto.com.ar`.
- Ticketera y acreditaciones cuando el evento use Accred.
- Reportes de campana, ventas, asistencia y consumo.

## Usuarios principales

- Direccion de MasAlto.
- Equipo de marketing y contenido.
- Produccion de eventos.
- Operadores de redes y mensajes.
- Administradores de Accred.
- Colaboradores externos con permisos limitados.

## Tipos de eventos

### Evento independiente

El evento no forma parte del ecosistema operativo de Accred.

Social Hub gestiona:

- Comunicacion.
- Redes.
- Leads.
- Sorteos.
- Link a ticketera externa, venta fisica o informacion general.
- Metricas sociales y de pauta.
- Carga manual o importacion CSV de ventas si se necesita.

No se sincronizan datos con Accred.

### Evento vinculado con Accred

El evento usa uno o mas modulos de Accred:

- Ticketera.
- Acreditaciones.
- Invitaciones y cortesias.
- Control de accesos QR.
- Venta de cantina.
- Reportes operativos.

La vinculacion es modular. Un evento puede usar todos los modulos o solo algunos.

## Relacion con masalto.com.ar

`masalto.com.ar` debe ser la salida publica oficial de eventos cuando el evento se publique.

Social Hub debe controlar:

- Si el evento se muestra o no en la web.
- Fecha de publicacion.
- Slug.
- Estado de venta.
- Imagen principal.
- Descripcion.
- SEO.
- Enlaces de compra o registro.

Cuando el evento use Accred, la pagina de venta debe integrarse en la experiencia de `masalto.com.ar`. La implementacion ideal es Accred como motor headless de venta. Como transicion, puede usarse un subdominio con estetica unificada.

## Relacion con Accred

Accred contiene ticketera, acreditaciones, accesos y cantina. Social Hub no reemplaza esas funciones.

Social Hub aporta:

- Origen de demanda.
- Campana, anuncio, publicacion y contenido.
- Interacciones sociales.
- Leads.
- Sorteos.
- Mensajes.
- Segmentos de audiencia.

Accred aporta:

- Compra.
- Orden.
- Pago.
- Entrada QR.
- Acreditacion.
- Check-in.
- Consumo de cantina.
- Asistencia real.

La retroalimentacion permite medir el recorrido completo desde comunicacion hasta presencia y consumo.

## Alcance fuera del MVP

- Reemplazar Metricool, ManyChat o herramientas externas con conectores directos completos.
- Crear un CRM general completo.
- Automatizar respuestas sensibles sin revision humana.
- Modificar bases internas de Accred directamente.
- Publicar en redes sin aprobacion cuando la cuenta requiera control humano.
