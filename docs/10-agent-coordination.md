# Coordinacion de agentes: Codex y Claude

Fuente: auditoria del plan tecnico y respuesta cruzada de Codex, 29 de julio de 2026.
Estado: propuesta pendiente de aprobacion de Hugo/Ivo.

Define como trabajan Codex y Claude sobre el ecosistema sin pisarse, y donde entra la
aprobacion humana.

## Principio

- Propiedad separada por repositorio/area. Revision cruzada obligatoria.
- Ningun agente toma decisiones unilaterales.
- El humano (Hugo/Ivo) es la unica compuerta de aprobacion, merge, publicacion y produccion.
- Ningun agente mergea a `main`.

## Propiedad

| Responsable | Propiedad |
|---|---|
| Codex | Social Hub: arquitectura, desarrollo, seguridad, datos propios, UI, CI y publicacion |
| Claude | Accred: repositorio, contratos Accred e `integrations/accred/` |
| Ambos | Revision cruzada, sin decisiones unilaterales |
| Hugo/Ivo | Aprobacion, merge, publicacion y produccion |

Claude puede auditar todo, pero solo modifica el area Accred salvo autorizacion
especifica. Codex puede auditar Accred, pero solo modifica Social Hub salvo autorizacion
especifica.

## Reglas de trabajo

1. Un branch por agente y por tarea. Nombre: `codex/<tarea>` o `claude/<tarea>`.
2. Todo cambio entra por Pull Request. Sin push directo a `main`.
3. El smoke de Playwright debe estar verde antes de cualquier merge.
4. Si dos tareas tocan el mismo archivo, se serializan: primero una, merge, luego la otra.
5. Cambios de contrato entre Social Hub y Accred: los propone quien es dueno del lado
   afectado, los revisa el otro agente, los aprueba el humano. Nada se da por acordado
   sin esa revision cruzada.
6. La revision cruzada es real, no de sello: cada agente puede bloquear un PR del otro con
   justificacion tecnica; el humano desempata.

## Flujo tipico

```text
Hugo/Ivo define tarea y area
  -> El agente dueno del area disena e implementa en su branch
  -> PR
  -> Revision cruzada del otro agente (puede bloquear con justificacion)
  -> smoke verde
  -> Aprobacion humana + merge
```

## Por que no un tercer agente

A 30 dias del piloto Sabroso, sumar un tercer agente agrega costo de coordinacion sin
resolver lo que falta. Lo que falta no es capacidad de generacion, es aprobacion humana
y decisiones cerradas. Si se suma algo, que sea integracion continua (CI), no otro
modelo. Reevaluar despues de Sabroso.
