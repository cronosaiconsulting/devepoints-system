FROM node:20 AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production=false

# Copy all source files
COPY index.html vite.config.ts tsconfig.json tsconfig.node.json ./
COPY public ./public
COPY src ./src
COPY tailwind.config.js postcss.config.js ./

# Verify source files are present
RUN echo "Checking src files:" && ls -la src/ && ls -la src/pages/

# Build the application
RUN npm run build

# Show what was built
RUN echo "Build output:" && ls -la dist/ && ls -la dist/assets/ 2>/dev/null || echo "No assets folder"

FROM caddy:2-alpine
WORKDIR /app
COPY Caddyfile ./
COPY --from=build /app/dist /app/dist
RUN echo "Final check:" && ls -la /app/dist/
CMD ["caddy", "run", "--config", "Caddyfile", "--adapter", "caddyfile"]
