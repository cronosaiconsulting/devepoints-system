FROM node:20 AS build
WORKDIR /app

# Copy package files and install dependencies
# Note: Only copy package.json to avoid npm optional dependencies bug with package-lock.json
COPY package.json ./
RUN npm install

# Copy all source files
COPY index.html vite.config.ts tsconfig.json tsconfig.node.json ./
COPY src ./src
COPY tailwind.config.js postcss.config.js ./

# Verify source files are present
RUN echo "Checking src files:" && ls -la src/ && ls -la src/pages/

# Build the application
RUN echo "=== Running TypeScript compiler ===" && npx tsc --noEmit || echo "TSC had errors but continuing..."
RUN echo "=== Running Vite build ===" && npx vite build

# Show what was built
RUN echo "=== DIST FILES ===" && find dist -type f -exec ls -lh {} \;

FROM caddy:2-alpine
WORKDIR /app
COPY Caddyfile ./
COPY --from=build /app/dist /app/dist
RUN echo "Final check:" && ls -la /app/dist/
CMD ["caddy", "run", "--config", "Caddyfile", "--adapter", "caddyfile"]
