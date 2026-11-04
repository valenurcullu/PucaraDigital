# Pucará Digital

Plataforma del Club Pucará, desarrollada por Suplio. Monorepo oficial: https://github.com/valenurcullu/PucaraDigital.

## Estado

Sprint 1, bloque de fundaciones: monorepo, entradas web/nativa navegables, contratos y datos demo mínimos, tokens visuales y herramientas de calidad. Las pantallas funcionales del socio, administración y migraciones SQL se desarrollan en los siguientes bloques. No hay autenticación ni conexión productiva.

## Requisitos

- Node.js 24 LTS (mínimo 24.3; desarrollo: 24.16.0).
- pnpm 12.17.0: instalar con `npm install --global pnpm@12.17.0`.
- Git; en Windows sobre carpetas de red, Git for Windows con Git Bash.
- Expo Go compatible con SDK 58 o un development build; Android Studio para emulador y macOS/Xcode para simulador iOS.

## Desarrollo

Desde la raíz que contiene este archivo y `pnpm-workspace.yaml`, en una carpeta local:

```sh
pnpm install --frozen-lockfile
pnpm dev:web
pnpm dev:mobile
```

En **esta carpeta compartida de Windows**, usar el ejecutor incluido:

```bat
scripts\windows-network.cmd install --frozen-lockfile
scripts\windows-network.cmd dev:web
scripts\windows-network.cmd dev:mobile
```

Ejecutar las dos aplicaciones en terminales separadas. Web: http://localhost:3000. No se necesitan variables de entorno para demo. Los archivos `.env.example` de cada app documentan su selector público.

El ejecutor verifica la raíz, usa una unidad temporal, ejecuta scripts mediante Git Bash y mantiene la caché en `%TEMP%\pucara-pnpm-store`. No mueve ni copia el checkout, no modifica configuración global y conserva un `pnpm_config_store_dir` definido por el usuario. Puede usarse para cualquier comando de pnpm, por ejemplo `scripts\windows-network.cmd lint`.

## Calidad

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm format:check
pnpm build
pnpm --filter @pucara/mobile exec expo install --check
pnpm --filter @pucara/mobile export
```

En esta unidad de red reemplazar `pnpm` por `scripts\windows-network.cmd`.

`build` compila la web. `export` genera bundles Android/iOS; no produce binarios para tiendas ni reemplaza pruebas en dispositivos. Ver [registro de verificaciones](docs/verification.md).

## Organización

- `apps/web`: Next.js App Router, React, Tailwind.
- `apps/mobile`: Expo Router, React Native, iOS y Android.
- `packages/shared`: contratos Zod, roles y servicio demo intercambiable.
- `packages/design-tokens`: colores, escalas y movimiento compartidos.
- `packages/config`: configuración TypeScript.
- `supabase`: ubicación prevista para migraciones y seed versionados.
- `docs`: arquitectura, producto, navegación, diseño y decisiones.

Los ejemplos son ficticios, de solo lectura y sin persistencia. Seleccionar modo real produce un error explícito hasta implementar su adaptador. La P tipográfica es un placeholder, no el escudo oficial.

## Cambios compartidos

Los paquetes internos se instalan como dependencias inyectadas para evitar junctions incompatibles con SMB. Después de editar contratos o tokens, ejecutar `pnpm typecheck`: pnpm sincroniza sus fuentes y valida a los consumidores. Al modificar la configuración compartida o crear paquetes, ejecutar nuevamente `pnpm install`. Las pantallas de cada app conservan su recarga habitual.

Ver [arquitectura](docs/architecture.md), [alcance](docs/product-requirements.md) y [roadmap](docs/roadmap.md).