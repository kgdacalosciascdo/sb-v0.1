#!/usr/bin/env sh
set -eu

php artisan config:cache
php artisan route:cache

exec php -S "0.0.0.0:${PORT:-10000}" -t public public/index.php
