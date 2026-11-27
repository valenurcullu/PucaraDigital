# Registro de verificaciones

Cada entrada indica qué se ejecutó, dónde y con qué resultado. Un bundle exportado o un build exitoso no equivale a una prueba en dispositivo ni a una revisión visual.

## 2026-11-04 — Etapa 0 (estabilización técnica)

**Entorno:** Windows 11, carpeta compartida SMB `\\navesserver\administracion\VALEN\IT\PucaraDigital\PucaraDigital`, Node 24.16.0, pnpm 12.17.0 (ejecutado vía `npx pnpm@12.17.0`; pnpm no está instalado globalmente en esta máquina), Git for Windows.

| Verificación                            | Comando                                                                        | Resultado                                                       |
| --------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| Instalación reproducible                | `pnpm install --frozen-lockfile`                                               | ✅ Lockfile al día, políticas de supply chain aprobadas         |
| Formato                                 | `pnpm format:check`                                                            | ✅ Todos los archivos cumplen Prettier                          |
| Lint                                    | `pnpm -r run lint`                                                             | ✅ 4 paquetes, sin errores ni advertencias                      |
| Tipos                                   | `pnpm -r run typecheck`                                                        | ✅ shared, design-tokens, mobile y web (`next typegen` + `tsc`) |
| Tests                                   | `vitest run` en packages/shared desde unidad temporal                          | ✅ 4/4                                                          |
| Compatibilidad Expo                     | `expo install --check` en apps/mobile                                          | ✅ Dependencies are up to date                                  |
| Build web                               | `pnpm build`                                                                   | ⏳ No ejecutado en esta etapa; pendiente en el clon local       |
| Export nativo                           | `pnpm --filter @pucara/mobile export`                                          | ⏳ No ejecutado en esta etapa; pendiente en el clon local       |
| Prueba en dispositivo / revisión visual | —                                                                              | ⏳ No realizada                                                 |
| Escaneo de secretos                     | Búsqueda de claves, tokens, JWT, `.env` y binarios en los archivos versionados | ✅ Sin coincidencias; solo `.env.example` con valores públicos  |

### Limitaciones de la carpeta compartida

- **Turborepo no funciona sobre SMB.** `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build` (que delegan en `turbo run`) fallan con `Discovery failed: bad pattern \\?\UNC\...`, incluso desde la unidad temporal del ejecutor. Por eso se usó `pnpm -r run <tarea>`.
- **Vitest no resuelve rutas UNC.** `pnpm -r run test` falla con `Root path does not exist`; funciona invocado desde una unidad mapeada con `pushd`.
- Los paquetes internos se copian (no se enlazan): los cambios en `packages/*` llegan a las apps después de `pnpm typecheck` o `pnpm install`.

### Configuración a revisar al trabajar desde un clon local

Verificar cada punto con la batería completa antes de retirarlo:

- `pnpm-workspace.yaml`: `injectWorkspacePackages: true`, `dedupeInjectedDeps: false` y `syncInjectedDepsAfterScripts` existen solo por SMB (ADR-011). En disco local deberían poder eliminarse para usar enlaces normales de workspace.
- `pnpm-workspace.yaml`: `hoistWorkspacePackages: false` — revisar junto con lo anterior.
- `nodeLinker: hoisted` — mantener: favorece la compatibilidad con Expo/Metro, no depende de SMB.
- `scripts/windows-network.cmd` y su sección en el README — retirar o marcar como heredado si ya no se usa la carpeta compartida.
- `AGENTS.md` ("Trabajar en esta raíz Git") y ADR-015 — actualizar con la nueva ubicación oficial.
- Confirmar que `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build` vía Turbo funcionan en local y ejecutar `export`.

### Correcciones aplicadas

- `.gitattributes`: faltaba un salto de línea; `*.woff2` quedaba como texto CRLF y `*.cmd` heredaba LF. Ahora `*.woff2 binary` y `*.cmd text eol=crlf` (comprobado con `git check-attr`).
- `README.md`: salto de línea final requerido por Prettier.
- `apps/web/postcss.config.mjs`: advertencia `import/no-anonymous-default-export`.
- Creación de este registro, enlazado desde el README.

## 2026-11-05 — Clon local y simplificación de pnpm

**Entorno:** `C:\Users\Nobody-GRD\Desktop\PucaraDigital`, Windows, Node 24.16.0, pnpm 12.17.0. Estado inicial limpio, rama main, HEAD `3014825db38b9523ee6f69df4bb1832c6dd474ae`. Origin oficial confirmado; `git ls-remote origin refs/heads/main` devolvió el mismo SHA. No se hizo pull, reset ni push.

