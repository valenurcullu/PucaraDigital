# Estado actual de Pucará Digital

Actualizado el 20 de noviembre de 2026. El Hito 2 partió de `af9f5b7`, sincronizado con la rama principal de GitHub al inicio. El desarrollo activo usa el clon del escritorio de Windows.

## Aplicación

El usuario probó en iPhone la navegación de cinco pestañas y la aceptó como base. Inicio, Club, Agenda, Carnet y Cuenta usan datos ficticios. El rediseño táctil y la dirección A · Club editorial siguen siendo provisorios. Expo y Next conservan sus lectores existentes.

## Último hito

Ya hay tres migraciones SQL versionadas, configuración local de Supabase y seed sintético de dos clubes. PostgreSQL separa usuarios, socios, responsables y roles por ámbito. Aplica RLS y permite consultar disponibilidad y reservar, modificar o cancelar con créditos de turno. La elegibilidad de una cancelación requiere aprobación administrativa para esa versión de la reserva. El flujo está disponible en SQL, pendiente de conexión al cliente.

En Windows se aplicaron migraciones y seed y se probaron autorización, integridad y concurrencia sobre PostgreSQL nativo. El CLI de Supabase está disponible. El arranque del stack completo quedó bloqueado por falta de Docker o Podman. La guía local incluye inicio, parada, reinicio, reconstrucción y ambos recorridos de prueba. [Guía](../supabase/README.md) · [Modelo](database.md) · [Verificaciones](verification.md).

## Para retomar

1. Habilitar un motor de contenedores, arrancar el stack local con PostgreSQL 17, reconstruir la base ficticia y correr la batería sobre ese stack.
2. Validar la API con sesiones Auth reales de ambos clubes, incluidos vínculos revocados. Conectar primero la disponibilidad de pádel desde una sección acotada de Expo.
3. Acordar con el club verificación del padrón, permisos de menores, cancelación y reintegros. El pago real requiere además proveedor, retención y conciliación. Gimnasio con asignación de rutinas y registro de cargas sigue entre las prioridades deportivas tempranas.

Para retomar la app desde la raíz, usar `pnpm dev:mobile` y escanear el nuevo QR con Expo Go. La app demo puede revisarse en forma independiente del backend. La capacidad para 300 usuarios concurrentes y el rendimiento móvil siguen pendientes de medición.
