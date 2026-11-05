# Estado actual de Pucará Digital

Actualizado: **2026-11-05**. Fuente de verdad para retomar entre Codex, Claude Code y personas; leer junto con [AGENTS.md](../AGENTS.md). Alcance y reglas completos permanecen en los documentos enlazados, no se duplican aquí.

## Repositorio y último hito

- Clon activo verificado: `C:\Users\Nobody-GRD\Desktop\PucaraDigital`. Trabajar desde la raíz Git del clon local; no desde el checkout SMB anterior.
- Rama main. Inicio de esta revisión: `3014825`, coincidente con origin/main consultado en GitHub. Origin oficial: https://github.com/valenurcullu/PucaraDigital.git.
- Último hito técnico: **fundaciones verificadas en disco local y ajustes SMB retirados**, commit `3de932d`. Ver [ADR-016](decisions.md) y [evidencia](verification.md).
- No se realizó push en esta revisión. La CI remota no fue consultada; no confundir controles locales correctos con un workflow remoto verde.
- Para conocer el último commit exacto y cambios de otro agente, ejecutar git status y git log antes de trabajar; este documento no sustituye esa inspección.

## Implementado y comprobado

| Área     | Estado real                                                                                                                              |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Monorepo | pnpm 12.17.0/Turbo; Expo y Next; paquetes TS compartidos enlazados directamente en disco local                                           |
| Web      | Entrada editorial /, vista informativa /experiencia, 404 y error boundary; no panel administrativo                                       |
| Móvil    | Dos rutas de stack: entrada y /experiencia; no cinco pestañas implementadas                                                              |
| Datos    | Contrato de club, roles, servicio demo de lectura y guardia de modo; 4 tests                                                             |
| Visual   | Tokens bordó y placeholder P siguen en código; identidad roja/marina/blanca aprobada como orientación provisional                        |
| Backend  | Solo documentación y carpetas previstas; sin migraciones SQL, Auth, RLS ni persistencia                                                  |
| Calidad  | Instalación congelada, Prettier, lint, tipos, tests, build web, Expo check y export Android/iOS correctos antes y después de simplificar |
| Límites  | Sin prueba nativa en dispositivo, VoiceOver/TalkBack ni validación de credenciales reales                                                |

Último hito de diseño: propuesta v1 documentada y revisada en navegador, pendiente de aprobación. Las aplicaciones no fueron rediseñadas.

El estado de aprobación visual y sus criterios se registra en [sistema de diseño](design-system.md); la estructura de cinco pestañas ya está acordada en [navegación](navigation.md). Las carpetas y wireframes no equivalen a módulos funcionales.

## Próximos pasos, en orden

1. Revisar y aprobar la [propuesta visual v1](ux-ui-proposal.md) y la [lámina con seis wireframes](design/etapa-1.html), ya preparadas: paleta concreta, tipografía, densidad y jerarquía.
2. Tras aprobación, implementar tokens semánticos y componentes nativos base; shell de cinco pestañas e Inicio demo como referencia.
3. Revisar capturas iOS/Android, tamaños chico/grande, texto 200 %, contraste y lectores de pantalla antes de extender el diseño.
4. Continuar según [roadmap](roadmap.md). Supabase, autenticación y módulos completos quedan fuera de esta revisión; no adelantarlos por completar los controles técnicos.

Deportes es prioritario en 2026. Orden de plataformas: móvil, administración web, portal web del socio posterior.

## Decisiones pendientes

- Aprobación de la propuesta visual concreta. No reemplazar los tokens actuales ni construir todas las pantallas sin esa aprobación.
- Confirmación del escudo y recursos oficiales; el archivo mencionado en la auditoría no fue aprobado como oficial.
- Política de validación del carnet, funcionamiento sin conexión y dispositivos del club.
- Pruebas nativas y CI remota verificable.
- Datos y permisos necesarios para etapas posteriores: padrón, onboarding, visibilidad por roles/equipos, proyecto Supabase, identificadores/cuentas de tiendas y privacidad de menores/wellness. Detalle en [requerimientos](product-requirements.md).

## Cómo continuar sin historial de chat

Leer este estado, [arquitectura](architecture.md), [roadmap](roadmap.md), [decisiones](decisions.md) y [verificaciones](verification.md). Usar los comandos del [README](../README.md). Registrar el alcance implementado, controles ejecutados y pendientes al cerrar cada bloque; conservar evidencia histórica y hacer commits pequeños. No hacer push sin autorización explícita.
