# Roadmap vigente

Actualizado 2026-11-12 tras auditoría independiente. App nativa primero, panel administrativo después, portal web del socio posterior. Una etapa se acepta con evidencia, no por existir carpetas o maquetas.

## Bloque 1 — Base nativa (ejecución actual)

Concepto A · Club editorial seleccionado provisionalmente. La estética definitiva se revisará después; queda levantado el bloqueo de aprobación visual para este bloque.

Componentes nativos básicos; cinco pestañas; Inicio, Club y Agenda inicial; Carnet y Cuenta demo; destinos de módulos; datos ficticios centralizados de lectura; carga, error, vacío y vuelta atrás. Reutilizar jerarquía y recorridos de A, sin trasladar su motor HTML ni desarrollar nuevas alternativas.

Aceptación técnica: lint, tipos, tests, build web sin regresiones, compatibilidad Expo y export Android/iOS. Aceptación móvil pendiente de prueba en dispositivos, texto ampliado, safe areas, gestos y lectores de pantalla. No confundir exportación con rendimiento medido.

## Bloque 2 — Identidad, RLS y reservas de pádel locales (prioridad temprana)

Supabase local/PostgreSQL con datos ficticios, migraciones, seeds y tests transaccionales. Separar cuenta, socio y responsables. Implementar aislamiento por club, restricciones de solapamiento, idempotencia, crédito de turno e historial; pagos como entidad separada. [Diseño y aceptación](database.md), [reglas confirmadas](padel-rules.md).

Primero demostrar transacciones con pruebas; luego conectar una sección vertical de la app. No construir un backend simulado completo. No requieren proveedor de pagos las pruebas de reservas con créditos ficticios. Para flujo sin créditos, mostrar pago pendiente hasta contar con proveedor y reglas, sin fabricar confirmaciones.

Pendientes del club: cancelación/reintegros, alcance familiar, horarios y límites. No habilitar reservas operativas antes de cerrar esos puntos y verificar autorización.

## Bloque 3 — Deportes tempranos y actividades

Gimnasio sigue entre las prioridades tempranas: asignación de rutinas, consulta semanal, registro rápido de cargas/series e historial. Puede prepararse UI tras el bloque 1; persistencia y permisos dependen del bloque 2. Gimnasio libre no genera eventos de Agenda.

Rugby/hockey: fixture, resultados y convocatorias. Yoga/funcional: inscripción y baja recurrentes conectadas a Agenda, distintas de asistencia. Cupos y concurrencia se validan en PostgreSQL. Wellness real permanece fuera hasta resolver privacidad.

## Bloque 4 — Circuito administrativo y quinchos

Panel Next.js para publicar comunicados/partidos y consumirlos en app con permisos reales. Quinchos reutiliza garantías transaccionales de reservas pero conserva política propia de aprobación y pago. Luego administración de rutinas y actividades según permisos.

## Posterior

Proveedor de pagos y conciliación, cuenta corriente/cuotas/becas, carnet válido, notificaciones e integraciones. Portal web del socio después; evolución comercial multi-club al final. No añadir infraestructura por anticipación.

## Objetivo de presentación

Mantener diciembre 2026 como objetivo a revisar según evidencia: app navegable, datos ficticios en Supabase y un circuito pequeño seguro. Pádel deja de estar postergado automáticamente a 2027; sus pruebas locales son tempranas. Pagos reales y salida operativa no se prometen por fecha. Gimnasio no se descarta por priorizar reservas. Cuentas de tiendas, builds instalables y validación en dispositivos siguen pendientes.

La estabilización local anterior está registrada en [verificaciones](verification.md). El estado exacto de cada bloque se mantiene en [current-status](current-status.md).
