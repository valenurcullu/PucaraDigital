# Handoff: Pucará Digital — rediseño UX/UI de la app de socios

> Destinatario: un agente de código (Codex / Claude Code) que trabaja sobre el repo `valenurcullu/PucaraDigital` (monorepo pnpm + turbo, app en `apps/mobile`, Expo Router + NativeTabs, tokens en `packages/design-tokens/src/member-theme.ts`, datos demo en `packages/shared/src/demo-member-experience.ts`).

## Overview
Rediseño completo de la experiencia del socio del Club Pucará (Buenos Aires) para iOS y Android: Inicio, Agenda, Carnet, Club, Cuenta, y los módulos Pádel (prioritario), Quinchos, Gimnasio (registro de entrenamiento estilo Hevy), Yoga/Funcional, Cuenta corriente y Grupo familiar. Principio rector: **menos es más** — menos texto, botones que parecen botones, acciones principales visibles, uso con una mano.

## About the Design Files
Los archivos `.dc.html` de este paquete son **referencias de diseño hechas en HTML**: prototipos que muestran aspecto y comportamiento. **No son código de producción para copiar.** La tarea es **recrear estos diseños en React Native / Expo** dentro de `apps/mobile`, usando los patrones existentes del repo (Expo Router, NativeTabs, `RoutePressable`, `member-ui.tsx`, `control-colors.ts`, `DateStrip`, `expo-symbols`). Para abrirlos: abrir `Pucara Digital - Propuesta.dc.html` en un navegador (requiere `support.js` al lado). `PucaraApp.dc.html` es el prototipo navegable.

Reglas del repo que se mantienen (ver `AGENTS.md`, `docs/padel-rules.md`, `docs/decisions.md`): no inventar reglas comerciales; no implementar pagos ni autenticación reales; la UI presenta resultados pero el backend decide disponibilidad, permisos y créditos; todo dato ficticio se marca como demo.

## Fidelity
**Alta fidelidad.** Colores, tipografía, espaciados, radios y estados son finales para esta etapa. Recrear con fidelidad usando componentes nativos. Diferencias de plataforma: ver “Plataforma”.

## Selección aprobada por el cliente
- **Inicio: variante 2a** (`homeStyle="c"`): cabecera marina de 1b + bloque “Primera” en tarjetas y “Novedades” en lista de 1a.
- **Pádel: variante 1c** (`padelPicker="grilla"`): grilla de 3 columnas.
- **Agenda: variante 1f** (`agendaStyle="semana"`): tira semanal + tarjetas del día.
- Botones: aprobados tal como están.
- Club → “Mis reservas” como tarjeta-botón (no link de texto).

Las demás variantes (1a, 1b, 1d, 1e, 1g, 1h) quedan en el lienzo solo como registro; **no implementarlas**.

---

## Design Tokens

### Color (alineado con `member-theme.ts`; nuevos marcados ★)
| Token | Hex | Uso |
|---|---|---|
| background | `#F4F3EF` | fondo de pantalla (★ ajuste mínimo del `#F5F4F0` actual; se puede conservar el actual) |
| surface | `#FFFFFF` | tarjetas |
| subtle ★ | `#EEEDE9` | divisores internos, chips neutros, fondo presionado |
| text | `#18283B` | texto principal |
| secondaryText | `#586575` | texto secundario |
| tertiary ★ | `#8A929B` / `#9AA3AD` | encabezados de tabla, chevrons, deshabilitado |
| action | `#BC2438` | primario, selección de horario, tab activa iOS |
| actionPressed | `#981B2C` | primario presionado |
| actionSoft | `#FBECEF` | etiqueta “Convocado”, fondo destructivo presionado |
| actionBorder ★ | `#E5B9C0` | borde de botón destructivo (paso 1) |
| destructiveSolid ★ | `#9F2030` (pressed `#7E1826`) | confirmación destructiva final |
| navy | `#14263D` | cabecera de Inicio, día seleccionado, botón fuerte neutro |
| navyPressed | `#223C59` | |
| navySoft | `#E8EEF5` | botón secundario, banners informativos |
| onDarkMuted | `#D3DFEB` | texto secundario sobre marino |
| success | `#1F5C3F` text / `#E6F2EA` bg / `#2E8A5C` sólido | Confirmada, Inscripto, crédito, serie hecha |
| warning ★ | `#7A4F00` text / `#FBF0D9` bg / `#C98A00` barra | Pendiente, avisos demo |
| androidTabPill ★ | `#F6D9DE` | indicador de tab activa Android |
| androidNavBg ★ | `#EFEDE8` | fondo barra inferior Android |
| scrim ★ | `rgba(10,18,30,.45)` | fondo de bottom sheet |

