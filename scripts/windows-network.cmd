@echo off
setlocal
if not exist "%~dp0..\pnpm-workspace.yaml" (
  echo No se encontro la raiz del monorepo.
  exit /b 1
)
pushd "%~dp0.."
if errorlevel 1 exit /b 1
set "pucara_bash="
for /f "delims=" %%G in ('where git.exe 2^>nul') do if not defined pucara_bash if exist "%%~dpG..\bin\bash.exe" set "pucara_bash=%%~dpG..\bin\bash.exe"
if not defined pucara_bash (
  echo Se necesita Git for Windows con Git Bash para ejecutar scripts en esta carpeta de red.
  popd
  exit /b 1
)
where pnpm.cmd >nul 2>&1
if errorlevel 1 (
  echo Instala la version de pnpm indicada en package.json.
  popd
  exit /b 1
)
set "pnpm_config_script_shell=%pucara_bash%"
if not defined pnpm_config_store_dir set "pnpm_config_store_dir=%TEMP%\pucara-pnpm-store"
call pnpm.cmd %*
set "pucara_result=%errorlevel%"
popd
exit /b %pucara_result%