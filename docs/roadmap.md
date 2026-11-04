# Roadmap

Dirección oficial acordada el 2026-11-04 a partir de la auditoría integral. Orden de plataformas: 1) app nativa iOS/Android, 2) panel web administrativo, 3) portal web del socio (postergado, no eliminado). Una etapa se acepta con evidencia de funcionamiento, no por contar con carpetas, contratos o pantallas.

## Objetivo diciembre 2026

Versión presentable al club, con calidad antes que cantidad.

**Mínimo:** app móvil navegable y visualmente premium con cinco pestañas (Inicio personalizado, Agenda, Carnet demo, Club, Cuenta); panel administrativo inicial; autenticación y datos de demostración reales en Supabase; circuito admin → socio funcional con RLS testeada.

**Adicional:** gimnasio con rutina semanal y registro de pesos (datos ficticios), fixture de ejemplo y pantallas deportivas destacadas.

**Fuera de diciembre:** pagos, reservas reales, wellness con datos reales, integraciones federativas, push y portal web del socio.

## Camino crítico

1. Etapa 0 → repositorio con historial, CI verde y entorno de trabajo estable.
2. Etapa 1 → identidad provisional y sistema de diseño (bloquea todas las pantallas).
3. Etapa 2 → Auth + RLS testeada (bloquea el circuito real).
4. Etapa 3 → circuito admin → socio.
5. Builds instalables (EAS, cuentas de Apple/Google) antes de la presentación.

La Etapa 4 (deportes, con datos ficticios) avanza en paralelo a partir del sistema de diseño, sin bloquear ni debilitar las etapas 2 y 3.

## Etapas

### Etapa 0 — Estabilización técnica · P0 · en curso

- **Objetivo:** base confiable para desarrollar.
- **Alcance:** correcciones de la auditoría (.gitattributes, Prettier, ESLint), registro de verificaciones, primer commit, revisión del entorno en la carpeta compartida, documentación alineada con estas decisiones.
- **Dependencias:** ninguna.
- **Riesgos:** perder cambios al mover el checkout; publicar archivos sensibles.
- **Aceptación:** historial local con commits verificados, sin secretos; lint, typecheck, tests, formato, build web, expo check y export en verde; push solo con autorización. Estado detallado en [verification.md](verification.md).

### Etapa 1 — Diseño UX/UI premium · P0

- **Objetivo:** identidad provisional (rojo institucional, azul marino, blanco, neutros) y sistema de diseño propio de cada plataforma.
- **Alcance:** propuesta visual justificada antes de implementar; tokens de color, tipografía, espaciado y escala accesible; navegación de cinco pestañas; arquitectura de información de Club y Cuenta; wireframes de Inicio, Agenda, Carnet, Club, Cuenta y acceso rápido al gimnasio; componentes base y estados de carga, error y vacío.
- **Dependencias:** Etapa 0. El escudo vectorial oficial no bloquea: se usa placeholder textual.
- **Riesgos:** pulido excesivo; colores que luego difieran de los oficiales (mitigado con tokens).
- **Aceptación:** propuesta aprobada; capturas iOS y Android en tamaños chico y grande; texto ampliado al 200 % sin cortes; VoiceOver/TalkBack básicos; contraste AA verificado.

### Etapa 2 — Base de datos y autenticación · P0

- **Objetivo:** identidad y permisos reales.
- **Alcance:** Supabase local, migraciones (clubs, profiles, club_memberships, user_roles, member_records, calendar_events, news), RLS denegando por defecto, tests de políticas en PostgreSQL, Supabase Auth, tipos generados y datos ficticios controlados.
- **Dependencias:** Etapa 0; proyecto Supabase de desarrollo.
- **Riesgos:** políticas incorrectas o recursivas; vinculación cuenta–padrón sin definir.
- **Aceptación:** pruebas con anónimo, socio A, socio B, miembro de ambos, administrador A y suspendido ejecutadas en CI ([database.md](database.md)).

### Etapa 3 — Primer circuito real · P0

- **Objetivo:** demostrar la plataforma de punta a punta.
- **Alcance:** login de administrador en web; crear, editar y publicar eventos y comunicados; la app autenticada los muestra en Inicio y Agenda con estados de carga, error y vacío.
- **Dependencias:** Etapas 1 y 2.
- **Riesgos:** confiar en filtros de UI en lugar de RLS.
- **Aceptación:** un socio solo ve contenido de su club y visibilidad; un socio no puede escribir; lo publicado aparece en la app sin intervención manual.

### Etapa 4 — Deportes · P1, progresiva desde la Etapa 1

- **Objetivo:** diferencial deportivo temprano.
- **Alcance inicial (datos ficticios estructurados):** navegación deportiva; rutina semanal; registro rápido de pesos por serie; series completadas; pesos anteriores e historial; fixture, resultados y posiciones de ejemplo; convocatorias de ejemplo.
- **Alcance posterior (persistencia real):** herramientas de PF para crear y asignar rutinas; registros reales; carga manual o Excel de fixtures; confirmación de asistencia; videos de YouTube; yoga y funcional con cupos y listas de espera.
- **Wellness:** solo diseño y datos ficticios hasta resolver consentimiento, tratamiento de datos sensibles y de menores.
- **Dependencias:** Etapa 1 para la UI; Etapa 2 para persistencia.
- **Riesgos:** dispersar el esfuerzo antes de cerrar el circuito real.
- **Aceptación:** registrar una serie en dos toques o menos; historial claro; datos demo identificados como tales.

### Etapa 5 — Reservas y administración financiera · P1 (2027)

Pádel y quinchos, cuenta corriente como libro de movimientos, cuotas, becas y descuentos. Pagos cuando se defina el proveedor (Mercado Pago, Banco Macro). Requiere datos del club: padrón, categorías y valores de cuota, reglas de becas y políticas de cancelación.

### Etapa 6 — Portal web del socio · P2

Experiencia web adaptada a necesidades reales, reutilizando contratos, validaciones y servicios de `packages/shared`.

### Etapa 7 — Evolución comercial · P3

Evaluación multi-club, identidad configurable por club, nuevos módulos y comercialización por Suplio.
