# Usar imagen base oficial de Node.js
FROM node:18-alpine

# Instalar dependencias del sistema para compilación
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && ln -sf python3 /usr/bin/python

# Establecer directorio de trabajo
WORKDIR /app

# Configurar npm para usar cache
RUN npm config set cache /tmp/.npm

# Copiar archivos de configuración
COPY package*.json ./

# Instalar dependencias con verbosidad mínima
RUN npm ci --silent --no-audit --no-fund

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Limpiar archivos innecesarios después del build
RUN rm -rf src/ public/ && \
    npm cache clean --force

# Exponer puerto dinámico de Railway
EXPOSE $PORT

# Variables de entorno
ENV NODE_ENV=production

# Comando para iniciar con manejo de señales
CMD ["node", "server.js"]
