FROM node:20 AS build
WORKDIR /app

# Copy package files first
COPY package.json ./
RUN npm install

# Copy ALL project files at once (dockerignore will exclude what we don't need)
COPY . .

# Verify what we have
RUN echo "=== Files in root ===" && ls -la && \
    echo "=== Source files ===" && find src -type f && \
    echo "=== Config files ===" && ls -la *.* 2>/dev/null || true

# Build - capture full output to file
RUN echo "=== Running TypeScript compilation ===" && \
    npx tsc --noEmit 2>&1 | tee tsc.log && \
    echo "=== TypeScript complete ===" && \
    echo "=== Running Vite build ===" && \
    npx vite build 2>&1 | tee vite.log && \
    echo "=== Vite log output ===" && \
    cat vite.log && \
    echo "=== End of Vite log ==="

# Show detailed results
RUN echo "=== Dist contents ===" && find dist -type f -ls

FROM caddy:2-alpine
WORKDIR /app
COPY Caddyfile ./
COPY --from=build /app/dist /app/dist
RUN echo "Final check:" && ls -la /app/dist/
CMD ["caddy", "run", "--config", "Caddyfile", "--adapter", "caddyfile"]
