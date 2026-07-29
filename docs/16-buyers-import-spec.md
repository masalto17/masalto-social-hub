# Import de compradores web (EntradaWeb) - especificacion

Fuente: archivo real "reporte-de-ventas campedrinos.xlsx" (export del Listado de
Compradores Web de EntradaWeb), 122 filas de compradores y 245 entradas. 29 de julio
de 2026.
Cubre el criterio MSH-071. Autor: Claude (analisis). Implementa: Codex (Social Hub).

## Formato del export

Una hoja, encabezado en fila 1. Columnas (orden exacto):

| # | Columna | Contenido | Notas |
|---|---|---|---|
| 1 | Apellido Comprador | texto | |
| 2 | Nombre Comprador | texto | |
| 3 | Cant. Entradas | entero | header trae salto de linea "Cant.\nEntradas" |
| 4 | E-mail Comprador | texto | clave de deduplicacion (normalizar minusculas/trim) |
| 5 | Fono Comprador | texto | telefono, formatos varios |
| 6 | Localidad Comprador | texto | ciudad |
| 7 | Provincia Comprador | texto | mayoria San Juan, algunos otras |
| 8 | DNI Pagador | texto | PII de alta sensibilidad operativa, frecuentemente vacio |
| 9 | Tipo de Dispositivo | texto | Smartphone android/iphone, Desktop windows/mac. Bajo valor |

## Lo que el export NO trae (importante)

No hay: order_id, monto, moneda, medio de pago, fecha/hora de compra, sector/tipo de
entrada, ni UTM/origen.

Consecuencias:
- Este archivo es una LISTA DE CONTACTOS, no un reporte financiero. La recaudacion sale
  del Reporte de Ventas Totalizado (agregado), no de aca.
- No permite atribuir la compra a un anuncio (sin UTM). La atribucion compra->anuncio
  solo se logra con Meta Pixel / GA4 (docs/15).
- Sin order_id no se puede deduplicar por orden. Ver reglas de dedup abajo.

## Mapeo a MASH

- Nombre Comprador + Apellido Comprador -> display_name (o first_name/last_name).
- E-mail Comprador -> email (clave de dedup, normalizada).
- Fono Comprador -> phone.
- Localidad Comprador -> city.
- Provincia Comprador -> province. NOTA: core.people (docs/08) no tiene columna province;
  requiere agregarla o guardarla en un campo de detalle.
- DNI Pagador -> documento sensible. NO almacenar en claro en MASH; preferir hash o dejar
  esa PII en Accred. Ver privacidad.
- Cant. Entradas -> cantidad en un touchpoint/registro de compra (no es monto).
- Tipo de Dispositivo -> opcional, solo analitica; se puede descartar.

## Reglas de importacion

1. Validacion: fila valida si tiene email (o DNI) + nombre. Cant. Entradas numerica.
2. Normalizacion: email a minusculas y sin espacios; telefono solo digitos.
3. Deduplicacion de personas: upsert por email normalizado (fallback DNI). Sin order_id,
   la unidad es la persona-compradora por evento, no la orden.
4. Anti reimport: como no hay order_id, para no duplicar al reimportar el mismo archivo,
   registrar un batch de importacion (hash del archivo o de cada fila) y saltar filas ya
   vistas para ese evento. Reconciliar cantidades contra el total del Reporte Totalizado.
5. Segmentacion: marcar segmento transaccional "Compro". NO agregar a audiencias
   comerciales/marketing sin base de consentimiento (ver privacidad).
6. Errores: generar archivo de errores descargable (filas invalidas, emails malformados).

## Privacidad (ley 25.326)

Este export es PII sensible (nombre, email, telefono, DNI, localidad). Por lo tanto:
- Base legal y proposito: importar compradores a MASH necesita finalidad declarada y, para
  uso comercial, consentimiento. La compra habilita fines transaccionales, no marketing
  automatico.
- Minimizacion: para medir conversion, MASH prefiere hash de email/telefono e IDs opacos
  (docs/04). Guardar PII cruda solo si hay proposito y base.
- Fuente de verdad: mantener la identidad del comprador en Accred (que ya tiene
  marketing_consent); en MASH, idealmente, solo lo necesario o hasheado (docs/12).
- Retencion: definir plazo y borrado. No dejar el xlsx con PII en carpetas sin control.

## Relacion con el resto

- Confirma que "Listado de Compradores Web" SI exporta (xlsx). Cierra la pregunta abierta
  de docs/15.
- Complementa, no reemplaza, la medicion por pixel/GA4/UTM (atribucion) ni el Reporte
  Totalizado (recaudacion, ocupacion, medios de pago).
