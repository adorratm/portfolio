#!/usr/bin/env bash
# Portfolio nginx → ttengamesstudio-nginx (Docker templates)
#
# Kullanım:
#   sudo ./deploy/ttengames/install-nginx.sh http
#   sudo ./deploy/ttengames/install-nginx.sh https
#
# Önerilen (Docker network — host IP gerekmez):
#   sudo PORTFOLIO_MODE=network ./deploy/ttengames/install-nginx.sh http
#
# Opsiyonel:
#   PORTFOLIO_MODE=host|network   (varsayılan: network)
#   PORTFOLIO_HOST=172.17.0.1     (host modunda)
#   PORTFOLIO_NETWORK=portfolio-prod_portfolio
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TTEN_TEMPLATES="${TTEN_TEMPLATES:-/opt/ttengamesstudio/docker/nginx/templates}"
NGINX_CONTAINER="${NGINX_CONTAINER:-ttengamesstudio-nginx}"
PORTFOLIO_MODE="${PORTFOLIO_MODE:-network}"
PORTFOLIO_HOST="${PORTFOLIO_HOST:-172.17.0.1}"
PORTFOLIO_NETWORK="${PORTFOLIO_NETWORK:-portfolio-prod_portfolio}"
MODE="${1:-}"

FRONTEND_UPSTREAM=""
ADMIN_UPSTREAM=""
API_UPSTREAM=""
TEST_URL=""

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

setup_upstream_targets() {
  if [[ "${PORTFOLIO_MODE}" == "network" ]]; then
    FRONTEND_UPSTREAM="portfolio-prod-frontend:3000"
    ADMIN_UPSTREAM="portfolio-prod-admin:3000"
    API_UPSTREAM="portfolio-prod-backend:3001"
    TEST_URL="http://${FRONTEND_UPSTREAM}/tr"

    if ! docker network inspect "${PORTFOLIO_NETWORK}" >/dev/null 2>&1; then
      echo "Hata: Docker network '${PORTFOLIO_NETWORK}' bulunamadı."
      echo "  docker network ls | grep portfolio"
      exit 1
    fi

    if ! docker network inspect "${PORTFOLIO_NETWORK}" --format '{{range .Containers}}{{.Name}} {{end}}' | grep -q "${NGINX_CONTAINER}"; then
      echo "==> ${NGINX_CONTAINER} → ${PORTFOLIO_NETWORK} ağına bağlanıyor..."
      docker network connect "${PORTFOLIO_NETWORK}" "${NGINX_CONTAINER}"
    fi
    return
  fi

  if [[ "${PORTFOLIO_MODE}" == "host" ]]; then
    FRONTEND_UPSTREAM="${PORTFOLIO_HOST}:3100"
    ADMIN_UPSTREAM="${PORTFOLIO_HOST}:3101"
    API_UPSTREAM="${PORTFOLIO_HOST}:3102"
    TEST_URL="http://${FRONTEND_UPSTREAM}/tr"
    return
  fi

  echo "Hata: PORTFOLIO_MODE 'network' veya 'host' olmalı."
  exit 1
}

render_template() {
  local src="$1"
  local dest="$2"
  sed \
    -e "s/@FRONTEND_UPSTREAM@/${FRONTEND_UPSTREAM}/g" \
    -e "s/@ADMIN_UPSTREAM@/${ADMIN_UPSTREAM}/g" \
    -e "s/@API_UPSTREAM@/${API_UPSTREAM}/g" \
    "${src}" > "${dest}"
}

setup_upstream_targets

SRC_DIR="${ROOT_DIR}/deploy/ttengames/${MODE}"
FILES=(emrekilic.web.tr admin.emrekilic.web.tr api.emrekilic.web.tr)

echo "==> Upstream modu: ${PORTFOLIO_MODE}"
echo "    frontend → ${FRONTEND_UPSTREAM}"
echo "    admin    → ${ADMIN_UPSTREAM}"
echo "    api      → ${API_UPSTREAM}"
echo "==> Hedef: ${TTEN_TEMPLATES}"
echo "==> SSL modu: ${MODE}"

for name in "${FILES[@]}"; do
  dest="${TTEN_TEMPLATES}/portfolio-${name}.conf.template"
  render_template "${SRC_DIR}/${name}.conf.template" "${dest}"
  echo "  + ${dest}"
done

echo ""
echo "==> Erişim testi (nginx container içinden)..."
if docker exec "${NGINX_CONTAINER}" wget -qO- --timeout=5 "${TEST_URL}" 2>/dev/null | head -1 | grep -q .; then
  echo "    OK: ${TEST_URL}"
else
  echo "    UYARI: ${TEST_URL} erişilemedi."
  if [[ "${PORTFOLIO_MODE}" == "network" ]]; then
    echo "    Kontrol: docker exec ${NGINX_CONTAINER} wget -qO- ${TEST_URL} | head"
    echo "    Portfolio ayakta mı: docker ps | grep portfolio-prod"
  else
    echo "    Deneyin: sudo PORTFOLIO_MODE=network $0 ${MODE}"
    echo "    veya: sudo PORTFOLIO_HOST=host.docker.internal PORTFOLIO_MODE=host $0 ${MODE}"
  fi
fi

echo ""
echo "==> Nginx container yeniden başlatılıyor (template'ler startup'ta işlenir)..."
docker restart "${NGINX_CONTAINER}"
sleep 3
docker exec "${NGINX_CONTAINER}" nginx -t

echo ""
if [[ "${MODE}" == "http" ]]; then
  echo "Test:"
  echo "  curl -I -H 'Host: emrekilic.web.tr' http://127.0.0.1/tr"
  echo ""
  echo "Sonraki adım (sertifika yoksa):"
  echo "  sudo certbot certonly --webroot -w /var/www/certbot \\"
  echo "    -d emrekilic.web.tr -d admin.emrekilic.web.tr -d api.emrekilic.web.tr \\"
  echo "    -m senin@email.com --agree-tos --non-interactive"
  echo "  sudo PORTFOLIO_MODE=${PORTFOLIO_MODE} $0 https"
else
  echo "Test:"
  echo "  curl -I https://emrekilic.web.tr/tr"
fi
