# EntradaWeb - Panel de productor: funciones y aplicacion

Fuente: revision read-only del panel boleteria.entradaweb.com.ar con la cuenta de Hugo,
29 de julio de 2026 (autorizada por el titular). No se modifico ninguna configuracion.
Autor: Claude. Estado: analisis para (a) portar funciones a Accred y (b) automatizar
reglas en MASH cuando un evento se vende por EntradaWeb.

Nota: el evento SABROSO 24/7 (28-08-2026 23:00, Hugo Espectaculos, San Juan, codigo
interno EEV-ee7309d3, capacidad 500) figura en EntradaWeb pero segun Hugo esta EN
REVISION, aun no cargado/publicado. Toda config vista es provisional.

## Modulos del panel (nivel superior)

Comunicate con Nuestras Areas, Reporte Ventas Evento y Rendiciones, Vender Entradas
Autogestion Flash, Publicar Evento, Herramientas de Marketing, Vendedores Web, Control
de Acceso, Bajar Kit Para Diseno, Modificar Mi Informacion de Usuario, Aprende a Usar
Herramientas.

## Funciones verificadas en detalle

### 1. Reporte de Ventas y Rendiciones (por evento y sesion)

- Desglose por canal: Boleteria vs Web.
- Metricas: entradas totales, cortesias, vendidas, reservadas.
- Recaudacion por medio de pago: efectivo, tarjeta debito/credito POS, pasarela
  EntradaWeb, billeteras offline.
- Ocupacion por sesion: capacidad, a la venta, vendidos, pendientes de pago, cortesia,
  reserva, disponibles, porcentaje de ocupacion.
- Sub-reportes: EntradaWeb Report Plus (analitica), Listado de Compradores Web,
  Rendicion de EntradaWeb, Detalle de Lugares, Reporte de Control de Acceso, Reporte
  Vendedores.
- Acciones: Imprimir, Reporte Detallado.
- "Listado de Compradores Web" se entrega como archivo Excel `.xlsx`. El ejemplo
  Campedrinos contiene una hoja tabular con nueve columnas: apellido, nombre, cantidad
  de entradas, email, telefono, localidad, provincia, DNI y dispositivo.

### 2. Herramientas de Seguimiento (por evento) - LA MAS VALIOSA

- Meta Pixel: pixel primario + pixel secundario (para agencia). Eventos que dispara
  automaticamente en el checkout: PageView, AddToCart, InitiateCheckout, Purchase.
- Google Analytics 4: ID de medicion (G-XXXXXXXXXX). Eventos: page_view, add_to_cart,
  begin_checkout, purchase.
- Estado Sabroso: No configurado (toggles apagados).

Implicancia: EntradaWeb dispara el evento de COMPRA (Purchase) en su propio checkout. Si
usamos el MISMO Meta Pixel y la MISMA propiedad GA4 en la landing de MASH y en esta
config, podemos construir el embudo anuncio -> landing (ViewContent/PageView) -> checkout
EntradaWeb (Purchase). En GA4 tambien se debe configurar medicion entre dominios y
verificar con una compra de prueba que EntradaWeb preserve el parametro de vinculacion;
el ID compartido por si solo no garantiza continuidad de sesion.

### 3. Landing Propia

- Pagina agregadora en el dominio de EntradaWeb: entradaweb.com.ar/<slug>
  (slug actual: hugo_de_bernardo). Lista todos los eventos publicados del organizador.
- Inferior a la landing propia de MASH (dominio, marca y SEO son de EntradaWeb, no
  nuestros). Sirve solo como fallback cero-esfuerzo si llegamos tarde.

### 4. Control de Acceso

Submenu: Manual de Uso, Instalar App, Codigo de Acceso, Datos en Tiempo Real, Datos
Historicos.

- App de check-in por QR (Instalar App) con codigo de acceso por operador.
- Datos en Tiempo Real: solo muestra eventos del dia (sin datos para Sabroso hoy).
- Datos Historicos: acceso a check-ins pasados.
- Solapa directo con Accred: access_control, access_logs, accreditations, anti_passback.
- Para MASH: cuando Sabroso se vende por EntradaWeb, la asistencia real (check-ins) vive
  en EntradaWeb. Datos Historicos / Reporte de Control de Acceso es la fuente de
  asistencia para el dashboard de MASH (import manual post-evento).

### 5. Vendedores Web

Submenu: Administrar Vendedores, Generar y Exportar Vendedores Web.

- Alta y gestion de vendedores/afiliados; cada vendedor recibe un link propio de venta,
  trackeable. Exportable.
- Solapa con Accred: sales_agents_commissions (migracion v3.8.2).
- Para MASH: cada link de vendedor es una fuente atribuible; combinable con UTM y con el
  Reporte Vendedores para medir performance por vendedor/influencer.

### 6. Vender Entradas Autogestion Flash

Punto de venta rapido en mostrador. Flujo (dialogos detectados en la pagina):
Configuracion -> Cobrar con QR Interoperable -> Detalle de Emision de Entradas ->
Ventana de Impresion -> Finalizar.

