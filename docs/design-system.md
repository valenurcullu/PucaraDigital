# Sistema de diseño inicial

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
