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
