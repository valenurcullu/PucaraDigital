# Arquitectura

## Alcance actual

Fundaciones del Sprint 1. Un único repositorio y lockfile. Expo y Next.js tienen entradas ejecutables y consumen contratos/tokens compartidos. Todavía no hay login, persistencia, servicios Supabase ni módulos funcionales.

## Prioridad de plataformas

1. apps/mobile — experiencia principal del socio.
2. apps/web — panel administrativo (Etapa 3).
3. Portal web del socio — Etapa 6, dentro de apps/web, reutilizando servicios de packages/shared.

Para que el portal posterior no duplique lógica, toda regla de negocio, validación y acceso a datos se escribe en packages/shared desde el principio; las apps contienen solo UI, navegación y estado de pantalla (ADR-012).

## Límites de responsabilidad

| Ubicación              | Responsabilidad                                                        |
| ---------------------- | ---------------------------------------------------------------------- |
| apps/mobile            | Navegación Expo Router, UI nativa, accesibilidad y ciclo de vida móvil |
| apps/web               | App Router, UI DOM, panel administrativo y futuro portal del socio     |
| packages/shared        | Contratos Zod, tipos de dominio y puertos de servicios                 |
| packages/design-tokens | Valores visuales puros, sin dependencias de UI                         |
| packages/config        | Opciones TypeScript comunes                                            |
| supabase               | Futuras migraciones, RLS y seed local                                  |
| docs                   | Decisiones, alcance y comprobaciones                                   |

Las aplicaciones pueden importar paquetes; los paquetes no importan aplicaciones. Los tokens no dependen del dominio. Se consumen fuentes TypeScript directamente; Next transpila los paquetes de workspace y Metro resuelve el monorepo.

No se crea packages/ui: DOM y React Native tienen convenciones distintas. Se compartirán componentes solo si una necesidad real demuestra que compensa la abstracción.

## Servicios y modo demo

ClubService define el puerto inicial. createDemoClubService implementa lectura ficticia y valida la identidad del club solicitado. La factoría de modo acepta demo (también por defecto) y rechaza cualquier selección no implementada. No hay fallback productivo silencioso ni escritura aparente.

El ejemplo web consume el servicio; la entrada móvil usa exclusivamente la identidad demo estática. Las futuras pantallas consumirán servicios por feature y estados explícitos de carga, error y vacío. Evitar un servicio universal con decenas de responsabilidades.

Esta separación facilita incorporar un adaptador Supabase sin cambiar los componentes presentacionales. La autorización real debe ejecutarse con la sesión del usuario y RLS; ni este puerto ni el selector de modo autorizan operaciones.

## Backend previsto

Supabase Auth identifica personas. PostgreSQL almacena clubes, membresías, roles y datos por club. El cliente recibe únicamente la clave pública cuando corresponda; service_role nunca se expone a aplicaciones. Las operaciones privilegiadas se diseñarán y auditarán en servidor.

Importes futuros: unidades menores enteras + moneda. Instantes: timestamptz, con presentación en la zona del club. Estado administrativo y situación económica son dimensiones separadas.

## Herramientas

pnpm 12.17.0, Node 24 LTS y Turbo coordinan tareas. node-linker=hoisted favorece la compatibilidad con las herramientas nativas y rutas Windows; la resolución sigue fijada por pnpm-lock.yaml. No se activa un build nativo durante la instalación.

La CI comprueba formato, lint, tipos, tests, build web, coherencia Expo y exportación nativa. No publica ni despliega. El lockfile debe cambiar junto con sus manifests.

## Entorno local verificado (2026-11-05)

El desarrollo activo usa el clon local existente de Windows (ADR-015/016). Los paquetes internos se enlazan directamente; se retiraron inyección, deduplicación forzada, sincronización por typecheck y hoisting especial de workspaces. Se conservan nodeLinker: hoisted, versiones, override de Expo y build Webpack. Turbo funciona en disco local. El ejecutor SMB queda como referencia histórica.
