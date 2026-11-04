# Navegación

## Disponible ahora

- Web: /, entrada de fundaciones; /experiencia, vista previa informativa de la estructura prevista.
- Móvil: /, entrada; /experiencia, vista previa mediante stack de Expo Router.
- Web: página 404 con regreso al inicio y límite de error con reintento.
- Estas vistas no representan funcionalidades de agenda, cuenta ni carnet.

## Móvil previsto

Cinco destinos principales: Inicio, Agenda, Carnet, Actividades y Perfil. El carnet queda a un toque; el detalle de evento se abre desde Inicio o Agenda. Cada actividad tiene un detalle propio. Perfil agrupa datos personales y preferencias.

El navegador de pestañas conserva el estado de cada sección. Los detalles usan stack, respetan volver y el gesto nativo; los formularios consideran teclado y safe areas. No se fuerza el mismo patrón entre iOS y Android cuando cambian las convenciones.

## Portal web previsto

Inicio, Agenda, Actividades, Carnet y Perfil. Sidebar en escritorio y navegación compacta en pantallas pequeñas. El foco de teclado acompaña los cambios; enlaces profundos permiten compartir rutas.

## Administración prevista

Área /admin con navegación propia: Resumen y futuros módulos de socios, actividades y operaciones. Mostrar el acceso solo por rol mejora UX, pero el control definitivo debe estar en servidor/RLS. El dashboard del Sprint 1 será demo explícito, sin exponer operaciones administrativas reales.

## Acciones frecuentes

Consultar próximo evento desde Inicio; abrir carnet desde navegación; revisar movimientos desde resumen de cuenta. Evitar atravesar menús anidados para estas tareas.
