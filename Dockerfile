# Usar imagen base con Node.js y Python
FROM node:18-bullseye

# Instalar Python y pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY python_backend/requirements.txt ./python_backend/

# Configurar npm para evitar problemas de red
RUN npm config set registry https://registry.npmjs.org/
RUN npm config set fetch-retries 5
RUN npm config set fetch-retry-mintimeout 20000
RUN npm config set fetch-retry-maxtimeout 120000

# Instalar dependencias de Node.js con reintentos
RUN npm install --no-optional --verbose || npm install --no-optional --verbose || npm install --no-optional --verbose

# Instalar dependencias de Python
RUN pip3 install -r python_backend/requirements.txt

# Copiar código fuente
COPY . .

# Crear directorios necesarios
RUN mkdir -p data python_backend/data

# Exponer puerto (aunque Electron no usa puerto web, es buena práctica)
EXPOSE 3000

# Comando por defecto
CMD ["npm", "run", "dev"] 