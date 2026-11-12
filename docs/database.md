# Diseño transaccional e identidad

Actualizado 2026-11-12. **Diseño previo a implementación:** no hay migraciones ejecutables, Auth ni RLS probadas todavía. Se mantiene Supabase + PostgreSQL. La siguiente etapa usa Supabase local y datos ficticios, sin backend simulado de escrituras.

## Identidades separadas

| Entidad propuesta                                              | Responsabilidad                                                                                                                             |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| auth.users / profiles                                          | Cuenta autenticada y preferencias mínimas; no equivale a socio                                                                              |
| clubs                                                          | Identidad y zona horaria del club                                                                                                           |
| club_memberships / user_roles                                  | Acceso del usuario al club y roles por ámbito; no padrón                                                                                    |
| member_records                                                 | Socio administrativo, número único por club; puede existir sin login                                                                        |
| member_user_links                                              | Vínculo verificado cuenta–socio, revocable; impedir dos cuentas dueñas activas del mismo socio sin decisión expresa                         |
| guardian_links                                                 | Responsable usuario → socio menor, club, permisos explícitos, verificador, vigencia y revocación; varios responsables autorizados por menor |
| resources / reservations                                       | Canchas/quinchos y reservas del socio; actor autenticado separado del titular                                                               |
| credit_accounts / credit_movements                             | Cuenta de turnos por club/socio y libro de movimientos inmutable                                                                            |
| payments / payment_events                                      | Intentos y notificaciones del proveedor, separados de reserva y créditos                                                                    |
| activity_groups / class_occurrences / enrollments / attendance | Horario recurrente, clase, inscripción y asistencia distintos                                                                               |

Un login Google/OTP no crea ni vincula automáticamente un socio. Compartir apellido o correo no autoriza representación. Falta validar verificación del padrón y permisos de responsables. Acceso suspendido, estado administrativo y situación económica son dimensiones separadas. Gimnasio tendrá asignaciones y registros por socio, sin crear eventos automáticos.

## Aislamiento y autorización

Todas las entidades del club llevan club_id NOT NULL; claves foráneas compuestas (club_id, id) evitan referencias cruzadas. RLS deniega por defecto en tablas expuestas. Lectura propia/autorizada y funciones de escritura verifican auth.uid(), membresía activa y alcance de rol o vínculo familiar vigente; nunca confiar en actor o club enviados como autoridad por el cliente.

Sin escrituras directas del socio a reservas, créditos, pagos, roles o vínculos. Operaciones críticas mediante funciones PostgreSQL acotadas. Si requieren SECURITY DEFINER: propietario de privilegios mínimos, search_path fijo, nombres cualificados, REVOKE EXECUTE FROM PUBLIC y permisos explícitos; revalidar actor/club/titular dentro de cada función porque el propietario puede omitir RLS. SELECT, UPDATE USING y WITH CHECK se prueban con roles reales. Evitar recursión de políticas.

## Invariantes y concurrencia

- Tiempos timestamptz, fin mayor que inicio. Pádel exige 90 minutos en servidor; precio desde configuración vigente y cotización histórica, no desde el móvil.
- Exclusión GiST con btree_gist por club_id, resource_id y tstzrange(start, end, '[)') usando && para estados que ocupan disponibilidad. Permite turnos contiguos. Predicado sobre estados explícitos, nunca now(); expiración de retenciones cambia estado transaccionalmente.
- Proteger también solapamiento de reservas de pádel del mismo titular. Alcance entre pádel y otros recursos pendiente. Canceladas no bloquean; solicitudes de quincho y retenciones necesitan política definida.
- Cada comando recibe clave idempotente, única por club/actor/operación/clave. Guardar huella normalizada de parámetros y resultado en la misma transacción. Repetición devuelve resultado original; misma clave con otros parámetros falla.
- Bloquear filas en orden consistente (cuenta de créditos, reserva y recursos cuando corresponda). La exclusión resuelve colisiones entre distintas reservas; no basta consultar disponibilidad y después insertar.
- credit_movements registra cantidades enteras +1/-1, socio, club, reserva, motivo, actor y operación. Historial inmutable; correcciones explícitas, sin borrar movimientos. Una emisión de cancelación única por reserva y un consumo único por confirmación, con índices únicos parciales.
- credit_accounts sirve como fila de bloqueo. Si se materializa un contador, se actualiza junto con el movimiento, con CHECK >= 0 y reconciliación con el historial. Dos solicitudes no pueden gastar el último crédito.
- Toda referencia cruzada incluye club_id; actor y titular son auditables. El cliente no puede editar contador ni historial.

