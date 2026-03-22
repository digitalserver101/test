# Training portal — intentionally vulnerable lab app
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build:login && npm prune --omit=dev

ENV NODE_ENV=production
ENV PORT=3000
# Persist DB file in a volume (see docker-compose.yml)
ENV DATA_FILE=/data/data.json

RUN mkdir -p /data

EXPOSE 3000

CMD ["node", "server.js"]