pnpm no estaba instalado globalmente. Se reutilizó su instalación temporal 12.17.0 mediante un lanzador local al proceso que invoca pnpm.mjs con Node y está disponible en PATH para Turbo. El primer intento con el antiguo shim temporal falló antes de instalar; se corrigió el lanzador fuera del repositorio. No se cambió configuración global ni la política PowerShell. Reproducción habitual: instalar pnpm fijado o usar npx como indica README.

| Verificación                                             | Base 3014825                          | Tras simplificar                                                                                                        |
| -------------------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                         | Correcta, instalación nueva           | Correcta, lockfile actualizado solo para enlaces internos                                                               |
| `pnpm format` y `pnpm format:check`                      | Correctos, sin cambios de formato     | Correctos al cerrar el bloque                                                                                           |
| `pnpm exec turbo run lint typecheck test --force`        | 9 tareas correctas, 4/4 tests         | 9 tareas correctas, 4/4 tests, sin caché Turbo                                                                          |
| `pnpm build` / `pnpm build --force`                      | Correcto                              | Correcto, sin caché Turbo; Next/Webpack generó /, /experiencia y 404                                                    |
| `pnpm --filter @pucara/mobile exec expo install --check` | Dependencies are up to date           | Dependencies are up to date                                                                                             |
| `pnpm --filter @pucara/mobile export`                    | Android e iOS correctos               | Con `--clear`: ambos correctos, 33 assets y dos bundles Hermes                                                          |
| Resolución de paquetes                                   | Inyectados por configuración heredada | require.resolve + realpath desde ambas apps llega a packages/shared, design-tokens y config                             |
| Exportación real                                         | —                                     | metadata.json declara android e ios; ambos archivos de bundle existen                                                   |
| Navegador web                                            | —                                     | Chrome local, build de producción: / y /experiencia en 1440, 768, 390 y 320 px, sin overflow horizontal ni errores JS   |
| Navegación y accesibilidad web básica                    | —                                     | CTA hacia /experiencia, 5 destinos informativos, primer Tab enfoca “Saltar al contenido”; ruta inexistente devuelve 404 |
| Dispositivo nativo / lectores de pantalla                | No probado en esta sesión             | Pendiente, exportar no equivale a ejecutar en iOS/Android                                                               |
| CI remota                                                | No consultada                         | No se afirma CI verde ni se publica nada                                                                                |

El build conservó su caché interna de Next en la segunda ejecución; Turbo se forzó. Metro se ejecutó con caché limpia después del cambio de enlaces. Los bundles generados quedan ignorados por Git.

Avisos observados: ESLint 9 deprecado (deuda conocida ADR-008), conflicto NO_COLOR/FORCE_COLOR del entorno de ejecución y aviso de caché vacía al usar --clear. No bloquearon verificaciones. El aviso de Turbo por coverage inexistente se corrigió con outputs vacío (ADR-016). No se actualizó ESLint ni se ignoraron errores de compilación.

Se retiraron los cuatro ajustes exclusivos de SMB y se revisó el diff del lockfile: ninguna versión externa cambió. Las limitaciones UNC del registro anterior son históricas; no aplican a este clon. El diseño de producto y los archivos de apps/packages permanecen intactos.

## 2026-11-05 — Propuesta visual de Etapa 1

Artefactos de documentación: `docs/ux-ui-proposal.md` y `docs/design/etapa-1.html`. No se modificaron pantallas ni tokens de las aplicaciones.

- Paleta: cálculo de luminancia sRGB de diez pares documentados; texto principal, secundario, inverso y estados por encima de 4,5:1; borde de control sobre blanco 3,64:1.
- Chrome local: lámina en 1440, 390 y 320 px; seis wireframes presentes, enlaces de navegación y acceso Inicio → gimnasio correctos; controles de escala y gris actualizan su estado.
- Muestra de texto al 200 %: sin overflow horizontal de página ni de los seis contenedores tras corregir el reflujo de Inicio. Inspección automatizada de dimensiones; no equivale a una auditoría completa de accesibilidad.
- Revisión visual de capturas de la lámina; no se generaron capturas de una app nativa. No hay QR escaneable, datos reales, fuentes externas, API ni operaciones persistentes.
- Prettier y git diff --check correctos al cerrar. Los enlaces relativos de la documentación agregada se comprobaron.
- Pendiente: aprobación de dirección visual y aceptación nativa en dispositivos, incluyendo texto ampliado, VoiceOver/TalkBack y estados reales.

## 2026-11-05 — Revisión funcional UX v2 y tres direcciones HTML

**Base:** main, HEAD inicial 8d2e82f, limpio; origin oficial confirmado. Esta ejecución modifica documentación y HTML de revisión. Expo, Next.js, paquetes compartidos, manifests y lockfile no se modifican.

**Recorridos comprobados con Chrome local, en A/B/C:**

