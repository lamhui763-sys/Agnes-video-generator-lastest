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

# CACHE BUST 2026-07-27T23:51 — force full rebuild after removing login UI
ARG CACHE_BUST=no-login-d041eeec
ENV CACHE_BUST=${CACHE_BUST}

# Build the application
RUN npm run build

# Safety check: fail build if old login text still present in frontend bundle
RUN if grep -r "請登入您的帳號\|註冊您的全新帳號\|信箱安全登入" dist/ 2>/dev/null; then \
      echo "ERROR: Login UI text still found in build output. AuthWrapper was not applied." && exit 1; \
    else \
      echo "OK: No login UI text in dist — guest mode confirmed"; \
    fi

# Set environment variable for production
ENV NODE_ENV=production

# Expose port 3000 (which our Express server binds to)
EXPOSE 3000

# Start command
CMD ["npm", "start"]
