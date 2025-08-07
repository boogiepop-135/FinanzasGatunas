# Usar imagen base de Node.js LTS
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar el resto de los archivos
COPY . .

# Construir la aplicación React
RUN npm run build

# Exponer puerto
EXPOSE 3001

# Comando para iniciar la aplicación
CMD ["npm", "start"]
