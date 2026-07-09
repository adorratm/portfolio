#!/usr/bin/env bash
# Portfolio Nginx site konfigürasyonlarını kurar.
# Kullanım: sudo ./deploy/setup-nginx.sh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Bu script root olarak çalıştırılmalı: sudo ./deploy/setup-nginx.sh"
  exit 1
fi

echo "==> Nginx config dosyaları kopyalanıyor..."
for conf in emrekilic.web.tr admin.emrekilic.web.tr api.emrekilic.web.tr; do
  cp "${ROOT_DIR}/deploy/nginx/${conf}.conf" "${NGINX_AVAILABLE}/${conf}.conf"
  ln -sf "${NGINX_AVAILABLE}/${conf}.conf" "${NGINX_ENABLED}/${conf}.conf"
  echo "  + ${conf}.conf"
done

if [[ ! -f /etc/letsencrypt/live/emrekilic.web.tr/fullchain.pem ]]; then
  echo ""
  echo "==> SSL sertifikası bulunamadı. Certbot çalıştırılıyor..."
  echo "    (Cloudflare proxy geçici olarak DNS only yapmanız gerekebilir)"
  certbot certonly --nginx \
    -d emrekilic.web.tr \
    -d admin.emrekilic.web.tr \
    -d api.emrekilic.web.tr \
    --non-interactive --agree-tos -m "${CERTBOT_EMAIL:-admin@emrekilic.web.tr}" || {
      echo ""
      echo "Certbot başarısız. Manuel:"
      echo "  certbot certonly --nginx -d emrekilic.web.tr -d admin.emrekilic.web.tr -d api.emrekilic.web.tr"
      exit 1
    }
fi

echo "==> Nginx test ediliyor..."
nginx -t
systemctl reload nginx

echo ""
echo "Kurulum tamam. Doğrulama:"
echo "  curl -H 'Host: emrekilic.web.tr' http://127.0.0.1:3100/tr -I"
echo "  curl http://127.0.0.1:3102/api/v1/health"
