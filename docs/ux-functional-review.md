# Revisión funcional UX — v2

**Estado vigente (2026-11-12):** A seleccionado provisionalmente; primer bloque nativo autorizado. Estética definitiva pendiente. Los HTML son históricos: prevalecen [reglas de pádel](padel-rules.md) y [diseño transaccional](database.md).

[Abrir comparador HTML](design/revision-ux.html). Los prototipos son simulaciones en memoria con datos ficticios: no reservan, cobran ni inscriben. Recargar restablece el escenario. No se modifican Expo, Next, contratos ni dependencias.

## Qué está confirmado

| Área             | Decisión del usuario                                                                                                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Navegación       | Inicio, Agenda, Carnet, Club y Cuenta                                                                                                                                                                                     |
| Inicio           | Saludo; accesos a Reservas, Gimnasio y Cuenta Corriente; próximos partidos de Primera de rugby y hockey con rival, local/visitante, día y hora; Novedades y Comunicaciones desde administración; resumen personal acotado |
| Audiencia        | Deportistas, socios sociales y familias; aproximadamente 2.500 socios activos y hasta 300 usuarios concurrentes previstos                                                                                                 |
| Agenda           | Día y semana prioritarios, mes secundario; partidos, convocatorias y entrenamientos con horario; reservas confirmadas; yoga/funcional solo con inscripción; gimnasio libre no crea eventos                                |
| Club             | Reservas primero (pádel/quinchos); Deportes; Actividades; Vida en el club                                                                                                                                                 |
| Pádel            | Disponibilidad, reserva, pago por turno, modificación y cancelación; reservas existentes visibles; pago real posterior                                                                                                    |
| Quinchos         | Disponibilidad por fecha/horario, reserva, modificación y cancelación; aprobación y pago configurables                                                                                                                    |
| Actividades      | Días, horarios, ubicación y cupos; inscribirse/desinscribirse; recurrencia integrada con Agenda; inscripción distinta de asistencia                                                                                       |
| Carnet           | Carnet QR inicialmente demo; sin validar ingreso real                                                                                                                                                                     |
| Cuenta           | Cuenta corriente, situación económica, becas, familia, perfil, preferencias y soporte                                                                                                                                     |
| Identidad futura | Google o email mediante OTP; cuenta de usuario distinta del registro administrativo de socio; menores vinculables con uno o más responsables autorizados                                                                  |

## Arquitectura de información propuesta para aprobación

**Inicio universal:** saludo → tres accesos rápidos → dos partidos de Primera (uno de cada deporte) → “Para vos” (máximo dos próximos compromisos, con “Ver agenda”) → Novedades y Comunicaciones (dos piezas, con ver todas). Un aviso importante puede subir de posición. Este límite y su prioridad son propuestas, no reglas aprobadas. Sin equipo asociado, siguen siendo útiles las reservas, actividades, partidos del club y comunicaciones.

**Club:** Reservas ocupa el primer bloque y enlaza directamente a disponibilidad de Pádel/Quinchos y a Mis reservas. Deportes agrupa rugby, hockey, gimnasio, fixture, resultados y videos. Actividades ofrece Yoga y Funcional. Vida en el club reúne buffet, beneficios, novedades y eventos.

**Detalle único:** una reserva se consulta desde Mis reservas, Agenda o Inicio sin duplicar la operación. Los partidos tienen el mismo detalle desde Inicio, Agenda y Deportes. Inicio no incorpora automáticamente partidos públicos a la agenda personal: separar “Partidos del club” de compromisos propios. Es una propuesta de filtrado por validar; entrenamientos y convocatorias se mostrarán según pertenencia/visibilidad.

**Contexto familiar:** consultar para quién se realiza la acción antes de confirmar. El prototipo ofrece Alex y un menor ficticio con vínculo ya autorizado; no demuestra verificación de parentesco. La posibilidad y condiciones de reservar por un menor siguen pendientes. Las actividades del prototipo permiten revisar la inscripción del menor bajo autorización ficticia. Otro responsable autorizado consulta el mismo registro del menor; no genera una segunda inscripción por tener su propia cuenta.

## Recorridos de reservas

### Entrada y consulta

