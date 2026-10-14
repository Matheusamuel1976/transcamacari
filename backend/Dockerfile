# TransCamaçari 2.0 — Backend PHP 8.3 (Railway/Render/Docker)
# Sobe com: php -S na porta $PORT servindo public/. Sessões em arquivo
# (use 1 réplica). Banco via variáveis DB_* (mysql ou pgsql/Supabase).

FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-progress

FROM php:8.3-cli
RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev \
    && docker-php-ext-install pdo_pgsql \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /srv/app
COPY --from=vendor /app/vendor ./vendor
COPY . .
EXPOSE 8000
CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-8000} -t public"]
