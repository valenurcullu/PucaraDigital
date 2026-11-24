# Estado actual de Pucará Digital

Actualizado el 24 de noviembre de 2026. El Hito 2 partió de `af9f5b7`, sincronizado con la rama principal de GitHub al inicio. El desarrollo activo usa el clon del escritorio de Windows.

## Aplicación

La implementación del [handoff de Claude Design](../design/Mobile%20app%20design%20project/design_handoff_pucara_digital/README.md) parte de `30160b0`. Inicio 2a, Club, Reservas, Pádel 1c y la barra inferior están implementados en React Native. El socio probó y aprobó en iPhone la modificación de Pádel dentro de su hoja. La entrega siguiente incorpora Agenda 1f, Carnet 09, Cuenta 10, Cuenta corriente 10b y perfil vinculado 10c. Falta la aceptación en dispositivo de estas cinco vistas.

Agenda permite ver la semana de toda la familia o de una sola persona. Combina las reservas e inscripciones de la sesión del titular con los compromisos ficticios asociados al vínculo seleccionado. Carnet y Cuenta consultan los mismos números de socio y categorías. Los QR de muestra contienen texto público de demostración. Las preferencias de notificación se conservan en memoria durante la sesión de la pestaña. [Comparación con el handoff](design/verification/2026-11-24-agenda-carnet-cuenta.jpg).

Pádel muestra 14 días, una sola cancha, turnos de 90 minutos y el precio del lector. El socio puede ensayar pago o uso de crédito, revisar su reserva, modificarla conservando el turno anterior hasta confirmar y probar una cancelación elegible de ejemplo. Modificar abre el selector de día y horario dentro de la misma hoja de detalle. Confirmar actualiza la reserva existente y vuelve a su detalle con el nuevo horario. Volver, cerrar o deslizar hacia abajo desde el tirador descarta el borrador. Mis reservas, Inicio y Agenda comparten la sesión en memoria. La elegibilidad real queda en PostgreSQL. [Verificaciones](verification.md).

## Antecedente del 20 de noviembre — revisión táctil y Agenda semanal

Inicio y Club exponen **Ver turnos de pádel** en el primer bloque de Reservas. En Mis reservas, **Ver disponibilidad de pádel** abre la misma pantalla. Una selección muestra el resumen del horario y vuelve a la fecha elegida al cerrarlo. El directorio de Club mantiene sus cuatro grupos.

Se corrigió la pérdida de estilos de Pressable al componer enlaces con Expo Router. Fondo, borde y respuesta al toque se aplican en la superficie nativa. Las cinco pestañas usan insets nativos explícitos. Mi agenda presenta una semana de lunes a domingo, días marcados y los compromisos del día seleccionado. Hoy y los controles de semana actúan sobre el calendario del club. Los datos del socio y las operaciones permitidas conservan el alcance demo.

Las pruebas automatizadas cubren los recorridos, estados y contraste. La aceptación en iPhone de esta revisión está pendiente. [Navegación](navigation.md) · [Sistema visual](design-system.md) · [Verificaciones](verification.md).

## Bloque anterior — disponibilidad de pádel

A partir de `605b0c1`, Inicio y Club abren el mismo módulo de consulta. El demo ofrece cuatro fechas desde mañana en el calendario del club. La segunda permite revisar el estado vacío. Al tocar un horario se abre un resumen descartable con cancha, fecha, inicio, fin, duración y precio del turno. La selección no escribe en Agenda, reservas ni créditos.

El lector de disponibilidad recibe club e intervalo. Sus filas conservan las cuatro columnas de la RPC. Los nombres de cancha se resuelven con un catálogo separado. Las fechas y precios de los ejemplos son datos de presentación. Las cuatro fechas son una decisión de esta demo, independiente de las reglas de anticipación del club. [Contrato y conexión pendiente](database.md).

## Hito 2 — fundamentos del backend

Ya hay tres migraciones SQL versionadas, configuración local de Supabase y seed sintético de dos clubes. PostgreSQL separa usuarios, socios, responsables y roles por ámbito. Aplica RLS y permite consultar disponibilidad y reservar, modificar o cancelar con créditos de turno. La elegibilidad de una cancelación requiere aprobación administrativa para esa versión de la reserva. El flujo está disponible en SQL, pendiente de conexión al cliente.

En Windows se aplicaron migraciones y seed y se probaron autorización, integridad y concurrencia sobre PostgreSQL nativo. El CLI de Supabase está disponible. El arranque del stack completo quedó bloqueado por falta de Docker o Podman. La guía local incluye inicio, parada, reinicio, reconstrucción y ambos recorridos de prueba. [Guía](../supabase/README.md) · [Modelo](database.md) · [Verificaciones](verification.md).

## Para retomar

1. Revisar Agenda, Carnet y Cuenta en iPhone con VoiceOver, texto ampliado y gesto de regreso. Probar Perfil de Sofía → Ver carnet / Ver agenda y Pádel → Ver en Agenda. En otro equipo con contenedores, arrancar Supabase con PostgreSQL 17 y correr la batería sobre la base ficticia.
2. Validar la API con sesiones Auth reales de ambos clubes, incluidos vínculos revocados. Implementar el lector autenticado de disponibilidad para esta pantalla y verificar los rangos de fechas con turnos publicados en esa base.
3. Acordar con el club verificación del padrón, permisos de menores, cancelación y reintegros. El pago real requiere además proveedor, retención y conciliación. Gimnasio con asignación de rutinas y registro de cargas sigue entre las prioridades deportivas tempranas.

Para retomar la app desde la raíz, usar `pnpm dev:mobile` y escanear el nuevo QR con Expo Go. La app demo puede revisarse en forma independiente del backend. La capacidad para 300 usuarios concurrentes y el rendimiento móvil siguen pendientes de medición.
