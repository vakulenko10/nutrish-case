# Use a Puppeteer-friendly base image with Chromium pre-installed
FROM ghcr.io/puppeteer/puppeteer:23.9.0

# Set environment variables to skip Chromium download and specify the path
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker caching
COPY package*.json ./

# Install dependencies (production only for smaller image size)
RUN npm ci --omit=dev

# Copy the rest of the application code to the container
COPY . .

# Build the TypeScript files
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
