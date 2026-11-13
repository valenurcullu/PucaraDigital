# Sistema visual nativo — revisión táctil

Actualizado 2026-11-13. Concepto A permanece como base provisional: fondo cálido, rojo y marino, acento editorial en títulos. El usuario probó el bloque anterior en iPhone: navegación funcional, **UX/UI no aprobada**. Esta implementación responde a su pedido de más jerarquía y acciones visibles. La nueva estética aún requiere su revisión en Expo Go.

## Composición implementada

- **Inicio:** cabecera con saludo/cuenta y badge demo; Reservas como bloque marino con botones Reservar pádel/quincho y acceso Mis reservas; tarjetas de rutina/cuenta; próximos partidos; resumen personal; novedades.
- **Club:** el mismo acceso destacado a Reservas, seguido de grillas de Deportes, Actividades y Vida en el club. Gimnasio destacado y actividad inscripta con badge desde el dato demo.
- **Partidos:** tarjetas compactas con deporte/división, rival, fecha/hora, local/visitante y botones separados Ver partido/Ver fixture. Una columna en teléfono; dos cuando hay ancho suficiente.
- **Agenda resumida:** día/mes visual, título, hora/lugar y estado. Noticias con icono, categoría, resumen y CTA.
- **Barra inferior:** NativeTabs conservado; SF Symbols con variantes seleccionadas, color/peso activo, etiquetas siempre visibles e indicador Android. No se fabrica una barra absoluta sobre la pantalla. Altura, espaciado y safe area siguen gestionados por el sistema; iOS 26 dibuja parte del fondo.

## Componentes reutilizables

| Archivo                                                | Componentes / propósito                                                                                                                                                      |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| apps/mobile/components/member-ui.tsx                   | AppHeader, SectionHeader/Section, ButtonLink primario/secundario/inverso, Action, Card, StatusBadge, NavRow, DemoNotice, TileGrid, StateView, carga y estructura de pantalla |
| apps/mobile/components/action-card.tsx                 | ActionCard: acceso rápido y módulo con icono, título, acción y estado opcional                                                                                               |
| apps/mobile/components/app-icon.tsx                    | Registro tipado y render de símbolos iOS/Android; iconos decorativos excluidos de lectura duplicada                                                                          |
| apps/mobile/features/experience/dashboard-cards.tsx    | ReservationHub, MatchCard, AgendaCard y NoticeCard consumiendo contratos existentes                                                                                          |
| apps/mobile/features/experience/module-presentation.ts | Iconos y etiquetas de CTA por módulo, sin duplicar fixtures ni reglas de negocio                                                                                             |

Los exports anteriores se preservan para mejorar los módulos existentes sin reescribirlos. Agenda y detalles heredan filas/estados/tokens; no se agregan nuevas operaciones de negocio.

## Tokens y accesibilidad

Fuente: packages/design-tokens/src/member-theme.ts. Web conserva sus tokens heredados.

| Semántica                   | Valor                       |
| --------------------------- | --------------------------- |
| Fondo / superficie          | #F5F4F0 / #FFFFFF           |
| Texto / secundario          | #18283B / #586575           |
| Acción / presionada / suave | #BC2438 / #981B2C / #FBECEF |
| Marino / superficie suave   | #14263D / #EAF0F6           |
| Texto sobre marino          | #FFFFFF / #D3DFEB           |
| Borde / control             | #DEE2E5 / #8490A0           |

Radios de control 14 y tarjetas 20; cabecera editorial de 32, secciones 22, cuerpo 16 y secundarios 14. Sin nuevas fuentes de texto. Iconos mediante expo-symbols 58.0.5, compatible con el rango ~58.0.4 del SDK fijado y disponible en Expo Go; Android utiliza su fuente de símbolos empaquetada. Es la única dependencia directa nueva.

Botones de al menos 48 puntos (50 en CTAs), estados de presión por color/borde, texto sin truncamiento forzado. Grillas pasan a una columna con ancho reducido o fontScale mayor a 1,35. Estado activo se distingue también por peso/forma, no sólo color. Carga estática con spinner y placeholders sin demora artificial; error con icono y reintento; vacío con contenido explicativo. No se agregan animaciones decorativas ni librerías UI.

Contrastes calculados y límites de prueba en [verificaciones](verification.md). Aún deben revisarse en dispositivos las composiciones, tamaños, VoiceOver/TalkBack y vuelta atrás. No se midió rendimiento.

## Alcance preservado

CTAs abren rutas nativas existentes. Reservar pádel/quincho abre su módulo de demostración; no confirma turnos. Mis reservas, rutina, cuenta y fixture no simulan escrituras. El bloque de Reservas lo indica explícitamente. Se conservan datos centrales, duración/precio/créditos, reglas pendientes y separación PostgreSQL/cliente.

Referencias de API: [símbolos de Expo](https://docs.expo.dev/versions/latest/sdk/symbols/) y [pestañas nativas](https://docs.expo.dev/router/advanced/native-tabs/). Branding, escudo y aceptación visual definitiva siguen pendientes.
