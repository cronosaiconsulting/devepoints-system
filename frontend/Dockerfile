FROM node:20 AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . ./
RUN npm run build
RUN echo "=== Build complete, dist contents: ===" && ls -laR dist

FROM caddy:2-alpine
WORKDIR /app
COPY Caddyfile ./
COPY --from=build /app/dist ./dist
RUN echo "=== Caddy stage, dist contents: ===" && ls -laR dist
CMD ["caddy", "run", "--config", "Caddyfile", "--adapter", "caddyfile"]
