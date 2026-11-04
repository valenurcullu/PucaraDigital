# Navegación

## Disponible ahora

- Web: /, entrada de fundaciones; /experiencia, vista previa informativa de la estructura prevista.
- Móvil: /, entrada; /experiencia, vista previa mediante stack de Expo Router.
- Web: página 404 con regreso al inicio y límite de error con reintento.
- Estas vistas no representan funcionalidades de agenda, cuenta ni carnet. Serán reemplazadas en la Etapa 1: un socio autenticado no debe ver una landing de marketing como inicio.

## Móvil aprobado (Etapa 1)

Cinco pestañas inferiores: **Inicio · Agenda · Carnet · Club · Cuenta**. Cada pestaña conserva su estado; los detalles se abren en stack, respetan volver y el gesto nativo. Convenciones de iOS y Android se respetan cuando difieren.

- **Inicio:** dashboard personal según roles y equipos del usuario: próximo entrenamiento, próximo partido, rutina de gimnasio, estado de cuenta, próxima reserva, comunicados importantes y accesos rápidos. No todos los usuarios ven lo mismo.
- **Agenda:** eje de la app. Vista semanal y diaria; mensual secundaria. Entrenamientos, partidos, actividades, eventos, reservas y convocatorias. Inspiración funcional en WebCampus UADE, con diseño original.
- **Carnet:** carnet digital, QR, datos básicos y estado de habilitación. Demo claramente identificado hasta contar con validación segura; evaluar disponibilidad sin conexión.
- **Club:** agrupado por categorías, no una lista plana. Propuesta inicial a validar en wireframes:
  - _Mis deportes_ (contextual al usuario): rugby, hockey, gimnasio — fixture, resultados, posiciones, videos y convocatorias de su equipo.
  - _Actividades_: yoga y funcional.
  - _Reservas_: pádel y quinchos.
  - _Vida en el club_: noticias y eventos, beneficios, carta del buffet.
- **Cuenta:** perfil, cuenta corriente, cuotas, historial de pagos, becas y descuentos, grupo familiar, configuración, preferencias, ayuda y soporte. El estado administrativo se muestra separado de la situación económica: un socio becado puede estar al día sin abonar cuota.

## Acciones frecuentes (objetivo de toques desde la app abierta)

| Tarea                    | Objetivo                                         |
| ------------------------ | ------------------------------------------------ |
| Próximo entrenamiento    | 0 (visible en Inicio)                            |
| Estado de cuenta / deuda | 0 para el estado, 1 para el detalle              |
| Rutina de hoy            | 1 desde Inicio                                   |
| Registrar una serie      | ≤ 2 dentro de la rutina                          |
| Próxima reserva          | 0 en Inicio, 1 desde Agenda                      |
| Carnet                   | 1 (pestaña)                                      |
| Beneficios               | 2 (Club → Beneficios), o acceso rápido en Inicio |

## Administración (Etapa 3)

Área web propia con navegación lateral: Resumen, Comunicados, Eventos y, más adelante, Socios, Actividades y Operaciones. Mostrar accesos por rol mejora la UX, pero el control definitivo está en servidor/RLS.

## Portal web del socio (Etapa 6)

Postergado, no eliminado. Reutilizará contratos y servicios compartidos. Sidebar en escritorio y navegación compacta en pantallas pequeñas; enlaces profundos para compartir rutas.
