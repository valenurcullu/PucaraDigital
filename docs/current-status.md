# Estado actual de Pucará Digital

Actualizado: **2026-11-13**. Fuente de verdad para retomar junto con AGENTS.md y CLAUDE.md.

## Repositorio e hito

Clon activo C:/Users/Nobody-GRD/Desktop/PucaraDigital, rama main. Rediseño respaldado en GitHub hasta e9aa184 tras autorización explícita de cierre. Se consultó origin/main, se descartó divergencia y se publicó mediante push normal. El registro de cierre se incluye en un commit documental posterior; consultar git log para el hash final exacto.

El usuario probó el primer bloque en iPhone/Expo Go y confirmó funcionamiento y navegación, pero no aprobó la UX/UI. El hito actual es el rediseño táctil de Inicio, Club, barra inferior y componentes comunes: ver [sistema visual](design-system.md) y ADR-020.

Se conservan el roadmap temprano de pádel/gimnasio, [reglas de créditos](padel-rules.md) y [diseño PostgreSQL](database.md). No hay nueva lógica transaccional ni cambios en los datos demo.

Últimos commits de código: b4d21bb (componentes/iconos) y 1c75128 (Inicio/Club/pestañas). Durante la revisión, Metro respondió HTTP 200 para el bundle iOS con la cuenta suplio. Al cerrar se detuvo el servidor; debe iniciarse de nuevo para revisar en el teléfono.

## Implementado

- Expo Router con cinco pestañas nativas, stack de módulos/detalles, retorno nativo, redirección de /experiencia y recuperación de enlaces inválidos.
- Inicio demo con saludo, accesos, Primera rugby/hockey, próximos compromisos y comunicaciones; Club agrupado con Reservas primero.
- Agenda inicial Hoy/próximos siete días, derivada de reservas confirmadas y clases con inscripción activa. Gimnasio no crea eventos.
- Carnet y Cuenta demo; detalles de partidos, novedades, reservas y entradas a módulos. QR textual sin código escaneable.
- Componentes React Native renovados: cabeceras, botones, tarjetas de acción/módulos, reservas destacadas, partidos, agenda, noticias, badges, grillas adaptables y estados. Tokens A modernizados; iconos nativos con expo-symbols. Datos y lectura compartida cancelable conservados.
- Acciones de reservar, modificar/cancelar e inscribir no realizan escrituras. Las operaciones con reglas pendientes aparecen explicadas o deshabilitadas.
- Next.js conserva sus entradas informativas; no hay panel administrativo ni rediseño web.

## No implementado

Supabase local, migraciones, Auth, RLS, transacciones, pagos, reservas persistidas, permisos familiares verificados, rutinas/cargas, inscripciones reales, calendario completo y carnet válido. El diseño PostgreSQL no equivale a pruebas ejecutadas. No se construyó un backend simulado de escrituras.

## Verificación y riesgos

Instalación congelada, formato, lint/tipos, nueve tests y build web; export Android/iOS. Ver comandos y resultados finales en [verification.md](verification.md). El usuario probó la versión anterior en iPhone. El agente no ejecutó este rediseño en dispositivos; rendimiento, lectores de pantalla y capacidad para 300 concurrentes siguen sin medir.

Expo recomienda remotamente cinco parches posteriores a las versiones fijadas; revisar como mantenimiento acotado. Este rediseño agrega expo-symbols 58.0.5 y actualiza el lockfile; no actualiza el stack existente. Las pruebas de exportación no garantizan compatibilidad en dispositivo.

## Cierre de sesión y cómo retomar

Cierre solicitado y autorizado el 2026-11-13. Los tres commits del rediseño se publicaron con push normal en origin/main hasta e9aa184; se comprobó ese SHA remoto. Este documento registra el cierre posterior. No hubo divergencia, force push ni cambios de funcionalidad/arquitectura.

Metro se detuvo al cerrar; la página de QR anterior no sirve sin volver a iniciar el servidor. Las credenciales de Expo permanecen locales y no forman parte del respaldo.

Desde la raíz del clon local, en PowerShell:

1. Ejecutar git status y revisar cambios de otras personas/agentes. Con árbol limpio, git pull --ff-only; si existe divergencia, revisarla sin reset ni force.
2. Leer este estado y [verificaciones](verification.md).
3. Instalar reproduciblemente: `npx.cmd --yes pnpm@12.17.0 install --frozen-lockfile`.
4. Verificar la cuenta: `npx.cmd --no-install expo whoami`; debe coincidir con la cuenta usada en Expo Go.
5. Iniciar: `npx.cmd --yes pnpm@12.17.0 dev:mobile`. Escanear el QR nuevo con la cámara del iPhone, en la misma red. No asumir que la IP anterior se conserva.
6. Revisar primero el rediseño en iPhone, sin adelantar todavía reservas persistidas ni pagos.

## Próximo bloque

1. Revisar este rediseño en iPhone/Expo Go, luego Android, texto ampliado y pantallas pequeñas/grandes; corregir hallazgos.
2. Supabase local con datos ficticios: identidad separada, vínculos, RLS, exclusión de solapamientos y comandos idempotentes de reservas/créditos, con pruebas concurrentes.
3. Conectar una sección vertical de pádel; gimnasio con asignación de rutinas y registro de cargas conserva prioridad deportiva temprana.

Política de cancelación/reintegros, proveedor/retención de pago, horarios/límites, padrón y permisos familiares pendientes del club. Branding definitivo y escudo oficial pendientes. No retomar exploración visual ni desarrollar todos los hitos juntos.
