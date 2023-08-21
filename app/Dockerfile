FROM node:20-alpine

WORKDIR /app

COPY package*.json /app

RUN npm ci

COPY example.xlsx /app

COPY views /app/views

COPY server.js /app

CMD ["node", "server.js"]
