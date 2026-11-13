# Navegación nativa

Actualizado 2026-11-12. Primer bloque implementado con Expo Router: pestañas nativas y stack nativo de detalles. Concepto A provisional; no HTML dentro de Expo.

## Rutas implementadas

| Ruta            | Contenido                                                                                                   |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| /               | Inicio: saludo, Reservas/Gimnasio/Cuenta corriente, Primera rugby/hockey, resumen personal y comunicaciones |
| /agenda         | Hoy o próximos siete días, lista inicial derivada de reservas confirmadas e inscripciones activas demo      |
| /carnet         | Datos ficticios; espacio para QR, sin código validable ni ingreso                                           |
| /club           | Reservas primero, Deportes, Actividades y Vida en el club                                                   |
| /cuenta         | Datos del socio, cuenta corriente, familia, perfil, preferencias y soporte                                  |
| /modulos/[id]   | Entrada de cada módulo con contenido de lectura o vacío explicativo                                         |
| /partidos/[id]  | Rival, deporte/división, local/visitante, fecha/hora/sede y acceso al fixture                               |
| /novedades/[id] | Comunicación completa de demostración                                                                       |
| /reservas/[id]  | Detalle demo, estados y acciones separadas Modificar/Cancelar todavía deshabilitadas                        |
| /experiencia    | Redirección del enlace histórico a Club                                                                     |

Las cinco pestañas son Inicio, Agenda, Carnet, Club y Cuenta. Los detalles se apilan encima; el botón y gesto nativos vuelven al origen. Android conserva historial entre pestañas. La ruta inicial del stack ancla las pestañas en enlaces profundos; enlaces desconocidos tienen recuperación hacia Inicio/Club. No se implementa un historial paralelo en JavaScript.

## Jerarquía y límites

Reservas accesible a un toque desde Inicio; pádel/quinchos visibles al entrar a Club. Un detalle único de reserva se alcanza desde Inicio, Agenda o Mis reservas. Partidos públicos no se agregan automáticamente a Agenda personal.

Gimnasio libre no genera eventos. La fuente demo incluye Funcional inscripto y Yoga sin inscripción; Agenda refleja esa diferencia sin guardar cambios. Inscribirme/Cancelar inscripción y Modificar/Cancelar están identificados, deshabilitados y explicados: la transacción se implementará en PostgreSQL, sin motor falso.

El calendario diario/semanal completo y vista mensual secundaria siguen pendientes; este bloque ofrece lista de Hoy/próximos siete días. Los campos de familia no acreditan permisos. Cuenta, Carnet y módulos secundarios son demo, no funcionalidades terminadas.

## Validación móvil pendiente

Comprobar Inicio → Reservas → detalle → atrás, Club → Yoga → Agenda, Inicio → partido → fixture y detalles por enlace profundo. Revisar regreso Android/iOS, conservación del scroll, 320/390/430 puntos y tablet, orientación, tamaño de texto 200 %, VoiceOver/TalkBack y safe areas. Exportar bundles valida compilación, no estos recorridos en dispositivo.

## Revisión UX/UI — 2026-11-13

Las rutas y el stack no cambian. Inicio/Club exponen Reservar pádel, Reservar quincho, Mis reservas, rutina, cuenta y fixture mediante botones/tarjetas. Esos accesos abren los módulos demo ya existentes; no ejecutan reservas. NativeTabs mantiene cinco destinos con variantes de icono y estados activos/inactivos más claros. Los componentes compartidos mejoran también listas y estados en pantallas secundarias, sin ampliar sus funciones.
