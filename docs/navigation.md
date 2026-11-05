# Navegación

## Disponible ahora en las aplicaciones

Web y móvil conservan / y /experiencia como entradas informativas de fundaciones. La web tiene 404 y error boundary. No hay cinco pestañas funcionales, reservas ni inscripciones reales. Los HTML de revisión están separados en docs/design.

## Decisiones confirmadas del socio

Cinco pestañas: **Inicio · Agenda · Carnet · Club · Cuenta**. La propuesta detallada de jerarquía y recorridos requiere aprobación separada de la dirección visual.

- **Inicio:** saludo; accesos directos a Reservas, Gimnasio y Cuenta Corriente; próximos partidos de Primera de rugby y hockey (rival, local/visitante, día y horario); Novedades y Comunicaciones administrables desde web; eventos y reservas personales relevantes, con resumen breve. Útil para deportistas, socios sociales y familias.
- **Agenda:** día y semana, mes secundario. Partidos, convocatorias y entrenamientos con horario; reservas confirmadas de pádel/quinchos; clases de yoga/funcional solo para participantes inscriptos. Gimnasio libre no genera eventos automáticos. Las inscripciones recurrentes incorporan clases futuras; la baja retira sus eventos futuros personales.
- **Carnet:** identificación QR, inicialmente demo sin valor de ingreso.
- **Club:** primero **Reservas** (pádel, quinchos y acceso a Mis reservas); **Deportes** (rugby, hockey, gimnasio, fixture, resultados y videos); **Actividades** (yoga y funcional); **Vida en el club** (buffet, beneficios, novedades y eventos).
- **Cuenta:** cuenta corriente, situación económica, becas, familia, perfil, preferencias y soporte. Separar estado administrativo y situación económica.

## Jerarquía y recorridos propuestos, pendientes de aprobación

[Revisión funcional v2](ux-functional-review.md) contiene escenarios normales, vacíos, conflictos, pago rechazado, cambios y cancelaciones. [Comparador HTML](design/revision-ux.html) ofrece tres direcciones sobre estos mismos recorridos. La v1 queda como antecedente no aprobado.

```text
Inicio ─ Reservas ─ Pádel / Quinchos ─ Disponibilidad ─ Revisión ─ Resultado
       ├ Gimnasio (sin evento automático)
       ├ Cuenta Corriente
       ├ Primera Rugby / Hockey ─ Partido ─ Fixture / Resultados
       ├ Para vos ─ Detalle de evento o reserva
       └ Novedades y Comunicaciones
Club ─ Reservas (primer bloque) ─ Pádel / Quinchos / Mis reservas
     ├ Deportes ─ Rugby / Hockey / Gimnasio / Fixture / Resultados / Videos
     ├ Actividades ─ Yoga / Funcional ─ Inscripción recurrente
     └ Vida en el club ─ Buffet / Beneficios / Novedades / Eventos
Mis reservas ─ Detalle ─ Modificar ─ Revisar cambio
                      └ Cancelar ─ Confirmar consecuencias
Actividad ─ Participante autorizado ─ Inscripción / Baja ─ Agenda personal
```

Conservar selección al volver, contexto por pestaña y detalle único accesible desde distintos puntos. Para familia, mostrar el participante en revisión, confirmación y detalle; no inferir autorización por compartir apellido o cuenta. Agenda pública y personal son filtros propuestos, no permisos implementados.

## Objetivos de acceso a validar

| Tarea                             | Objetivo desde Inicio                                                |
| --------------------------------- | -------------------------------------------------------------------- |
| Abrir Reservas o Mis reservas     | 1 toque al centro de reservas                                        |
| Consultar disponibilidad de pádel | 2 toques, sin submenús adicionales                                   |
| Abrir gimnasio o cuenta corriente | 1 toque                                                              |
| Ver próximos partidos de Primera  | Visibles en Inicio; detalle a 1 toque                                |
| Consultar carnet                  | 1 toque en pestaña                                                   |
| Abrir una actividad               | Club → Yoga/Funcional                                                |
| Inscribirse                       | Detalle → revisión de recurrencia/participante → confirmar           |
| Cancelar                          | Detalle → advertencia → confirmar, sin acción irreversible inmediata |

Los objetivos no incluyen elegir datos ni lectura de condiciones. No sacrificar una confirmación necesaria para reducir toques.

## Plataformas posteriores

Administración web: Resumen, Comunicados y Eventos primero; gestión de recursos, reservas y actividades al implementar cada módulo. La edición web de Novedades y Comunicaciones es fuente del contenido de Inicio. Portal web del socio postergado, no eliminado. Se reutiliza lógica compartida, no componentes nativos.
