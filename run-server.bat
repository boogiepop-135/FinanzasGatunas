@echo off
echo ========================================
echo    Sistema de Finanzas - Servidor Web
echo ========================================
echo.

echo Iniciando servidor web...
echo.
echo La aplicacion estara disponible en:
echo   http://localhost:3000
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

python python_backend/simple_server.py

echo.
echo Servidor detenido.
pause 