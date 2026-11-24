# Arquitectura

## Alcance actual

Cinco pestañas nativas con Inicio, Agenda familiar, Carnet, Club y Cuenta en demostración. Un repositorio y lockfile. Next conserva sus fundaciones. El backend local de desarrollo cuenta con migraciones, RLS y transacciones de pádel. Su integración con las apps queda pendiente.

El lector de sesión devuelve la membresía del titular, los vínculos familiares de ejemplo y los datos económicos por separado. Agenda proyecta reservas e inscripciones de esa sesión; los compromisos de cada menor pertenecen a su vínculo. El selector de persona cambia la vista, sin cambiar el actor. Los ámbitos de demostración sirven a la presentación. El backend debe validar la autorización en cada lectura y escritura real.

## Prioridad de plataformas

1. apps/mobile — experiencia principal del socio.
2. apps/web — panel administrativo (Etapa 3).
3. Portal web del socio — Etapa 6, dentro de apps/web, reutilizando servicios de packages/shared.

Para que el portal posterior no duplique lógica, contratos, validaciones de entrada, selectores y adaptadores se comparten en packages/shared. La integridad de reservas/créditos y los permisos se ejecutan en PostgreSQL, no sólo en TypeScript (ADR-018 precisa ADR-012).

## Límites de responsabilidad

| Ubicación              | Responsabilidad                                                        |
| ---------------------- | ---------------------------------------------------------------------- |
| apps/mobile            | Navegación Expo Router, UI nativa, accesibilidad y ciclo de vida móvil |
| apps/web               | App Router, UI DOM, panel administrativo y futuro portal del socio     |
| packages/shared        | Contratos Zod, tipos de dominio y puertos de servicios                 |
| packages/design-tokens | Valores visuales puros, sin dependencias de UI                         |
| packages/config        | Opciones TypeScript comunes                                            |
| supabase               | Migraciones PostgreSQL, RLS, RPC, pruebas y seed local                 |
| docs                   | Decisiones, alcance y comprobaciones                                   |

Las aplicaciones pueden importar paquetes; los paquetes no importan aplicaciones. Los tokens no dependen del dominio. Se consumen fuentes TypeScript directamente; Next transpila los paquetes de workspace y Metro resuelve el monorepo.

No se crea packages/ui: DOM y React Native tienen convenciones distintas. Se compartirán componentes solo si una necesidad real demuestra que compensa la abstracción.

## Servicios y modo demo

ClubService define el puerto inicial. createDemoClubService implementa lectura ficticia y valida la identidad del club solicitado. La factoría de modo acepta demo (también por defecto) y rechaza cualquier selección no implementada. No hay fallback productivo silencioso ni escritura aparente.

El ejemplo web conserva ClubService. Móvil consume MemberExperienceReader: lectura única compartida de fixtures tipados, con cancelación al desmontar/reintentar y estados explícitos de carga/error/ready. Los selectores derivan Agenda y próximos partidos. No existen métodos de escritura; separar contratos y fixtures. Los futuros adaptadores reales serán por feature, no un servicio universal.

Esta separación facilita incorporar un adaptador Supabase sin cambiar los componentes presentacionales. La autorización real debe ejecutarse con la sesión del usuario y RLS; ni este puerto ni el selector de modo autorizan operaciones.

## Backend

Supabase Auth identifica personas. PostgreSQL almacena clubes, membresías, roles y datos por club. El cliente recibe únicamente la clave pública cuando corresponda; service_role nunca se expone a aplicaciones. Los comandos SQL de pádel verifican el actor autenticado y registran cada operación confirmada en la misma transacción. Ver [modelo y permisos](database.md).

Importes futuros: unidades menores enteras + moneda. Instantes: timestamptz, con presentación en la zona del club. Estado administrativo y situación económica son dimensiones separadas.

## Herramientas

pnpm 12.17.0, Node 24 LTS y Turbo coordinan tareas. node-linker=hoisted favorece la compatibilidad con las herramientas nativas y rutas Windows; la resolución sigue fijada por pnpm-lock.yaml. No se activa un build nativo durante la instalación.

La CI comprueba formato, lint, tipos, tests, build web, coherencia Expo y exportación nativa. No publica ni despliega. El lockfile debe cambiar junto con sus manifests.

## Entorno local verificado (2026-11-05)

El desarrollo activo usa el clon local existente de Windows (ADR-015/016). Los paquetes internos se enlazan directamente; se retiraron inyección, deduplicación forzada, sincronización por typecheck y hoisting especial de workspaces. Se conservan nodeLinker: hoisted, versiones, override de Expo y build Webpack. Turbo funciona en disco local. El ejecutor SMB queda como referencia histórica.

## Implicaciones de la revisión funcional v2 (sin implementación)

La [revisión funcional](ux-functional-review.md) confirma Google o email OTP como métodos futuros de acceso. Autenticarse no crea por sí mismo un socio administrativo ni concede autorización. Cuenta, registro de socio y vínculo de responsabilidad sobre menores deben ser conceptos separados; puede haber socios sin login y varios responsables autorizados para un mismo menor. Verificación, alcance de permisos y revocación quedan pendientes.

Agenda personal se derivará de eventos con horario, reservas confirmadas y participación activa en actividades recurrentes; no de rutinas de gimnasio libre. La baja retira proyecciones futuras personales sin eliminar clases globales ni historial de asistencia. La estrategia de generación y horizonte temporal se decidirán al diseñar persistencia.

Las reservas requerirán control atómico de disponibilidad, estados separados de pago/aprobación y operaciones idempotentes en servidor. Son requisitos futuros, no capacidades del HTML. Los 2.500 socios y 300 concurrentes previstos exigen definir mezcla de carga, objetivos de latencia y pruebas antes de afirmar capacidad.

Los prototipos viven únicamente en docs/design, comparten un motor de escenarios en memoria y no importan código ni tokens de las aplicaciones. ADR-018 levanta el bloqueo histórico: A es la referencia provisional del primer bloque nativo.

## Auditoría — 2026-11-12

Se conserva Expo/React Native, Next.js y Supabase/PostgreSQL. [database.md](database.md) define identidad separada, RLS por club, exclusiones, comandos atómicos/idempotentes e historial de créditos. El siguiente bloque usa Supabase local con datos ficticios, sin infraestructura adicional anticipada. El demo actual sólo proporciona lectura; no es un backend transaccional ni simula autorización real.

## Navegación del primer bloque

Expo Router NativeTabs (SDK 58) para cinco pestañas; Stack nativo para módulos, partido, comunicación y reserva. Un provider encima mantiene la lectura demo entre pestañas; no hay store ni biblioteca de consultas adicional. Tokens nativos separados de los heredados web; componentes por plataforma. Las fechas se presentan en la zona del club, no en la del host.

Referencia: [Native tabs de Expo](https://docs.expo.dev/router/advanced/native-tabs/). Los recorridos y límites de validación constan en [navegación](navigation.md).