Bordes de tarjeta: en vez de borde, sombra de 1px `0 0 0 1px rgba(20,38,61,.07)` (en RN: `borderWidth: StyleSheet.hairlineWidth*2, borderColor: 'rgba(20,38,61,0.08)'`).

### Tipografía
- **UI**: fuente del sistema (SF Pro en iOS, Roboto en Android). Sin fuentes nuevas para texto.
- **Numérica / display ★**: `Barlow Condensed` 500/600/700 (Google Fonts, `@expo-google-fonts/barlow-condensed`) **solo** para horarios, números de día, marcador, N° de socio, kg/reps, montos. Si el club no la aprueba, usar sistema con `fontVariant: ['tabular-nums']`.

| Rol | Tamaño / peso |
|---|---|
| Título de pestaña | 32 / 700, tracking -0.02em |
| Saludo Inicio | 30 / 700 |
| Título de sección | 20 / 700 (18 / 700 dentro de módulos) |
| Título de sheet | 22 / 700 |
| Título de tarjeta | 16–17 / 600 |
| Cuerpo | 15–16 / 400 |
| Secundario | 13–14 / 400 |
| Etiqueta/chip | 12 / 600–700 |
| Botón primario | 17 / 600 |
| Horario en grilla | Barlow 24 / 600 |
| Número de día (DateStrip) | Barlow 26 / 700 |
| Hora en tarjeta de Agenda | Barlow 21 / 600 (fin 15 / 500) |

### Espaciado, radios y toque
- Padding horizontal de pantalla: **16**. Gap entre secciones: **22–24**. Gap dentro de sección: **10**. Gap de grilla: **8–10**.
- Radios: chip 999 · input/botón chico 10–13 · control 14 · botón primario 15–16 · tarjeta 18 · tarjeta destacada 20–22 · carnet 24 · sheet 28 (solo esquinas superiores).
- Alturas: botón primario **56** (52 en barra fija), secundario **48**, fila de lista **54–68**, chip de horario **62**, día de DateStrip **58×80**, flechas de semana **44×44**. Mínimo táctil 44.
- Presionado: escala 0.97–0.98 + color presionado (Pressable `style={({pressed}) => …}`).

### Iconos
Material Symbols Rounded en el prototipo. **En la app: mantener `expo-symbols` (SF Symbols en iOS / símbolos de Android ya empaquetados)** con estos equivalentes:
| Concepto | Material (prototipo) | SF Symbol sugerido |
|---|---|---|
| Inicio | home | house / house.fill |
| Agenda | calendar_month | calendar |
| Carnet | id_card | person.text.rectangle(.fill) |
| Club | stadium | sportscourt(.fill) |
| Cuenta | person | person.crop.circle(.fill) |
| Pádel | sports_tennis | figure.tennis / tennis.racket |
| Quinchos | outdoor_grill | flame |
| Gimnasio | fitness_center | dumbbell(.fill) |
| Rugby | sports_rugby | figure.rugby / football |
| Hockey | sports_hockey | figure.hockey |
| Yoga | self_improvement | figure.mind.and.body |
| Funcional | directions_run | figure.run |
| Crédito | confirmation_number | ticket(.fill) |
| Cuenta corriente | receipt_long | doc.text |
| Modificar | edit_calendar | calendar.badge.clock |
| Cancelar | event_busy | calendar.badge.minus |
Estado activo de la tab bar = variante rellena + peso mayor + color, no solo color.

---

