FROM node:20 AS build
WORKDIR /app

# Copy package files first
COPY package.json ./
RUN npm install

# Copy ALL project files at once (dockerignore will exclude what we don't need)
COPY . .

# Verify what we have
RUN echo "=== ALL root files ===" && ls -la && \
    echo "=== Source files ===" && find src -type f && \
    echo "=== Critical config files ===" && \
    (test -f index.html && echo "✓ index.html" || echo "✗ index.html MISSING") && \
    (test -f vite.config.ts && echo "✓ vite.config.ts" || echo "✗ vite.config.ts MISSING") && \
    (test -f tsconfig.json && echo "✓ tsconfig.json" || echo "✗ tsconfig.json MISSING") && \
    (test -f tsconfig.node.json && echo "✓ tsconfig.node.json" || echo "✗ tsconfig.node.json MISSING") && \
    (test -f tailwind.config.js && echo "✓ tailwind.config.js" || echo "✗ tailwind.config.js MISSING") && \
    (test -f postcss.config.js && echo "✓ postcss.config.js" || echo "✗ postcss.config.js MISSING") && \
    echo "=== Checking index.html content ===" && head -5 index.html && \
    echo "=== Checking vite.config.ts ===" && cat vite.config.ts

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
WORKDIR /srv
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
RUN echo "=== Final verification ===" && \
    ls -la /srv/ && \
    echo "=== Caddyfile contents ===" && \
    cat /etc/caddy/Caddyfile
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
