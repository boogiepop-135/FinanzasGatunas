
# Etapa 1: Build de React
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Etapa 2: Producción
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Copia solo el build generado y el server
COPY --from=builder /app/build ./build
COPY --from=builder /app/server.js ./server.js

# Si usas otros archivos JS para el backend, agrégalos aquí
# COPY --from=builder /app/otros.js ./otros.js

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "server.js"]
