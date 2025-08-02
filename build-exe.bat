@echo off
echo ========================================
echo    🐱 Construyendo Finanzas Gatunas 💖
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

echo Node.js encontrado!
echo.

echo Instalando dependencias...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Error instalando dependencias.
    pause
    exit /b 1
)

echo.
echo Dependencias instaladas correctamente!
echo.

echo Construyendo ejecutable...
echo Esto puede tomar varios minutos...
echo.

npm run build-exe

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Error construyendo el ejecutable.
    echo Revisa los logs anteriores para mas detalles.
    pause
    exit /b 1
)

echo.
echo ========================================
echo    🎉 ¡Ejecutable creado exitosamente!
echo ========================================
echo.
echo El archivo .exe se encuentra en:
echo   dist\win-unpacked\finanzas-gatunas.exe
echo.
echo Tambien puedes encontrar el instalador en:
echo   dist\Finanzas Gatunas Setup.exe
echo.
echo ¡Disfruta de tu Sistema de Finanzas Gatuno! 🐱💖
echo.
pause 