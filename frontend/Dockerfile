FROM node:20 AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN echo "=== All files after COPY ===" && ls -laR
RUN npm run build
RUN echo "=== Dist contents ===" && find dist -type f

FROM caddy:2-alpine
WORKDIR /app
COPY Caddyfile ./
COPY --from=build /app/dist /app/dist
RUN echo "=== Final dist ===" && find /app/dist -type f
CMD ["caddy", "run", "--config", "Caddyfile", "--adapter", "caddyfile"]
