# Pucará Digital

Plataforma del Club Pucará, desarrollada por Suplio. Monorepo oficial: https://github.com/valenurcullu/PucaraDigital.

## Estado

Fundaciones verificadas en disco local: aplicaciones Next.js y Expo con entradas demo navegables, contratos mínimos, tokens y herramientas de calidad. Todavía no hay autenticación, persistencia, cinco pestañas funcionales ni módulos deportivos.

Orden de plataformas: app nativa iOS/Android → panel administrativo web → portal web del socio, postergado. La Etapa 1 comienza con una propuesta visual para aprobación; el código conserva su paleta provisional bordó hasta aprobar el rediseño.

Para retomar el trabajo, leer [AGENTS.md](AGENTS.md) (Codex), [CLAUDE.md](CLAUDE.md) y [estado actual](docs/current-status.md). Ver [roadmap](docs/roadmap.md) y [verificaciones](docs/verification.md).

## Requisitos

- Node.js 24 LTS (mínimo 24.3; desarrollo: 24.16.0).
- pnpm 12.17.0. Instalar con `npm install --global pnpm@12.17.0` o usar `npx --yes pnpm@12.17.0 <comando>`.
- Git y un checkout en disco local. No usar el checkout antiguo de la carpeta de red para desarrollo.
- Para probar en dispositivo: Expo Go compatible con SDK 58 o development build; Android Studio para emulador y macOS/Xcode para simulador iOS.

## Desarrollo local

Desde la raíz que contiene este archivo y `pnpm-workspace.yaml`:

```sh
pnpm install --frozen-lockfile
pnpm dev:web
pnpm dev:mobile
```

En PowerShell, usar `pnpm.cmd` si la política de ejecución bloquea el lanzador `pnpm.ps1`. No hace falta cambiar esa política ni usar Git Bash.

Ejecutar las aplicaciones en terminales separadas. Web: http://localhost:3000. El demo no necesita variables de entorno. Los archivos `.env.example` documentan su selector público.

## Calidad

```sh
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --filter @pucara/mobile exec expo install --check
pnpm --filter @pucara/mobile export
```

`pnpm format` aplica Prettier. `build` compila la web; `export` genera bundles Android/iOS, sin producir binarios de tiendas ni sustituir pruebas en dispositivos. El registro de verificaciones diferencia resultados locales de CI remota.

## Organización

- `apps/mobile`: Expo Router, React Native, iOS y Android.
- `apps/web`: Next.js App Router, React, Tailwind; panel administrativo futuro.
- `packages/shared`: contratos Zod, roles y servicio demo intercambiable.
- `packages/design-tokens`: colores, escalas y movimiento compartidos.
- `packages/config`: configuración TypeScript.
- `supabase`: ubicación prevista para migraciones y seed, aún sin backend.
- `docs`: arquitectura, producto, propuestas, decisiones y evidencias.

Los datos demo son ficticios, de lectura y sin persistencia. Seleccionar modo real produce un error explícito hasta implementar su adaptador. La P tipográfica es un placeholder, no el escudo oficial.

## Paquetes compartidos y entorno anterior

Los workspaces locales se enlazan directamente: los cambios en contratos y tokens ya no requieren `typecheck` para copiar fuentes a las apps. Ejecutar los controles de calidad igualmente; reinstalar al cambiar manifests o dependencias.

Se mantiene `nodeLinker: hoisted` por compatibilidad con las herramientas nativas. Se retiraron los ajustes exclusivos de SMB, sin actualizar dependencias ([ADR-015 y ADR-016](docs/decisions.md)).

`scripts/windows-network.cmd` se conserva como referencia histórica. No es el ejecutor del clon local ni garantiza compatibilidad con SMB después de retirar la inyección de paquetes. El checkout de red queda fuera de esta sesión.

Ver [arquitectura](docs/architecture.md), [alcance](docs/product-requirements.md), [navegación](docs/navigation.md) y [diseño](docs/design-system.md).