- Inicio muestra accesos a Reservas, Gimnasio y Cuenta Corriente y partidos de Primera de rugby/hockey con rival, condición, fecha y hora.
- Reserva de pádel: disponibilidad → resumen → rechazo de pago (sin confirmación) → aprobación simulada → detalle; modificación preservando el turno anterior hasta confirmar; cancelación con aviso y retiro de Agenda.
- Sin disponibilidad y conflicto concurrente simulado: mensajes claros y turno bloqueado en el escenario. Volver de una modificación no cambia la reserva original.
- Quinchos: solicitud pendiente → aprobación → pago cuando corresponde; aprobación directa con/sin pago; rechazo de solicitud. Solo confirmadas aparecen en Agenda.
- Yoga/Funcional: inscripción recurrente, proyección futura en Agenda y baja; inscripción de adulto y menor, comprobando que la baja del menor conserva la del adulto; cupo completo impide confirmar. No se incluye gimnasio como evento.
- Agenda diaria, semanal y mensual; escenarios social/deportista/familiar; entrenamiento/convocatoria con horario; combinación de partidos públicos/personales sin duplicar el mismo encuentro.
- Consulta de ambos partidos → deporte/fixture/resultados; estado vacío sin inventar marcadores.
- Selección de turno con teclado y conservación del foco al cambiar fecha. No constituye auditoría completa de accesibilidad.

**Presentación:** páginas individuales comprobadas en 1440, 390 y 320 px; sin overflow horizontal en Inicio, Club, Reservas, Actividad y Disponibilidad. Se corrigió un desborde en B. Capturas revisadas de Inicio/Club y del comparador; controles del comparador cambian la vista de los tres prototipos. Sin errores JS ni solicitudes HTTP durante los recorridos file://; no hay API, fuentes remotas, persistencia ni operaciones reales.

Contraste sRGB calculado para pares principales (A/B/C): blanco sobre acción roja 6,09 / 5,54 / 6,24; blanco sobre marino 15,28 / 16,94 / 13,13; texto secundario sobre canvas 5,41 / 5,64 / 5,23. Esto verifica esos pares, no certifica todos los estados ni el sistema completo.

Controles de cierre: sintaxis de review.js con node --check, Prettier, enlaces relativos y git diff --check. No se repiten build web ni export nativo porque no cambiaron sus entradas; se conserva la evidencia técnica anterior. No se probó capacidad para 300 concurrentes, permisos reales, dispositivos nativos, lectores de pantalla ni texto 200 % en esta v2.

Estado: arquitectura detallada y dirección visual pendientes de aprobación. La v1 permanece como antecedente no aprobado, con aviso y enlace a v2.

## 2026-11-12 — Auditoría y primer bloque nativo

**Entorno:** clon local Windows, main, base 94818b5 limpia; origin oficial confirmado. Sin fetch ni push. Node 24.16.0 y pnpm 12.17.0 mediante el lanzador temporal ya disponible; sin cambios globales, nuevas dependencias ni cambios de lockfile.

| Control                                         | Resultado real                                                                                                       |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| pnpm install --frozen-lockfile                  | Correcto; lockfile sin cambios                                                                                       |
| Prettier / format:check                         | Aplicado y comprobado al cerrar                                                                                      |
| pnpm exec turbo run lint typecheck test --force | 9 tareas correctas, sin caché Turbo; 9 tests en 2 archivos                                                           |
| pnpm build --force                              | Correcto: Next/Webpack, /, /experiencia y 404; repetido tras la separación final de fixtures                         |
| pnpm --filter @pucara/mobile export --clear     | Android/iOS exportados con Metro limpio                                                                              |
| pnpm --filter @pucara/mobile export             | Exportación final correcta tras ajustes de provider/fixtures; 33 assets y bundles Hermes Android 3,2 MB / iOS 3,3 MB |
| Expo dev --port 8081 --lan                      | Metro arrancado; manifiestos Android e iOS devuelven HTTP 200, SDK 58 y launchAsset                                  |
| Rutas generadas                                 | Cinco pestañas, módulos, reservas, partidos, novedades, redirect legado y not-found presentes                        |
| Dispositivos / emulador / rendimiento           | No probados; adb no disponible, ruta habitual de Android SDK ausente; Windows sin simulador iOS                      |
| Supabase / PostgreSQL / RLS                     | Diseño documentado, no ejecutado. CLI Supabase y Docker no encontrados en PATH; no se instalaron                     |
| CI remota / capacidad para 300 concurrentes     | No comprobadas                                                                                                       |

**Compatibilidad Expo:** el chequeo online devuelve “Found outdated dependencies”: recomienda expo 58.0.25, expo-router 58.0.31, expo-constants 58.0.16, expo-linking 58.0.17 y expo-status-bar 58.0.5. Se mantuvieron las versiones fijadas; no se declara ese chequeo aprobado. Una comprobación adicional offline indicó “Dependencies are up to date” junto con “Dependency validation is unreliable in offline-mode”: es información del SDK local, no reemplaza el resultado online ni prueba compatibilidad en dispositivo. Revisar esos cinco parches como mantenimiento acotado antes de la aceptación móvil.

