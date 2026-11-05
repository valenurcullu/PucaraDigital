# Etapa 1 — propuesta UX/UI v1

**Estado: propuesta para aprobación, 2026-11-05.** No reemplaza todavía los tokens ni las pantallas de las apps. [Lámina visual y seis wireframes](design/etapa-1.html): abrir el archivo en un navegador; funciona sin servidor, fuentes externas ni dependencias.

## Diagnóstico del sistema existente

Reutilizable: separación de UI web/nativa, tokens compartidos, safe areas, scroll, foco web, reducción de movimiento y modo demo explícito. Las entradas actuales son editoriales: títulos de 40–52 en móvil, mucho espacio de presentación y dos rutas de stack. No son el dashboard ni la navegación final.

A corregir al aprobar: bordó ajeno a la dirección acordada; tipografía editorial serif en web sin equivalente móvil; varios tamaños y espaciados literales; falta de tokens por función y estados de interacción; ausencia de componentes de datos, formularios y pestañas. No hay pruebas de VoiceOver/TalkBack ni texto al 200 % en dispositivos. El archivo del escudo mencionado en la auditoría sigue sin confirmación oficial; no se incorpora ni se redibuja.

## Dirección recomendada

Identidad deportiva sobria, con blanco como superficie predominante, azul marino para estructura y jerarquía, y rojo para la acción principal y pertenencia. Una tarea relevante por bloque, datos legibles y pocos contenedores; evitar que todo sea una tarjeta o un botón rojo. El rojo de marca no significa error: los errores llevan mensaje e icono, con su token propio.

Inicio muestra primero qué hacer hoy. Gimnasio y equipo reciben accesos prominentes para acompañar el desarrollo deportivo de 2026. La información económica permanece visible en su propio contexto, separada de habilitación administrativa.

## Paleta candidata y tokens semánticos

Los nombres expresan función; los valores hexadecimales son provisionales, no colores institucionales certificados. Implementar referencias a primitivas después de aprobar, con tipos TypeScript y adaptadores por plataforma.

| Token propuesto                 | Valor             | Uso                          |
| ------------------------------- | ----------------- | ---------------------------- |
| brand.primary                   | #C52235           | Identidad roja               |
| brand.navy                      | #10213A           | Cabecera destacada y carnet  |
| background.canvas               | #F4F6F9           | Fondo de pantalla            |
| background.surface              | #FFFFFF           | Contenido y controles        |
| background.subtle               | #EAF0F6           | Agrupaciones secundarias     |
| text.primary                    | #14233B           | Títulos y cuerpo             |
| text.secondary                  | #536176           | Metadatos legibles           |
| text.inverse                    | #FFFFFF           | Texto sobre rojo o marino    |
| action.primary                  | #C52235           | Acción principal             |
| action.primaryPressed           | #A6192B           | Pulsación / hover            |
| action.secondary                | #10213A           | Acción secundaria y enlaces  |
| action.disabledBackground       | #E2E7EE           | Control no disponible        |
| action.disabledText             | #536176           | Etiqueta no disponible       |
| border.subtle                   | #DEE4EC           | Separador decorativo         |
| border.control                  | #7B8799           | Límite de campos             |
| focus.ring                      | #C52235           | Anillo con separación blanca |
| status.successText / Background | #176447 / #EAF5EF | Confirmación                 |
| status.warningText / Background | #825000 / #FFF4DB | Atención                     |
| status.dangerText / Background  | #B42332 / #FFF0F1 | Error con explicación        |
| status.infoText / Background    | #10213A / #EAF0F6 | Información y modo demo      |

Contraste calculado por luminancia sRGB, sin redondear antes de comparar:

| Combinación               | Relación |
| ------------------------- | -------- |
| Texto principal / blanco  | 15,75:1  |
| Texto secundario / blanco | 6,29:1   |
| Texto secundario / canvas | 5,81:1   |
| Blanco / rojo principal   | 5,75:1   |
| Blanco / rojo presionado  | 7,51:1   |
| Blanco / marino           | 16,15:1  |
| Éxito texto / fondo       | 6,37:1   |
| Atención texto / fondo    | 6,21:1   |
| Error texto / fondo       | 5,88:1   |
| Borde de control / blanco | 3,64:1   |

