FROM node:20 AS build
WORKDIR /app

# Copy package files and install dependencies
# Note: Only copy package.json to avoid npm optional dependencies bug with package-lock.json
COPY package.json ./
RUN npm install

# Copy config files
COPY vite.config.ts tsconfig.json tsconfig.node.json tailwind.config.js postcss.config.js ./
COPY src ./src

# Create index.html directly
RUN printf '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <link rel="icon" type="image/svg+xml" href="/vite.svg" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>DevePoints - Loyalty & Rewards System</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>\n' > index.html

# Verify with multiple methods
RUN ls -lh index.html && wc -l index.html && file index.html && grep -c "root" index.html || echo "File check done"

# Build the application
RUN echo "=== Cleaning and building ===" && \
    rm -rf dist node_modules/.vite && \
    NODE_ENV=production npx vite build

# Show what was built
RUN echo "=== DIST FILES ===" && find dist -type f -exec ls -lh {} \;

FROM caddy:2-alpine
WORKDIR /app
COPY Caddyfile ./
COPY --from=build /app/dist /app/dist
RUN echo "Final check:" && ls -la /app/dist/
CMD ["caddy", "run", "--config", "Caddyfile", "--adapter", "caddyfile"]
