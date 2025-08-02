#!/bin/bash

echo "========================================"
echo "   Sistema de Finanzas - Docker"
echo "========================================"
echo

# Verificar Docker
echo "Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker no esta instalado."
    echo "Por favor instala Docker desde https://www.docker.com/products/docker-desktop/"
    exit 1
fi
echo "Docker encontrado: $(docker --version)"

# Verificar Docker Compose
echo "Verificando Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    echo "ERROR: Docker Compose no esta instalado."
    echo "Por favor instala Docker Compose"
    exit 1
fi
echo "Docker Compose encontrado: $(docker-compose --version)"

echo
echo "Creando directorios necesarios..."
mkdir -p exports

echo
echo "Construyendo imagen Docker..."
docker-compose build

if [ $? -ne 0 ]; then
    echo "ERROR: Error al construir la imagen Docker"
    exit 1
fi

echo
echo "========================================"
echo "   Opciones de ejecucion:"
echo "========================================"
echo
echo "1. Ejecutar en modo desarrollo (interactivo)"
echo "2. Ejecutar aplicacion directamente"
echo "3. Solo construir imagen"
echo
read -p "Selecciona una opcion (1-3): " choice

case $choice in
    1)
        echo
        echo "Ejecutando contenedor en modo desarrollo..."
        echo "Para ejecutar la aplicacion dentro del contenedor:"
        echo "  npm run dev"
        echo
        docker-compose run --rm sistema-finanzas
        ;;
    2)
        echo
        echo "Ejecutando aplicacion directamente..."
        docker-compose run --rm sistema-finanzas npm run dev
        ;;
    3)
        echo
        echo "Imagen construida exitosamente!"
        echo "Para ejecutar: docker-compose run --rm sistema-finanzas npm run dev"
        ;;
    *)
        echo "Opcion invalida."
        ;;
esac 