Estas combinaciones de texto superan 4,5:1; esto no certifica la accesibilidad de una pantalla. El separador suave no sirve para identificar por sí solo un campo. En fondos oscuros, el foco lleva separación blanca para conservar contraste. Criterio de referencia: [WCAG 2.2, contraste mínimo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

## Tipografía y escala

Recomendación v1: fuentes del sistema, sin descargar ni redistribuir archivos. iOS usa la fuente predeterminada del sistema; Android, la suya; web usa `system-ui, -apple-system, "Segoe UI", sans-serif`. Se unifica la jerarquía y los pesos, conservando métricas nativas. Esto permite decidir la marca antes de incorporar otra familia y su licencia.

| Rol       | Tamaño / interlínea inicial | Peso | Uso                                       |
| --------- | --------------------------- | ---- | ----------------------------------------- |
| display   | 32 / 38                     | 700  | Saludo y hito, excepcional                |
| title     | 28 / 34                     | 700  | Título de pantalla                        |
| section   | 20 / 26                     | 600  | Secciones                                 |
| body      | 16 / 24                     | 400  | Contenido                                 |
| label     | 16 / 22                     | 600  | Acciones y campos                         |
| secondary | 14 / 20                     | 400  | Lugar, horario y ayudas                   |
| caption   | 12 / 16                     | 500  | Etiqueta breve, nunca contenido principal |
| metric    | 32 / 38                     | 700  | Pesos y resultados, cifras tabulares      |

Valores iniciales en unidades lógicas nativas y rem equivalentes web. Escalan con preferencias del sistema; no fijar alturas de texto ni limitar font scaling. Interlínea escalable, sin condensar etiquetas para hacerlas entrar. A 200 %, apilar filas y permitir scroll; verificar las cinco etiquetas de navegación con el componente nativo.

Espaciado: 4, 8, 12, 16, 20, 24, 32, 48. Margen móvil 20 (16 en pantallas estrechas), 24 entre secciones y 12 dentro de un grupo. Radios 8 para controles y 16 para paneles; cápsulas solo para estados/filtros. Controles de 48 unidades como mínimo, botón principal de 52, nunca por debajo de 44. Iconos de 20/24 con etiqueta accesible y área táctil independiente. Un solo nivel de sombra sutil, reservado para elementos elevados. Movimiento 150/220 ms, respetando reducción de movimiento. Modo oscuro queda pendiente de una propuesta específica.

## Arquitectura de navegación

Cinco pestañas permanentes y del mismo nivel: **Inicio · Agenda · Carnet · Club · Cuenta**. Carnet ocupa la posición central sin botón flotante sobredimensionado. Conservar estado y posición de scroll por pestaña; detalle en stack, volver nativo y deep links. El contenido de Inicio depende del rol/equipo; un socio sin deporte no recibe una rutina inventada.

Esquema conceptual de Expo Router, no rutas implementadas:

```text
app/
  (tabs)/
    index                    Inicio
    agenda                   Agenda
    carnet                   Carnet
    club                     Club
    cuenta                   Cuenta
  agenda/[eventId]            Detalle compartido
  club/rugby                 Equipo, fixture, resultados, posiciones
  club/hockey                Equipo, fixture, resultados, posiciones
  club/gimnasio              Semana y rutina asignada
  club/gimnasio/rutina/[id]   Registro de una sesión
  club/yoga                  Horarios (etapa posterior)
  club/funcional             Horarios (etapa posterior)
  club/reservas              Pádel y quinchos (etapa posterior)
  club/buffet
  club/beneficios
  club/noticias/[id]
  cuenta/perfil
  cuenta/estado-de-cuenta
  cuenta/familia
  cuenta/preferencias
  cuenta/ayuda
```

Club agrupa **Deportes** (rugby, hockey, gimnasio, resultados por deporte), **Actividades** (yoga, funcional), **Espacios** (reservas de pádel y quinchos) y **Vida en el club** (buffet, beneficios, noticias y eventos). Destacar primero lo asociado al socio y conservar acceso al catálogo completo; resultados tiene entrada visible y selección de deporte. No duplicar detalle de partido entre Inicio y Agenda.

Durante una sesión de gimnasio el stack concentra el registro; volver no debe descartar silenciosamente avances. Una sesión con cambios necesita confirmación de salida o conservación local definida al implementar. Las rutas futuras no se convierten ahora en pantallas vacías ni controles que simulen operaciones reales.

Administración posterior: navegación lateral con Resumen, Comunicados y Eventos; Socios y Operaciones solo al desarrollar sus módulos. Portal del socio posterior reutiliza lógica, sin condicionar ahora las pestañas móviles.

## Wireframes y jerarquía por pantalla

Los seis wireframes están en la [lámina](design/etapa-1.html). Los enlaces solo recorren la propuesta; no hay autenticación ni registro de datos.

| Vista    | Orden de lectura                                                                                   | Acción principal                                      | Casos a diseñar                                                                    |
| -------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Inicio   | Saludo y contexto → próximo entrenamiento/partido → rutina de hoy → resumen de cuenta → comunicado | Abrir próximo evento; rutina a un toque               | Sin equipo, día libre, sin eventos, evento cancelado, error parcial                |
| Agenda   | Semana y hoy → filtro contextual → fecha seleccionada → lista por hora                             | Abrir evento                                          | Día vacío, evento cancelado, cargas/error y visibilidad por rol                    |
| Carnet   | Marca → socio demo → estado administrativo → zona de código → instrucciones                        | Mostrar identificación, cuando exista validación real | Sin carnet, suspendido, credencial vencida/sin conexión; nunca fingir habilitación |
| Club     | Título → accesos propios → cuatro grupos → resultados y novedades                                  | Abrir módulo elegido                                  | Socio sin deporte, contenido no disponible, no autorizado                          |
| Cuenta   | Identidad → estado administrativo → situación económica → perfil/familia/preferencias/ayuda        | Abrir detalle de cuenta                               | Beca 100 %, deuda sin inferir suspensión, datos incompletos                        |
| Gimnasio | Volver/contexto → semana/rutina → ejercicio → anterior → filas serie/kg/reps/completar → progreso  | Registrar una serie                                   | Sin rutina, peso vacío o inválido, descanso, interrupción, sesión finalizada       |

Carnet de propuesta: área de código sin QR escaneable, con “DEMO · NO VÁLIDO PARA INGRESAR”. La política real de validación y el acceso sin conexión siguen abiertos. Separar “habilitación administrativa” de “situación económica” incluso en demo.

Gimnasio: peso anterior visible, teclado numérico con decimal local, series grandes y operación con una mano. Objetivo: completar con peso sugerido en un toque; si cambia el peso, editar y confirmar sin navegar a otra pantalla. Medir dos toques para la acción con valor precargado; el ingreso de nuevos dígitos requiere pulsaciones adicionales. Permitir deshacer y no asumir guardado remoto. El tiempo de descanso no bloquea el registro.

## Componentes a construir primero, luego de aprobación

1. **Base accesible:** tokens semánticos, AppText, Screen, Button, IconButton, Divider y StatusBadge; variantes normal/presionado/foco/deshabilitado/cargando. UI nativa primero.
2. **Navegación y lectura:** encabezado, cinco pestañas, SectionHeader, ListRow, EventRow, DemoNotice y estados Empty/Error/Loading. Validar con Inicio y Agenda demo.
3. **Identificación y cuenta:** MemberCardDemo y AccountSummary; distinguir estado administrativo y financiero. QR real fuera de alcance.
4. **Deportes:** RoutineSummary, ExerciseHeader y SetRow con campos numéricos, etiquetas accesibles y feedback de completado/deshacer.

Cada componente tiene implementación por plataforma; compartir tokens y contratos, sin crear packages/ui. No incorporar bibliotecas de UI, iconos o tipografía hasta evaluar una necesidad concreta.

## Aprobación y siguiente bloque

Aprobar la dirección rojo/marino/blanco, tipografía del sistema, densidad, jerarquía de Inicio y agrupaciones de Club de esta v1; registrar ajustes en este documento. La navegación de cinco pestañas y el orden de plataformas ya están aprobados y no se vuelven a abrir.

Después: implementar tokens semánticos y componentes base nativos; luego shell de pestañas y un Inicio demo de referencia. Cerrar ese bloque con capturas iOS/Android, pantalla pequeña/grande, texto 200 %, VoiceOver/TalkBack y contraste de combinaciones reales. El resto de pantallas avanza después de esa revisión. No avanzar a Supabase, Auth ni módulos completos por aprobar una lámina.
