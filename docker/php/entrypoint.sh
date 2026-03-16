#!/bin/sh
set -e

echo "MightyInvest backend is starting..."

#if no .env
if [ ! -f .env ]; then
    echo ".env dosyasi olusturuluyor..."
    cp .env.example .env 2>/dev/null || touch .env
    echo "App key is created..."
    php artisan key:generate --force
fi

#cache cleaning and optimize
echo "Cache is cleaned ..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# wait till db is ready
echo "Waintg for DB..."
MAX_RETRIES=30
RETRY_COUNT=0
until php artisan migrate:status || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do
    echo "   Veritabani henuz hazir degil... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
    RETRY_COUNT=$((RETRY_COUNT + 1))
done

echo "Migration'lar calistiriliyor..."
php artisan migrate --force
echo "Backend hazir!"
# Orijinal komutu çalıştır (php-fpm)
exec "$@"