## Plataforma
- **iOS**: NativeTabs (barra translúcida con blur, ícono 28 relleno en rojo `#BC2438` cuando está activa, inactiva `#6B7684`, etiqueta 10.5). Stack con encabezado nativo: título centrado 17/600 y botón atrás rojo con el título de la pantalla anterior. Títulos grandes en las raíces de pestaña (se dibujan en el contenido, 32/700).
- **Android**: barra inferior Material 3: indicador tipo píldora de 60×32, `#F6D9DE`, detrás del ícono activo, color activo `#14263D`, etiqueta 12. Top app bar: flecha atrás + título 21/500 alineado a la izquierda.
- Safe areas: mantener la decisión actual de `docs/navigation.md` (un solo responsable de insets).
- Confirmaciones: **bottom sheet** en ambas plataformas (p. ej. `@gorhom/bottom-sheet` o `Modal` con `presentationStyle="formSheet"`/`pageSheet` en iOS). Barra de arrastre 40×5, padding 8/20/34, gap 16, altura máxima del 88 %.
- Toast de confirmación: arriba, marino `#14263D`, radio 16, ícono check verde `#9FD8B5`, 2,6 s.

---

## Pantallas

Datos demo en el prototipo: Martín Ferreyra, socio N° 4821, “Activo · Plantel Superior Rugby”; hijos Sofía (N° 7316, Hockey Sub-12) y Tomás (N° 8042, Rugby M9); corresponsable Laura Gómez. Hoy demo = viernes 20/11/2026. Reemplazar con los lectores demo del repo (`createDemoExperience`) ampliando los contratos donde haga falta.

### 01 · Inicio (variante 2a)
1. **Cabecera marina** (`#14263D`, de borde a borde, radio inferior 28, padding 6/16/22, la barra de estado también es marina con texto blanco):
   - Fila: marca (cuadrado de 34 `#BC2438`, radio 9, “P” en Barlow 22/700 blanca + “PUCARÁ” en Barlow 16/700, tracking .16em) + chip “DEMO” (`#FBF0D9` / `#14263D`, 10/700) · a la derecha, avatar de 44 “MF” (`rgba(255,255,255,.14)`) → Cuenta.
   - Fecha 15 `#D3DFEB` y “Hola, Martín” 30/700 blanco.
   - **Botón principal “Reservar pádel”**: alto 58, radio 16, `#BC2438`, ícono + texto a la izquierda y, a la derecha, chip con los créditos (“1 crédito”, `rgba(255,255,255,.18)`). → Pádel.
   - Grilla de 3 accesos secundarios (alto 64, radio 14, `rgba(255,255,255,.1)`, ícono 22 + etiqueta 13/600 blanca): Quinchos · Gimnasio · Cuenta (→ Cuenta corriente).
2. **Contenido** (padding 20/16/28, gap 22):
   - **“Próximo para vos”** + link “Agenda”: hasta 3 filas (tarjeta blanca de radio 16, alto mínimo 64): bloque de fecha de 48×48 (`#F4F3EF`, día de semana 10/700 rojo en mayúsculas + número en Barlow 22/700), título 16/600, “hora · lugar” 13, chip de estado a la derecha. Tocar → detalle (reserva → sheet; clase → actividad; partido → fixture).
   - **“Primera”** + botón de texto “Fixture y resultados”: grilla de 2 columnas de tarjetas de partido (radio 18, padding 14): ícono del deporte en rojo + DEPORTE 12/700 en mayúsculas · chip Local (`#E8EEF5`/`#14263D`) o Visitante (`#EEEDE9`/`#586575`) · “vs” 13 · rival 17/700 · “Sáb 21 nov · 15:30” en Barlow 20/600 marino. Tocar → Fixture.
   - **“Novedades”** + “Ver todas”: lista vertical de tarjetas (radio 18, padding 10): miniatura de 64×64 con radio 12 · CATEGORÍA · CUÁNDO 12/700 roja · título 16/600 · resumen 13. Tocar → detalle de la novedad.

