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
