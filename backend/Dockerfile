# API de inventario LØN (Node + Express)
FROM node:22-alpine
WORKDIR /app

# Dependencias (cacheable)
COPY package*.json ./
RUN npm install --omit=dev

# Código
COPY . .

ENV PORT=3001
EXPOSE 3001
CMD ["node", "src/server.js"]
