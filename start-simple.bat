@echo off
echo ========================================
echo    Sistema de Finanzas - Servidor Simple
echo ========================================
echo.

echo NOTA: Esta es una version basica que funciona sin Docker
echo Para funcionalidad completa, inicia Docker Desktop y usa start-web.bat
echo.

echo Iniciando servidor web simple...
echo.
echo La aplicacion estara disponible en:
echo   http://localhost:3000
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

REM Usar el servidor HTTP simple de Python que ya funcionaba
python -m http.server 3000

echo.
echo Servidor detenido.
pause 