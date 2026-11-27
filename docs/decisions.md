# Decisiones técnicas

Las entradas históricas conservan contexto. ADR-018/019 prevalecen sobre bloqueos visuales y planificación anteriores.

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

Revisión pendiente en ADR-015.

## ADR-012 — Prioridad de plataformas (2026-11-04)

Orden: app nativa iOS/Android, panel web administrativo y, en una etapa posterior, portal web del socio. El portal no se elimina: se posterga porque la mayoría de los socios usará la app. Para no duplicar lógica, contratos, validaciones, reglas de negocio y acceso a datos viven en `packages/shared`; cada app solo aporta su UI. No se desarrollan tres interfaces completas en simultáneo.

## ADR-013 — Identidad visual provisional (2026-11-04)

La paleta bordó inicial no coincide con el club. Se adopta provisionalmente rojo institucional, azul marino, blanco y neutros, derivados del escudo disponible fuera del repositorio (`Escudo restaurado del Club Pucará.png`). Ese archivo no está confirmado como oficial: no se versiona ni se muestra en las apps. Hasta recibir el vector oficial se mantiene el placeholder textual. Colores, tipografía y espaciados se centralizan en tokens con nombres semánticos para ajustar la identidad sin tocar pantallas. La propuesta visual se presenta para aprobación antes del rediseño.

## ADR-014 — Desarrollo deportivo temprano (2026-11-04)

Gimnasio, rugby y hockey son diferenciales y se desarrollan progresivamente desde la Etapa 1, primero con datos ficticios estructurados y luego con persistencia real. No pueden adelantarse a costa de autenticación, RLS ni el circuito admin → socio. Wellness se limita a diseño y datos ficticios hasta resolver consentimiento y tratamiento de datos de menores.

## ADR-015 — Entorno de trabajo y carpeta compartida (2026-11-04; aprobada 2026-11-05)

Estado actual: aprobada por la continuación del usuario del 2026-11-05; aplicada en ADR-016. Se conserva debajo la motivación histórica. Trabajar sobre SMB obliga a paquetes inyectados (ADR-011): los cambios en `packages/*` solo llegan a las apps después de `typecheck` o reinstalar, Vitest no resuelve rutas UNC y cada herramienta requiere una unidad temporal. Propuesta: una vez publicado el historial en GitHub, trabajar en un clon en disco local, retirar la configuración específica de SMB de pnpm-workspace.yaml tras verificarlo y conservar la carpeta compartida solo como respaldo o retirarla, sin mantener dos checkouts activos. La restricción histórica de trabajar en la carpeta compartida queda sustituida por ADR-016; el ejecutor se conserva como referencia.

## ADR-016 — Simplificación para disco local (2026-11-05)

Estado: aplicada y verificada. La instrucción de continuación aprueba el clon local existente como entorno activo, resolviendo ADR-015. Raíz comprobada: `C:\Users\Nobody-GRD\Desktop\PucaraDigital`; main partía de `3014825`, idéntico al main remoto consultado. No se creó otro checkout ni se modificó la carpeta compartida.

Tras verificar la base, se retiraron únicamente `injectWorkspacePackages`, `dedupeInjectedDeps`, `syncInjectedDepsAfterScripts` y `hoistWorkspacePackages`. Los paquetes internos usan enlaces normales de workspace y ya no requieren copiar fuentes después de typecheck. El lockfile cambió de referencias file a link y eliminó snapshots de los tres paquetes internos; las versiones externas no cambiaron.

Se conserva nodeLinker: hoisted por compatibilidad con herramientas nativas, además de Webpack, versiones fijadas, políticas de instalación y override acotado de Expo. El ejecutor SMB queda como referencia histórica, no como ruta de desarrollo soportada en esta configuración. No se mantienen dos checkouts activos desde esta sesión.

Turbo declara `outputs: []` para test: Vitest ejecuta los tests sin generar cobertura. Así se elimina el aviso de un artefacto que no existe; si se agrega cobertura, declarar su tarea y salida entonces.

