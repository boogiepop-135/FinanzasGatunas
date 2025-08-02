# 🚂 Despliegue en Railway - Sistema de Finanzas Gatunas

Guía completa para desplegar el Sistema de Finanzas Gatunas en Railway.

## 🎯 Ventajas de Railway

- ✅ **Despliegue automático** desde GitHub
- ✅ **SSL gratuito** (HTTPS automático)
- ✅ **Escalabilidad** automática
- ✅ **Base de datos** persistente
- ✅ **Dominio personalizado** opcional
- ✅ **Monitoreo** integrado

## 🚀 Pasos para Desplegar

### 1. **Preparar el Repositorio**

Asegúrate de que tu repositorio contenga estos archivos:

```
sistemadefinanzas/
├── index.html              # Interfaz principal
├── styles.css              # Estilos CSS
├── renderer.js             # Lógica del frontend
├── python_backend/
│   └── simple_server.py    # Servidor Python
├── requirements.txt        # Dependencias Python
├── Procfile               # Comando de inicio
├── runtime.txt            # Versión de Python
└── .gitignore             # Archivos a ignorar
```

### 2. **Conectar con Railway**

1. Ve a [railway.app](https://railway.app)
2. Inicia sesión con tu cuenta GitHub
3. Haz clic en **"New Project"**
4. Selecciona **"Deploy from GitHub repo"**
5. Busca y selecciona tu repositorio
6. Haz clic en **"Deploy Now"**

### 3. **Configuración Automática**

Railway detectará automáticamente:
- ✅ **Python** como runtime
- ✅ **requirements.txt** para dependencias
- ✅ **Procfile** para el comando de inicio
- ✅ **Puerto** dinámico asignado

### 4. **Variables de Entorno (Opcional)**

Railway configurará automáticamente:
- `PORT` - Puerto asignado por Railway
- `RAILWAY_STATIC_URL` - URL para archivos estáticos

### 5. **Dominio Personalizado (Opcional)**

1. En tu proyecto Railway, ve a **"Settings"**
2. En **"Domains"**, agrega tu dominio personalizado
3. Configura los registros DNS según las instrucciones

## 🔧 Configuración del Proyecto

### Archivos Clave

#### `Procfile`
```
web: python python_backend/simple_server.py
```

#### `requirements.txt`
```
# No se requieren dependencias externas
# SQLite3, http.server, json, os, datetime están incluidos en Python
```

#### `runtime.txt`
```
python-3.11.7
```

## 📊 Monitoreo y Logs

### Ver Logs en Tiempo Real
1. En tu proyecto Railway
2. Ve a la pestaña **"Deployments"**
3. Haz clic en el deployment más reciente
4. Ve a **"Logs"** para ver los logs en tiempo real

### Métricas del Sistema
- **CPU Usage** - Uso de procesador
- **Memory Usage** - Uso de memoria
- **Network** - Tráfico de red
- **Response Time** - Tiempo de respuesta

## 🗄️ Base de Datos

### SQLite en Railway
- ✅ **Persistente** - Los datos se mantienen entre deployments
- ✅ **Automática** - Se crea automáticamente en `/app/data/`
- ✅ **Respaldo** - Railway hace backups automáticos

### Respaldo Manual
El sistema incluye función de respaldo:
1. Usa el botón **"Respaldar BD"** en la aplicación
2. Los respaldos se guardan en `/app/backups/`
3. Puedes descargarlos desde Railway

## 🔄 Actualizaciones

### Despliegue Automático
1. Haz push a tu repositorio GitHub
2. Railway detectará los cambios automáticamente
3. Se desplegará la nueva versión
4. No hay tiempo de inactividad

### Despliegue Manual
1. En Railway, ve a **"Deployments"**
2. Haz clic en **"Deploy"**
3. Selecciona la rama o commit específico

## 🛠️ Solución de Problemas

### Error: "Application Error"
1. Revisa los logs en Railway
2. Verifica que `Procfile` esté correcto
3. Asegúrate de que `simple_server.py` funcione localmente

### Error: "Port already in use"
- Railway asigna el puerto automáticamente
- El código ya está adaptado para usar `os.environ.get('PORT')`

### Error: "Database not found"
- La base de datos se crea automáticamente
- Verifica que el directorio `/app/data/` tenga permisos de escritura

### Error: "Static files not found"
- Los archivos estáticos (HTML, CSS, JS) se sirven desde la raíz
- Verifica que estén en el repositorio

## 💰 Costos

### Plan Hobby (Gratuito)
- ✅ **512 MB RAM**
- ✅ **1 GB almacenamiento**
- ✅ **500 horas/mes**
- ✅ **1 proyecto activo**
- ✅ **Dominio personalizado**

### Plan Pro ($5/mes)
- ✅ **1 GB RAM**
- ✅ **10 GB almacenamiento**
- ✅ **Horas ilimitadas**
- ✅ **Proyectos ilimitados**
- ✅ **Soporte prioritario**

## 🎉 ¡Listo!

Una vez desplegado, tu sistema estará disponible en:
- **URL de Railway**: `https://tu-proyecto.railway.app`
- **HTTPS automático**: Sin configuración adicional
- **Escalabilidad**: Automática según el tráfico

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Railway
2. Verifica la configuración del repositorio
3. Consulta la documentación de Railway
4. Contacta soporte de Railway si es necesario

¡Tu Sistema de Finanzas Gatunas estará disponible 24/7 en la nube! 🚀 