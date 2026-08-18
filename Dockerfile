# syntax=docker/dockerfile:1

FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Vite ฝัง VITE_BACKEND_URL ตอน build (จำเป็นเมื่อ frontend เข้าผ่านโดเมน ไม่ใช่ localhost)
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
RUN npm run build

# เสิร์ฟไฟล์ static ที่ build แล้วด้วย nginx (image เล็ก ไม่ต้องมี Node ตอน runtime)
FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