**Cobertura real de tests:** cuatro tests previos y cinco nuevos que verifican fechas del club/fechas inválidas, inclusión de reservas confirmadas y participantes inscriptos en Agenda, baja de proyección sin datos inventados, próximos partidos de Primera, integridad de destinos de fixtures, duración demo de 90 minutos/precio en unidades menores y frontera demo con cancelación/lecturas independientes. No prueban transacciones, RLS ni interacción/renderizado nativo.

Se corrigió el setState síncrono redundante del efecto de carga señalado por ESLint: el reintento cambia a loading desde la acción. Limpieza del efecto cancela la lectura y evita publicar resultados obsoletos. Sin desactivar reglas. Se verifican tipos con las rutas generadas por Metro al cierre.

**Aceptación pendiente:** dispositivo Android e iOS, tamaños pequeños/grandes, orientación, texto 200 %, safe areas, retorno físico/gesto, enlaces profundos, VoiceOver/TalkBack, escenarios de error/reintento en pantalla y perfiles de rendimiento. La navegación está implementada y compilada; no se afirma interacción probada en hardware.

Los avisos NO_COLOR/FORCE_COLOR no impidieron la exportación. Artefactos dist/.expo/.next permanecen ignorados. Sin pagos, reservas persistidas, autenticación ni operaciones de créditos. Modificar/Cancelar e Inscribirme/Cancelar inscripción aparecen separados y deshabilitados, con explicación.

Cierre: format:check correcto; typecheck móvil volvió a ejecutarse después de generar las rutas. Manifiesto Android por IP LAN también HTTP 200 desde esta PC; no se comprobó firewall/conectividad desde un teléfono. Expo generó apps/mobile/.gitignore para excluir expo-env.d.ts; se conserva junto con las exclusiones de raíz. Lockfile y apps/web sin diff.

## 2026-11-13 — Rediseño táctil del primer bloque nativo

**Base:** main, 62857e7 limpio y sincronizado con la referencia local de origin/main. El usuario confirmó funcionamiento/navegación de la versión anterior en iPhone/Expo Go, pero no aprobó su UX/UI. Esta revisión implementa Inicio, Club, estilo de NativeTabs y componentes comunes en React Native; no crea HTML.

| Control                  | Resultado                                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Instalación congelada    | pnpm install --frozen-lockfile correcto después de fijar expo-symbols 58.0.5                                                   |
| Lint, TypeScript y tests | pnpm exec turbo run lint typecheck test --force: 9 tareas correctas; 9 tests existentes en 2 archivos                          |
| Build web                | pnpm build --force correcto; Next/Webpack mantiene /, /experiencia y 404                                                       |
| Export nativo            | pnpm --filter @pucara/mobile export --clear correcto para Android e iOS                                                        |
| Artefactos exportados    | 34 assets; bundles Hermes Android 3,4 MB e iOS 3,3 MB; MaterialSymbols_400Regular.ttf empaquetada (974 KB)                     |
| Expo CLI / Metro         | whoami devuelve suplio; Metro activo en 8081; manifiestos iOS/Android por LAN HTTP 200, username suplio y launchAsset presente |
| Formato / diff / enlaces | Prettier y verificaciones de cierre registrados al finalizar                                                                   |
| Datos y web              | packages/shared y apps/web sin modificaciones                                                                                  |

El lockfile agrega sólo expo-symbols 58.0.5 y @expo-google-fonts/material-symbols 0.4.53; no elimina ni actualiza versiones de paquetes anteriores. La instalación inicial encontró un bloqueo de archivos de Windows con Metro activo: se detuvo sólo ese servidor, se completó la instalación y se volvió a iniciar. No se modificaron credenciales.

**Expo install --check online:** conserva la advertencia preexistente de cinco parches recomendados: expo 58.0.25, expo-router 58.0.31, expo-constants 58.0.16, expo-linking 58.0.17 y expo-status-bar 58.0.5. No se declara este control aprobado ni se actualiza todo el stack. expo-symbols 58.0.5 satisface la recomendación online y el rango del SDK instalado.

**Contraste sRGB calculado:** texto/superficie 14,94; secundario/fondo 5,40; blanco/acción 6,09; blanco/acción presionada 8,31; secundario sobre marino 11,30; acción/superficie roja suave 5,32; texto de control deshabilitado 5,09; éxito/blanco 7,25; borde de control/blanco 3,24. Estos pares no equivalen a auditoría integral de accesibilidad.

**Alcance de las pruebas:** tests de contratos, modo demo, fechas y selectores existentes; no son tests de interacción visual. Exportar valida compilación e inclusión de símbolos, no renderizado nativo. No se agregaron tests que sólo repliquen estilos.

