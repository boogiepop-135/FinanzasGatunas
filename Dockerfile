
# Etapa 1: Build de React
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Etapa 2: Producción con Node.js y Python
FROM node:18-alpine

# Instalar Python3 y pip
RUN apk add --no-cache python3 py3-pip

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Copia solo el build generado y el server
COPY --from=builder /app/build ./build
COPY --from=builder /app/server.js ./server.js

# Copiar el backend Python
COPY ./python_backend ./python_backend

# Instalar dependencias Python
RUN pip3 install --no-cache-dir -r ./python_backend/requirements.txt

EXPOSE 3000
EXPOSE 8000
ENV NODE_ENV=production
ENV PORT=3000

# Instalar concurrently para ejecutar ambos procesos
RUN npm install -g concurrently

# Comando para iniciar Node.js y Python juntos
CMD ["concurrently", "node server.js", "python3 python_backend/web_server.py"]
