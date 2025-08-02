@echo off
echo ========================================
echo    Sistema de Finanzas - Docker
echo ========================================
echo.

echo Verificando Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker no esta instalado o no esta ejecutandose.
    echo Por favor instala Docker Desktop desde https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)
echo Docker encontrado:
docker --version

echo.
echo Creando directorios necesarios...
if not exist "exports" mkdir exports

echo.
echo Construyendo imagen Docker...
docker-compose build

if %errorlevel% neq 0 (
    echo ERROR: Error al construir la imagen Docker
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Opciones de ejecucion:
echo ========================================
echo.
echo 1. Ejecutar en modo desarrollo (interactivo)
echo 2. Ejecutar aplicacion directamente
echo 3. Solo construir imagen
echo.
set /p choice="Selecciona una opcion (1-3): "

if "%choice%"=="1" (
    echo.
    echo Ejecutando contenedor en modo desarrollo...
    echo Para ejecutar la aplicacion dentro del contenedor:
    echo   npm run dev
    echo.
    docker-compose run --rm sistema-finanzas
) else if "%choice%"=="2" (
    echo.
    echo Ejecutando aplicacion directamente...
    docker-compose run --rm sistema-finanzas npm run dev
) else if "%choice%"=="3" (
    echo.
    echo Imagen construida exitosamente!
    echo Para ejecutar: docker-compose run --rm sistema-finanzas npm run dev
) else (
    echo Opcion invalida.
)

echo.
pause 