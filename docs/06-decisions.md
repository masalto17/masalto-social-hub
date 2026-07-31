# Decisiones registradas

## 2026-07-28 - Nombre del producto

Decision: el producto se llama MasAlto Social Hub.

Contexto: antes se lo nombro como Campaign Hub. El nombre vigente para el proyecto y la documentacion es MasAlto Social Hub.

## 2026-07-28 - Producto principal

Decision: construir una app web/PWA, no una skill aislada.

Motivo: el nucleo necesita panel, calendario, contenido, aprobaciones, integraciones, usuarios, estados y dashboards. Una skill puede sumarse despues como asistente conversacional.

## 2026-07-28 - Accred opcional

Decision: la vinculacion con Accred es opcional por evento y modular.

Motivo: habra eventos dentro del ecosistema y eventos externos o independientes. Social Hub debe funcionar aunque Accred no este operativo.

## 2026-07-28 - Alcance de Accred

Decision: Accred incluye ticketera, acreditaciones, accesos y cantina.

Motivo: no se debe modelar MacroTicket como sistema interno. Si existe una ticketera externa, se trata como proveedor externo por evento.

## 2026-07-28 - Pagina publica

Decision: `masalto.com.ar` debe ser la experiencia publica principal del evento.

Motivo: evita duplicar informacion, mejora SEO, concentra medicion y reduce confusion del comprador.

## 2026-07-28 - Venta con Accred

Decision: cuando el evento use Accred, la pagina publica ideal debe vender en la misma experiencia de MasAlto con Accred como motor headless.

Alternativa transitoria: subdominio de entradas con marca MasAlto mientras se termina la integracion completa.

## 2026-07-28 - Separacion de productos

Decision: Social Hub, Accred y web MasAlto se integran por APIs, webhooks y contratos versionados.

Motivo: evitar acoplamiento directo, proteger produccion y permitir desarrollo paralelo.

# Auditoria y decisiones del piloto (2026-07-29)

Cada apartado indica si es una decision aprobada o una propuesta pendiente.

## Decision - Accred fuera del camino critico de Sabroso

Decision: para Sabroso 28/08/2026, la venta NO usa Accred. Se vende con ticketera
externa entradaweb.com.ar (confirmado por Hugo, 2026-07-29).

Motivo: Accred no expone hoy API publica/partner para Social Hub. Verificado en el
repo masalto17/Accred: sus rutas API son admin interno, cron y webhooks entrantes de
proveedores (mercadopago, meta-whatsapp, resend, twilio). No hay endpoint de catalogo
de eventos ni webhook saliente de orden hacia un tercero. Los contratos de
04-integration-contracts.md aun no existen del lado de Accred.

Nota: Accred SI tiene ticketera y pagos propios (MercadoPago); usar entradaweb es
decision comercial, no limite tecnico. El conector Accred queda preparado y apagado
detras de feature flag (accred_enabled = false) para activarse post-Sabroso con API y
contrato confirmados.

Consecuencia de medicion: entradaweb probablemente no envia webhook de orden. La venta
se mide por UTM + redirect + import CSV (MSH-071). El dashboard de ventas sera manual.

## Decision - Herramienta de publicacion pendiente de elegir

Decision: NO cerrar proveedor todavia. Para Sabroso, calendario y aprobacion dentro de
Social Hub + publicacion manual asistida como respaldo. Probar Meta primero.

Comparar antes de elegir: Postiz (open-source, AGPL, self-host = suma operacion, OAuth,
backups), Metricool (API paga y limitada) y APIs directas. Postiz queda como candidato,
no eleccion.

## Propuesta - Umami como complemento

Propuesta: usar Umami self-host para medir anuncio -> clic -> compra, sujeto a definir
politica de privacidad y de retencion.

Motivo: sin cookies, liviano, soporta UTMs y eventos. Aviso: en self-host retiene datos
hasta borrado manual; y leads/sorteos SI recopilan PII bajo ley 25.326 (informar
finalidad, responsable, destinatarios, derechos y consentimiento). Umami no elimina esas
obligaciones. Candidato recomendado, no decision.

## Decision - Alcance reducido a carril Sabroso

Decision: recortar el MVP al carril que mueve entradas de Sabroso. Diferir conector
Accred real, auth de roles completa y publicacion automatica multired.

## Propuesta - Roles iniciales

Propuesta: 3 roles para el piloto: admin, editor/aprobador, lector. Expandir despues.

## Decision - Puertas de seguridad obligatorias antes del primer dato real

Decision (controles obligatorios, aun no hay fuga porque no hay backend ni secretos):
.gitignore, versiones fijadas + lockfile, RLS activo, variables seguras en Vercel,
firma e idempotencia de webhooks, CI con Playwright bloqueando merges.

## Decision - Division de trabajo entre agentes

Propuesta: ver 10-agent-coordination.md. Codex posee Social Hub (arquitectura, dev,
seguridad, datos propios, UI, CI, publicacion). Claude posee Accred (repo, contratos,
integrations/accred/). Revision cruzada obligatoria, sin decisiones unilaterales.
Aprobacion, merge y produccion: Hugo. Sin tercer agente.

## Meta Pixel y GA4

Decision: Meta Pixel y Google Analytics 4 son la estrategia oficial de atribucion de
conversion. La activacion requiere usar los mismos IDs de MasAlto en Social Hub y
EntradaWeb, politica y consentimiento vigentes, y validacion final de Hugo.

Umami puede evaluarse despues como medicion first-party complementaria; no reemplaza el
embudo de compra informado por EntradaWeb.

## Aprobador vigente

Decision: por ahora Hugo es el unico aprobador de cambios, merges, publicaciones,
credenciales, despliegues y produccion. Otros usuarios se incorporaran mediante una
decision posterior.

## Portabilidad PostgreSQL y Supabase

Decision: continuar con PostgreSQL, migraciones SQL y RLS estandar de Supabase. El
mismo nucleo debe ejecutarse en Supabase administrado o self-host sin modificar el
modelo ni las migraciones.

Se acepta como frontera comun `auth.users`, `auth.uid()`, los roles `anon` y
`authenticated`, y las APIs estandar disponibles en ambas modalidades. No se
incorporan Vault, Edge Functions indispensables, Realtime, Storage obligatorio,
extensiones administradas ni jobs o HTTP desde PostgreSQL sin una decision posterior
aprobada por Hugo.
