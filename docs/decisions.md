# Decisiones técnicas

## ADR-001 — Repositorio único y ubicación existente

Usar el checkout oficial cuya raíz Git ya existía en PucaraDigital/PucaraDigital dentro del workspace. La carpeta exterior no es un repositorio. No se creó un checkout adicional ni se movió .git. Rama inicial main, sin commits; origin coincide con el repositorio indicado. Sin push autorizado.

## ADR-002 — pnpm y paquetes fuente

pnpm 12.17.0 fijado con lockfile y Turborepo. Se utiliza la versión estable actual tras reproducir un fallo de enlace de ejecutables en pnpm 10 durante la preparación del entorno. Paquetes TypeScript consumidos como fuente para evitar una cadena de builds innecesaria. node-linker=hoisted facilita compatibilidad nativa y Windows.

## ADR-003 — Versiones coordinadas

Expo 58.0.23, Expo Router 58.0.30, React Native 0.88.1 y React 19.3.0 derivados de la plantilla oficial publicada de Expo. TypeScript 6.0.3 coincide con esa plantilla. Next.js 16.4.5 acepta React 19 y comparte React 19.3.0. Node 24.16.0 satisface los requisitos de los dos entornos.

Fuentes consultadas: metadatos públicos de npm para expo-template-default, expo, next y sus peerDependencies; [documentación de Expo](https://docs.expo.dev/versions/latest/) y [instalación de Next.js](https://nextjs.org/docs/app/getting-started/installation). Las versiones concretas y transitivas se fijan en pnpm-lock.yaml.

## ADR-004 — Componentes específicos por plataforma

Compartir tokens y contratos, no componentes DOM con React Native. Sin biblioteca UI genérica ni paquetes adicionales sin necesidad demostrada. Paleta institucional preliminar y placeholder textual hasta recibir el escudo.

## ADR-005 — Demo explícito y adaptadores futuros

El demo es de lectura, ficticio y no persistente. Cualquier modo distinto de demo falla explícitamente hasta contar con un adaptador real. No se agregan claves Supabase ni SDK sin una integración que los utilice.

## ADR-006 — Alcance incremental

Esta entrega desarrolla las fundaciones solicitadas al final del prompt maestro. La visión completa y el resto del Sprint 1 permanecen documentados, sin sustituir implementación real por placeholders presentados como módulos completos.

## ADR-007 — Build web

El comando de producción usa Next con Webpack para disponer de una ruta de compilación explícita y compatible con paquetes fuente y el entorno Windows de red. El desarrollo usa el comando estándar de Next; ambos deben probarse. No se desactivan verificaciones TypeScript ni lint para producir un build.

## ADR-008 — Compatibilidad de ESLint

ESLint 9.39.5 es la última revisión de la línea 9 consultada al preparar este bloque. Los plugins oficiales eslint-plugin-react y eslint-plugin-import todavía declaran peers hasta ESLint 9, también usados por Expo. Por eso se mantiene esta versión compatible sin ignorar restricciones de peers. La línea 9 anuncia fin de soporte: actualizar a ESLint 10 cuando ambos plugins y los presets Next/Expo declaren compatibilidad, y volver a ejecutar todas las verificaciones.

## ADR-009 — Parche transitivo de herramientas Expo

Se fija @expo/cli>glob a 14.0.3 mediante override acotado. El árbol original incluía glob 13.0.6 y minimatch 10.2.6, señalados por la auditoría de npm con avisos moderados. Glob 14.0.3 incorpora minimatch 11 y admite Node 24. La actualización requiere comprobar compatibilidad mediante inicio de Metro y exportación Android/iOS; no se desactivan avisos de auditoría. Retirar el override cuando Expo incorpore una versión corregida de forma nativa.

Referencias: https://github.com/advisories/GHSA-3g3m-2fjr-6pw4 y https://github.com/advisories/GHSA-g3hv-75wg-m249.

## ADR-010 — Configuración vigente de pnpm

pnpm 12 lee los ajustes de instalación desde pnpm-workspace.yaml: nodeLinker, saveExact, strictPeerDependencies y allowBuilds. .npmrc queda reservado a autenticación y se ignora en Git. Las excepciones de antigüedad generadas por pnpm quedan limitadas a versiones exactas de paquetes seleccionados; no se desactiva globalmente la política. Ver https://pnpm.io/blog/releases/11.0.

En la carpeta compartida de Windows se usa una unidad temporal de cmd (pushd) y una caché local para evitar las limitaciones de rutas UNC y el costo de extraer miles de archivos en el servidor. La caché no contiene código del proyecto ni constituye otro checkout.

## ADR-011 — Paquetes internos sobre SMB

El servidor rechazó junctions de workspace con errores de reparse point. Se configura injectWorkspacePackages=true y dedupeInjectedDeps=false para instalar los paquetes internos mediante archivos. syncInjectedDepsAfterScripts=[typecheck] mantiene actualizados los consumidores después de validar los cambios compartidos. Las modificaciones de configuración requieren reinstalar. pnpm 12.17.0 también corrige enlaces duplicados de instalaciones hoisted.

Se acepta esta sincronización explícita para trabajar directamente sobre la ubicación oficial solicitada, conservando un único checkout y sin cambiar la arquitectura de las aplicaciones. Referencias: https://pnpm.io/workspaces y https://pnpm.io/blog/releases/12.17.0.
