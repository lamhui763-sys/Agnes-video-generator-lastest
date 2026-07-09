# Use a lightweight Node image as the base
FROM node:20-slim

# Install system dependencies (ffmpeg and ffprobe)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy dependency definition files
COPY package*.json ./

# Install dependencies (including devDependencies to build)
RUN npm install

# Copy rest of the application files
COPY . .

# Build the application
RUN npm run build

# Set environment variable for production
ENV NODE_ENV=production

# Expose port 3000 (which our Express server binds to)
EXPOSE 3000

# Start command
CMD ["npm", "start"]
