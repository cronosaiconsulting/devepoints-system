FROM node:20 AS build
WORKDIR /app

# Copy package files and install dependencies
# Note: Only copy package.json to avoid npm optional dependencies bug with package-lock.json
COPY package.json ./
RUN npm install

# Copy all source files explicitly
COPY index.html ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tsconfig.node.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY src ./src

# Verify files
RUN echo "=== Verifying copied files ===" && \
    ls -lh index.html && \
    wc -l index.html && \
    echo "First 5 lines:" && head -5 index.html && \
    echo "Last 5 lines:" && tail -5 index.html

# Build the application
RUN echo "=== Running Vite build with verbose output ===" && npx vite build --logLevel info

# Show what was built
RUN echo "=== DIST FILES ===" && find dist -type f -exec ls -lh {} \;

FROM caddy:2-alpine
WORKDIR /app
COPY Caddyfile ./
COPY --from=build /app/dist /app/dist
RUN echo "Final check:" && ls -la /app/dist/
CMD ["caddy", "run", "--config", "Caddyfile", "--adapter", "caddyfile"]
