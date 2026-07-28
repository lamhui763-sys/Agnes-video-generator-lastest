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

# CACHE BUST 2026-07-28T08:55 — EXT_ONTHEFLY_START_V1 0-scene Start button
ARG CACHE_BUST=ext-onthefly-start-8d3f3469
ENV CACHE_BUST=${CACHE_BUST}

# Build the application (prebuild patches server + AuthWrapper + chain)
RUN npm run build

# Safety: fail if login UI text still in frontend bundle
RUN if grep -r "請登入您的帳號\|註冊您的全新帳號\|信箱安全登入" dist/ 2>/dev/null; then \
      echo "ERROR: Login UI text still found in build." && exit 1; \
    else \
      echo "OK: No login UI in dist"; \
    fi

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
