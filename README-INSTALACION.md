# 🚀 Sistema de Finanzas - Guía de Instalación

Esta guía te ayudará a ejecutar el Sistema de Finanzas según las herramientas que tengas disponibles en tu sistema.

## 📋 Opciones de Instalación

### **Opción 1: Docker (Recomendado) ⭐**

**Requisitos:**
- Docker Desktop instalado y ejecutándose

**Pasos:**
1. Inicia Docker Desktop
2. Ejecuta: `.\start-web.bat`
3. Abre tu navegador en: `http://localhost:3000`

**Ventajas:**
- ✅ Funcionalidad completa
- ✅ Base de datos SQLite
- ✅ APIs del backend
- ✅ Sin necesidad de instalar dependencias

---

### **Opción 2: Python Local**

**Requisitos:**
- Python 3.x instalado

**Pasos:**
1. Instala Python desde [python.org](https://python.org)
2. Ejecuta: `.\run-server.bat`
3. Abre tu navegador en: `http://localhost:3000`

**Ventajas:**
- ✅ Funcionalidad completa
- ✅ Base de datos SQLite
- ✅ APIs del backend

---

### **Opción 3: Servidor Simple (Sin Backend)**

**Requisitos:**
- Cualquier navegador web

**Pasos:**
1. Ejecuta: `.\start-powershell.bat`
2. Abre tu navegador en: `http://localhost:3000`

**Limitaciones:**
- ❌ No hay base de datos
- ❌ No se guardan los datos
- ❌ Solo interfaz visual

---

## 🔧 Solución de Problemas

### **Error: "Docker Desktop no está ejecutándose"**
```bash
# Inicia Docker Desktop desde el menú inicio
# O ejecuta desde PowerShell:
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

### **Error: "Python no está instalado"**
```bash
# Descarga Python desde:
# https://www.python.org/downloads/
# Asegúrate de marcar "Add Python to PATH"
```

### **Error: "Puerto 3000 ya está en uso"**
```bash
# Encuentra el proceso que usa el puerto:
netstat -ano | findstr :3000

# Termina el proceso:
taskkill /PID [PID] /F
```

### **Error: "No se puede conectar al servidor"**
```bash
# Verifica que el servidor esté ejecutándose
# Revisa los logs en la terminal
# Asegúrate de que no haya firewall bloqueando el puerto
```

## 📁 Estructura del Proyecto

```
sistemadefinanzas/
├── index.html              # Interfaz principal
├── styles.css              # Estilos CSS
├── renderer.js             # Lógica del frontend
├── main.js                 # Proceso principal de Electron
├── package.json            # Configuración de Node.js
├── python_backend/         # Backend en Python
│   ├── main.py            # Lógica del backend
│   ├── simple_server.py   # Servidor web simplificado
│   └── requirements.txt   # Dependencias de Python
├── Dockerfile.simple       # Configuración Docker
├── docker-compose.yml      # Orquestación Docker
├── start-web.bat          # Script para Docker
├── run-server.bat         # Script para Python
└── start-powershell.bat   # Script para PowerShell
```

## 🎯 Funcionalidades por Opción

| Funcionalidad | Docker | Python | PowerShell |
|---------------|--------|--------|------------|
| Dashboard | ✅ | ✅ | ❌ |
| Transacciones | ✅ | ✅ | ❌ |
| Categorías | ✅ | ✅ | ❌ |
| Reportes | ✅ | ✅ | ❌ |
| Base de datos | ✅ | ✅ | ❌ |
| Gráficos | ✅ | ✅ | ❌ |
| Exportar datos | ✅ | ✅ | ❌ |

## 🚀 Inicio Rápido

### **Para usuarios con Docker:**
```bash
.\start-web.bat
```

### **Para usuarios con Python:**
```bash
.\run-server.bat
```

### **Para usuarios sin dependencias:**
```bash
.\start-powershell.bat
```

## 📞 Soporte

Si tienes problemas:

1. **Verifica los requisitos** de tu opción elegida
2. **Revisa los logs** en la terminal
3. **Consulta la sección** de solución de problemas
4. **Prueba otra opción** si la actual no funciona

## 🎉 ¡Listo para Usar!

Una vez que el servidor esté ejecutándose, simplemente abre tu navegador en **http://localhost:3000** y disfruta de tu Sistema de Finanzas.

---

**¡Disfruta gestionando tus finanzas de manera profesional! 🎉** 