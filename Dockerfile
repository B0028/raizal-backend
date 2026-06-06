FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY --chown=node:node . .

EXPOSE 5000

# Usamos nodemon (si lo instalas) o node para arrancar en modo desarrollo
# Antes: CMD ["node", "server.js"]
CMD ["npm", "run", "dev"]

FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 5000

CMD ["node", "index.js"]