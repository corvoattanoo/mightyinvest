# ==== STAGE 1: Build ====
FROM node:20-alpine AS builder
WORKDIR /app
COPY ./mighty-invest-frontend-clean/package*.json ./
RUN npm ci
COPY ./mighty-invest-frontend-clean .
RUN npm run build
# ==== STAGE 2: Serve ====
FROM nginx:1.25-alpine
COPY --from=builder /app/dist/mighty-invest-frontend/browser /usr/share/nginx/html
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80