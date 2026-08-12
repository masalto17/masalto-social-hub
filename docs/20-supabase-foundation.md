# Base segura de Supabase

Estado: proyecto remoto verificado; migraciones preparadas en codigo y aun no
aplicadas.

## Bloqueo actual

El proyecto dedicado `wstvibvkrmhmzjotjqhx` existe y esta vacio: no tiene tablas ni
migraciones remotas. La organizacion `MasAlto` continua en plan gratuito al
2026-08-11; por lo tanto no se aplican migraciones ni se activa persistencia remota
hasta que Hugo confirme el cambio a Pro.

Para destrabar el backend remoto se necesita una decision de Hugo:

1. Confirmar Supabase Pro para la organizacion `MasAlto`.
2. Aplicar las migraciones versionadas al proyecto dedicado.
3. Ejecutar el bootstrap del primer administrador y validar RLS con dos identidades.

La opcion aprobada para el MVP es Supabase administrado con este proyecto separado.

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
