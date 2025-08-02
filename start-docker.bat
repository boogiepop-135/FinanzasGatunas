@echo off
echo ========================================
echo    Sistema de Finanzas - Docker
echo ========================================
echo.

echo Verificando Docker Desktop...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Docker Desktop no esta ejecutandose.
    echo.
    echo Por favor:
    echo 1. Abre Docker Desktop desde el menu inicio
    echo 2. Espera a que aparezca "Docker Desktop is running"
    echo 3. Ejecuta este script nuevamente
    echo.
    echo O ejecuta manualmente:
    echo   docker-compose build
    echo   docker-compose run --rm sistema-finanzas npm run dev
    echo.
    pause
    exit /b 1
)

echo Docker Desktop esta ejecutandose correctamente!
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
echo    Imagen construida exitosamente!
echo ========================================
echo.
echo Para ejecutar la aplicacion:
echo   docker-compose run --rm sistema-finanzas npm run dev
echo.
echo Para modo desarrollo interactivo:
echo   docker-compose run --rm sistema-finanzas
echo.
echo ¿Deseas ejecutar la aplicacion ahora? (s/n)
set /p choice="Respuesta: "

if /i "%choice%"=="s" (
    echo.
    echo Ejecutando aplicacion...
    docker-compose run --rm sistema-finanzas npm run dev
) else (
    echo.
    echo Puedes ejecutar la aplicacion mas tarde con:
    echo   docker-compose run --rm sistema-finanzas npm run dev
)

echo.
pause 