**Pendiente en hardware:** revisar nuevo Inicio/Club en iPhone y Android; CTAs, navegación y retorno; tamaños 320/390/430 puntos y tablet; texto ampliado 200 %, safe areas, orientación y VoiceOver/TalkBack. Las grillas tienen adaptación implementada por ancho/fontScale, pero no se afirma que esas combinaciones hayan sido probadas en dispositivos. No se midió rendimiento ni se declara una mejora de FPS.

Sin backend, pagos, autenticación productiva ni escrituras de reservas/créditos. Los CTAs abren módulos demo existentes. Este rediseño se guarda localmente, sin push autorizado.

Cierre: format:check y git diff --check correctos; enlaces relativos de la documentación comprobados. El bundle de desarrollo iOS servido por Metro devolvió HTTP 200 e incluye AppHeader y ReservationHub; esto valida entrega/compilación, no ejecución visual en el iPhone. Cambios de código guardados en b4d21bb y 1c75128. No se hizo push.

## 2026-11-13 — Cierre y respaldo autorizado en GitHub

- Rama main, árbol limpio al iniciar; tres commits pendientes (b4d21bb, 1c75128, e9aa184). Origin oficial confirmado. git fetch origin y conteo remoto/local: 0/3; sin divergencia.
- Revisión de los 18 archivos/versiones de esos commits: cambios del rediseño, manifiesto/lockfile y documentación. Búsqueda de patrones de claves privadas, tokens, JWT y credenciales literales sin hallazgos; sin rutas locales sensibles o artefactos generados en los commits. Se comprobaron exclusiones de .env, .expo, dist y .next. Es una revisión acotada, no una certificación de ausencia absoluta de secretos.
- Ejecutados de nuevo: pnpm install --frozen-lockfile, pnpm format:check y pnpm exec turbo run lint typecheck test --force. Todos correctos: 9 tareas, 9 tests en 2 archivos, sin caché Turbo.
- Build web y export Android/iOS ya estaban correctos sobre el mismo código del rediseño (entrada anterior). No se repitieron en este cierre: no cambió código ni dependencias. Sigue pendiente el aviso conocido de cinco parches Expo.
- Push normal origin main realizado hasta e9aa184 y SHA remoto comprobado; sin sobrescribir trabajo ajeno. Actualización documental de cierre enviada en un commit posterior del mismo respaldo autorizado.
- Metro del proyecto detenido; no se cerraron otras aplicaciones ni se borraron credenciales. Instrucciones para retomar en current-status.md.

## Hito 2 — 2026-11-20

- Base de partida comprobada en el clon de escritorio, rama main limpia, en af9f5b7 al igual que main en el remoto oficial.
- npx con Supabase CLI 3.2.0 respondió a la consulta de versión. El comando start se detuvo al buscar Docker o Podman. Quedan pendientes inicio, reset, Auth, JWT, PostgREST y pruebas contra PostgreSQL 17 en contenedor.
- La prueba aislada usó PostgreSQL 16.14 local con btree_gist. Ejecutó tres migraciones y seed desde cero, 40 comprobaciones SQL y tres ensayos con dos conexiones y contención observada. Pasaron los 43. Incluye permisos anónimos, usuarios de dos clubes, responsables, revocación, suspensión, alcances administrativos, reservas y créditos, exclusiones, atomicidad e idempotencia. Los ensayos concurrentes cubren una cancha disputada, dos solicitudes sobre el último crédito y reintentos de una cancelación. El clúster se detuvo y eliminó al finalizar.
- El entorno aislado proporciona la clave de auth.users, los roles y el contrato de auth.uid(). Las comprobaciones de privilegios cambian al rol de cliente en PostgreSQL. Este recorrido deja pendiente la verificación de tokens reales en la API. Tampoco mide capacidad para 300 usuarios.
- Instalación pnpm 12.17.0 con lockfile congelado completada. Turbo ejecutó lint, typecheck, nueve tests Vitest y build web con caché desactivada. Las diez tareas finalizaron correctamente. El hito no introduce cambios nativos ni dependencias de aplicación.

Comandos y requisitos del backend en la [guía de desarrollo local](../supabase/README.md).

Prettier aprobó el formato del repositorio. El workflow Backend SQL queda preparado para repetir la batería aislada y ejecutar la suite SQL tras un reset de Supabase local en GitHub Actions. La ejecución remota está pendiente.

## Consulta nativa de pádel — 2026-11-20

