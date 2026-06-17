FROM node:22-alpine

# Puppeteer dependencies
RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .

EXPOSE 3001
CMD ["node", "--import", "tsx/esm", "src/server.ts"]
