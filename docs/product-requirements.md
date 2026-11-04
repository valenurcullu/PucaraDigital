# Requerimientos del producto

Fuente: prompt maestro del Sprint 1 proporcionado por el usuario y su instrucción posterior de usar exclusivamente el repositorio oficial. Desarrollo incremental; este bloque entrega las fundaciones.

## Implementado en este bloque

- Monorepo pnpm/Turborepo con aplicaciones Next.js y Expo Router.
- TypeScript estricto, ESLint, Prettier, Vitest y workflow de CI.
- Entradas iniciales web/nativa, marca textual reemplazable y modo demo visible.
- Tokens iniciales en bordó, blanco y neutros.
- Contrato de club, roles iniciales y adaptador demo de lectura.
- Documentación de arquitectura, navegación y modelo conceptual.
- Exclusión de variables, credenciales, cachés y archivos generados.

## Planificado para los siguientes bloques del Sprint 1

- Sistema de diseño completo: componentes, estados, accesibilidad y revisión responsive.
- Móvil: Inicio, Agenda diaria/semanal/mensual, Carnet demo, Actividades y Perfil.
- Portal web: inicio, agenda y navegación.
- Panel administrativo separado: socios totales/activos, reservas, actividades y cuotas pendientes ficticias.
- Datos ficticios de socios, eventos, partidos, actividades, movimientos y noticias.
- Migraciones iniciales para clubs, profiles, club_memberships, member_records, user_roles, activities y calendar_events.
- RLS y pruebas de aislamiento reales en PostgreSQL local.

## Planificado para futuros sprints

Socios y familias, becas y descuentos, cuenta corriente, pagos, fixtures/importación Excel, gimnasio, wellness sensible, yoga/funcional con cupos, reservas de pádel/quinchos, comunidad y auditoría. Cada módulo requiere alcance y reglas acordadas antes de implementarse.

## Pendiente de definir

- Escudo y recursos oficiales de marca; tipografía definitiva y sus licencias.
- Flujos de alta, invitación, recuperación de cuenta y vínculo con el padrón.
- Reglas de visibilidad de agenda, noticias y perfiles por rol/equipo.
- Política de reservas, cancelaciones y devoluciones.
- Tratamiento, consentimiento y retención de wellness.
- Mercado Pago o Banco Macro y reglas contables.
- Permisos concretos de PF, entrenadores y profesores por ámbito.
- Disponibilidad del proyecto Supabase de desarrollo.

## Descartado o fuera del sprint

Aptos médicos descartados. En Sprint 1 no se implementan pagos/reservas reales, scraping, integraciones federativas, rutinas completas, wellness completo, notificaciones reales, facturación ni publicación en tiendas. Tampoco se construye administración comercial multi-club.

El demo no valida acceso al club: cualquier QR futuro de demostración debe estar marcado como tal y carecer de valor real.

## Reglas que deben preservarse en los próximos bloques

- La aplicación móvil es la experiencia principal del socio; web y administración comparten backend.
- Un usuario admite varios roles por club. La operación inicial prevé aproximadamente cuatro administradores con acceso completo; los demás roles acceden solo a sus módulos y ámbitos autorizados.
- El estado administrativo y la situación económica son independientes. Una beca del 100% no puede generar deuda por cuotas exentas.
- Los únicos espacios reservables inicialmente son pádel y quinchos.
- Wellness requiere acceso restringido y tratamiento como información sensible.
- El futuro cambio a servicios reales no puede convertir el demo en una fuente de datos productivos.