### 02 · Club
Título “Club”. Secciones (gap 24):
- **Reservas**: 2 tarjetas grandes lado a lado (alto 164, radio 20, padding 16):
  - **Pádel** `#BC2438` (sombra roja), ícono 32, “Pádel” 22/700, “Turnos de 90 min” 13 al 85 %, píldora blanca “Reservar →” con texto rojo.
  - **Quinchos** `#14263D`, “Para reuniones y eventos”, píldora translúcida “Consultar →”.
  - Debajo, **tarjeta-botón “Mis reservas”** de ancho completo (alto mínimo 68, radio 18, sombra `0 0 0 1px rgba(20,38,61,.1), 0 2px 6px -2px rgba(20,38,61,.12)`): ícono de 44 (`#E8EEF5`) con un **círculo rojo de conteo** de 20 en la esquina superior derecha (con anillo blanco de 2), “Mis reservas” 17/600, “Próxima: Pádel · Sáb 21 · 18:30” 13, y a la derecha un **botón marino “Ver ›”** (alto 38, radio 11). Toda la tarjeta navega a Reservas.
- **Deportes**: grilla de 3 (Rugby, Hockey, Gimnasio) en tarjetas blancas de radio 18 con ícono 28 marino y etiqueta 16/600. Gimnasio lleva un punto rojo de 9 si hay rutina nueva.
- **Actividades**: filas de Yoga y Funcional: ícono de 44, título 17/600, “Mar y Jue · 18:00”, y a la derecha un chip de estado: “Inscripto” (verde) o “Inscribirme” (rojo suave).
- **Vida en el club**: grilla de 4 (Buffet, Beneficios, Noticias, Eventos) con ícono 26 + etiqueta 12/600.

### 03 · Reservas (stack)
- Fila ancha de Pádel (`#BC2438`, ícono de 52, “90 min · $40.000 o 1 crédito”, píldora “Reservar”) y fila de Quinchos (marino, “Consultá disponibilidad”, “Consultar”).
- Fila de créditos: ticket relleno (verde si hay ≥1, gris si hay 0), “1 crédito disponible” / “Sin créditos disponibles”, “1 crédito = 1 turno completo de pádel”, ícono de info → sheet de créditos.
- **Mis reservas**: tarjetas con bloque de fecha de 52×52, título 17/600, “18:30 – 20:00”, chip Confirmada/Pendiente. Tocar → sheet de reserva. Estado vacío: “No tenés reservas activas”.

### 04 · Pádel: elegir día y horario (variante 1c, **una sola pantalla**)
**No hay selector de cancha.** Orden vertical:
1. (Solo en modo modificar) Banner `#E8EEF5`: ícono edit_calendar, “Modificando Sáb 21 nov · 18:30” 15/700, “Tu turno actual se mantiene hasta que confirmes.”, botón “Salir”.
2. Fila de info: “Cancha de pádel” 15/600 + “Turnos de 90 min · $40.000” 13 · a la derecha, **chip de créditos** (alto 40, ticket + “1 crédito”; verde `#E6F2EA`/`#1F5C3F` o gris `#EEEDE9`/`#586575`). Tocar → sheet de créditos.
3. **“Elegí el día”**: DateStrip horizontal con scroll de **14 días** a partir de hoy. Ítem de 58×80, radio 16: día de semana 12/600 (“Hoy” para el día actual) · número en Barlow 26/700 · disponibilidad 10/600 (“5 libres” en verde o “Completo” en gris). Seleccionado: fondo marino, texto blanco, sombra. Completo: texto gris (seleccionable, muestra el estado vacío).
4. **“Elegí el horario”** + “N disponibles”: grilla de 3 columnas, gap 8, chips de alto 62 con radio 14. **Solo se muestran los turnos libres.** Chip: hora de inicio en Barlow 24/600 + “hasta 20:00” 11. Seleccionado: fondo `#BC2438`, texto blanco, sombra roja. Volver a tocar el seleccionado lo deselecciona.
   - Turnos fijos de 90 min: 08:00, 09:30, 11:00, 12:30, 14:00, 15:30, 17:00, 18:30, 20:00, 21:30 (el último termina a las 23:00). La lista real llega del backend (RPC de disponibilidad).
   - Vacío: tarjeta con event_busy, “No quedan turnos libres”, “Probá con otro día.” y botón secundario “Ver {próximo día con turnos}”.
