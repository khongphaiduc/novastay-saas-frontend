# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package manifests and install dependencies
COPY package.json package-lock.json* ./
# Sửa dòng dưới đây từ npm ci thành npm install
RUN npm install

# Copy source code and build the app
COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]