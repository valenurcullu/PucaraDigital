# Desarrollo local del backend

Desde la raíz del clon en disco local. El CLI fijado es Supabase 3.2.0. Se ejecuta con Node y npx, por separado de las dependencias de Expo. El stack necesita un motor de contenedores compatible en ejecución. Para consultar SQL hace falta psql. La configuración solicita PostgreSQL 17.

## Iniciar, detener y reiniciar

```powershell
npx.cmd --yes supabase@3.2.0 start
npx.cmd --yes supabase@3.2.0 status
npx.cmd --yes supabase@3.2.0 stop
```

Para reiniciar conservando los datos, ejecutar `stop` y después `start`. Para reconstruir **la base descartable local**, con el stack en ejecución, usar `npx.cmd --yes supabase@3.2.0 db reset`. Este comando reemplaza los datos locales, aplica las migraciones en orden y carga el seed una vez. En esta versión del CLI el destino predeterminado es local. Trabajar sin vincular el clon a un proyecto cloud.

El seed crea dos clubes imaginarios, usuarios sintéticos sin credenciales de acceso, dos responsables de un mismo menor, horarios del 1 de junio de 2099, un bloqueo parcial y dos créditos de apertura.

## Conexión y pruebas en el stack

Los endpoints locales configurados son API en 54321 y PostgreSQL en 54322. Las pruebas SQL se ejecutan desde una sesión administrativa del **stack local de pruebas**. Usan los roles reales de la API dentro de una transacción que termina en rollback.

```powershell
psql -X -h 127.0.0.1 -p 54322 -U postgres -d postgres -W -v ON_ERROR_STOP=1 -f supabase/tests/foundations.sql
```

Usar la contraseña que corresponda a la base local. Mantener la salida de `status` y las credenciales en la terminal personal. Guardar cualquier configuración privada en archivos de entorno ignorados por Git. Expo y Next continúan usando datos demo y no requieren variables nuevas. Las credenciales administrativas pertenecen únicamente a los procesos del servidor.

## Prueba independiente con PostgreSQL instalado

Requiere Python 3, PostgreSQL con btree_gist y sus ejecutables initdb, pg_ctl y psql. En Windows, por ejemplo:

```powershell
$env:PG_BIN = 'C:\Program Files\PostgreSQL\16\bin'
py -3 supabase/tests/isolated_postgres.py
```

El script inicia un clúster temporal en loopback con puerto libre y contraseña aleatoria, aplica las tres migraciones y el seed, ejecuta la batería SQL y enfrenta operaciones simultáneas en dos conexiones. Finalmente detiene y elimina su clúster. Puede ejecutarse con los binarios en PATH omitiendo PG_BIN.

Este recorrido usa PostgreSQL real y un contrato mínimo de Auth para inyectar el identificador del usuario. La validación de JWT, PostgREST y la integración con Auth requieren el stack completo. Resultados y limitaciones del último ensayo en [verificaciones](../docs/verification.md).
