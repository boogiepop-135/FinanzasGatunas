# 🚀 Crear Ejecutable - Finanzas Gatunas 🐱💖

Esta guía te ayudará a convertir tu aplicación web en un archivo `.exe` ejecutable.

## 📋 Requisitos Previos

### 1. **Node.js** (Obligatorio)
- Descarga desde: https://nodejs.org/
- Versión recomendada: 18.x o superior
- Asegúrate de que esté en el PATH del sistema

### 2. **Python** (Opcional, para funcionalidad completa)
- Descarga desde: https://python.org/
- Versión recomendada: 3.8 o superior
- Marca "Add Python to PATH" durante la instalación

## 🎯 Pasos para Crear el Ejecutable

### **Paso 1: Verificar Node.js**
```bash
node --version
npm --version
```

### **Paso 2: Ejecutar el Script de Construcción**
```bash
.\build-exe.bat
```

O manualmente:
```bash
npm install
npm run build-exe
```

### **Paso 3: Encontrar tu Ejecutable**
Después de la construcción exitosa, encontrarás:

- **Ejecutable directo**: `dist\win-unpacked\finanzas-gatunas.exe`
- **Instalador**: `dist\Finanzas Gatunas Setup.exe`

## 📁 Estructura del Ejecutable

```
dist/
├── win-unpacked/
│   ├── finanzas-gatunas.exe     # Ejecutable principal
│   ├── resources/               # Recursos de la aplicación
│   └── locales/                 # Archivos de idioma
└── Finanzas Gatunas Setup.exe   # Instalador
```

## 🎨 Personalizar el Icono

### Opción 1: Usar un icono personalizado
1. Coloca tu archivo `icon.ico` en la carpeta `assets/`
2. El icono debe ser de 256x256 píxeles o mayor
3. Ejecuta `.\build-exe.bat` nuevamente

### Opción 2: Sin icono personalizado
- La aplicación usará el icono por defecto de Electron

## 🔧 Configuración Avanzada

### Modificar el package.json
Puedes personalizar la configuración en `package.json`:

```json
{
  "build": {
    "appId": "com.tuempresa.finanzasgatunas",
    "productName": "🐱 Tu Nombre de App",
    "directories": {
      "output": "dist"
    },
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico"
    }
  }
}
```

### Opciones de Construcción
- `npm run build` - Construir para todas las plataformas
- `npm run build-exe` - Construir solo para Windows
- `npm run pack` - Empaquetar sin crear instalador

## 🚀 Distribuir tu Aplicación

### Para Usuarios Finales
1. **Instalador**: Envía `Finanzas Gatunas Setup.exe`
2. **Portable**: Envía la carpeta `win-unpacked` completa

### Características del Instalador
- ✅ Instalación automática
- ✅ Acceso directo en escritorio
- ✅ Acceso directo en menú inicio
- ✅ Desinstalación limpia

## 🐛 Solución de Problemas

### Error: "Node.js no está instalado"
```bash
# Descarga e instala Node.js desde:
# https://nodejs.org/
```

### Error: "Python no encontrado"
```bash
# La aplicación funcionará sin Python
# pero sin funcionalidad de base de datos
```

### Error: "electron-builder no encontrado"
```bash
npm install electron-builder --save-dev
```

### Error: "Permisos insuficientes"
```bash
# Ejecuta PowerShell como administrador
# O ejecuta desde una carpeta con permisos de escritura
```

## 📦 Tamaño del Ejecutable

- **Ejecutable**: ~150-200 MB
- **Instalador**: ~100-150 MB
- **Primera ejecución**: Puede tardar 10-30 segundos

## 🎉 ¡Listo!

Una vez completado, tendrás:
- ✅ Aplicación de escritorio nativa
- ✅ Tema gatuno rosado completo
- ✅ Base de datos SQLite integrada
- ✅ Instalador profesional
- ✅ Accesos directos automáticos

## 🐱 Características del Ejecutable

- **🎨 Interfaz gatuna** con tema rosado
- **💾 Base de datos local** SQLite
- **📊 Gráficos interactivos** con Chart.js
- **🔧 Configuración persistente**
- **📱 Diseño responsive**
- **🎯 Navegación fluida**

---

**¡Disfruta de tu Sistema de Finanzas Gatuno como aplicación de escritorio! 🐱💖** 