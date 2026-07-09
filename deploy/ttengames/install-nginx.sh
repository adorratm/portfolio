#!/usr/bin/env bash
# Portfolio nginx → ttengamesstudio-nginx (Docker templates)
# Kullanım:
#   sudo ./deploy/ttengames/install-nginx.sh http
#   sudo ./deploy/ttengames/install-nginx.sh https
#
# Opsiyonel:
#   PORTFOLIO_HOST=172.17.0.1   (Docker bridge → host; container içinden test edin)
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TTEN_TEMPLATES="${TTEN_TEMPLATES:-/opt/ttengamesstudio/docker/nginx/templates}"
NGINX_CONTAINER="${NGINX_CONTAINER:-ttengamesstudio-nginx}"
PORTFOLIO_HOST="${PORTFOLIO_HOST:-172.17.0.1}"
MODE="${1:-}"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Root gerekli: sudo $0 http|https"
  exit 1
fi

if [[ "${MODE}" != "http" && "${MODE}" != "https" ]]; then
  echo "Kullanım: sudo $0 http|https"
  exit 1
fi

if [[ ! -d "${TTEN_TEMPLATES}" ]]; then
  echo "Hata: ${TTEN_TEMPLATES} bulunamadı."
  exit 1
fi

SRC_DIR="${ROOT_DIR}/deploy/ttengames/${MODE}"
FILES=(emrekilic.web.tr admin.emrekilic.web.tr api.emrekilic.web.tr)

echo "==> Portfolio host (nginx container'dan): ${PORTFOLIO_HOST}"
echo "==> Hedef: ${TTEN_TEMPLATES}"
echo "==> Mod: ${MODE}"

for name in "${FILES[@]}"; do
  dest="${TTEN_TEMPLATES}/portfolio-${name}.conf.template"
  sed "s/@PORTFOLIO_HOST@/${PORTFOLIO_HOST}/g" \
    "${SRC_DIR}/${name}.conf.template" > "${dest}"
  echo "  + ${dest}"
done

echo ""
echo "==> Host erişim testi (nginx container içinden)..."
if docker exec "${NGINX_CONTAINER}" wget -qO- --timeout=3 "http://${PORTFOLIO_HOST}:3100/tr" 2>/dev/null | head -1 | grep -q .; then
  echo "    OK: ${PORTFOLIO_HOST}:3100 erişilebilir"
else
  echo "    UYARI: ${PORTFOLIO_HOST}:3100 erişilemedi."
  echo "    Deneyin: sudo PORTFOLIO_HOST=host.docker.internal $0 ${MODE}"
  echo "    veya TTEN docker-compose'a extra_hosts: host.docker.internal:host-gateway ekleyin"
fi

echo ""
echo "==> Nginx container yeniden başlatılıyor (template'ler startup'ta işlenir)..."
docker restart "${NGINX_CONTAINER}"
sleep 3
docker exec "${NGINX_CONTAINER}" nginx -t

echo ""
if [[ "${MODE}" == "http" ]]; then
  echo "Sonraki adım (sertifika yoksa):"
  echo "  sudo certbot certonly --webroot -w /var/www/certbot \\"
  echo "    -d emrekilic.web.tr -d admin.emrekilic.web.tr -d api.emrekilic.web.tr \\"
  echo "    -m senin@email.com --agree-tos --non-interactive"
  echo "  sudo $0 https"
else
  echo "Test:"
  echo "  curl -I https://emrekilic.web.tr/tr"
fi
