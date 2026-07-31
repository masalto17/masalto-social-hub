# Base de autenticacion

Estado: implementada y probada sin credenciales reales.

## Modos

- `prototype`: solo fuera de produccion y cuando Supabase no esta configurado. El
  panel conserva los datos locales y la preview debe permanecer protegida por Vercel.
- `configured`: exige URL y clave publicable de Supabase. El proxy valida la sesion
  con `getClaims()` antes de permitir `/app`.
- `blocked`: en produccion, si falta cualquiera de las dos variables, `/app`
  redirige a una pantalla cerrada. La agenda publica sigue disponible.

## Variables

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

No se utiliza `service_role` en el navegador. La autenticacion es solo por invitacion;
no existe registro publico.

## Pendiente para activar

1. Crear el proyecto Supabase separado.
2. Aplicar la migracion despues de revisar CI.
3. Crear la organizacion MasAlto y el primer miembro administrador mediante un
   procedimiento de bootstrap de servidor.
4. Invitar exclusivamente a Hugo.
5. Cargar URL y clave publicable en Vercel.
6. Validar inicio y cierre de sesion en preview.
7. Reemplazar la persistencia local por consultas protegidas con RLS.

No conectar el dominio publico al panel mientras el paso 7 este pendiente.
