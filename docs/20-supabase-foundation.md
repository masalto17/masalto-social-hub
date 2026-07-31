# Base segura de Supabase

Estado: preparada en codigo, no aplicada a ningun proyecto remoto.

## Bloqueo actual

La organizacion Supabase disponible ya tiene dos proyectos activos en el plan
gratuito: Accred y Handy. La creacion de `MasAlto Social Hub` fue rechazada por la
plataforma. Ninguno de esos proyectos se reutiliza, pausa o modifica.

Para destrabar el backend remoto se necesita una decision de Hugo:

1. Cambiar la organizacion Supabase a un plan que permita el proyecto adicional.
2. Crear otra organizacion/cuenta separada para Social Hub.
3. Aprobar una infraestructura self-hosted con operacion, backups y monitoreo propios.

La opcion recomendada para el MVP es mantener Supabase administrado y habilitar un
proyecto separado en Sao Paulo. Antes de aceptar un plan pago se debe mostrar el
precio final del panel y obtener aprobacion expresa.

## Alcance de esta migracion

- Organizaciones y membresias.
- Roles iniciales `admin`, `editor` y `reader`.
- Eventos y campañas.
- Piezas y tareas de publicacion manual.
- Registro de actividad de solo lectura para clientes.
- Proyeccion publica separada para paginas de eventos.
- RLS desde la primera tabla.
- Claves foraneas que impiden mezclar organizaciones.

No incluye personas, leads, sorteos, consentimientos, pagos ni integracion Accred.

## Portabilidad

Las migraciones usan PostgreSQL, RLS y la interfaz estandar de Supabase Auth. Deben
funcionar sin cambios tanto en Supabase administrado como self-host. No se aceptan
funciones exclusivas de un plan o modalidad de alojamiento dentro del nucleo.

El contrato y su control automatico estan definidos en
`docs/27-database-portability.md` y `npm run db:portability`.

## Reglas de seguridad

- El alta de organizaciones y del primer administrador es una operacion de
  bootstrap de servidor, nunca del navegador.
- El rol anonimo solo puede consultar eventos con estado `published`.
- Las tablas internas requieren membresia de la organizacion.
- Solo administradores crean o modifican la proyeccion web publica.
- Los clientes no pueden insertar registros de auditoria.
- `service_role` no se agrega a variables `NEXT_PUBLIC_*` ni al repositorio.
- La autenticacion se configura solo por invitacion y exige al menos 12 caracteres.

## Verificacion

GitHub Actions levanta una base Supabase aislada, aplica la migracion y ejecuta:

```text
supabase db lint --local
supabase test db --local supabase/tests/database
```

La migracion no esta lista para un proyecto remoto hasta que ambos comandos pasen en
CI y se realice una revision cruzada.