5. **“Mis reservas”** (debajo del selector, en la misma pantalla): tarjetas con bloque de fecha, “18:30 – 20:00”, “Pagado / Con 1 crédito”, y a la derecha un botón “Gestionar” (`#E8EEF5`). Tocar → sheet de reserva. Vacío: caja punteada “Todavía no tenés turnos reservados.”
6. **Barra de acción fija** (aparece solo con un horario elegido; queda sobre la tab bar): blanca, sombra superior, padding 12/16. A la izquierda “Viernes 21 de noviembre” 13 + “18:30 – 20:00” en Barlow 24. A la derecha, botón rojo de alto 52, “Continuar” (o “Revisar cambio” en modo modificar). El contenido suma un espaciador de 110 para que la barra no tape nada.

### 05 · Pádel: confirmar (bottom sheet)
- “Confirmá tu turno” 22/700.
- Resumen en caja `#F4F3EF` de radio 16, con filas etiqueta/valor separadas por línea `#E6E4DF`: Día · Horario · Duración “90 minutos” · Precio “$40.000”.
- **Con créditos ≥ 1**: “¿Cómo querés reservar?” y dos tarjetas-radio. **Preseleccionada: “Usar 1 crédito”** (ticket verde, “Sin pagar · te quedan N”); alternativa: “Pagar $40.000” (“Guardás tu crédito”). La seleccionada lleva anillo `#BC2438` de 2 y radio relleno.
- **Sin créditos**: línea informativa “No tenés créditos de turno disponibles.” (sin opciones).
- Botón primario: “Confirmar con 1 crédito” / “Confirmar y pagar $40.000”.
- Botón secundario “Cambiar horario”: cierra el sheet y **conserva el día y el horario**.
- Pie: “Demostración · no se realiza ningún cobro.” 12 `#7A4F00`.
- **Éxito** (sheet): círculo verde de 72 con check, “¡Turno reservado!” 24/700, fecha larga, horario en Barlow 30, “Con 1 crédito · Ya está en tu Agenda”. Botones “Listo” (primario) y “Ver en Agenda” (secundario, abre Agenda en ese día).

### 06 · Mis reservas: gestionar (bottom sheet)
Título (“Pádel”) + chip de estado. Caja con bloque de fecha, fecha larga, horario en Barlow 22, “Cancha de pádel · 90 min · Pagado”.
- **“Modificar día u horario”**: botón sólido marino `#14263D`, alto 56, con ícono (solo pádel).
- **“Cancelar reserva”**: botón con contorno, borde 1.5 `#E5B9C0`, texto `#A51F31`, alto 54, con ícono. En quinchos dice “Cancelar solicitud”.
- “Cerrar”: texto gris.

### 07 · Modificar / Cancelar
- **Modificar**: vuelve a la pantalla 04 en modo modificar (banner, el turno original no cuenta como ocupado). Al elegir día y horario → “Revisar cambio” → sheet “Confirmá el cambio” con dos tarjetas, **Antes** (tachado, gris) → **Nuevo** (`#E8EEF5`, en negrita), y el texto “Sin costo adicional. No se usan ni generan créditos.” Botones “Confirmar modificación” / “Elegir otro horario”. Si se confirma, la misma reserva se actualiza y aparece el toast “Reserva modificada”. Si el usuario sale o hay error, la reserva original queda intacta.
- **Cancelar**: sheet “¿Cancelar este turno?” + fecha y horario. Caja de consecuencias: “El horario queda libre para otros socios.” y, en pádel, “Si cumple la política del club, recibís **1 crédito** para otro turno.” Aviso: “Política de cancelación pendiente de definición. En esta demo se acredita 1 crédito.” Botones: **“Sí, cancelar”** (sólido `#9F2030`) / “No, mantener reserva” (secundario). Resultado: se libera el turno, sale el toast “Turno cancelado · +1 crédito” y la reserva desaparece de Agenda y de Mis reservas. **El crédito lo emite el backend, nunca el cliente.**

