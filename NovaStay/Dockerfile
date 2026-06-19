# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package manifests and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code and build the app
COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine

# 👇 CHÈN DÒNG NÀY ĐỂ ĐÈ CONFIG MỚI VÀO CONTAINER
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy file tĩnh đã build từ stage trước
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]