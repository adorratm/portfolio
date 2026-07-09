#!/usr/bin/env bash
# İki site, tek nginx (ttengamesstudio-nginx):
#   ttengamesstudio.com.tr  → TTEN (ttengamesstudio-frontend)
#   emrekilic.web.tr        → Portfolio
#
# Kullanım:
#   sudo bash deploy/ttengames/install-nginx.sh
#   sudo bash deploy/ttengames/install-nginx.sh https
#
# Upstream modları (otomatik seçilir):
#   host   → host.docker.internal:3100 (extra_hosts gerekir)
#   docker → portfolio-prod-frontend:3000 (TTEN ağına bağlanır, TTEN'i bozmaz)
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TTEN_TEMPLATES="${TTEN_TEMPLATES:-/opt/ttengamesstudio/docker/nginx/templates}"
NGINX_CONTAINER="${NGINX_CONTAINER:-ttengamesstudio-nginx}"
PORTFOLIO_NETWORK="${PORTFOLIO_NETWORK:-portfolio-prod_portfolio}"
CERT_PATH="/etc/letsencrypt/live/emrekilic.web.tr/fullchain.pem"
MODE="${1:-auto}"

PORTFOLIO_CONTAINERS=(portfolio-prod-frontend portfolio-prod-admin portfolio-prod-backend)
UPSTREAM_MODE=""
UPSTREAM_FRONTEND=""
UPSTREAM_ADMIN=""
UPSTREAM_API=""

if [[ "${EUID}" -ne 0 ]]; then
  echo "Root gerekli: sudo bash $0"
  exit 1
fi

resolve_mode() {
  if [[ "${MODE}" == "auto" ]]; then
    [[ -f "${CERT_PATH}" ]] && echo "https" || echo "http"
    return
  fi
  if [[ "${MODE}" != "http" && "${MODE}" != "https" ]]; then
    echo "Kullanım: sudo bash $0 [auto|http|https]" >&2
    exit 1
  fi
  echo "${MODE}"
}

detect_tten_network() {
  docker inspect "${NGINX_CONTAINER}" --format '{{range $k,$v := .NetworkSettings.Networks}}{{println $k}}{{end}}' \
    | grep -v '^portfolio' \
    | head -1
}

test_upstream() {
  local url="$1"
  docker exec "${NGINX_CONTAINER}" wget -qO- --timeout=4 "${url}" 2>/dev/null | head -1 | grep -q .
}

detect_host_upstream() {
  local candidate gw host_ip

  gw="$(docker exec "${NGINX_CONTAINER}" ip route 2>/dev/null | awk '/default/ {print $3; exit}')"
  host_ip="$(hostname -I 2>/dev/null | awk '{print $1}')"

  for candidate in host.docker.internal "${gw}" "${host_ip}" 172.17.0.1 172.18.0.1; do
    [[ -z "${candidate}" ]] && continue
    if test_upstream "http://${candidate}:3100/tr"; then
      UPSTREAM_MODE="host"
      UPSTREAM_FRONTEND="${candidate}:3100"
      UPSTREAM_ADMIN="${candidate}:3101"
      UPSTREAM_API="${candidate}:3102"
      echo "${candidate}"
      return 0
    fi
  done
  return 1
}

connect_portfolio_to_tten_network() {
  local tten_net="$1"
  local container

  for container in "${PORTFOLIO_CONTAINERS[@]}"; do
    if ! docker ps --format '{{.Names}}' | grep -qx "${container}"; then
      echo "Hata: ${container} çalışmıyor. Önce: cd /opt/portfolio && ./deploy/deploy.sh"
      exit 1
    fi
    docker network connect "${tten_net}" "${container}" 2>/dev/null || true
  done
}

detect_docker_upstream() {
  local tten_net

  tten_net="$(detect_tten_network)"
  if [[ -z "${tten_net}" ]]; then
    return 1
  fi

  echo "    TTEN ağı: ${tten_net}"
  connect_portfolio_to_tten_network "${tten_net}"

  if test_upstream "http://portfolio-prod-frontend:3000/tr"; then
    UPSTREAM_MODE="docker"
    UPSTREAM_FRONTEND="portfolio-prod-frontend:3000"
    UPSTREAM_ADMIN="portfolio-prod-admin:3000"
    UPSTREAM_API="portfolio-prod-backend:3001"
    echo "portfolio-prod-frontend"
    return 0
  fi
  return 1
}