- Clon local sobre main desde 605b0c1. Instalación verificada con pnpm 12.17.0 y lockfile congelado.
- ESLint, TypeScript, Vitest y build Next.js correctos con Turbo sin caché. Pasaron 19 pruebas unitarias, incluidas 4 nuevas del lector y 6 del modelo de presentación móvil. Se comprobaron el rango de fechas del club, campos de la RPC, duración y precio con centavos, agrupación, carga, vacío, reintento y descarte de respuestas obsoletas.
- Expo exportó bundles Hermes para iOS y Android. El chequeo de compatibilidad en línea de Expo devolvió código 1 porque recomienda cinco parches de paquetes ya fijados (expo, expo-constants, expo-linking, expo-router y expo-status-bar). Se conservó el lockfile.
- Los tests móviles ejecutan el modelo de presentación en Vitest. Quedan pendientes la interacción en iPhone, VoiceOver, tamaños de texto y la integración Auth/PostgREST en el equipo con contenedores. Este bloque utilizó exclusivamente el lector de ejemplo y no ejecutó operaciones sobre PostgreSQL.

Para revisar en Expo Go, entrar por Inicio o Club, tocar **Ver turnos de pádel**, abrir un horario y cerrar su resumen. La segunda fecha de la demo permite revisar la pantalla vacía.

## Revisión táctil y regresiones nativas — 2026-11-20

- Punto de partida local 54aea3e. Se reprodujo con la versión instalada de Slot la pérdida del callback de estilo del Pressable al pasar por Link asChild. El resultado era un objeto vacío. La ruta de Pádel ya existía. RoutePressable preserva la composición de navegación y aplica fondo, borde y estado de presión sobre el control nativo.
- Instalación con lockfile congelado, Prettier, ESLint, TypeScript y build Next.js. Vitest pasó 38 casos (13 compartidos y 25 móviles). Las pruebas de interfaz renderizan componentes React con primitivas nativas y navegación sustituidas para observar acciones, y ejercitan la composición real de Radix Slot. Comprueban tres accesos a Pádel, selección/resumen/regreso, destinos secundarios, calendario, carga, error, reintento y controles ocupados o deshabilitados.
- Se calculó contraste con luminancia relativa para texto normal y presionado, estados y etiquetas. Blanco sobre rojo primario da 6,09:1. Texto secundario sobre el fondo deshabilitado da 5,09:1. Las pruebas exigen al menos 4,5:1 para los pares de texto cubiertos y 3:1 para el borde de control sobre blanco.
- Expo generó los bundles iOS y Android. Expo install --check en línea sigue devolviendo código 1 por cinco parches recomendados en el stack fijado. Metro sirvió el manifiesto del proyecto y el bundle iOS con HTTP 200 en la LAN.
- La revisión física queda pendiente. Probar en iPhone el último control de las cinco pestañas, volver con gesto y botón, cerrar el resumen con la misma fecha seleccionada y recorrer Agenda con VoiceOver y texto al 200 %. En Android comprobar el regreso del sistema y TalkBack. No se midieron FPS ni latencia.

## 2026-11-24 — Inicio 2a, Club y Pádel 1c

Clon del escritorio de Windows, rama `main`, base publicada `30160b0`. Se revisaron el README, los prototipos y las 26 referencias de Claude Design.

- La instalación offline con el lockfile congelado pasó. Expo Font ya estaba resuelto en el monorepo. Se declaró directamente para empaquetar Barlow Condensed con su licencia OFL.
- Prettier, ESLint y TypeScript pasan. Vitest ejecutó 39 pruebas, 26 móviles y 13 compartidas. Incluyen accesos desde Inicio y Club, el contrato de disponibilidad, reintento, conservación de Agenda, modificación del mismo turno y cancelación elegible única en la sesión.
- Pasaron el build de Next.js y la exportación Hermes para iOS y Android. El build web se ejecutó después de TypeScript para que ambos procesos no regeneren `.next/types` a la vez. Metro sirvió el manifiesto del proyecto y el bundle iOS a través de la red local.
- `expo install --check` devolvió código 1. El catálogo del SDK 58 recomienda parches para Expo, Constants, Font, Linking, Router y Status Bar. Se conservó el conjunto fijado. Conviene validar los seis parches juntos en un bloque de mantenimiento.
- La comparación usa los componentes de producción con React Native Web en una herramienta temporal, iconos Material, fuentes locales y un viewport de 390 × 804. Se recorrieron selección, consulta de créditos, pago simulado con y sin crédito, gestión, modificación, cancelación y recuperación desde un día completo. Se comprobó el ancho del documento a 320 px. [Comparación de pantallas](design/verification/2026-11-24-pantallas.jpg) · [Comparación de hojas](design/verification/2026-11-24-hojas.jpg).
- La altura de la cabecera y el texto de las fichas varían con el contenido de la sesión y las métricas del sistema. El render de comparación omite las barras de navegación de iOS y Android. Queda probar su aspecto, safe areas, VoiceOver/TalkBack, gesto de regreso y texto ampliado en dispositivo. No se midieron tiempos de cuadro.

## 2026-11-24 — Modificación dentro de la hoja de Pádel

