@echo off
echo ========================================
echo    CREANDO PAQUETE PARA COMPARTIR
echo ========================================
echo.

REM Crear carpeta temporal
if exist "SistemaFinanzasGatunas" rmdir /s /q "SistemaFinanzasGatunas"
mkdir "SistemaFinanzasGatunas"

echo Copiando archivos del sistema...

REM Copiar archivos principales
copy "index.html" "SistemaFinanzasGatunas\"
copy "styles.css" "SistemaFinanzasGatunas\"
copy "renderer.js" "SistemaFinanzasGatunas\"
copy "package.json" "SistemaFinanzasGatunas\"
copy "iniciar_sistema.bat" "SistemaFinanzasGatunas\"
copy "README.md" "SistemaFinanzasGatunas\"

REM Crear carpeta python_backend
mkdir "SistemaFinanzasGatunas\python_backend"
copy "python_backend\simple_server.py" "SistemaFinanzasGatunas\python_backend\"

REM Crear carpeta data (vacía)
mkdir "SistemaFinanzasGatunas\data"

REM Crear carpeta backups (vacía)
mkdir "SistemaFinanzasGatunas\backups"

echo.
echo ========================================
echo    PAQUETE CREADO EXITOSAMENTE
echo ========================================
echo.
echo Carpeta creada: SistemaFinanzasGatunas
echo.
echo Para compartir:
echo 1. Comprime la carpeta "SistemaFinanzasGatunas" en un ZIP
echo 2. Envía el archivo ZIP
echo 3. La persona debe extraer y hacer doble clic en "iniciar_sistema.bat"
echo.
pause 