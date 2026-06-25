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

# Backend interno al que se hace proxy /api (se puede sobreescribir en EasyPanel).
ENV API_UPSTREAM=http://backend:3001

# Plantilla: el entrypoint de nginx sustituye ${API_UPSTREAM} al arrancar.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Copiar el build generado
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
