@echo off
echo ========================================
echo    SISTEMA DE FINANZAS GATUNAS
echo ========================================
echo.
echo Iniciando el sistema...
echo.

REM Verificar si Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python no está instalado
    echo Por favor instala Python desde: https://python.org
    pause
    exit /b 1
)

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no está instalado
    echo Por favor instala Node.js desde: https://nodejs.org
    pause
    exit /b 1
)

echo Python y Node.js encontrados ✓
echo.

REM Instalar dependencias si no existen
if not exist "node_modules" (
    echo Instalando dependencias de Node.js...
    npm install
    echo.
)

REM Iniciar el servidor Python
echo Iniciando servidor Python...
start "Servidor Python" python python_backend/simple_server.py

REM Esperar un momento para que el servidor inicie
timeout /t 3 /nobreak >nul

REM Abrir el navegador
echo Abriendo aplicación en el navegador...
start http://localhost:3000

echo.
echo ========================================
echo    SISTEMA INICIADO EXITOSAMENTE
echo ========================================
echo.
echo La aplicación se abrirá en tu navegador
echo Para detener el sistema, cierra esta ventana
echo.
pause 