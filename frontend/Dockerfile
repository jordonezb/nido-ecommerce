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

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["npm", "run", "dev"]
