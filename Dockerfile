FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY --chown=node:node . .

EXPOSE 5000

CMD ["npm", "run", "dev"]

FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]