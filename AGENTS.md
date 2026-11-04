# Pucará Digital — reglas de trabajo

- Trabajar en esta raíz Git. Remoto oficial: https://github.com/valenurcullu/PucaraDigital.git.
- Revisar estado, rama, remoto y cambios existentes antes de modificar archivos.
- Nunca hacer push sin autorización explícita del usuario. Hacer commits pequeños luego de verificar cada bloque.
- Mantener pnpm workspaces + Turborepo, Expo / React Native y Next.js. No crear proyectos o repositorios adicionales.
- Priorizar calidad UX/UI, accesibilidad y arquitectura mantenible. Documentar decisiones y alcance real.
- UI web y nativa por separado; compartir contratos, validaciones, lógica y tokens.
- TypeScript estricto. No ocultar errores con any, ts-ignore o desactivando verificaciones de build.
- No agregar dependencias sin una necesidad concreta; respetar las versiones compatibles de Expo.
- Datos demo ficticios y explícitos, sin presentar persistencia ni autorización simulada como real.
- Datos por club y roles por membresía. La seguridad futura debe imponerse en PostgreSQL/RLS, nunca solo en filtros de UI.
- Nunca versionar secretos, claves privadas o archivos .env. Los .env.example solo contienen valores públicos o placeholders.
- No implementar pagos reales, reservas reales, scraping, push, wellness completo ni integraciones de sprints futuros.
- Aptos médicos descartados. Suplio es desarrollador; Pucará es la marca principal.
- No inventar ni redibujar el escudo. Usar un placeholder textual hasta recibir el archivo oficial.
- Verificar pnpm install --frozen-lockfile, pnpm lint, pnpm typecheck, pnpm test, pnpm format:check y pnpm build cuando corresponda.
- Para cambios nativos verificar expo install --check y exportación Android/iOS. No afirmar prueba en dispositivo si solo se exportó el bundle.
- Actualizar README y docs con lo implementado, verificaciones realizadas y limitaciones.
