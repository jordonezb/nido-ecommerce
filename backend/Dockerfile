FROM node:20-alpine

WORKDIR /app

# Instalar dependencias requeridas para Prisma y compilación nativa en Alpine
RUN apk add --no-cache openssl libc6-compat

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm install

# Copiar el código fuente completo
COPY . .

# Generar el cliente de Prisma
RUN npx prisma generate

# Compilar la aplicación NestJS para producción
RUN npm run build

EXPOSE 4000

# Sincroniza las tablas de la BD con prisma db push y arranca el servidor compilado
CMD ["npm", "run", "start:prod"]
