# Modelo de datos preliminar

Documento de diseño; todavía no hay migraciones ejecutables ni RLS implementada. La creación y prueba del esquema corresponde al bloque E.

## Entidades previstas

| Tabla            | Relación y datos                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| clubs            | UUID, slug único, nombre, zona horaria e identidad configurable                                             |
| profiles         | id referenciado a auth.users; datos mínimos de la persona                                                   |
| club_memberships | club_id + user_id únicos; vínculo de usuario con club y estado de acceso                                    |
| member_records   | Registro administrativo por club; número de socio único por club; membresía opcional para socios sin cuenta |
| user_roles       | club_membership_id + rol únicos; una membresía admite múltiples roles                                       |
| activities       | club_id, nombre, tipo y estado                                                                              |
| calendar_events  | club_id, actividad opcional, comienzo/fin, ubicación y visibilidad                                          |

Los roles iniciales están declarados en packages/shared: member, administrator, fitness_coach, team_coach y activity_instructor. No asumir que PF/entrenador/profesor tienen permisos administrativos generales.

## Integridad e índices

- UUID como identificadores, created_at/updated_at en timestamptz y fechas de eventos con fin mayor que inicio.
- Unicidad de (club_id, user_id), (club_id, member_number) y (membership_id, role).
- Índices en claves foráneas y recorridos por (club_id, starts_at).
- Las relaciones con actividades y registros deben impedir cruces entre clubes mediante claves foráneas compuestas que incluyan club_id.
- Decidir explícitamente ON DELETE; evitar cascadas que borren historial administrativo sin intención.
- Estado administrativo del socio separado de deuda/becas. El bloque actual no modela dinero ni datos sensibles.

## Seguridad a implementar

RLS habilitada en cada tabla pública. Denegar por defecto. La identidad se deriva de auth.uid(), no de un user_id enviado por el cliente. Acceso al club condicionado a membresía habilitada; roles consultados por membresía/club.

Las políticas deben evitar recursión entre membresías y roles. Si se requiere una función SECURITY DEFINER, fijar search_path, limitar privilegios y auditar los argumentos. El usuario no puede autoasignarse roles ni reactivar su membresía. Las políticas UPDATE deben comprobar USING y WITH CHECK.

Los perfiles requieren una decisión explícita sobre campos visibles y ámbito: no conceder lectura global a todos los usuarios autenticados. El alta inicial de administradores será un procedimiento controlado, no una vía pública.

## Pruebas de aceptación del bloque E

En PostgreSQL local: usuario anónimo, socio de A, socio de B, miembro de ambos, administrador A y usuario suspendido. Verificar SELECT/INSERT/UPDATE/DELETE, intento de cambiar club_id, autoescalado de rol y referencias cruzadas. Probar políticas con JWT simulados y rol authenticated, no solamente con el propietario de la base.

Un filtro por club en el adaptador demo es comportamiento del ejemplo, no evidencia de aislamiento productivo.

## Requisitos nuevos a incorporar al modelo futuro (2026-11-05)

La revisión funcional exige separar cuenta autenticada de registro administrativo del socio y permitir menores sin cuenta con uno o más responsables autorizados. El esquema preliminar anterior no resuelve aún esa representación; no tomar profiles ligado a auth.users como identidad obligatoria de todo socio. Diseñar y validar vínculo con padrón, verificación, permisos por responsable y revocación antes de escribir migraciones.

Distinguir actividad, grupo/horario recurrente, ocurrencia de clase, inscripción y asistencia individual. Una baja no borra ocurrencias del club ni asistencia pasada: elimina la inclusión futura del participante en su calendario. Reservas confirmadas y solicitudes pendientes son estados distintos; pago también requiere estado propio. No se agregan tablas ni SQL en esta revisión.
