FROM node:20 AS build
WORKDIR /app

# Accept build argument for API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copy package files first
COPY package.json ./
RUN npm install

# Copy ALL project files at once (dockerignore will exclude what we don't need)
COPY . .

# Verify environment variables and files
RUN echo "=== Environment Variables ===" && \
    echo "VITE_API_URL: $VITE_API_URL" && \
    echo "=== Config files present ===" && \
    ls -la *.* 2>/dev/null | grep -E "(index.html|vite.config|tsconfig)" || echo "Config files OK"

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