### Sheet de créditos
Ticket verde de 52, “1 crédito disponible” 22/700. Tres puntos: “1 = 1 · Un crédito vale un turno completo de 90 min, sin importar el precio.” · “Se generan al cancelar un turno, si corresponde.” · “No son dinero: no se pueden transferir ni cobrar.” Botón “Entendido”. ⚠ La frase sobre transferencia está pendiente de validar con el club (ver `padel-rules.md`, pendientes); si no se confirma, quitarla.

### 08 · Agenda (variante 1f)
- Título “Agenda” 32/700 + píldora “Hoy” (alto 38, con contorno; el borde es marino cuando no estás en hoy y gris cuando sí).
- **Chips de persona** (alto 36): Todos · Yo · Sofía · Tomás. Seleccionado: marino. Filtra solo lo que el responsable tiene permitido ver.
- **Tarjeta de semana** (blanca, radio 20, padding 8): “Noviembre 2026” 17/700 + flechas ‹ › (44×44, rojas). Grilla de 7 columnas (L M M J V S D) con inicial 12 gris, número 17 en círculo de 38 (seleccionado: marino con texto blanco; hoy: número rojo en 700; pasado: gris) y **punto rojo de 5** si hay eventos. La semana va de lunes a domingo.
- Encabezado del día: “Viernes 20 de noviembre · Hoy” 18/700 + “N actividades”.
- **Tarjetas de evento** (radio 18, alto mínimo 76): columna de hora de 50 (inicio en Barlow 21/600 marino, fin en Barlow 15 gris) · **barra vertical de 3** con el color del estado · título 16/600 · lugar con ícono de pin 13 · a la derecha, chip de estado y, en modo “Todos”, el nombre del hijo (SOFÍA/TOMÁS, 11/700).
- Estados de color: Confirmada/Inscripto = verde · Pendiente = ámbar · Convocado = rojo · Grupal/Entrenamiento = marino.
- Vacío: “Día libre” + “No tenés compromisos este día.” + botón secundario “Reservar pádel”.
- Contenido: reservas (pádel confirmadas, quinchos pendientes), clases **solo si hay inscripción**, entrenamientos grupales, convocatorias personales y actividades de los hijos. **Nunca** gimnasio libre ni el fixture público.

### 09 · Carnet
- Título + selector de 3 botones (alto 48): Yo · Sofía · Tomás, con avatar de iniciales de 26.
- **Tarjeta** marina con radio 24, franja superior roja de 8 y un anillo decorativo sutil: escudo (círculo blanco de 46 con “P”; **reemplazar por el escudo real**) + “CLUB PUCARÁ” en Barlow 18 (tracking .2em) + “CARNET DE SOCIO” 11 · chip “Habilitado” verde · nombre 24/700 · categoría 14 · QR en caja blanca de 150 (radio 16, padding 12) · “SOCIO N°” + número en Barlow 34/700 · “VENCE” + fecha.
- Aviso ámbar: “QR demostrativo · todavía no habilita el ingreso.”
- Si es un menor: banner `#E8EEF5` “Lo ves porque sos responsable de Sofía.”

### 10 · Cuenta
- Título · perfil (avatar de 60, nombre 20/700, “Socio N° 4821 · Activo”, botón “Editar”).
- **Tarjeta de cuenta corriente** (botón): “Cuenta corriente” + chip “Al día” · “$0” en Barlow 40/700 + “saldo pendiente” · línea divisoria · “Próxima cuota · vence 10 dic” + “Ver movimientos” en rojo.
- **Grupo familiar** (“Sos responsable”): filas por hijo con avatar de color, nombre, “Hockey Sub-12 · 12 años” y chevron → Perfil del menor.
- Lista: Perfil · Becas (“1 activa”) · Preferencias · Soporte. “Cerrar sesión” como texto rojo.

