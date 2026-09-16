FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
# Install exactly the dependency graph committed to the repository. `npm install`
# resolves version ranges on every Railway build and is currently crashing in the
# image's bundled npm ("edgesOut"), before Next.js can build or start.
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/db/migrations /db/migrations
RUN chown -R node:node /app /db
USER node
EXPOSE 3000
CMD ["node", "server.js"]
