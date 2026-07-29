# Importacion agregada de EntradaWeb

El formato de referencia fue revisado el 29/07/2026. Contiene nueve columnas:

- Apellido y nombre del comprador.
- Cantidad de entradas.
- Email y telefono.
- Localidad y provincia.
- DNI del pagador.
- Tipo de dispositivo.

No contiene importe, precio, fecha de compra ni identificador de orden. Por ese motivo
sirve para medir compradores, entradas y distribuciones generales, pero no facturacion
ni atribucion individual.

## Privacidad

El archivo se procesa en memoria dentro del navegador. Social Hub no guarda ni envia
las filas originales. Solo conserva:

- Cantidad de compradores.
- Cantidad total de entradas.
- Filas rechazadas.
- Conteos por dispositivo, provincia y localidad.
- Evento, fuente y fecha de importacion.

No se conservan nombre, apellido, email, telefono ni DNI. El archivo original debe
mantenerse bajo la custodia del productor y no subirse al repositorio.

## Limites

- Solo acepta `.xlsx` de hasta 5 MB.
- Exige las nueve columnas del formato verificado.
- Cantidades de entradas vacias, no enteras o menores a uno se descartan.
- La facturacion se incorporara cuando EntradaWeb incluya importe o exista otra
  exportacion conciliable.