- Windows, clon del escritorio. Instalación offline con lockfile congelado, ESLint, TypeScript, 41 pruebas de Vitest (28 móviles y 13 compartidas), build de Next.js y exportaciones Hermes de Expo para iOS y Android correctos.
- Prueba interactiva con React Native Web y Chromium usando los componentes y el proveedor de sesión de la app. Se comprobó la identidad de la hoja al pasar de detalle a edición, la exclusión del turno ocupado, la limpieza del horario al cambiar el día, la recuperación desde un día completo y el descarte al volver, cerrar o deslizar el tirador. Confirmar conservó cantidad, ID, modalidad de pago y créditos, y cambió el horario en la proyección que consume Agenda. Abandonar la cancelación conservó el turno; aceptar la cancelación elegible lo quitó de Agenda y devolvió un crédito demo.
- En un viewport de 320 × 568 con un inset inferior simulado de 34 px, el formulario tuvo scroll interno y el botón fijo de confirmación quedó dentro del área útil. La revisión física de safe areas, gesto y VoiceOver en iOS queda pendiente.
- Prettier y el control de diferencias de Git forman parte del cierre. El catálogo de Expo SDK 58 continúa recomendando seis parches en `expo install --check`. Se conservaron las dependencias fijadas.

## 2026-11-24 — Agenda 1f, Carnet y Cuenta

Se compararon las referencias iOS 08, 09, 10, 10b y 10c y las variantes Android A08/A09 con las pantallas del bloque. La marca P ocupa el lugar del escudo oficial pendiente. El perfil del titular ofrece consulta. La sesión demo carece de autenticación y conserva los cambios de preferencias en memoria. [Comparación visual](design/verification/2026-11-24-agenda-carnet-cuenta.jpg).

- Instalación offline con lockfile congelado, Prettier, ESLint, TypeScript y 51 pruebas de Vitest (35 móviles, 16 compartidas). Los tests comprueban las cinco pestañas, los vínculos y ámbitos, el estado de cuotas y becas, filtros y movimientos de reservas.
- Build de Next.js y exportación Hermes del cliente para iOS y Android. Expo SDK 58 continúa recomendando seis parches en `expo install --check`. Se conservaron las versiones del monorepo.
- React Native Web y Chromium con los componentes reales y un adaptador temporal de navegación. Se probaron los siete días a 390 px, Hoy, cambio de semana, detalle de evento, filtros de persona, tres carnets, perfil de menor → Carnet / Agenda, cuotas, movimiento de pago y preferencias. La creación, modificación y cancelación de Pádel se reflejaron en Agenda en la misma sesión.
- A 320 px y con una simulación de texto al 180 %, se comprobó el acceso al último contenido de las tres pestañas y al carnet del menor. Las capturas omiten la barra de pestañas y el encabezado del stack que dibuja el sistema. Safe areas físicas, VoiceOver/TalkBack, gesto de regreso y transiciones nativas quedan para la prueba en dispositivo.

## 2026-11-27 — Gimnasio, Yoga y Funcional

Base local `a230ff5` en `main`. Se revisaron AGENTS, CLAUDE, estado, arquitectura, README del handoff, prototipos y capturas 11, 11b y 12. Se aplicaron las referencias con componentes nativos y datos tipados de sesión.

- Instalación offline con lockfile congelado. ESLint, TypeScript y 59 pruebas (37 móviles, 22 compartidas), build de Next.js y exportación Hermes iOS/Android correctos.
- Pruebas unitarias de cargas y repeticiones, series completas, métricas, guardado, último peso, registros de solo lectura, historial por persona y exclusión de gimnasio en Agenda. Inscripción/baja de Yoga y Funcional con cupos, rechazo de duplicados, persona ajena o vínculo revocado, conservación de clases pasadas y reinscripción sin clases duplicadas.
- Prueba interactiva con React Native Web y Chromium, componentes y proveedor reales, navegación temporal de prueba. Se recorrieron ambos días, registro y cambio de peso, serie completa, salida/reanudación, guardado e historial. Para Sofía, se verificó inscripción a Yoga → Agenda propia → baja. Para el titular, baja y reinscripción de Funcional. Se comprobó la ausencia de registros del titular en el historial de un familiar.
- A 320 px y texto ampliado simulado al 180 %, los campos de la tabla y el contenido final fueron accesibles mediante scroll, sin desborde horizontal del documento. Safe areas físicas, teclado de iPhone, VoiceOver/TalkBack y transiciones quedan para el dispositivo. [Comparación de componentes](design/verification/2026-11-27-gimnasio-actividades.jpg).
- `expo install --check` informa seis versiones recomendadas por el catálogo SDK 58, incluida Expo ~58.1.0 y Router ~58.0.33. Se conservaron las dependencias fijadas.

## 2026-11-27 — Cierre comercial de series y actividades

