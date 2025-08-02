# 🐱 Sistema de Finanzas Gatunas

Un sistema de gestión financiera personal con interfaz web moderna y funcionalidades completas.

## ✨ Características

- 📊 **Dashboard** con estadísticas en tiempo real
- 💰 **Gestión de transacciones** (ingresos y gastos)
- 🏷️ **Categorías personalizables** con colores e iconos
- 📈 **Reportes y gráficos** visuales
- 💾 **Respaldo automático** de la base de datos
- 🌐 **Interfaz web** moderna y responsive

## 🚀 Instalación Rápida

### Requisitos Previos

1. **Python 3.8+** - [Descargar aquí](https://python.org)
2. **Node.js 14+** - [Descargar aquí](https://nodejs.org)

### Instalación Automática (Windows)

1. **Descarga** todos los archivos del proyecto
2. **Haz doble clic** en `iniciar_sistema.bat`
3. **Espera** a que se abra el navegador automáticamente

### Instalación Manual

```bash
# 1. Instalar dependencias de Node.js
npm install

# 2. Iniciar el servidor Python
python python_backend/simple_server.py

# 3. Abrir en el navegador
# http://localhost:3000
```

## 📁 Estructura del Proyecto

```
sistemadefinanzas/
├── index.html              # Interfaz principal
├── styles.css              # Estilos CSS
├── renderer.js             # Lógica del frontend
├── package.json            # Configuración de Node.js
├── iniciar_sistema.bat     # Script de inicio automático
├── python_backend/
│   └── simple_server.py    # Servidor Python
└── data/
    └── finances.db         # Base de datos SQLite
```

## 🎯 Cómo Usar

### 1. **Dashboard Principal**
- Ver estadísticas generales
- Balance actual
- Transacciones recientes

### 2. **Transacciones**
- **Crear**: Haz clic en "Nueva Transacción"
- **Editar**: Haz clic en el ícono de editar
- **Eliminar**: Haz clic en el ícono de papelera

### 3. **Categorías**
- **Ver**: Todas las categorías disponibles
- **Crear**: Nuevas categorías personalizadas
- **Editar**: Modificar colores e iconos

### 4. **Respaldo**
- Haz clic en "Respaldar BD" para crear copias de seguridad
- Los respaldos se guardan en la carpeta `backups/`

## 🔧 Configuración

### Categorías por Defecto

El sistema incluye 8 categorías predefinidas:

**Gastos:**
- 🍽️ Alimentación
- 🚗 Transporte  
- 🎮 Entretenimiento
- ❤️ Salud
- 🎓 Educación

**Ingresos:**
- 💰 Salario
- 💻 Freelance
- 📈 Inversiones

### Personalización

Puedes agregar nuevas categorías con:
- **Nombre** personalizado
- **Color** a elección
- **Icono** de FontAwesome
- **Tipo** (ingreso o gasto)

## 💾 Base de Datos

- **Ubicación**: `data/finances.db`
- **Tipo**: SQLite (portable)
- **Respaldo**: Automático en carpeta `backups/`

## 🛠️ Solución de Problemas

### Error: "Python no está instalado"
- Descarga e instala Python desde [python.org](https://python.org)
- Asegúrate de marcar "Add Python to PATH" durante la instalación

### Error: "Node.js no está instalado"
- Descarga e instala Node.js desde [nodejs.org](https://nodejs.org)

### Error: "Puerto 3000 en uso"
- Cierra otras aplicaciones que usen el puerto 3000
- O modifica el puerto en `python_backend/simple_server.py`

### Error: "Base de datos corrupta"
- Elimina el archivo `data/finances.db`
- Reinicia el sistema para crear una nueva base de datos

## 📞 Soporte

Si tienes problemas:
1. Verifica que Python y Node.js estén instalados
2. Revisa que no haya otros programas usando el puerto 3000
3. Asegúrate de tener permisos de escritura en la carpeta

## 🎉 ¡Disfruta tu Sistema de Finanzas!

El sistema está diseñado para ser simple, rápido y fácil de usar. ¡Perfecto para gestionar tus finanzas personales! 