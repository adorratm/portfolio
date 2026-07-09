#!/usr/bin/env bash
# Portfolio nginx — 80/443 zaten kullanılıyorsa (ör. TTEN Docker nginx)
# Config'leri host'a kopyalar; AKTİF nginx'in bu dosyaları include etmesi gerekir.
#
# Kullanım:
#   sudo CERTBOT_EMAIL=senin@email.com ./deploy/setup-shared-nginx.sh
#   sudo NGINX_CONTAINER=tten-nginx CERTBOT_EMAIL=... ./deploy/setup-shared-nginx.sh
#
# Opsiyonel:
#   NGINX_CONF_DIR=/path/to/active/nginx/conf.d/portfolio
#   NGINX_CONTAINER=container_adı   → docker exec ile reload
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NGINX_CONF_DIR="${NGINX_CONF_DIR:-/etc/nginx/conf.d/portfolio}"
CERT_PATH="/etc/letsencrypt/live/emrekilic.web.tr/fullchain.pem"
SITES=(emrekilic.web.tr admin.emrekilic.web.tr api.emrekilic.web.tr)

if [[ "${EUID}" -ne 0 ]]; then
  echo "Bu script root olarak çalıştırılmalı: sudo ./deploy/setup-shared-nginx.sh"
  exit 1
fi

port_in_use() {
  local port="$1"
  ss -tlnH "sport = :${port}" 2>/dev/null | grep -q .
}

detect_port_owner() {
  ss -tlnpH "sport = :$1" 2>/dev/null || true
}

reload_active_nginx() {
  if [[ -n "${NGINX_CONTAINER:-}" ]]; then
    echo "==> Docker nginx reload: ${NGINX_CONTAINER}"
    docker exec "${NGINX_CONTAINER}" nginx -t
    docker exec "${NGINX_CONTAINER}" nginx -s reload
    return
  fi

  if systemctl is-active --quiet nginx 2>/dev/null; then
    echo "==> Host nginx reload..."
    nginx -t
    systemctl reload nginx
    return
  fi

  echo ""
  echo "UYARI: Aktif nginx otomatik reload edilemedi."
  echo "  80/443 dinleyen süreci bulun:"
  detect_port_owner 80
  detect_port_owner 443
  echo ""
  echo "  Docker ise: docker ps | grep -E '80|443'"
  echo "  Sonra: docker exec <container> nginx -t && docker exec <container> nginx -s reload"
}

install_configs() {
  local source_dir="$1"
  mkdir -p "${NGINX_CONF_DIR}"
  for conf in "${SITES[@]}"; do
    cp "${ROOT_DIR}/deploy/nginx/${source_dir}/${conf}.conf" "${NGINX_CONF_DIR}/${conf}.conf"
    echo "  + ${NGINX_CONF_DIR}/${conf}.conf (${source_dir})"
  done
}

echo "==> 80/443 port kontrolü..."
if port_in_use 80; then
  echo "    Port 80 kullanımda (beklenen — TTEN nginx):"
  detect_port_owner 80 | sed 's/^/      /'
else
  echo "    Port 80 boş — doğrudan ./deploy/setup-nginx.sh kullanabilirsiniz."
fi

echo "==> Certbot webroot hazırlanıyor..."
mkdir -p /var/www/certbot

if [[ -f "${CERT_PATH}" ]]; then
  echo "==> Mevcut SSL sertifikası bulundu. HTTPS config yükleniyor..."
  install_configs "."
else
  echo "==> Adım 1/3: HTTP bootstrap config..."
  install_configs "http"
  reload_active_nginx

  echo ""
  echo "==> Adım 2/3: Let's Encrypt (webroot)..."
  echo "    Aktif nginx'in /.well-known/acme-challenge/ → /var/www/certbot sunması gerekir."
  echo "    Cloudflare hata verirse @, admin, api kayıtlarını geçici DNS only yapın."
  certbot certonly --webroot \
    -w /var/www/certbot \
    -d emrekilic.web.tr \
    -d admin.emrekilic.web.tr \
    -d api.emrekilic.web.tr \
    --non-interactive --agree-tos \
    -m "${CERTBOT_EMAIL:-admin@emrekilic.web.tr}"

  echo ""
  echo "==> Adım 3/3: HTTPS config..."
  install_configs "."
fi

reload_active_nginx

echo ""
echo "==> Kurulum tamam (config dizini: ${NGINX_CONF_DIR})"
echo ""
echo "Aktif nginx bu dizini include etmiyorsa ana nginx.conf'a ekleyin:"
echo "  include ${NGINX_CONF_DIR}/*.conf;"
echo ""
echo "Doğrulama:"
echo "  curl -s http://127.0.0.1:3100/tr | head -3"
echo "  curl -I -H 'Host: emrekilic.web.tr' http://127.0.0.1/tr"
echo "  curl -I https://emrekilic.web.tr/tr"
