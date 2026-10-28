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

# Variables públicas para la compilación de Next.js
ARG NEXT_PUBLIC_API_URL=https://nido-backend-1d66.onrender.com
ARG NEXT_PUBLIC_WS_URL=https://nido-backend-1d66.onrender.com
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV HOSTNAME="0.0.0.0"

# Compilar la aplicación durante la construcción de la imagen Docker
RUN npm run build

EXPOSE 3000

# Arranque instantáneo en producción (sin demoras ni tiempos de espera de escaneo de puerto)
CMD ["npm", "run", "start"]
