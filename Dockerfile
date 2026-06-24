# ---------- Etapa 1: build de la app Vue/Vite ----------
FROM node:22-alpine AS build
WORKDIR /app

# Instalar dependencias (cacheable)
COPY package*.json ./
RUN npm ci

# Copiar el resto y compilar a /app/dist
COPY . .
RUN npm run build

# ---------- Etapa 2: servir el estático con nginx ----------
FROM nginx:alpine

# Config de nginx para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar el build generado
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
