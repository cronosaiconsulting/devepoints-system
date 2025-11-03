FROM node:20 AS build
WORKDIR /app

# Copy package files first
COPY package.json ./
RUN npm install

# Copy ALL project files at once (dockerignore will exclude what we don't need)
COPY . .

# Verify what we have
RUN echo "=== Files in root ===" && ls -la && \
    echo "=== Total source files ===" && find src -name "*.tsx" -o -name "*.ts" -o -name "*.css" | wc -l

# Build
RUN npm run build

# Show results
RUN echo "=== Build complete - dist contents ===" && ls -lah dist/ && find dist -type f

FROM caddy:2-alpine
WORKDIR /app
COPY Caddyfile ./
COPY --from=build /app/dist /app/dist
RUN echo "Final check:" && ls -la /app/dist/
CMD ["caddy", "run", "--config", "Caddyfile", "--adapter", "caddyfile"]
