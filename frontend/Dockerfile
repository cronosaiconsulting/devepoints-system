FROM node:20 AS build
WORKDIR /app

# Copy package files and install dependencies
# Note: Only copy package.json to avoid npm optional dependencies bug with package-lock.json
COPY package.json ./
RUN npm install

# Copy config files
COPY vite.config.ts tsconfig.json tsconfig.node.json tailwind.config.js postcss.config.js ./
COPY src ./src

# Create index.html directly to avoid copy corruption
RUN cat > index.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DevePoints - Loyalty & Rewards System</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

# Verify
RUN echo "index.html created:" && cat index.html

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
