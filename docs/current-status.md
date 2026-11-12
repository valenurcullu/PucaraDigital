# Estado actual de Pucará Digital

Actualizado: **2026-11-12**. Fuente de verdad para retomar junto con AGENTS.md y CLAUDE.md.

## Repositorio e hito

Clon activo C:/Users/Nobody-GRD/Desktop/PucaraDigital, rama main. Base inspeccionada 94818b5, árbol limpio y cinco commits sobre origin/main local. Origin oficial confirmado. No se hizo fetch ni push; no se afirma conocer cambios remotos posteriores.

Bloque documental registrado en 7dd9fd1: A provisional, bloqueo nativo levantado, pádel temprano y gimnasio prioritario. [Roadmap](roadmap.md), [pádel](padel-rules.md) y [modelo transaccional](database.md) prevalecen sobre los prototipos históricos.

Últimos bloques de código: c346d19 (datos/tokens), f2fc1ad (componentes/carga) y c09e602 (pestañas/recorridos). Metro se dejó activo en puerto 8081; el manifiesto respondió por loopback y por la dirección LAN del equipo. Esto no demuestra conectividad desde otro dispositivo.

## Implementado

- Expo Router con cinco pestañas nativas, stack de módulos/detalles, retorno nativo, redirección de /experiencia y recuperación de enlaces inválidos.
- Inicio demo con saludo, accesos, Primera rugby/hockey, próximos compromisos y comunicaciones; Club agrupado con Reservas primero.
- Agenda inicial Hoy/próximos siete días, derivada de reservas confirmadas y clases con inscripción activa. Gimnasio no crea eventos.
- Carnet y Cuenta demo; detalles de partidos, novedades, reservas y entradas a módulos. QR textual sin código escaneable.
- Componentes React Native y tokens semánticos provisionales A. Datos ficticios tipados/centralizados y lectura compartida cancelable, carga, error/reintento y vacíos.
- Acciones de reservar, modificar/cancelar e inscribir no realizan escrituras. Las operaciones con reglas pendientes aparecen explicadas o deshabilitadas.
- Next.js conserva sus entradas informativas; no hay panel administrativo ni rediseño web.

## No implementado

Supabase local, migraciones, Auth, RLS, transacciones, pagos, reservas persistidas, permisos familiares verificados, rutinas/cargas, inscripciones reales, calendario completo y carnet válido. El diseño PostgreSQL no equivale a pruebas ejecutadas. No se construyó un backend simulado de escrituras.

## Verificación y riesgos

Instalación congelada, formato, lint/tipos, nueve tests y build web; export Android/iOS. Ver comandos y resultados finales en [verification.md](verification.md). No se probaron dispositivos, rendimiento, lectores de pantalla ni capacidad para 300 concurrentes.

Expo recomienda remotamente cinco parches posteriores a las versiones fijadas; revisar como mantenimiento acotado. No se añadieron dependencias ni se cambió el lockfile. Las pruebas de exportación no garantizan compatibilidad en dispositivo.

## Próximo bloque

1. Aceptación de este recorrido en Android/iOS y tamaños de texto/pantalla; corregir hallazgos.
2. Supabase local con datos ficticios: identidad separada, vínculos, RLS, exclusión de solapamientos y comandos idempotentes de reservas/créditos, con pruebas concurrentes.
3. Conectar una sección vertical de pádel; gimnasio con asignación de rutinas y registro de cargas conserva prioridad deportiva temprana.

Política de cancelación/reintegros, proveedor/retención de pago, horarios/límites, padrón y permisos familiares pendientes del club. Branding definitivo y escudo oficial pendientes. No retomar exploración visual ni desarrollar todos los hitos juntos.