Verificaciones completas antes y después, exportación Metro limpia y resolución real de paquetes documentadas en [verification.md](verification.md). Referencias: [configuración pnpm](https://pnpm.io/settings) y [monorepos Expo](https://docs.expo.dev/guides/monorepos/).

## ADR-017 — Experiencia del socio antes de componentes nativos (2026-11-05)

Estado: decisiones funcionales del usuario confirmadas; arquitectura detallada, recorridos concretos y dirección visual pendientes de aprobación. La propuesta v1 no está aprobada y queda como antecedente. La [revisión funcional v2](ux-functional-review.md) es la referencia actual.

Se mantienen cinco pestañas. Reservas tiene acceso directo desde Inicio y ocupa el primer bloque de Club. Inicio incluye los próximos partidos de Primera de ambos deportes y comunicaciones administrables, además de un resumen personal breve. Agenda excluye gimnasio libre e incluye clases recurrentes solo por inscripción activa; la baja retira eventos futuros personales sin borrar historia ni actividad. Se separa inscripción de asistencia.

Pádel se diseña con pago por turno; quinchos admite aprobación/pago configurables. Las políticas concretas siguen abiertas. Los HTML permiten probar escenarios en memoria, sin cobros, reservas, inscripciones ni persistencia reales. No se modifican Expo, Next, paquetes ni dependencias.

Requisitos futuros confirmados: cerca de 2.500 socios activos, hasta 300 concurrentes previstos, Google o email OTP, cuenta distinta del registro de socio y menores con múltiples responsables autorizados. No equivalen a implementación, permisos definidos ni capacidad medida.

Las dos aprobaciones (arquitectura de información y dirección visual) preceden al desarrollo de componentes nativos. La comparación A/B/C conserva la funcionalidad para evaluar estructura, densidad e identidad, sin decidir una estética por el usuario.

## ADR-018 — A provisional y base nativa autorizada (2026-11-12)

A · Club editorial es referencia provisional, sin aprobar estética definitiva. Se levanta el bloqueo de ADR-017; no generar otras alternativas. Bloque autorizado: componentes nativos, cinco pestañas, Inicio/Club/Agenda inicial, Carnet/Cuenta demo, destinos de módulos y lectura centralizada. Sin operaciones persistidas; web conserva alcance.

Expo/React Native/Next.js/Supabase/PostgreSQL permanecen. Se precisa ADR-012: shared comparte contratos, validaciones y adaptadores; integridad de reservas/créditos y permisos se imponen en PostgreSQL. Demo sólo de lectura, sin backend simulado de escrituras.

## ADR-019 — Pádel temprano y créditos (2026-11-12)

Se elimina la postergación de pádel a 2027. Próximo bloque: identidad/RLS/transacciones en Supabase local. Gimnasio con asignaciones y cargas sigue temprano. [Reglas](padel-rules.md) y [diseño](database.md) son referencias vigentes. Sin saldo monetario interno; cancelación elegible emite 1 turno; modificación sin cobro/crédito. Políticas y proveedor pendientes; ninguna escritura real se autoriza sólo en el cliente.

## ADR-020 — Rediseño táctil del bloque nativo (2026-11-13)

El usuario confirmó que la app funciona y navega en iPhone/Expo Go, pero rechazó su presentación textual. Se rediseñan directamente Inicio, Club, barra nativa y componentes comunes; no se vuelve a HTML ni se cambia navegación, stack o datos demo.

Reservas tiene CTAs explícitos; rutina/cuenta y catálogo usan tarjetas/grillas; partidos, agenda y comunicaciones tienen presentaciones diferentes. Se conserva NativeTabs y el comportamiento de vuelta atrás. El sistema gestiona el espaciado y altura de la barra, especialmente su apariencia nativa en iOS 26.

Se incorpora únicamente expo-symbols 58.0.5 (rango local SDK ~58.0.4 y peer Router ^58.0.4), más su dependencia transitiva Material Symbols, sin cambiar versiones previas del stack. SF Symbols en iOS y símbolos empaquetados en Android. La necesidad concreta es iconografía consistente en acciones y módulos; no se agrega un kit UI.

Los CTAs navegan a módulos demo existentes, sin reservas, pagos o inscripciones reales. La selección A sigue provisional; la nueva UX debe validarse en el teléfono. No se afirma rendimiento ni accesibilidad nativa probados por exportar bundles.

## ADR-021 — Autorización y créditos en PostgreSQL (2026-11-20)

Las membresías, vínculos, roles por ámbito, becas, decisiones de elegibilidad y auditoría se guardan en un esquema privado. El cliente solo recibe lectura filtrada por RLS y los comandos autorizados. Una misma restricción de exclusión cubre bloqueos y reservas de cancha. Una segunda protege al titular. Cada movimiento de un turno actualiza el contador en su transacción. Los reintentos usan una clave por club y actor.

Hasta validar la política comercial, una aprobación administrativa privada habilita la cancelación de una versión concreta. Los responsables pueden consultar los registros y reservas del menor vinculado. Los créditos y sus operaciones quedan reservados al titular. El siguiente bloque debe validar estas decisiones con Auth y PostgREST antes de conectar Expo. [Detalle técnico](database.md).

## ADR-022 — Diseño nativo aprobado y simulación por sesión (2026-11-24)

El [handoff de Claude Design](../design/Mobile%20app%20design%20project/design_handoff_pucara_digital/README.md) reemplaza la elección estética provisional de ADR-018/020. Implementar Inicio 2a y Pádel 1c con NativeTabs, stacks y hojas nativas. La cancha de pádel es única. El mismo lector tipado conserva el contrato de la RPC. En esta etapa sólo se simula el resultado de las interacciones en el estado de demostración compartido. En producción, PostgreSQL sigue siendo la autoridad para disponibilidad, autorización y emisión de créditos.

## ADR-023 — Fixture por jornadas completas (2026-11-27)

El pedido más reciente reemplaza la selección individual de divisiones. Una única ruta permite elegir deporte y grupo/línea y ver toda la jornada. Próxima fecha/Resultados y navegación anterior/siguiente reemplazan la ampliación individual y las hojas de división/jornada.

El catálogo conserva divisiones y agrega equipos opcionales (A/B/C) y ámbito de grupo en las jornadas. Los partidos preservan fecha/hora, rival y sede propios. La lista agrupa por día y mantiene el orden configurado. Inicio consume los mismos partidos de Primera. Hockey admite categorías diferentes entre líneas; la distribución demo no es información oficial. Rugby infantil excluye marcadores también desde el selector compartido.

No cambia el modelo PostgreSQL ni se incorporan fuentes deportivas. La estructura oficial, publicación y mantenimiento administrativo siguen pendientes. Las nuevas imágenes mencionadas no estuvieron disponibles en esta sesión; se usó el handoff aprobado y la especificación funcional escrita.