### 10b · Cuenta corriente
Tarjeta marina con “Saldo grupo familiar”, “$0” en Barlow 46 y la próxima cuota. Lista de cuotas (mes, detalle, monto en Barlow, estado “A pagar” en ámbar o “Pagada” en verde). Becas: “Tomás · Beca deportiva · 50 %”. Pie: “Importes de ejemplo.”

### 10c · Perfil del menor (sin cambiar de identidad)
- Banner `#E8EEF5`: avatar de 56, nombre 21/700, categoría y N°, y una píldora blanca “Estás viendo el perfil de Sofía como responsable” con ícono de ojo.
- Dos botones marinos: “Ver carnet” (abre Carnet con Sofía) y “Ver agenda” (abre Agenda filtrada por Sofía).
- **“Qué podés hacer por Sofía”**: lista de permisos con check verde (permitido) o ícono de bloqueo gris con nota “No habilitado”: Ver carnet ✓ · Ver agenda y convocatorias ✓ · Ver y pagar cuotas ✓ · Inscribir en actividades ✓ · Reservar pádel o quinchos ✗. Pie: “Permisos de ejemplo. Los define el club para cada vínculo.” **Los permisos llegan del backend por vínculo**; un menor puede tener varios responsables.
- Responsables: Martín (chip “Vos”) y Laura Gómez.

### 11 · Gimnasio: rutina
Tarjeta marina: chip blanco “RUTINA ASIGNADA”, “Semana 3 · Fuerza” 24/700, “Prof. Diego Ramos · 3 días por semana”. Segmentado “Día A / Día B” (fondo `#E7E6E1`; el seleccionado blanco con sombra). Lista de ejercicios: número en círculo de 32, nombre 16/600, “4 × 6” y el último peso en Barlow a la derecha. Botón primario de alto 56 “▶ Empezar entrenamiento”. Tarjeta de progreso: “Progreso · Sentadilla” + “+15 kg” en verde, con 4 barras semanales (la última roja `#BC2438`, las anteriores `#D6DEE8`) y el valor arriba en Barlow.

### 11b · Gimnasio: registrar sesión (referencia: Hevy)
- Barra de métricas fija debajo del encabezado: Tiempo (cronómetro mm:ss) · Series hechas/total · Volumen (kg × reps de las series hechas), cada una con etiqueta 11 y valor en Barlow 20. Botón rojo “Finalizar”.
- Una tarjeta por ejercicio: nombre 17/700 marino + “4 × 6 · último 100 kg”. Tabla con columnas `36 | 1fr | 68 | 60 | 44`: SERIE · ANTERIOR (“100 × 6”) · **KG** (input de 42 de alto, `#F1F0EC`, centrado, Barlow 18, teclado decimal) · **REPS** (input, teclado numérico) · **check** (botón de 44×42).
- Serie hecha: fila `#E6F2EA`, inputs `#D2E8DA` y check sólido `#2E8A5C` blanco. Pendiente: check gris `#E8E7E2`.
- Los inputs vienen precargados con el peso anterior, así que en la mayoría de los casos basta un toque en ✓ por serie.
- “+ Agregar serie” copia la última. Al finalizar se guarda la sesión y aparece el toast “Entrenamiento guardado · N series”.

### 12 · Yoga / Funcional
Segmentado Yoga | Funcional · foto (marcador) de 150 · título 28/700 + chip de estado · grilla 2×2 de datos: Días · Horario (Barlow) · Lugar · Cupos (“4 libres de 16”) · profesor.
- **No inscripto**: botón primario “Inscribirme” + “Al inscribirte, las clases se suman a tu Agenda.” → sheet “Inscribirte en Yoga” (resumen) → “Confirmar inscripción” → toast; las clases futuras aparecen en Agenda.
- **Inscripto**: caja verde “Estás inscripto · Tus próximas clases están en la Agenda.” + botón con contorno rojo “Cancelar inscripción” → sheet “¿Cancelar inscripción?” (“Las clases futuras dejan de aparecer en tu Agenda. Tu historial se conserva.”) → “Sí, cancelar inscripción” (sólido `#9F2030`).

