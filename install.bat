@echo off
echo ========================================
echo    Sistema de Finanzas - Instalacion
echo ========================================
echo.

echo Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado.
    echo Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js encontrado: 
node --version

echo.
echo Verificando Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python no esta instalado.
    echo Por favor instala Python desde https://python.org/
    pause
    exit /b 1
)
echo Python encontrado:
python --version

echo.
echo Instalando dependencias de Node.js...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Error al instalar dependencias de Node.js
    pause
    exit /b 1
)

echo.
echo Creando directorios necesarios...
if not exist "data" mkdir data
if not exist "python_backend\data" mkdir python_backend\data

echo.
echo ========================================
echo    Instalacion completada exitosamente!
echo ========================================
echo.
echo Para ejecutar la aplicacion en modo desarrollo:
echo   npm run dev
echo.
echo Para ejecutar la aplicacion en modo produccion:
echo   npm start
echo.
echo Para construir el ejecutable:
echo   npm run build
echo.
pause 