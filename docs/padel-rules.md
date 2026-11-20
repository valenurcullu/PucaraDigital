# Pádel: reglas confirmadas y pendientes

Vigente desde 2026-11-12. Sustituye precios, duración y reglas contradictorias de los HTML históricos. Este documento define el producto; no demuestra persistencia ni cobros implementados.

## Confirmado

- Cada turno dura exactamente **90 minutos**. Precio actual **ARS 40.000**, configurable por el club; guardar importes en unidades menores (4.000.000 centavos) y conservar la cotización histórica.
- No existe saldo monetario interno. **1 crédito = 1 turno completo**, independiente del precio vigente. El contador expresa turnos, nunca pesos.
- Sin créditos se requiere pago verificado para confirmar. Con créditos se consume exactamente uno y no se paga nuevamente.
- **Modificar** es una acción independiente: nueva fecha/hora disponible → **Confirmar modificación**. Actualiza la misma reserva, sin cobrar ni generar créditos. Ante conflicto, error o abandono, se conserva íntegra la original.
- **Cancelar** es otra acción: revisar consecuencias → confirmación explícita → liberar turno. Si cumple la política del club, genera exactamente **un crédito**. Repetir la solicitud no genera otro crédito.
- Evitar reservas superpuestas, doble consumo y doble emisión de créditos. Mostrar reservas existentes, estados y contador de créditos.
- Una reserva cancelada deja de ocupar Agenda futura y conserva su historial.

## Pendiente de validar con el club

Ventana de cancelación elegible, tratamiento de cancelaciones no elegibles, excepciones administrativas, reintegros monetarios, vencimiento/transferencia de créditos, plazos de anticipación, horarios de canchas, límites por socio, reservas por menores y alcance de incompatibilidad entre distintos recursos. No fijar una ventana arbitraria ni prometer reintegros.

El proveedor de pagos, retención de disponibilidad durante el pago, expiración y resolución de pagos tardíos también están pendientes. Quinchos tiene condiciones de aprobación y pago configurables; no hereda automáticamente las reglas de pádel.

## Implementación por bloques

El primer bloque nativo presenta información y reservas ficticias de lectura. No simula un motor transaccional ni cobra, acredita o confirma operaciones. Las acciones de escritura permanecen explícitamente no disponibles.

El Hito 2 incorpora identidad, RLS y comandos transaccionales con créditos. Se probaron en PostgreSQL nativo con datos ficticios. Falta verificar el stack de Supabase con Auth y PostgREST. Antes de permitir operaciones reales, cumplir el diseño y las pruebas de [base de datos](database.md). El cliente presenta resultados, pero nunca decide permisos, disponibilidad definitiva o emisión de créditos.
