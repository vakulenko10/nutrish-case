FROM ghcr.io/puppeteer/puppeteer:23.10.0

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Set file ownership to pptruser
USER root
RUN chown -R pptruser:pptruser /app

# Switch to non-root user
USER pptruser

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application code
COPY --chown=pptruser:pptruser . .

# Compile TypeScript to JavaScript
RUN npm run build

# Puppeteer setup: Skip Chromium download
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Expose the application port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