### 13 · Quinchos
Aviso ámbar: “Condiciones de pago y aprobación a definir por el club. En esta demo, la reserva queda como solicitud.” · DateStrip (sin conteo) · selección de quincho (tarjetas-radio con foto, “Quincho 1 · Hasta 40 personas”; **nombres y capacidades de ejemplo**) · franja en 2 chips (Mediodía 12–17 / Noche 20–01, **de ejemplo**) · botón “Solicitar reserva” → se crea una reserva **Pendiente** y aparece el toast “Solicitud enviada · queda pendiente”. No hereda las reglas de pádel.

### 14 · Primera: fixture
Segmentado Rugby | Hockey · “Próximos” (fecha de torneo · Local/Visitante, “vs Rival”, fecha en Barlow) · “Resultados” (cuadrado G/P/E en verde/rojo/gris, rival, fecha y marcador en Barlow 24). Datos de ejemplo.

---

## Interactions & Behavior
- Navegación: 5 pestañas (Inicio, Agenda, Carnet, Club, Cuenta) con stack por pestaña. Tocar una pestaña lleva a su raíz. Al cambiar de pantalla, el scroll vuelve arriba.
- Pádel: tocar un día borra el horario elegido. Elegir un horario muestra la barra fija. Las flechas de “atrás” no pierden la selección hasta salir del módulo.
- Sheets: se abren desde abajo (≈280 ms, `cubic-bezier(.2,.8,.2,1)`) y el fondo aparece en 200 ms. Se cierran tocando el fondo o con el botón secundario.
- Toast: aparece en 250 ms y se oculta a los 2,6 s.
- Presionado: todas las tarjetas y botones se achican a 0.97–0.98 y oscurecen su color. Sin animaciones decorativas.
- Texto ampliado (fontScale > 1,35): las grillas de 3–4 columnas pasan a 2 (o 1), la DateStrip sigue con scroll y las tarjetas crecen en alto (nada de alturas fijas en contenedores con texto).
- Carga: placeholders con la forma final (por ejemplo, 3 chips grises en la grilla). Error: caja `#FFF0F1` con ícono, mensaje y “Reintentar”.

## State Management
- Pádel: `selectedDay`, `selectedSlot`, `modifyingReservationId`, `paymentChoice` ('credit' | 'pay', por defecto 'credit' si hay créditos ≥ 1), `sheet` ('confirm' | 'success' | 'reservation' | 'cancel' | 'modifyConfirm' | 'credits').
- Del servidor: disponibilidad por día (`demo-padel-availability` → RPC), reservas activas, contador de créditos, inscripciones, eventos de Agenda por persona y permisos de cada vínculo familiar.
- Agenda: `selectedDate`, `personFilter`. Gimnasio: sesión en curso `{exerciseId: [{kg, reps, done}]}` y cronómetro.
- El prototipo guarda todo en memoria. En la app, cada acción de escritura pasa por los comandos transaccionales de `supabase/migrations/*padel*`.

## Assets
- **Escudo oficial del club: pendiente.** Reemplazar el marcador (círculo con “P”).
- Fotos de novedades, actividades y quinchos: marcadores con rayas. Las provee el club.
- QR: patrón demostrativo, no válido.
- Fuentes: Barlow Condensed (OFL). Iconos: Material Symbols en el prototipo, `expo-symbols` en la app.

## Files
- `Pucara Digital - Propuesta.dc.html`: lienzo con IA, flujos, todas las pantallas (iOS y Android), variantes (aprobadas: 2a, 1c, 1f), componentes y justificación.
- `PucaraApp.dc.html`: prototipo navegable. Props: `platform` (ios|android), `credits` (0|1|2), `homeStyle` (**c** aprobada), `padelPicker` (**grilla** aprobada), `agendaStyle` (**semana** aprobada), `start` (pantalla inicial).
- `support.js`: runtime necesario para abrir los `.dc.html` en el navegador.
- `screenshots/`: una captura PNG por pantalla o estado, con la misma numeración que las secciones de este README (01 a 14 para iOS, A01 a A09 para Android). Sirven como referencia visual rápida; ante cualquier duda sobre medidas, prevalecen este README y el prototipo.
