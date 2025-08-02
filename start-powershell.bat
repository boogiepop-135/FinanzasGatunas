@echo off
echo ========================================
echo    Sistema de Finanzas - Servidor PowerShell
echo ========================================
echo.

echo Iniciando servidor web con PowerShell...
echo.
echo La aplicacion estara disponible en:
echo   http://localhost:3000
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

powershell -Command "& { $listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://localhost:3000/'); $listener.Start(); Write-Host 'Servidor iniciado en http://localhost:3000'; while ($listener.IsListening) { $context = $listener.GetContext(); $request = $context.Request; $response = $context.Response; $path = $request.Url.LocalPath; Write-Host \"Peticion: $path\"; if ($path -eq '/' -or $path -eq '/index.html') { $content = Get-Content 'index.html' -Raw -Encoding UTF8; $buffer = [System.Text.Encoding]::UTF8.GetBytes($content); $response.ContentType = 'text/html'; } elseif ($path -eq '/styles.css') { $content = Get-Content 'styles.css' -Raw -Encoding UTF8; $buffer = [System.Text.Encoding]::UTF8.GetBytes($content); $response.ContentType = 'text/css'; } elseif ($path -eq '/renderer.js') { $content = Get-Content 'renderer.js' -Raw -Encoding UTF8; $buffer = [System.Text.Encoding]::UTF8.GetBytes($content); $response.ContentType = 'application/javascript'; } else { $buffer = [System.Text.Encoding]::UTF8.GetBytes('404 - Not Found'); $response.StatusCode = 404; } $response.ContentLength64 = $buffer.Length; $response.OutputStream.Write($buffer, 0, $buffer.Length); $response.Close(); } }"

echo.
echo Servidor detenido.
pause 