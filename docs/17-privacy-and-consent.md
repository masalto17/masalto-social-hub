# Privacidad y consentimiento

Fecha: 29 de julio de 2026.
Estado: borrador tecnico aprobado para preparacion. No habilita analitica en produccion.

## Decision aprobada

- Meta Pixel y Google Analytics 4 seran la estrategia oficial de atribucion de conversion.
- Social Hub y EntradaWeb deben usar los mismos identificadores del evento.
- Social Hub emite visita e inicio de checkout; EntradaWeb confirma la compra.
- La medicion solo se activa despues de validar politica, consentimiento e IDs en ambos
  sistemas.
- GA4 requiere ademas configurar y probar la medicion entre los dominios de Social Hub y
  EntradaWeb; compartir el ID por si solo no garantiza continuidad de sesion.
- Hugo es el unico aprobador operativo vigente.

## Controles implementados

La analitica requiere simultaneamente:

1. `NEXT_PUBLIC_ANALYTICS_ENABLED=true`.
2. Al menos un ID valido de Meta Pixel o GA4.
3. Un correo de privacidad valido.
4. Consentimiento explicito del visitante.

Sin esas cuatro condiciones no se carga ningun script de Meta o Google.

Variables:

```text
NEXT_PUBLIC_ANALYTICS_ENABLED=false
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_GA4_MEASUREMENT_ID=
NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL=
```

## Consentimiento

- Estado inicial: medicion bloqueada.
- Opciones: aceptar medicion o usar solo funciones necesarias.
- Persistencia: eleccion local en el navegador.
- Revocacion: control de preferencias disponible despues de decidir.
- No se condiciona la compra ni la navegacion a aceptar analitica.

## Datos y finalidades

| Dato o senal | Finalidad |
|---|---|
| Pagina visitada | Medir interes por evento |
| UTM de origen | Atribuir campana y canal |
| Clic de compra | Medir inicio del checkout |
| Navegador/dispositivo | Calidad tecnica y rendimiento |
| Compra en EntradaWeb | Conversion y rendimiento comercial |

EntradaWeb es responsable de su checkout y exporta reportes con datos personales. Social
Hub no debe importar compradores hasta tener backend seguro, RLS, finalidad definida y
politica de retencion aprobada.

Meta, Google, Vercel y EntradaWeb son proveedores o terceros relevantes que deben
identificarse correctamente en la version publica de la politica, incluyendo transferencias
internacionales cuando corresponda.

## Pendientes antes de publicar la politica

- Razon social o nombre legal completo del responsable.
- CUIT, si corresponde informar.
- Domicilio del responsable.
- Correo oficial para ejercer derechos.
- Plazo de conservacion de analitica.
- Plazo de conservacion de exportaciones de EntradaWeb.
- Revision legal final.

## Derechos

La politica final debe explicar los derechos de informacion, acceso, rectificacion,
actualizacion y supresion. Como referencia oficial, la AAIP informa un plazo de diez dias
corridos para responder solicitudes de acceso y cinco dias habiles para rectificacion,
actualizacion o supresion.

Fuente oficial:
`https://www.argentina.gob.ar/aaip/datospersonales/derechos`

Referencia tecnica GA4:
`https://support.google.com/analytics/answer/10071811`
