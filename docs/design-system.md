# Sistema de diseño inicial

> Revisión vigente: [UX funcional v2](ux-functional-review.md) y [tres direcciones visuales](design/revision-ux.html). Ninguna dirección está aprobada. La v1 queda como antecedente; no migrar tokens hasta aprobar arquitectura de información y diseño.

## Dirección

Una experiencia deportiva sobria, cálida y precisa. Pucará ocupa la marca principal; Suplio aparece únicamente como desarrollador cuando sea pertinente. No se inventa un escudo: una P tipográfica funciona como placeholder reemplazable.

La primera entrada presenta identidad y estado de desarrollo. No constituye todavía el dashboard del socio.

## Tokens

> **Paleta en revisión (ADR-013).** Los valores bordó de esta tabla no coinciden con la identidad del club. En la Etapa 1 se presentará una propuesta en rojo institucional, azul marino, blanco y neutros, con tokens semánticos, tipografía y escala accesible. Hasta su aprobación, el código conserva estos valores.

Fuente única: packages/design-tokens/src/index.ts. La web transforma colores en variables CSS; React Native consume los valores directamente.

| Token     | Valor   | Uso                                  |
| --------- | ------- | ------------------------------------ |
| brand     | #751D32 | Acciones principales e identidad     |
| brandDark | #541426 | Hover y contraste intenso            |
| brandSoft | #F5E9EC | Acento suave                         |
| ink       | #202322 | Texto principal                      |
| muted     | #626763 | Texto secundario legible             |
| canvas    | #F7F7F2 | Fondo cálido                         |
| surface   | #FFFFFF | Superficies                          |
| line      | #DADDD6 | Separadores                          |
| success   | #236348 | Estado positivo, acompañado de texto |

Espaciado: 4, 8, 16, 24, 32, 48 y 64. Radios: 8, 16 y 24. Tipografía base de 16; secundarios de 12 con moderación. La web usa la pila sans del sistema y un acento editorial serif; móvil usa la tipografía nativa. Una fuente de marca se evaluará con recursos y licencia disponibles, sin descargas externas necesarias para compilar.

## Composición

Jerarquía editorial, márgenes generosos, una acción principal por contexto y agrupación por separadores antes que tarjetas repetidas. Evitar sombras grandes, gradientes y ornamentos. Pantallas amplias aprovechan columnas; móvil prioriza una secuencia vertical.

## Interacciones y accesibilidad

- Contraste objetivo WCAG AA; validar combinaciones usadas al incorporar cada componente.
- Foco visible, navegación por teclado, semántica y enlaces descriptivos en web.
- Controles táctiles de al menos 44 puntos en móvil; etiquetas accesibles y respeto por escalado de texto.
- Safe areas y scroll para tamaños pequeños; probar horizontal y texto ampliado.
- Carga con skeletons solo cuando exista espera real. Errores con recuperación y vacíos que expliquen el siguiente paso.
- Movimiento breve (150/220 ms), respetando reduced motion. No introducir animación decorativa.
- No usar solo color para comunicar estado.

## Componentes por desarrollar

Botón, campo, encabezado de sección, fila de evento, resumen de cuenta, estado vacío, feedback y estructura de navegación. Cada implementación será propia de su plataforma, con el mismo lenguaje visual.

La aceptación visual del sistema completo requiere revisión en navegador y dispositivos. Un build exitoso no sustituye esa evaluación.

## Revisión de Etapa 1 — pendiente de aprobación (2026-11-05)

La [propuesta UX/UI v1](ux-ui-proposal.md) define paleta semántica roja/marina/blanca, tipografía del sistema, escala, contrastes calculados, navegación y orden de componentes. La [lámina visual](design/etapa-1.html) contiene seis wireframes: Inicio, Agenda, Carnet, Club, Cuenta y gimnasio; se abre localmente en el navegador.

Es un artefacto de revisión, no pantallas implementadas. Los tokens y vistas de las apps conservan el estado descrito arriba hasta que el usuario apruebe la dirección. La navegación de cinco pestañas ya está aprobada; la densidad, paleta concreta y jerarquía propuestas requieren revisión. El escudo oficial sigue pendiente. Las comprobaciones HTML no sustituyen aceptación iOS/Android.

## Referencia visual de las tres direcciones v2

Los tokens de revisión están en docs/design/review.css; no son los tokens aprobados del producto. Tras elegir una dirección, se propondrá su migración semántica a packages/design-tokens.

| Dirección           | Acción primaria | Estructura | Fondo   | Tipografía de títulos        |
| ------------------- | --------------- | ---------- | ------- | ---------------------------- |
| A · Club editorial  | #BC2438         | #14263D    | #F6F4EF | Georgia / serif de sistema   |
| B · Pulso deportivo | #C92436         | #0B1D34    | #F0F2F5 | Impact / Arial Narrow / sans |
| C · Club cotidiano  | #B9233A         | #19324B    | #F2F6F9 | Sans de sistema, peso 750    |

El cuerpo usa sans de sistema. Las diferencias de estructura, densidad, radios y jerarquía están descritas en [revisión funcional](ux-functional-review.md#tres-direcciones-visuales). La elección requiere revisión con el socio; no se declara una ganadora por intuición. Los pares principales de contraste calculados constan en [verificaciones](verification.md).
