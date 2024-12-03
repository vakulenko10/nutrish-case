FROM node:18

# Install Puppeteer dependencies
RUN apt-get update && apt-get install -y \
  libnss3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  fonts-liberation \
  libasound2 \
  libgbm-dev \
  --no-install-recommends

# Install Puppeteer
RUN npm install puppeteer

# Set the working directory
WORKDIR /usr/src/app

# Copy project files
COPY . .

# Install project dependencies
RUN npm install

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
