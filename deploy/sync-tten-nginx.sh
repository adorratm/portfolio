#!/usr/bin/env bash
# TTEN nginx'e portfolio.conf merge + reload + kısa doğrulama
set -euo pipefail

NGINX_CONTAINER="${NGINX_CONTAINER:-ttengamesstudio-nginx}"
TTEN_TPL="${TTEN_TEMPLATES:-/opt/ttengamesstudio/docker/nginx/templates}"

if ! docker ps --format '{{.Names}}' | grep -qx "${NGINX_CONTAINER}"; then
  echo "TTEN nginx yok (${NGINX_CONTAINER}) — atlanıyor."
  exit 0
fi

if [[ ! -f "${TTEN_TPL}/portfolio.conf" ]]; then
  echo "portfolio.conf yok (${TTEN_TPL}) — nginx sync atlandı."
  exit 0
fi

echo "==> Nginx portfolio merge + reload..."
docker exec "${NGINX_CONTAINER}" sh -c '
  line=$(grep -n -E "^upstream portfolio_|^# Portfolio|^map \\$http_upgrade|server_name emrekilic|server_name admin\.emrekilic|server_name api\.emrekilic" \
    /etc/nginx/conf.d/default.conf 2>/dev/null | head -1 | cut -d: -f1)
  if [ -n "$line" ]; then
    head -n $((line - 1)) /etc/nginx/conf.d/default.conf > /tmp/default.clean
  else
    cp /etc/nginx/conf.d/default.conf /tmp/default.clean
  fi
  cat /etc/nginx/templates/portfolio.conf >> /tmp/default.clean
  mv /tmp/default.clean /etc/nginx/conf.d/default.conf
'
docker exec "${NGINX_CONTAINER}" nginx -t
docker exec "${NGINX_CONTAINER}" nginx -s reload

echo "==> Nginx → portfolio upstream testi..."
if docker exec "${NGINX_CONTAINER}" wget -qSO- http://portfolio-prod-frontend:3000/tr 2>&1 | head -1 | grep -q '200'; then
  echo "  OK  portfolio-prod-frontend:3000"
else
  echo "  UYARI: nginx container'ından frontend erişilemedi."
  echo "        docker network inspect ttengamesstudio_ttengamesstudio-network | grep portfolio"
  exit 1
fi

if curl -fsSI --resolve emrekilic.web.tr:443:127.0.0.1 https://emrekilic.web.tr/tr -k 2>/dev/null | head -1 | grep -qE '200|301|302'; then
  echo "  OK  https://emrekilic.web.tr/tr"
else
  echo "  UYARI: HTTPS site testi başarısız (502 olabilir)."
  docker exec "${NGINX_CONTAINER}" tail -5 /var/log/nginx/error.log 2>/dev/null || true
  exit 1
fi

echo "Nginx sync tamam."