- Cobro con QR Interoperable (Transferencias 3.0 argentino: cualquier billetera).
- Emision e impresion de entrada en el acto.
- Pocos pasos, pensado para venta express.
- Estaba en estado "Cargando..." por no haber evento en venta hoy (Sabroso en revision).
- Accred ya tiene POS y cash_sessions (v4.0.3, v3.2.0); el diferencial a copiar es el
  cobro por QR interoperable + emision inmediata en un flujo minimo.

### 7. Publicar Evento

- El tile no responde a la automatizacion (ni icono ni label navegan). Indicio: la
  publicacion de eventos en EntradaWeb parece ser un flujo asistido/manual (con ejecutivo),
  no autogestion pura. No se pudo ver el wizard.
- Insight: esa friccion (depender de un ejecutivo para publicar) es justo lo que Accred
  puede ganar siendo 100% self-service.

### 8. Herramientas de Marketing - descartadas

Segun Hugo, el resto de marketing (Influencers, Estadisticas, Plan 3 Cuotas, Configurar
Cargo) aporta poco; solo branding. No se profundiza.

## Ideas para simplificar creacion y venta de eventos en Accred

Objetivo: que crear un evento con venta de tickets en Accred sea lo mas simple posible,
tomando lo bueno de EntradaWeb y evitando su friccion.

1. Modo "Express": crear un evento vendible en una sola pantalla (nombre, fecha, venue,
   capacidad, un tipo de entrada y precio) y activarlo. Diferir sectores, seating,
   promociones y cortesias a configuracion avanzada (progressive disclosure).
2. Duplicar evento / plantillas: Hugo Espectaculos repite venue y formato. "Duplicar
   ultimo evento" ahorra la mayor parte de la carga. Accred ya tiene taxonomia de eventos
   (v3.8.6) donde apoyarse.
3. Venta mostrador con QR interoperable: sumar a POS de Accred el cobro por QR
   interoperable (Transferencias 3.0) con emision e impresion inmediata, como el flash de
   EntradaWeb.
4. Autogestion total: publicar sin depender de un ejecutivo. Este es el diferencial mas
   claro frente a EntradaWeb.
5. Config integrada en el alta: pixel/GA4 del evento y link de vendedor configurables en
   el mismo wizard de creacion, no en menus separados.
6. Defaults sanos y estados claros: el evento nace en borrador/preventa y pasa a "En
   venta" con un clic.

Relacion con MASH: el evento se define una vez en core.events (docs/08). Cuando exista API
partner, MASH lo empuja a Accred por el conector (docs/13). Para eventos vendidos por
EntradaWeb, MASH no crea el evento alla; solo lo referencia por external_ticket_url y mide
por pixel/GA4/UTM/CSV.

## Candidatos a portar a Accred

- Config por evento de Meta Pixel + GA4 con eventos de embudo automaticos. Accred ya
  tiene ticketing + checkout + pagos; podria disparar Purchase de forma nativa. Alto valor.
- Vendedores Web / Influencers = seguimiento de vendedores/afiliados. Comparar con lo que
  Accred ya tiene: sales_agents_commissions (migracion v3.8.2).
- Plan 3 Cuotas Sin Interes = cuotas. Accred usa MercadoPago, que soporta cuotas; evaluar.
- Formato de Rendicion y desglose por medio de pago del reporte.
- Landing agregadora del organizador (Accred podria ofrecerla).

## Automatizaciones para MASH cuando el evento se vende por EntradaWeb

1. Pixel/GA4 compartido (prioridad alta): crear un Meta Pixel y una propiedad GA4 de
   MasAlto; poner el mismo ID en la landing de MASH y en la config de EntradaWeb.
   Configurar medicion entre dominios y validar una compra real de bajo monto antes de
   considerarlo atribucion operativa.
2. Import de compradores: cargar el Excel de "Listado de Compradores Web" en MASH
   (MSH-071) para conciliar ingresos y ocupacion. Manual (sin API confirmada). El
   archivo contiene PII y no debe cargarse hasta implementar RLS, finalidad y retencion.
3. Alerta de ocupacion: cuando el porcentaje de ocupacion se acerca a agotado, MASH
   avisa para cortar o redirigir pauta.
4. Sync de estado de venta: mapear estado EntradaWeb (En Venta / Terminado / Agotado) al
   estado publico de la landing de MASH (sale_status, website_status).
5. Performance de vendedores: del Reporte Vendedores, atribuir leads/ventas por vendedor
   o influencer.

## Advertencias

- No se hallo API publica. Integracion = export manual + config compartida de pixel/GA4.
- No activar pixel/GA4 en produccion hasta: crear los IDs de MasAlto, definir politica de
  privacidad y retencion (ley 25.326) y cumplir terminos de Meta/Google.
- Config de Sabroso es provisional: evento en revision, aun no cargado.

## Pendiente de explorar

- Publicar Evento: el tile no navego al click (probable asistente de alta con
  confirmacion). No se forzo para no iniciar una creacion de evento por accidente.
- Vender Entradas Autogestion Flash, Bajar Kit para Diseno, Comunicate con Areas.
- Marketing restante: Influencers, Estadisticas de Ventas, Plan 3 Cuotas Sin Interes,
  Configurar Cargo por Servicio Extra.
- Confirmado: "Listado de Compradores Web" exporta un archivo Excel `.xlsx`.
