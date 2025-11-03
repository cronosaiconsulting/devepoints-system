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

# Build with full output
RUN npm run build 2>&1 | tee build.log && \
    echo "=== Build log ===" && cat build.log && \
    echo "=== Build exit code: $? ==="

# Show detailed results
RUN echo "=== Dist contents ===" && find dist -type f -ls

FROM caddy:2-alpine
WORKDIR /app
COPY Caddyfile ./
COPY --from=build /app/dist /app/dist
RUN echo "Final check:" && ls -la /app/dist/
CMD ["caddy", "run", "--config", "Caddyfile", "--adapter", "caddyfile"]
