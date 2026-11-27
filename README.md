# Pucará Digital

Plataforma del Club Pucará, desarrollada por Suplio. Monorepo oficial: https://github.com/valenurcullu/PucaraDigital.

## Estado

Inicio, Club, la barra de cinco pestañas y Pádel implementan el diseño aprobado en `30160b0`. Desde **Reservar pádel** se eligen día y horario en la única cancha del club. La app permite ensayar pago, crédito, modificación y cancelación. Desde Mis reservas, **Modificar** permite elegir y confirmar otro turno dentro de la misma hoja. Los cambios actualizan Mis reservas y Agenda durante la sesión y se descartan al reiniciar. El diseño y el alcance por plataforma están en el [sistema visual](docs/design-system.md).

Agenda 1f, Carnet y Cuenta comparten los perfiles ficticios de Martín, Sofía y Tomás. Desde el perfil de un menor se puede abrir su agenda o presentar su carnet de ejemplo. Cuenta reúne cuotas, movimientos de pago, becas y preferencias de esta sesión. Los QR contienen únicamente texto demo.

Gimnasio permite seguir una rutina asignada, registrar series y consultar el historial por persona. Yoga y Funcional permiten inscribirse o cancelar con actualización de cupos y Agenda. Los borradores y registros se conservan durante la sesión demo.

El backend de desarrollo conserva identidad, autorización y comandos de pádel en PostgreSQL. La app móvil usa datos ficticios. [Guía del backend local](supabase/README.md).

Para retomar el trabajo, leer [AGENTS.md](AGENTS.md) (Codex), [CLAUDE.md](CLAUDE.md) y [estado actual](docs/current-status.md). Ver [roadmap](docs/roadmap.md) y [verificaciones](docs/verification.md).

## Requisitos

- Node.js 24 LTS (mínimo 24.3; desarrollo: 24.16.0).
- pnpm 12.17.0. Instalar con `npm install --global pnpm@12.17.0` o usar `npx --yes pnpm@12.17.0 <comando>`.
- Git y un checkout en disco local. No usar el checkout antiguo de la carpeta de red para desarrollo.
- Para probar en dispositivo: Expo Go compatible con el SDK 58 fijado o development build; Android Studio para emulador y macOS/Xcode para simulador iOS.

## Desarrollo local

Desde la raíz que contiene este archivo y `pnpm-workspace.yaml`:

```sh
pnpm install --frozen-lockfile
pnpm dev:web
pnpm dev:mobile
```

En PowerShell, usar `pnpm.cmd` si la política de ejecución bloquea el lanzador `pnpm.ps1`. No hace falta cambiar esa política ni usar Git Bash.

Al ejecutar pnpm dev:mobile, escanear el QR de Metro desde Expo Go compatible, con teléfono y PC en la misma red. La app abre Inicio; probar las cinco pestañas y los detalles. Para Android emulado usar a; para simulador iOS usar i desde macOS. Windows no ejecuta el simulador iOS. No se necesita Supabase para esta demostración. Si el cliente instalado no soporta el SDK fijado, preparar un development build compatible en un bloque específico.

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
- `packages/shared`: contratos, roles, selectores, fixtures tipados y lectores demo; integridad de pádel en PostgreSQL.
- `packages/design-tokens`: colores, escalas y movimiento compartidos.
- `packages/config`: configuración TypeScript.
- `supabase`: configuración del CLI, migraciones, seed sintético y pruebas SQL y concurrentes.
- `docs`: arquitectura, producto, propuestas, decisiones y evidencias.

Los datos demo son ficticios, de lectura y sin persistencia; fechas relativas al día del club al abrir la sesión. Modificar/Cancelar e Inscribirme/Cancelar inscripción están deshabilitados con explicación; el Carnet contiene un espacio QR textual no escaneable. Seleccionar modo real produce un error explícito hasta implementar su adaptador. La P tipográfica es un placeholder, no el escudo oficial.

## Paquetes compartidos y entorno anterior

Los workspaces locales se enlazan directamente: los cambios en contratos y tokens ya no requieren `typecheck` para copiar fuentes a las apps. Ejecutar los controles de calidad igualmente; reinstalar al cambiar manifests o dependencias.

Se mantiene `nodeLinker: hoisted` por compatibilidad con las herramientas nativas. Se retiraron los ajustes exclusivos de SMB, sin actualizar dependencias ([ADR-015 y ADR-016](docs/decisions.md)).

`scripts/windows-network.cmd` se conserva como referencia histórica. No es el ejecutor del clon local ni garantiza compatibilidad con SMB después de retirar la inyección de paquetes. El checkout de red queda fuera de esta sesión.

Ver [arquitectura](docs/architecture.md), [alcance](docs/product-requirements.md), [navegación](docs/navigation.md) y [diseño](docs/design-system.md).