1. Inicio → Reservas, o Club → Pádel / Quinchos. Mis reservas está visible desde el primer nivel.
2. Elegir espacio, fecha y franja; mostrar inicio/fin, duración, disponibilidad y precio por turno o condición configurable.
3. Sin disponibilidad: explicar el resultado y permitir otra fecha/espacio; preservar selección al volver.
4. Revisar espacio, fecha, horario, titular, precio total, pago y política aplicable antes de confirmar. Para pádel rigen 90 minutos y ARS 40.000 configurable. Quinchos tiene reglas pendientes; los importes antiguos del HTML son históricos.

### Pádel: pago por turno o crédito

Disponibilidad → resumen → consumir 1 crédito disponible o pagar sin créditos → resultado → Mis reservas. No existe saldo monetario interno. En HTML solo se elige **simular pago aprobado o rechazado**; no se piden tarjetas ni se conecta un proveedor. Rechazo: conservar selección y permitir reintentar/volver; no mostrar reserva confirmada. En producción debe revalidarse disponibilidad de forma atómica y tratar idempotencia, retención temporal y confirmación de pago en servidor. Nada de eso se implementa aquí.

Escenario alternativo: el turno se ocupa mientras se revisa; volver a disponibilidad con una explicación y sin cobrar ni crear reserva en la simulación.

### Quinchos: políticas configurables

Disponibilidad → resumen de condiciones → solicitud o confirmación → detalle. El panel de revisión permite probar aprobación directa o revisión administrativa y pago requerido o no requerido. Son escenarios UX, no configuración administrativa implementada.

Si exige aprobación, mostrar “Pendiente de aprobación”; no confundir solicitud con reserva confirmada ni incorporarla como reserva confirmada a Agenda. El prototipo propone aprobar primero y luego pagar cuando corresponda. El orden aprobación/pago, su plazo y el bloqueo de disponibilidad **quedan pendientes**. El revisor puede simular aprobación o rechazo desde los controles de escenario, claramente separados de las acciones del socio.

### Consultar, modificar y cancelar

- Mis reservas agrupa activas, pendientes e históricas; estados explícitos, con detalle de pago separado.
- Modificar → nueva disponibilidad → comparar turno anterior/nuevo y diferencias → confirmar cambio simulado. No liberar ni sobrescribir el turno original al explorar o volver. Conflicto conserva la reserva original.
- Pádel: Modificar → nueva fecha/hora disponible → Confirmar modificación. Actualizar la misma reserva sin cobrar ni generar créditos; ante error conservar la original. Quinchos conserva reglas propias pendientes.
- Cancelar → resumen y consecuencias → confirmación explícita → estado Cancelada. Se elimina de futuros compromisos personales pero conserva historial. En pádel, cancelación elegible genera exactamente 1 crédito de turno sin duplicados. Elegibilidad y reintegros monetarios pendientes.
- Error o acción no permitida: conservar datos y mostrar motivo/recuperación; no ofrecer un botón destructivo sin explicación.

## Recorrido de actividades

Club → Yoga / Funcional → detalle (días, horario, sede, cupos) → seleccionar participante autorizado → revisar inscripción recurrente → confirmar simulación → estado Inscripto y próximas clases en Agenda.

La revisión muestra las fechas futuras afectadas. Inscripción activa genera la presencia personal en las clases futuras de ese grupo, sin duplicarlas por abrir de nuevo la pantalla. No crea asistencia confirmada: inscripción recurrente, convocatoria de clase y asistencia individual son conceptos distintos.

Cancelar inscripción → advertencia con participante y alcance → confirmar → retirar clases futuras de la agenda de ese participante. Se conserva el pasado y la asistencia histórica en el modelo futuro; cancelar una inscripción no elimina las clases del club ni afecta a otros socios. El prototipo solo contiene fechas futuras y demuestra su retiro.

Cupo completo: informar sin crear inscripción. Lista de espera, prioridad, promoción automática, cancelación de una sola clase, recuperatorios y penalizaciones son reglas posteriores pendientes; el prototipo no activa una lista ficticia como si existiera. Un cambio de horario/feriado exige actualizar la proyección personal y comunicarlo: mecanismo y anticipación pendientes.

## Recorrido de consulta de partidos

Inicio → tarjeta Primera de rugby/hockey → detalle con rival, local/visitante, fecha/hora y sede → fixture o resultados del mismo deporte. Fixture y resultados están separados por estado del partido; “A confirmar” cuando faltan datos, nunca un horario inventado en producción.