## Comandos previstos

**Reservar con crédito:** autorizar → registrar/bloquear idempotencia → bloquear cuenta → comprobar disponibilidad y crédito → insertar reserva confirmada y consumo -1 → devolver resultado al commit. Un conflicto revierte todo, incluido consumo. Sin crédito devuelve pago requerido; no confirma.

**Confirmar con pago:** pago separado con importe/moneda y referencia del proveedor. Sólo evidencia verificada por servidor, con evento de proveedor único, habilita confirmación. Actualización de reserva y marca de aplicación del pago son atómicas. El cliente nunca manda “pagado” como prueba. Si el pago llega tarde y el turno ya no está disponible, registrar conciliación pendiente; no forzar una reserva superpuesta. Proveedor, retenciones y compensación pendientes.

**Modificar:** autorizar → bloquear reserva y comprobar versión esperada → validar nuevo horario → actualizar la misma fila y registrar auditoría → commit. No tocar pagos ni créditos. Conflicto de exclusión o error revierte la transacción y conserva la reserva original. Comandos sobre versiones obsoletas devuelven conflicto.

**Cancelar:** autorizar → bloquear cuenta y reserva → comprobar versión/estado y política vigente → cancelar, liberar disponibilidad y emitir +1 sólo si es elegible → commit. Política y motivo quedan registrados. La unicidad por reserva y el estado impiden doble emisión incluso con claves idempotentes distintas. Reintento de una cancelación ya realizada devuelve el resultado existente.

**Inscripción/baja:** inscripción única por socio/grupo; cupo controlado transaccionalmente. Agenda deriva de inscripción activa y ocurrencias. La baja termina vigencia futura sin borrar clases ni asistencia pasada. Cupos por grupo/clase, espera y cancelaciones individuales requieren decisión del club.

## Pruebas obligatorias antes de conectar escrituras

Ejecutar migraciones y seeds reproducibles en Supabase local. Probar con rol authenticated y JWT de anónimo, socios A/B, usuario de ambos clubes, administrador A, suspendido y responsables autorizados/revocados; no sólo como propietario.

1. Acceso cruzado, autoasignación de rol, cambio de club_id, vínculo no verificado y escritura directa denegados.
2. Dos conexiones compiten por el mismo turno: exactamente una confirma.
3. Dos confirmaciones compiten por el último crédito: una consume; nunca saldo negativo.
4. Cancelación simultánea/repetida, incluso con claves distintas: un solo +1.
5. Modificación conflictiva o fallida conserva reserva, pago y créditos originales; sin cobro adicional.
6. Reintento idempotente recupera resultado; misma clave con otros parámetros falla.
7. Pago duplicado/tardío no duplica reserva ni habilita confirmación sin evidencia.
8. Límites de 90 minutos, turnos contiguos, zona horaria, suspensión y revocación familiar.
9. Inscripción/baja actualiza Agenda sin confundir asistencia ni introducir gimnasio.

Revisar compatibilidad de CLI y PostgreSQL antes de instalar. No hace falta un proyecto cloud para pruebas locales; no incorporar Redis, colas o microservicios en este bloque. No se afirma capacidad para 300 concurrentes sin medir una carga definida.

Referencias técnicas: [RLS de Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security), [desarrollo local](https://supabase.com/docs/guides/local-development), [restricciones sobre rangos de PostgreSQL](https://www.postgresql.org/docs/current/rangetypes.html#RANGETYPES-CONSTRAINT). Las decisiones de dominio y pruebas anteriores son el diseño del proyecto, no garantías ya verificadas.
