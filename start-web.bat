@echo off
echo ========================================
echo    Sistema de Finanzas - Modo Web
echo ========================================
echo.

echo Verificando Docker Desktop...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker Desktop no esta ejecutandose.
    echo Por favor inicia Docker Desktop y ejecuta este script nuevamente.
    pause
    exit /b 1
)

echo Docker Desktop esta ejecutandose correctamente!
echo.

echo Iniciando aplicacion en modo web...
echo.
echo La aplicacion estara disponible en:
echo   http://localhost:3000
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

docker-compose run --rm -p 3000:3000 sistema-finanzas npm run web

echo.
echo Servidor detenido.
pause 