# Sistema visual nativo mínimo

Vigente 2026-11-12: **A · Club editorial seleccionado provisionalmente**. El usuario autorizó comenzar el desarrollo nativo; estética definitiva, tipografía y branding se revisarán después. No continuar generando alternativas.

## Reutilizado de A

Saludo editorial, jerarquía de lectura, acceso inmediato a Reservas, partidos de Primera, resumen personal breve y Club agrupado por intención. Se reimplementan con React Native; no se reutilizan DOM, CSS ni el motor de operaciones del HTML.

## Tokens y tipografía

Fuente nativa: packages/design-tokens/src/member-theme.ts, exportada como memberTheme. Los tokens anteriores siguen usados por la web, cuyo rediseño no pertenece a este bloque.

| Semántica                  | Valor             |
| -------------------------- | ----------------- |
| Fondo / superficie         | #F6F4EF / #FFFFFF |
| Texto / secundario         | #18283B / #586575 |
| Acción / acción presionada | #BC2438 / #981B2C |
| Marino / inverso           | #14263D / #FFFFFF |
| Borde / borde de control   | #DEDED8 / #8490A0 |

Cuerpo sans del sistema, títulos Georgia en iOS y serif del sistema en Android. Escala 12/14/16/22/34, sin fuentes descargadas. Espaciado 4/8/12/16/24/32; radios 8/12. Marca textual Pucará; sin inventar escudo.

## Componentes implementados

MemberScreen/ExperienceScreen, Heading, Copy, Section, Card, Badge, NavRow, Action y StateView; filas compartidas de eventos, partidos, noticias y módulos. Estados de carga/error con reintento, vacío y enlace inválido. Controles de al menos 48 puntos, texto escalable sin truncamiento forzado y áreas desplazables.

Pestañas del sistema y stack nativo de Expo Router; feedback inmediato de presión y selección, sin animación ornamental ni biblioteca UI extra. Safe areas diferenciadas entre pestañas y detalle con header.

Pendiente: aceptación visual en dispositivos, contraste de todos los estados, texto ampliado, orientación y lectores de pantalla. Los contrastes históricos del HTML no certifican esta app. Carnet sólo reserva un espacio textual de QR demo: no contiene código escaneable.

Los HTML de docs/design y ux-ui-proposal.md son antecedentes. En discrepancias funcionales prevalecen [reglas de pádel](padel-rules.md), [navegación](navigation.md) y ADR-018/019.