setup_upstream() {
  echo "==> 2/5 Portfolio upstream tespit ediliyor..."

  if [[ -n "${PORTFOLIO_UPSTREAM_MODE:-}" ]]; then
    case "${PORTFOLIO_UPSTREAM_MODE}" in
      host)
        if [[ -z "${PORTFOLIO_HOST:-}" ]]; then
          PORTFOLIO_HOST="$(detect_host_upstream)" || true
        fi
        if [[ -z "${PORTFOLIO_HOST:-}" ]]; then
          echo "HATA: host modu için PORTFOLIO_HOST gerekli."
          exit 1
        fi
        UPSTREAM_MODE="host"
        UPSTREAM_FRONTEND="${PORTFOLIO_HOST}:3100"
        UPSTREAM_ADMIN="${PORTFOLIO_HOST}:3101"
        UPSTREAM_API="${PORTFOLIO_HOST}:3102"
        ;;
      docker)
        detect_docker_upstream >/dev/null || { echo "HATA: docker modu başarısız."; exit 1; }
        ;;
      *)
        echo "HATA: PORTFOLIO_UPSTREAM_MODE=host|docker olmalı."
        exit 1
        ;;
    esac
  elif [[ -n "${PORTFOLIO_HOST:-}" ]]; then
    UPSTREAM_MODE="host"
    UPSTREAM_FRONTEND="${PORTFOLIO_HOST}:3100"
    UPSTREAM_ADMIN="${PORTFOLIO_HOST}:3101"
    UPSTREAM_API="${PORTFOLIO_HOST}:3102"
  elif detect_host_upstream >/dev/null; then
    :
  elif detect_docker_upstream >/dev/null; then
    :
  else
    echo ""
    echo "HATA: Nginx container'ından portfolio'ya erişilemiyor."
    echo ""
    echo "Host'ta portfolio çalışıyor mu?"
    echo "  curl -s http://127.0.0.1:3100/tr | head -1"
    echo ""
    echo "Docker ağ modunu zorla (önerilen — extra_hosts gerekmez):"
    echo "  sudo PORTFOLIO_UPSTREAM_MODE=docker bash $0 ${SSL_MODE}"
    exit 1
  fi

  echo "    Mod: ${UPSTREAM_MODE}"
  echo "    frontend → ${UPSTREAM_FRONTEND}"
  echo "    admin    → ${UPSTREAM_ADMIN}"
  echo "    api      → ${UPSTREAM_API}"
}

cleanup_old_templates() {
  rm -f "${TTEN_TEMPLATES}"/portfolio-*.conf.template
}

install_portfolio_template() {
  local ssl_mode="$1"
  local src="${ROOT_DIR}/deploy/ttengames/${ssl_mode}/portfolio.conf.template"
  local dest="${TTEN_TEMPLATES}/portfolio.conf.template"

  if [[ ! -f "${src}" ]]; then
    echo "Hata: ${src} bulunamadı."
    exit 1
  fi

  sed \
    -e "s|@FRONTEND_UPSTREAM@|${UPSTREAM_FRONTEND}|g" \
    -e "s|@ADMIN_UPSTREAM@|${UPSTREAM_ADMIN}|g" \
    -e "s|@API_UPSTREAM@|${UPSTREAM_API}|g" \
    "${src}" > "${dest}"
  echo "  + ${dest} (${ssl_mode})"
}

verify_nginx_config() {
  echo ""
  echo "==> Nginx server_name kontrolü..."
  docker exec "${NGINX_CONTAINER}" nginx -T 2>/dev/null \
    | grep -E "server_name (emrekilic|admin\.emrekilic|api\.emrekilic|ttengamesstudio)" || true

  if ! docker exec "${NGINX_CONTAINER}" nginx -T 2>/dev/null | grep -q "server_name emrekilic.web.tr"; then
    echo "HATA: portfolio.conf nginx'e yüklenmemiş."
    docker exec "${NGINX_CONTAINER}" ls -la /etc/nginx/conf.d/ || true
    exit 1
  fi
}

test_sites() {
  echo ""
  echo "==> Site ayrımı testi..."

  local tten_body portfolio_body
  tten_body="$(curl -sL -H 'Host: ttengamesstudio.com.tr' http://127.0.0.1/ | head -c 500)"
  portfolio_body="$(curl -sL -H 'Host: emrekilic.web.tr' http://127.0.0.1/tr | head -c 500)"

  if echo "${tten_body}" | grep -qiE 'TTENGAMES|ttengames'; then
    echo "  OK  ttengamesstudio.com.tr → TTEN"
  else
    echo "  HATA ttengamesstudio.com.tr TTEN içeriği dönmüyor"
    echo "       docker network disconnect ${PORTFOLIO_NETWORK} ${NGINX_CONTAINER}"
  fi

  if echo "${portfolio_body}" | grep -qiE 'Emre|portfolio|yüklenemedi'; then
    echo "  OK  emrekilic.web.tr → Portfolio"
  else
    echo "  HATA emrekilic.web.tr portfolio içeriği dönmüyor"
    echo "       docker exec ${NGINX_CONTAINER} wget -qO- http://${UPSTREAM_FRONTEND}/tr | head"
  fi
}

SSL_MODE="$(resolve_mode)"

echo "==> İki site kurulumu (mod: ${SSL_MODE})"
echo ""

echo "==> 1/5 Nginx portfolio ağından ayrılıyor (TTEN DNS koruması)..."
docker network disconnect "${PORTFOLIO_NETWORK}" "${NGINX_CONTAINER}" 2>/dev/null || true

setup_upstream

echo "==> 3/5 Eski portfolio template'leri temizleniyor..."
cleanup_old_templates

echo "==> 4/5 portfolio.conf.template yükleniyor..."
install_portfolio_template "${SSL_MODE}"

echo ""
echo "==> 5/5 Nginx yeniden başlatılıyor..."
docker restart "${NGINX_CONTAINER}"
sleep 4
docker exec "${NGINX_CONTAINER}" nginx -t

verify_nginx_config
test_sites

echo ""
if [[ "${SSL_MODE}" == "http" ]]; then
  echo "Sertifika:"
  echo "  sudo certbot certonly --webroot -w /var/www/certbot \\"
  echo "    -d emrekilic.web.tr -d admin.emrekilic.web.tr -d api.emrekilic.web.tr \\"
  echo "    -m admin@emrekilic.web.tr --agree-tos --non-interactive"
  echo "  sudo bash $0 https"
else
  echo "HTTPS test:"
  echo "  curl -I https://emrekilic.web.tr/tr"
  echo "  curl -I https://ttengamesstudio.com.tr/"
fi

echo ""
echo "Kurulum tamam."
