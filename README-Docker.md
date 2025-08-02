# 🐳 Sistema de Finanzas - Guía Docker

Esta guía te ayudará a ejecutar el Sistema de Finanzas usando Docker, evitando problemas de instalación de dependencias.

## 📋 Requisitos Previos

- **Docker Desktop** instalado y ejecutándose
- **Docker Compose** (incluido con Docker Desktop)

## 🚀 Instalación y Ejecución Rápida

### **Opción 1: Modo Web (Recomendado)**

#### Windows:
```bash
start-web.bat
```

#### Linux/macOS:
```bash
docker-compose run --rm -p 3000:3000 sistema-finanzas npm run web
```

Luego abre tu navegador en: **http://localhost:3000**

### **Opción 2: Script Automático**

#### Windows:
```bash
docker-run.bat
```

#### Linux/macOS:
```bash
./docker-run.sh
```

### **Opción 3: Comandos Manuales**

1. **Construir la imagen:**
```bash
docker-compose build
```

2. **Ejecutar la aplicación en modo web:**
```bash
docker-compose run --rm -p 3000:3000 sistema-finanzas npm run web
```

3. **Modo desarrollo interactivo:**
```bash
docker-compose run --rm sistema-finanzas
```

## 🌐 Acceso a la Aplicación

Una vez que el servidor esté ejecutándose:

1. **Abre tu navegador web**
2. **Ve a:** `http://localhost:3000`
3. **¡Disfruta de tu Sistema de Finanzas!**

## 📁 Estructura de Volúmenes

La aplicación usa volúmenes Docker para persistir datos:

- **`finanzas_data`**: Base de datos SQLite
- **`finanzas_backend_data`**: Datos del backend Python
- **`./exports`**: Reportes exportados

## 🔧 Comandos Útiles

### **Desarrollo**
```bash
# Entrar al contenedor para desarrollo
docker-compose run --rm sistema-finanzas

# Dentro del contenedor:
npm run web          # Ejecutar en modo web
npm run dev          # Ejecutar Electron (requiere X11)
npm start           # Ejecutar en modo producción
npm run build       # Construir ejecutable
```

### **Gestión de Contenedores**
```bash
# Ver contenedores en ejecución
docker ps

# Ver logs del contenedor
docker-compose logs sistema-finanzas

# Detener todos los contenedores
docker-compose down

# Eliminar volúmenes (¡CUIDADO! Esto borra todos los datos)
docker-compose down -v
```

### **Mantenimiento**
```bash
# Reconstruir imagen (si cambias dependencias)
docker-compose build --no-cache

# Limpiar imágenes no utilizadas
docker system prune

# Ver uso de espacio
docker system df
```

## 🐛 Solución de Problemas

### **Error: "Cannot connect to the Docker daemon"**
```bash
# Verificar que Docker Desktop esté ejecutándose
# En Windows: Buscar "Docker Desktop" en el menú inicio
# En macOS: Buscar Docker en Applications
```

### **Error: "Port already in use"**
```bash
# Verificar qué está usando el puerto
netstat -ano | findstr :3000

# Cambiar puerto en docker-compose.yml si es necesario
```

### **Error: "Permission denied"**
```bash
# En Linux, agregar tu usuario al grupo docker
sudo usermod -aG docker $USER
# Luego cerrar sesión y volver a entrar
```

### **Error: "No space left on device"**
```bash
# Limpiar espacio de Docker
docker system prune -a
docker volume prune
```

### **Error: "Missing X server or $DISPLAY"**
```bash
# Este error ocurre al intentar ejecutar Electron en Docker
# Usa el modo web en su lugar:
docker-compose run --rm -p 3000:3000 sistema-finanzas npm run web
```

## 🔒 Seguridad

- La aplicación se ejecuta como usuario no-root dentro del contenedor
- Los datos se almacenan en volúmenes Docker persistentes
- No se requieren permisos especiales del sistema

## 📊 Monitoreo

### **Ver uso de recursos:**
```bash
docker stats sistema-finanzas-app
```

### **Ver logs en tiempo real:**
```bash
docker-compose logs -f sistema-finanzas
```

## 🔄 Actualizaciones

Para actualizar la aplicación:

1. **Obtener cambios del repositorio:**
```bash
git pull origin main
```

2. **Reconstruir imagen:**
```bash
docker-compose build --no-cache
```

3. **Reiniciar aplicación:**
```bash
docker-compose down
docker-compose run --rm -p 3000:3000 sistema-finanzas npm run web
```

## 📝 Variables de Entorno

Puedes configurar variables de entorno en `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=development
  - PYTHONPATH=/app/python_backend
```

## 🎯 Ventajas de Usar Docker

✅ **Sin conflictos de dependencias**
✅ **Entorno consistente**
✅ **Fácil despliegue**
✅ **Aislamiento de datos**
✅ **Portabilidad entre sistemas**
✅ **Modo web accesible desde cualquier navegador**

## 🌟 Características del Modo Web

- **Interfaz completa**: Todas las funcionalidades disponibles
- **Base de datos local**: Datos persistentes en volúmenes Docker
- **Responsive**: Funciona en desktop, tablet y móvil
- **Sin instalación**: Solo necesitas un navegador web
- **Multiplataforma**: Funciona en Windows, macOS y Linux

## 📞 Soporte

Si tienes problemas con Docker:

1. Verifica que Docker Desktop esté ejecutándose
2. Revisa los logs: `docker-compose logs`
3. Reconstruye la imagen: `docker-compose build --no-cache`
4. Consulta la documentación oficial de Docker

## 🎉 ¡Listo para Usar!

Tu Sistema de Finanzas está listo para usar con Docker. Simplemente ejecuta:

```bash
start-web.bat
```

Y abre tu navegador en **http://localhost:3000**

---

**¡Disfruta usando el Sistema de Finanzas con Docker! 🎉** 