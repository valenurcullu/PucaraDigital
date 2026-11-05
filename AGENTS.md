# Pucará Digital — reglas de trabajo

- Trabajar en esta raíz Git, en el clon de disco local. No usar el checkout SMB anterior. Remoto oficial: https://github.com/valenurcullu/PucaraDigital.git.
- Revisar estado, rama, remoto y cambios existentes antes de modificar archivos.
- Nunca hacer push sin autorización explícita del usuario. Hacer commits pequeños luego de verificar cada bloque.
- Mantener pnpm workspaces + Turborepo, Expo / React Native y Next.js. No crear proyectos o repositorios adicionales.
- Priorizar calidad UX/UI, accesibilidad y arquitectura mantenible. Documentar decisiones y alcance real.
- UI web y nativa por separado; compartir contratos, validaciones, lógica y tokens.
- Orden de plataformas: app nativa → panel administrativo web → portal web del socio (postergado, no eliminado). Ver docs/roadmap.md y docs/decisions.md (ADR-012 a ADR-015).
- Navegación móvil aprobada: Inicio, Agenda, Carnet, Club y Cuenta. El inicio autenticado es un dashboard personal, no una landing.
- TypeScript estricto. No ocultar errores con any, ts-ignore o desactivando verificaciones de build.
- No agregar dependencias sin una necesidad concreta; respetar las versiones compatibles de Expo.
- Datos demo ficticios y explícitos, sin presentar persistencia ni autorización simulada como real.
- Datos por club y roles por membresía. La seguridad futura debe imponerse en PostgreSQL/RLS, nunca solo en filtros de UI.
- Nunca versionar secretos, claves privadas o archivos .env. Los .env.example solo contienen valores públicos o placeholders.
- No implementar pagos reales, reservas reales, scraping, push, wellness completo ni integraciones de sprints futuros.
- Aptos médicos descartados. Suplio es desarrollador; Pucará es la marca principal.
- No inventar ni redibujar el escudo. Usar un placeholder textual hasta recibir el archivo oficial. La imagen del escudo fuera del repositorio no está confirmada como oficial: no versionarla ni mostrarla.
- Identidad provisional: rojo institucional, azul marino, blanco y neutros, siempre mediante tokens.
- Verificar pnpm install --frozen-lockfile, pnpm lint, pnpm typecheck, pnpm test, pnpm format:check y pnpm build cuando corresponda.
- Para cambios nativos verificar expo install --check y exportación Android/iOS. No afirmar prueba en dispositivo si solo se exportó el bundle.
- Actualizar README y docs con lo implementado, verificaciones realizadas y limitaciones.

- Al retomar, leer docs/current-status.md; al cerrar un bloque, actualizar estado y docs/verification.md con evidencia. CLAUDE.md remite a estas mismas reglas.

- Referencia UX vigente: docs/ux-functional-review.md y docs/design/revision-ux.html. La v1 no está aprobada. Se requieren aprobación de arquitectura de información y dirección visual antes de componentes nativos. Conservar reglas confirmadas: Reservas visible, gimnasio libre fuera de Agenda, inscripción recurrente distinta de asistencia y baja que retira solo clases futuras personales.