Deportes → Rugby/Hockey → fixture/resultados/videos ofrece la misma información. Agenda distingue compromisos del socio de calendario público del club. Seleccionar “Partidos del club” no cambia la pertenencia a un equipo ni implica una convocatoria. Sin partido publicado, mostrar estado vacío y última actualización cuando exista.

## Reglas abiertas antes de desarrollo real

| Decisión pendiente                                                      | Por qué importa                                        |
| ----------------------------------------------------------------------- | ------------------------------------------------------ |
| Anticipación/límites y precio/duración de quinchos                      | Cotización, selección de turnos y elegibilidad         |
| Retención del turno durante pago, vencimiento, cancelación y reintegros | Evitar sobreventa, doble cobro y falsas confirmaciones |
| Aprobación/pago de quinchos, depósitos y condiciones                    | Orden y estados del recorrido                          |
| Quién puede reservar o inscribir por un menor                           | No inferir permisos desde la pantalla de familia       |
| Cupo por grupo o por clase; bajas individuales y listas de espera       | Efectos de recurrencia y asistencia                    |
| Horizonte de clases, feriados, cambios/cancelaciones de sede y horario  | Proyección de Agenda y comunicación                    |
| Verificación del vínculo usuario–socio y responsables                   | Separar autenticación, identidad y autorización        |
| Datos visibles para cada responsable y revocación de vínculos           | Privacidad y acceso consistente                        |
| Filtros públicos/personales de partidos y convocatorias                 | No saturar ni exponer agendas privadas                 |
| Criterio de orden/prioridad y límite del resumen de Inicio              | Utilidad para sociales, familias y deportistas         |

## Futuro, sin implementación en esta revisión

Pagos y reservas reales, inscripciones persistidas, listas de espera, asistencia por clase, notificaciones, autenticación Google/OTP, vínculos administrativos y QR válido. Las pantallas secundarias de Cuenta/Gimnasio/Carnet en HTML son contextuales, no módulos implementados. El volumen previsto es un requisito de dimensionamiento, **no capacidad probada**; requiere objetivos de latencia, mezcla de operaciones y pruebas de carga posteriores.

## Tres direcciones visuales

| Propuesta           | Composición                                                                                       | Tipografía / identidad                                             | Ventaja y aspecto a revisar                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| A · Club editorial  | Saludo amplio, accesos en fila, partidos como agenda editorial, separadores y superficies cálidas | Títulos serif de sistema, cuerpo sans, rojo profundo y marino      | Pertenencia y lectura tranquila; revisar densidad y velocidad de exploración    |
| B · Pulso deportivo | Cabecera marino, jerarquía tipográfica fuerte, botones compactos, marcadores y franjas rojas      | Títulos sans condensados del sistema, números grandes, rojo vivo   | Energía e identidad deportiva; comprobar cercanía para familias/socios sociales |
| C · Club cotidiano  | Cabecera clara, accesos en bloques amplios, agrupaciones suaves y acciones explícitas             | Sans de sistema, radios generosos, blanco y azul grisáceo con rojo | Accesibilidad y orientación a servicios; revisar que mantenga carácter propio   |

La diferenciación incluye estructura, densidad, tipografía y tratamiento de contenido; no solo colores. Todas conservan las cinco pestañas y los mismos flujos para comparar sin alterar las decisiones funcionales. Fuentes instaladas del sistema, sin descarga externa; los resultados tipográficos pueden variar entre equipos. No se usa el escudo sin confirmación oficial.

## Criterios de aprobación

Revisar por separado: (1) arquitectura de información, prioridades y recorridos; (2) dirección visual A/B/C o combinación explícita. Las funcionalidades confirmadas no requieren repetirse; las reglas abiertas no se convierten en reglas por aparecer en una maqueta.

Pruebas de recorrido: hallar Reservas desde Inicio/Club; ver y modificar una existente; simular rechazo de pago sin confirmación; probar solicitud de quincho; inscribir y dar de baja yoga/funcional verificando Agenda; consultar ambos partidos de Primera; entender para quién se actúa. Evaluar lectura en 320–430 px, teclado, contraste, foco y texto ampliado. Las pruebas HTML no sustituyen VoiceOver/TalkBack ni interacción nativa.

Actualización 2026-11-12: el usuario autoriza el primer bloque nativo con A provisional. No se requieren nuevas alternativas ni aprobación estética definitiva para avanzar. Los criterios anteriores son guía de revisión, no bloqueo.
