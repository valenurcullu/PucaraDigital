# Requerimientos del producto

Fuentes: prompt maestro del Sprint 1, auditoría integral, decisiones del 2026-11-04 y revisión funcional del usuario del 2026-11-05. Las decisiones funcionales confirmadas y las reglas pendientes se distinguen en [ux-functional-review.md](ux-functional-review.md). Desarrollo incremental. La hoja de ruta vigente está en [roadmap.md](roadmap.md) y la navegación aprobada en [navigation.md](navigation.md).

## Dirección vigente

- Plataformas en orden: app nativa iOS/Android → panel web administrativo → portal web del socio (postergado, no eliminado; reutilizará la lógica compartida).
- UX/UI premium como prioridad máxima. El inicio de un socio autenticado es un dashboard personal, no una landing.
- Navegación móvil: Inicio, Agenda, Carnet, Club y Cuenta.
- Identidad provisional en rojo institucional, azul marino, blanco y neutros, hasta recibir recursos oficiales.
- El desarrollo deportivo (gimnasio, rugby, hockey) avanza desde las primeras etapas con datos ficticios estructurados, sin comprometer autenticación ni seguridad.
- Primer circuito real: el administrador publica un evento o comunicado en web, se guarda en Supabase y el socio autenticado lo ve en la app, con RLS testeada.

## Implementado en el bloque de fundaciones

- Monorepo pnpm/Turborepo con aplicaciones Next.js y Expo Router.
- TypeScript estricto, ESLint, Prettier, Vitest y workflow de CI.
- Entradas iniciales web/nativa, marca textual reemplazable y modo demo visible.
- Tokens iniciales en bordó, blanco y neutros (a reemplazar en la Etapa 1: no coinciden con la identidad del club).
- Contrato de club, roles iniciales y adaptador demo de lectura.
- Documentación de arquitectura, navegación y modelo conceptual.
- Exclusión de variables, credenciales, cachés y archivos generados.

## Objetivo diciembre 2026

- Mínimo: app móvil premium con las cinco pestañas (Carnet demo identificado), panel administrativo inicial, Supabase Auth y datos de demostración reales, circuito admin → socio con RLS testeada.
- Adicional: rutina semanal y registro de pesos con datos ficticios, fixture de ejemplo y pantallas deportivas destacadas.
- Sin pagos ni reservas reales.

## Módulos deportivos

- **Gimnasio:** PF crean rutinas semanales, las asignan a equipos o jugadores, configuran ejercicios, series, repeticiones y descansos, y consultan registros y evolución. Jugadores consultan su rutina, registran pesos por serie, marcan series completadas y ven pesos anteriores y progresión. El registro debe ser muy rápido durante el entrenamiento (referencia funcional: Hevy, sin copiar su diseño).
- **Rugby y hockey:** fixtures, resultados, posiciones, calendarios, videos de YouTube, convocatorias y confirmación de asistencia. Carga manual o Excel; la obtención automática desde URBA y la asociación de hockey se evaluará más adelante, sin scraping.
- **Wellness:** formularios diarios (sueño, fatiga, dolor muscular, ánimo) con seguimiento por PF. Sin datos reales hasta resolver privacidad, consentimiento y tratamiento de datos de menores.
- **Yoga y funcional:** detalle de días, horarios, sede y cupos; inscripción recurrente o baja según estado. Inscribirse incorpora clases futuras a Agenda; la baja retira sus eventos futuros personales. La asistencia a cada clase es independiente. Reglas finas de cupos, cancelaciones individuales y listas de espera quedan para etapas posteriores.

## Planificado para etapas posteriores

La implementación real de reservas de pádel/quinchos, inscripciones, cuenta corriente, cuotas, becas, pagos, grupos familiares y portal del socio sigue en etapas posteriores. Su experiencia de consulta, reserva, pago por turno, modificación/cancelación e inscripción/baja recurrente se diseña ahora, sin operaciones reales. Aprobar un flujo no adelanta automáticamente su backend ni define las políticas abiertas.

## Pendiente de definir

- Escudo y recursos oficiales de marca (vector), colores institucionales; tipografía definitiva y sus licencias.
- Quién valida el carnet en el club y con qué dispositivo.
- Identificadores de app (bundle iOS / package Android) y titular de las cuentas de Apple y Google.
- Flujos de alta, invitación, recuperación de cuenta y vínculo con el padrón.
- Reglas de visibilidad de agenda, noticias y perfiles por rol/equipo.
- Política de reservas, cancelaciones y devoluciones.
- Tratamiento, consentimiento y retención de wellness.
- Mercado Pago o Banco Macro y reglas contables.
- Permisos concretos de PF, entrenadores y profesores por ámbito.
- Disponibilidad del proyecto Supabase de desarrollo.

## Descartado o fuera del sprint

Aptos médicos descartados. Para diciembre no se implementan pagos/reservas reales, scraping, integraciones federativas, wellness con datos reales, notificaciones reales, facturación ni publicación en tiendas. Tampoco se construye administración comercial multi-club.

El demo no valida acceso al club: cualquier QR futuro de demostración debe estar marcado como tal y carecer de valor real.

## Reglas que deben preservarse en los próximos bloques

- La aplicación móvil es la experiencia principal del socio; web y administración comparten backend.
- Un usuario admite varios roles por club. La operación inicial prevé aproximadamente cuatro administradores con acceso completo; los demás roles acceden solo a sus módulos y ámbitos autorizados.
- El estado administrativo y la situación económica son independientes. Una beca del 100% no puede generar deuda por cuotas exentas.
- Los únicos espacios reservables inicialmente son pádel y quinchos.
- Wellness requiere acceso restringido y tratamiento como información sensible.
- El futuro cambio a servicios reales no puede convertir el demo en una fuente de datos productivos.

## Revisión funcional confirmada — 2026-11-05

Inicio debe servir a deportistas, sociales y familias: saludo y accesos a Reservas, Gimnasio y Cuenta Corriente; partidos de Primera de rugby/hockey con rival, condición local/visitante, día/hora; Novedades y Comunicaciones administrables desde web; compromisos personales relevantes sin lista excesiva.

Club prioriza Reservas (pádel/quinchos), seguido de Deportes, Actividades y Vida en el club. Agenda solo incorpora eventos con horario establecido: partidos, convocatorias, entrenamientos, reservas confirmadas y clases de yoga/funcional cuando existe inscripción. Gimnasio libre nunca crea un evento automático.

Pádel incluye consulta, reserva, pago por turno, cambio y cancelación; pago real posterior. Quinchos incluye fecha/horario, reserva, cambio/cancelación y condiciones de aprobación/pago configurables. Confirmación de reserva, resultado de pago y solicitud administrativa son estados diferentes.

**Usuarios:** aproximadamente 2.500 socios activos y hasta 300 usuarios concurrentes previstos. Son requisitos, no métricas de capacidad verificada. Login futuro por Google o email OTP. El registro de usuario se separa del registro administrativo de socio; un menor puede tener uno o más responsables autorizados.

Ver [revisión funcional v2](ux-functional-review.md) para recorridos propuestos, reglas abiertas y comparación visual. Las decisiones de este apartado están confirmadas; arquitectura detallada y dirección visual todavía requieren aprobación. Las políticas pendientes no se deducen de las tarifas ni escenarios ficticios del HTML.
