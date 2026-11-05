# Pucará Digital — contexto para Claude Code

Leer primero [AGENTS.md](AGENTS.md) y [docs/current-status.md](docs/current-status.md). Sus reglas de alcance, seguridad, calidad y commits también aplican a Claude Code.

- Trabajar exclusivamente en el clon local existente. Antes de editar: confirmar raíz Git, rama, remoto, historial y cambios del usuario o de otro agente. No recrear el proyecto ni trabajar sobre el antiguo checkout SMB.
- El repositorio es la fuente de verdad. Consultar [requerimientos](docs/product-requirements.md), [arquitectura](docs/architecture.md), [roadmap](docs/roadmap.md), [navegación](docs/navigation.md), [diseño](docs/design-system.md) y [decisiones](docs/decisions.md); no sustituir decisiones aprobadas por supuestos del historial de chat.
- La dirección visual de Etapa 1 requiere aprobación antes del rediseño. No avanzar a Supabase, autenticación ni módulos completos durante esta revisión.
- Ejecutar los controles pertinentes del [README](README.md). Registrar comandos, resultados y límites en [verificaciones](docs/verification.md).
- Al cerrar un bloque, actualizar current-status con el hito real, siguientes pasos y pendientes. Conservar las entradas históricas; distinguir propuesta, implementación y prueba.
- Hacer commits pequeños y descriptivos de bloques verificados. Nunca hacer push sin autorización explícita.
