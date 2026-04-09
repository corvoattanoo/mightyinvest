# ---- Base Image ----
# PHP 8.2 FPM (FastCGI Process Manager) - production-grade PHP runner
FROM php:8.2-fpm-alpine

# ---- Sistem Bağımlılıkları ----
# Alpine Linux'a gerekli paketleri yüklüyoruz
RUN apk add --no-cache \
    postgresql-dev \
    autoconf \
    g++ \
    make \
    git \
    libzip-dev \
    zip \
    unzip \
    curl

# ---- PHP Eklentileri ----
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pdo_mysql \
    opcache \
    zip \
    bcmath

# ---- Redis PHP Eklentisi ----
RUN pecl install redis && docker-php-ext-enable redis

# ---- Composer ----
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# ---- Çalışma Dizini ----
WORKDIR /var/www/html

# ---- Uygulama Dosyalarını Kopyala ----
COPY ./mightyinvest .

# ---- Bağımlılıkları Yükle ----
RUN composer install --optimize-autoloader --no-interaction

# ---- Dosya İzinleri ----
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
RUN chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# ---- PHP Ayarları ----
COPY docker/php/php.ini /usr/local/etc/php/conf.d/custom.ini

# ---- Başlangıç Scripti ----
COPY docker/php/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 9000

ENTRYPOINT ["entrypoint.sh"]
CMD ["php-fpm"]