Base `9b6dff3`. Se conservan las referencias 11, 11b y 12 con los ajustes de interacción solicitados por el usuario. Eliminar opera por serie, Deshacer recupera la última eliminación, la carga es opcional y la marca masiva conserva los valores sugeridos sin convertirlos en registros reales. Se retiraron las visualizaciones de progreso y volumen del jugador.

- Prettier, ESLint, TypeScript y 65 pruebas de Vitest (37 móviles y 28 compartidas). Los casos nuevos cubren agregar tras eliminar todas las series, restaurar posición y valores una sola vez, interruptor sin pérdida de cargas, completar sin kilos, marca masiva sin datos inventados, desmarcar y aislamiento de registros finalizados o de otros perfiles.
- Instalación con lockfile congelado, build de Next.js, exportaciones de Expo para iOS, Android y web. Para comprobar el build de navegador se incorporaron las dependencias necesarias `react-native-web` 0.21.4 y `react-dom` 19.3.0. Las versiones previas del stack se conservaron. La primera instalación encontró un bloqueo de archivos de Metro en Windows y se completó al detener el servidor de desarrollo.
- Prueba interactiva en Chromium con los componentes y el proveedor de sesión. Se verificaron deslizamientos con mouse y toque, menú accesible, eliminación, Deshacer después de navegar, pesos opcionales, marca masiva, desmarcar, finalización, historial e identidades. Yoga y Funcional conservaron su relación con Agenda y los cupos.
- Se sirvió la exportación real de Expo web desde un servidor temporal local. Se verificaron la entrada por URL a Gimnasio, cargas, marca masiva, eliminación y restauración, peso opcional, guardado e historial. En una entrada a Actividades, la inscripción de Sofía abrió su Agenda con Yoga. El SDK mantiene las pantallas de las otras pestañas montadas.
- La barra de pestañas web del SDK se dibuja arriba y se superpone parcialmente con la cabecera en 390 px. Es un pendiente de presentación para la demo pública, fuera del registro de series. El artefacto de navegador queda en `apps/mobile/dist/web`. Requiere hosting con fallback SPA, una URL HTTPS y la posterior generación del QR público.
- Se comprobó scroll y acceso a campos en 320 px con texto ampliado simulado al 180 %. El teclado, el gesto de iPhone, VoiceOver y Safari físico quedan pendientes. Los datos son de sesión y se reinician al recargar.

- Metro reiniciado y manifiesto y bundle iOS verificados en LAN, con HTTP 200. El QR de Expo Go sigue siendo local. expo install --check mantiene seis recomendaciones del stack anterior. La publicación pública queda pendiente de autorización.

## 2026-11-27 — Fixture deportivo por divisiones

Base local `9465886`. Revisión de las reglas del repositorio, estado, arquitectura y referencia 14 del handoff de Claude. Se conservaron el segmentado, las tarjetas y las hojas existentes.

- Catálogo tipado con 23 divisiones de Rugby y 31 de Hockey, jornadas, sedes y resultados ficticios. Los partidos son la única fuente de fechas y rivales para Inicio y fixture. Las divisiones destacadas se configuran mediante `featuredDivisionId`; Hockey usa inicialmente Primera de Línea A.
- Prettier, ESLint, TypeScript y 77 pruebas de Vitest (41 móviles y 36 compartidas). Los casos nuevos cubren catálogo, cambios de deporte/grupo/línea/división, ampliación del catálogo sin rutas nuevas, próximas fechas, resultados con perspectiva local/visitante, exclusión de marcadores infantiles y consistencia de los destacados.
- Pruebas específicas de jornadas de Hockey con sedes diferentes entre líneas y con un partido trasladado dentro de la misma jornada. La consulta mantiene la sede de cada partido y no mezcla líneas aunque compartan un identificador de jornada mal configurado.
- Build de Next.js y exportaciones de Expo para iOS, Android y web. Se mantuvieron las dependencias y el módulo de Pádel.
- Prueba interactiva del artefacto real de Expo web en Chromium. Inicio y Club abrieron el mismo fixture, los filtros y las divisiones vacías funcionaron, Ver fixture completo amplió el calendario y las hojas reunieron los siete horarios de las líneas A y B con sus respectivas sedes. Cerrar mantuvo el filtro anterior. El regreso del navegador volvió a Inicio o Club según el acceso. También se probó un enlace directo a Línea C/Novena y el ancho de 320 px.
- Los filtros usan el catálogo; agregar o quitar divisiones cambia las opciones disponibles sin crear pantallas. La estructura de Hockey, rivales, fechas y marcadores son datos de ejemplo pendientes de información oficial. No hay nombres ni registros personales de menores en el fixture.
- La prueba física de navegación, gestos, VoiceOver/TalkBack y Safari queda pendiente.

- La instalación con lockfile congelado pasó. Metro sirvió el bundle iOS por LAN con HTTP 200. expo install --check sigue informando seis versiones recomendadas del stack previo, sin cambios de dependencias en este bloque.
