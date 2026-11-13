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
