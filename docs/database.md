# Identidad y reservas de pádel

Hito 2, 2026-11-20. Las migraciones de [supabase/migrations](../supabase/migrations) definen el esquema ejecutable. La app continúa con su lector demo. La [guía local](../supabase/README.md) describe ambos entornos de prueba.

## Identidad y permisos

| Registro        | Qué representa                                                                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| auth.users      | Identidad de autenticación. El login por sí solo no da acceso al padrón.                                                                                      |
| clubs y members | Club, zona horaria y socios administrativos. El número de socio es único dentro del club.                                                                     |
| memberships     | Acceso activo o suspendido de un usuario a un club. Un socio puede existir sin usuario.                                                                       |
| member_links    | Vinculación personal otorgada por una operación administrativa de confianza. Una cuenta y un socio tienen a lo sumo un vínculo personal por club.             |
| guardians       | Relación verificada entre usuario responsable y menor. Admite varios responsables por menor y varios menores por responsable. La revocación retira el acceso. |
| role_grants     | Combinaciones de rol y ámbito por membresía. Hoy solo el rol administrativo en el ámbito de padrón amplía la lectura de socios.                               |
| scholarships    | Datos administrativos privados.                                                                                                                               |

Solo el esquema público se expone a la API. Las tablas privadas pertenecen a `pucara_private`. Las claves foráneas compuestas incluyen el club. Las tablas públicas tienen RLS y privilegios explícitos. Un socio activo lee sus datos y sus reservas. Un responsable puede consultar los registros y reservas de menores vinculados. Solo el titular puede ver sus movimientos y consumir créditos. Suspender la membresía corta el acceso al club.

El cliente carece de permisos para crear vínculos, otorgar roles, modificar becas o escribir directamente en las tablas. Las funciones con `SECURITY DEFINER` usan propietarios dedicados sin login, permisos explícitos y ruta de búsqueda fija. Comprueban el actor con `auth.uid()`. La verificación administrativa para el alta de un vínculo, su trazabilidad operativa y la autenticación del usuario final requieren un bloque posterior.

## Disponibilidad y reservas

- `padel_courts` guarda precio por cancha en centavos de ARS, inicialmente 4.000.000. `padel_slots` publica turnos de 90 minutos.
- `padel_occupancy` reúne reservas y bloqueos administrativos en el mismo índice de exclusión GiST. Los intervalos `[inicio, fin)` admiten turnos contiguos. Otra exclusión impide que el titular reserve dos canchas a la vez. Una reserva exige una franja publicada.
- `padel_availability` devuelve cancha, horario y precio, omite bloqueos incluso parciales y protege la identidad de otros socios. La exclusión en la escritura resuelve las carreras posteriores a la consulta.
- `padel_credits` cuenta turnos enteros y actúa como fila de bloqueo. Debe provisionarse una cuenta por titular antes de operar. Cada alta o consumo en `padel_movements` modifica el contador en la misma transacción. El historial queda protegido frente a escrituras de los clientes.

## Comandos disponibles en PostgreSQL

`public.padel_command(p_club, p_member, p_request, p_action, p_reservation, p_version, p_court, p_start)` devuelve el UUID de la reserva. El cliente genera un UUID por intención y lo conserva al reintentar. La auditoría registra actor, titular, clave, argumentos y versión resultante. Reusar una clave con otros argumentos produce conflicto.

| Acción | Efecto atómico                                                                                                                                                                                                  |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| book   | Reserva un turno futuro y consume exactamente un crédito del titular. Guarda el precio vigente. Si el crédito falta o hay conflicto, se revierte toda la operación.                                             |
| move   | Con la versión esperada, cambia cancha y horario en la misma reserva. Conserva precio y créditos. Si falla, se mantiene el turno anterior.                                                                      |
| cancel | Requiere aprobación privada con motivo para esa reserva y versión. Libera la cancha y emite un crédito. Una modificación invalida la aprobación previa. La unicidad por reserva y motivo protege la devolución. |

Mientras el club define la política, solo se prueba la rama de cancelación elegible con una decisión administrativa explícita. Sin aprobación el comando conserva la reserva. La operación con pago queda pendiente de un proveedor y evidencia verificada en servidor. Los pagos futuros tendrán su propio historial y mecanismo de conciliación. Las reglas de negocio pendientes están en [pádel](padel-rules.md).

## Aceptación pendiente

Validar el arranque y reset bajo Supabase/PostgreSQL 17 y ejercer las políticas mediante sesiones Auth y PostgREST. Después se podrá conectar una sección vertical de consulta de disponibilidad. Quedan pendientes alta y revocación administrativas auditadas, pago duplicado/tardío, retenciones, reglas para menores, pruebas de carga representativa y los módulos de quinchos, inscripción y gimnasio. Resultados ejecutados en [verificaciones](verification.md).
