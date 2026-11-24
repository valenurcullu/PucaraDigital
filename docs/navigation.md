# Navegación nativa

Actualizado el 24 de noviembre de 2026. Expo Router conserva cinco pestañas nativas. Cuenta aloja sus vistas secundarias en su propio stack. Inicio y Club alojan un stack cada uno para conservar su pestaña durante la consulta de Pádel.

## Rutas implementadas

| Ruta                 | Contenido                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| /                    | Inicio: saludo, Reservas/Gimnasio/Cuenta corriente, Primera rugby/hockey, resumen personal y comunicaciones         |
| /turnos, /club/padel | Misma pantalla de una cancha en los stacks de Inicio y Club; parámetro opcional `manage` para abrir una reserva     |
| /club/reservas       | Directorio de reservas, créditos y reservas personales                                                              |
| /fixture             | Partidos de Primera de ambos deportes y resultados disponibles                                                      |
| /agenda              | Variante 1f con semana, Hoy y filtro Todos/Yo/Sofía/Tomás                                                           |
| /carnet              | Carnet del titular o familiar permitido, con QR demostrativo                                                        |
| /club                | Reservas primero, Deportes, Actividades y Vida en el club                                                           |
| /cuenta              | Datos del socio, cuenta corriente, familia, perfil, preferencias y soporte                                          |
| /cuenta/[section]    | Perfil, cuenta corriente, becas, preferencias, soporte y grupo familiar. `integrante?id=…` abre el perfil vinculado |
| /modulos/[id]        | Entrada de cada módulo con contenido de lectura o vacío explicativo                                                 |
| /partidos/[id]       | Rival, deporte/división, local/visitante, fecha/hora/sede y acceso al fixture                                       |
| /novedades/[id]      | Comunicación completa de demostración                                                                               |
| /reservas/[id]       | Detalle demo; los turnos de pádel activos abren su hoja de gestión                                                  |
| /experiencia         | Redirección del enlace histórico a Club                                                                             |

Las cinco pestañas son Inicio, Agenda, Carnet, Club y Cuenta. Los detalles se apilan encima; el botón y gesto nativos vuelven al origen. Android conserva historial entre pestañas. La ruta inicial del stack ancla las pestañas en enlaces profundos; enlaces desconocidos tienen recuperación hacia Inicio/Club. No se implementa un historial paralelo en JavaScript.

## Jerarquía y límites

Reservas accesible a un toque desde Inicio; pádel/quinchos visibles al entrar a Club. Un detalle único de reserva se alcanza desde Inicio, Agenda o Mis reservas. Partidos públicos no se agregan automáticamente a Agenda personal.

Gimnasio libre no genera eventos. La fuente demo incluye Funcional inscripto y Yoga sin inscripción; Agenda refleja esa diferencia sin guardar cambios. Las inscripciones de actividades siguen en consulta. Pádel permite ensayar Modificar o Cancelar en la sesión.

La vista semanal permite cambiar de día y semana. La vista mensual secundaria queda pendiente. Los campos de familia no acreditan permisos. Cuenta, Carnet y módulos secundarios son demo, no funcionalidades terminadas.

## Validación móvil pendiente

Comprobar Inicio → Reservas → detalle → atrás, Club → Yoga → Agenda, Inicio → partido → fixture y detalles por enlace profundo. Revisar regreso Android/iOS, conservación del scroll, 320/390/430 puntos y tablet, orientación, tamaño de texto 200 %, VoiceOver/TalkBack y safe areas. Exportar bundles valida compilación, no estos recorridos en dispositivo.

## Antecedente de navegación — 2026-11-13

Las rutas y el stack no cambian. Inicio/Club exponen Reservar pádel, Reservar quincho, Mis reservas, rutina, cuenta y fixture mediante botones/tarjetas. Esos accesos abren los módulos demo ya existentes; no ejecutan reservas. NativeTabs mantiene cinco destinos con variantes de icono y estados activos/inactivos más claros. Los componentes compartidos mejoran también listas y estados en pantallas secundarias, sin ampliar sus funciones.

## Revisión de accesos y regreso — 2026-11-20

- Inicio → Ver turnos de pádel y Club → Reservas → Ver turnos de pádel abren `/modulos/padel`. Mis reservas → Ver disponibilidad de pádel abre ese mismo destino.
- Tocar un turno abre un resumen modal. Volver a los horarios cierra el modal y conserva la fecha. El botón nativo de regreso del módulo vuelve al origen.
- Mi agenda permite navegar entre semanas de lunes a domingo. Un punto marca compromisos personales. El toque sobre una reserva o clase abre su detalle existente. Los partidos públicos conservan su recorrido por Inicio y Deportes.
- En las cinco pestañas, la vista nativa de área segura recibe los cuatro bordes y reserva el espacio comunicado por el sistema. Los ajustes automáticos del tab y del scroll se desactivaron para que haya un solo responsable de los insets. En los detalles el stack provee el encabezado.
