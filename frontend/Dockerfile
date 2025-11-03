FROM node:20 AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . ./
RUN npm run build
RUN ls -la dist

FROM caddy:2-alpine
WORKDIR /app
COPY Caddyfile ./
COPY --from=build /app/dist ./dist
RUN ls -la dist
CMD ["caddy", "run", "--config", "Caddyfile", "--adapter", "caddyfile"]
