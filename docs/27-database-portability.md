# Portabilidad de base de datos

Estado: decision aprobada y controlada por CI.

## Objetivo

El nucleo de datos de MasAlto Social Hub debe poder ejecutarse en Supabase
administrado o Supabase self-host sin reescribir el modelo.

La fuente de verdad es PostgreSQL:

- migraciones SQL versionadas;
- tablas, claves, constraints, indices, vistas, funciones y triggers PostgreSQL;
- RLS habilitado desde la primera migracion;
- pruebas de politicas con pgTAP;
- acceso del cliente mediante la API estandar de Supabase.

## Frontera Supabase aceptada

El nucleo puede depender de estas interfaces disponibles tanto en Supabase
administrado como self-host:

- `auth.users` para relacionar usuarios autenticados;
- `auth.uid()` para aplicar identidad dentro de RLS;
- roles de base `anon` y `authenticated`;
- cliente `@supabase/supabase-js` y autenticacion GoTrue compatible.

Esto permite cambiar la URL y las claves del despliegue sin alterar las migraciones.
Un cambio a PostgreSQL sin el stack Supabase requeriria reemplazar solo el adaptador de
identidad, no el modelo de negocio.

## Funciones no permitidas en el nucleo

Sin una decision de arquitectura separada no se incorporan:

- Supabase Vault;
- Edge Functions como logica indispensable del dominio;
- Realtime;
- Supabase Storage como unica ubicacion posible de archivos;
- `pg_net`, llamadas HTTP desde PostgreSQL o webhooks de base;
- `pg_cron` o jobs dependientes del proveedor;
- extensiones disponibles solo en determinados planes o instalaciones;
- funciones de IA, analytics o transformacion de imagenes del proveedor.

Los archivos se consumiran mediante un adaptador de almacenamiento. Los procesos
asincronos y webhooks se ejecutaran en la aplicacion o en workers reemplazables.

## Verificacion

`npm run db:portability` inspecciona todas las migraciones y bloquea patrones fuera de
esta frontera. GitHub Actions ejecuta el control antes de construir la aplicacion.

La base tambien debe pasar:

```text
supabase db lint --local
supabase test db --local supabase/tests/database
```

Aceptar una nueva dependencia de base exige:

1. documentar su equivalente en Supabase administrado y self-host;
2. definir exportacion, backup y recuperacion;
3. demostrar que no bloquea un cambio de infraestructura;
4. aprobacion expresa de Hugo.
