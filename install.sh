#!/bin/bash

echo "========================================"
echo "   Sistema de Finanzas - Instalacion"
echo "========================================"
echo

# Verificar Node.js
echo "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js no esta instalado."
    echo "Por favor instala Node.js desde https://nodejs.org/"
    exit 1
fi
echo "Node.js encontrado: $(node --version)"

echo
echo "Verificando Python..."
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "ERROR: Python no esta instalado."
        echo "Por favor instala Python desde https://python.org/"
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi
echo "Python encontrado: $($PYTHON_CMD --version)"

echo
echo "Instalando dependencias de Node.js..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Error al instalar dependencias de Node.js"
    exit 1
fi

echo
echo "Creando directorios necesarios..."
mkdir -p data
mkdir -p python_backend/data

echo
echo "========================================"
echo "   Instalacion completada exitosamente!"
echo "========================================"
echo
echo "Para ejecutar la aplicacion en modo desarrollo:"
echo "  npm run dev"
echo
echo "Para ejecutar la aplicacion en modo produccion:"
echo "  npm start"
echo
echo "Para construir el ejecutable:"
echo "  npm run build"
echo 