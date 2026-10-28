FROM node:20-alpine

WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache libc6-compat

# Copiar manifiesto de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente completo
COPY . .

ENV HOSTNAME "0.0.0.0"

# Construye el frontend con las variables inyectadas y arranca el servidor de produccion
CMD ["sh", "-c", "npm run build && npm run start"]
