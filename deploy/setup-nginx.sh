#!/usr/bin/env bash
# Portfolio Nginx kurulumu — önce HTTP, sonra Let's Encrypt, sonra HTTPS
# Kullanım: sudo CERTBOT_EMAIL=senin@email.com ./deploy/setup-nginx.sh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"
CERT_PATH="/etc/letsencrypt/live/emrekilic.web.tr/fullchain.pem"
SITES=(emrekilic.web.tr admin.emrekilic.web.tr api.emrekilic.web.tr)

if [[ "${EUID}" -ne 0 ]]; then
  echo "Bu script root olarak çalıştırılmalı: sudo ./deploy/setup-nginx.sh"
  exit 1
fi

install_configs() {
  local source_dir="$1"
  for conf in "${SITES[@]}"; do
    cp "${ROOT_DIR}/deploy/nginx/${source_dir}/${conf}.conf" "${NGINX_AVAILABLE}/${conf}.conf"
    ln -sf "${NGINX_AVAILABLE}/${conf}.conf" "${NGINX_ENABLED}/${conf}.conf"
    echo "  + ${conf}.conf (${source_dir})"
  done
}

reload_or_start_nginx() {
  nginx -t
  if systemctl is-active --quiet nginx; then
    systemctl reload nginx
  else
    echo "==> nginx çalışmıyor, başlatılıyor..."
    systemctl enable nginx
    systemctl start nginx
  fi
}

echo "==> Certbot webroot klasörü hazırlanıyor..."
mkdir -p /var/www/certbot

if [[ -f "${CERT_PATH}" ]]; then
  echo "==> Mevcut SSL sertifikası bulundu. HTTPS config yükleniyor..."
  install_configs "."
else
  echo "==> Adım 1/3: HTTP bootstrap config (sertifika olmadan)..."
  install_configs "http"
  reload_or_start_nginx

  echo ""
  echo "==> Adım 2/3: Let's Encrypt sertifikası alınıyor (webroot)..."
  echo "    Cloudflare kullanıyorsanız ve hata alırsanız DNS kayıtlarını"
  echo "    geçici olarak 'DNS only' (gri bulut) yapın."
  certbot certonly --webroot \
    -w /var/www/certbot \
    -d emrekilic.web.tr \
    -d admin.emrekilic.web.tr \
    -d api.emrekilic.web.tr \
    --non-interactive --agree-tos \
    -m "${CERTBOT_EMAIL:-admin@emrekilic.web.tr}"

  echo ""
  echo "==> Adım 3/3: HTTPS config yükleniyor..."
  install_configs "."
fi

echo "==> Nginx test ediliyor..."
reload_or_start_nginx

echo ""
echo "Kurulum tamam."
echo "  curl -I http://127.0.0.1:3100/tr"
echo "  curl http://127.0.0.1:3102/api/v1/health"
echo "  curl -I https://emrekilic.web.tr/tr"
