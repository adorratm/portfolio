#!/usr/bin/env bash
# İki site, tek nginx (ttengamesstudio-nginx):
#   ttengamesstudio.com.tr  → TTEN repo (ttengamesstudio-frontend)
#   emrekilic.web.tr        → Portfolio repo (host:3100-3102)
#
# Kullanım:
#   sudo bash deploy/ttengames/install-nginx.sh
#   sudo bash deploy/ttengames/install-nginx.sh http
#   sudo bash deploy/ttengames/install-nginx.sh https
#
# Önkoşul (TTEN docker-compose.yml → nginx servisi):
#   extra_hosts:
#     - "host.docker.internal:host-gateway"
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TTEN_TEMPLATES="${TTEN_TEMPLATES:-/opt/ttengamesstudio/docker/nginx/templates}"
NGINX_CONTAINER="${NGINX_CONTAINER:-ttengamesstudio-nginx}"
PORTFOLIO_NETWORK="${PORTFOLIO_NETWORK:-portfolio-prod_portfolio}"
CERT_PATH="/etc/letsencrypt/live/emrekilic.web.tr/fullchain.pem"
MODE="${1:-auto}"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Root gerekli: sudo bash $0"
  exit 1
fi

detect_portfolio_host() {
  local candidate
  local gw host_ip

  gw="$(docker exec "${NGINX_CONTAINER}" ip route 2>/dev/null | awk '/default/ {print $3; exit}')"
  host_ip="$(hostname -I 2>/dev/null | awk '{print $1}')"

  for candidate in \
    host.docker.internal \
    "${gw}" \
    "${host_ip}" \
    172.17.0.1 \
    172.18.0.1; do
    [[ -z "${candidate}" ]] && continue
    if docker exec "${NGINX_CONTAINER}" wget -qO- --timeout=4 "http://${candidate}:3100/tr" 2>/dev/null | head -1 | grep -q .; then
      echo "${candidate}"
      return 0
    fi
  done
  return 1
}

resolve_mode() {
  if [[ "${MODE}" == "auto" ]]; then
    if [[ -f "${CERT_PATH}" ]]; then
      echo "https"
    else
      echo "http"
    fi
    return
  fi
  if [[ "${MODE}" != "http" && "${MODE}" != "https" ]]; then
    echo "Kullanım: sudo bash $0 [auto|http|https]" >&2
    exit 1
  fi
  echo "${MODE}"
}

cleanup_old_templates() {
  rm -f "${TTEN_TEMPLATES}"/portfolio-*.conf.template
}

install_portfolio_template() {
  local ssl_mode="$1"
  local portfolio_host="$2"
  local src="${ROOT_DIR}/deploy/ttengames/${ssl_mode}/portfolio.conf.template"
  local dest="${TTEN_TEMPLATES}/portfolio.conf.template"

  if [[ ! -f "${src}" ]]; then
    echo "Hata: ${src} bulunamadı."
    exit 1
  fi

  sed \
    -e "s/@FRONTEND_UPSTREAM@/${portfolio_host}:3100/g" \
    -e "s/@ADMIN_UPSTREAM@/${portfolio_host}:3101/g" \
    -e "s/@API_UPSTREAM@/${portfolio_host}:3102/g" \
    "${src}" > "${dest}"
  echo "  + ${dest} (${ssl_mode}, upstream host: ${portfolio_host})"
}

verify_nginx_config() {
  echo ""
  echo "==> Nginx server_name kontrolü..."
  docker exec "${NGINX_CONTAINER}" nginx -T 2>/dev/null | grep -E "server_name (emrekilic|admin\.emrekilic|api\.emrekilic|ttengamesstudio)" || true

  if ! docker exec "${NGINX_CONTAINER}" nginx -T 2>/dev/null | grep -q "server_name emrekilic.web.tr"; then
    echo "HATA: portfolio.conf nginx'e yüklenmemiş."
    echo "  docker exec ${NGINX_CONTAINER} ls -la /etc/nginx/conf.d/"
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
    echo "       İpucu: docker network disconnect ${PORTFOLIO_NETWORK} ${NGINX_CONTAINER}"
  fi

  if echo "${portfolio_body}" | grep -qiE 'Emre|portfolio|yüklenemedi'; then
    echo "  OK  emrekilic.web.tr → Portfolio"
  else
    echo "  HATA emrekilic.web.tr portfolio içeriği dönmüyor"
    echo "       upstream erişim: docker exec ${NGINX_CONTAINER} wget -qO- http://${PORTFOLIO_HOST}:3100/tr | head"
  fi
}

SSL_MODE="$(resolve_mode)"

echo "==> İki site kurulumu (mod: ${SSL_MODE})"
echo ""

echo "==> 1/5 Portfolio ağından ayırılıyor (TTEN DNS koruması)..."
docker network disconnect "${PORTFOLIO_NETWORK}" "${NGINX_CONTAINER}" 2>/dev/null || true

echo "==> 2/5 Portfolio upstream host tespit ediliyor..."
if [[ -n "${PORTFOLIO_HOST:-}" ]]; then
  echo "    Manuel: ${PORTFOLIO_HOST}"
else
  if ! PORTFOLIO_HOST="$(detect_portfolio_host)"; then
    echo ""
    echo "HATA: Nginx container'ından portfolio'ya (3100) erişilemiyor."
    echo ""
    echo "Teşhis:"
    echo "  docker ps | grep portfolio-prod-frontend"
    echo "  curl -s http://127.0.0.1:3100/tr | head -1"
    echo "  docker exec ${NGINX_CONTAINER} getent hosts host.docker.internal || echo 'extra_hosts YOK'"
    echo "  GW=\$(docker exec ${NGINX_CONTAINER} ip route | awk '/default/ {print \$3}')"
    echo "  docker exec ${NGINX_CONTAINER} wget -qO- --timeout=3 http://\$GW:3100/tr | head -1"
    echo ""
    echo "Çözüm A — TTEN docker-compose.yml → nginx servisi:"
    echo "  extra_hosts:"
    echo "    - \"host.docker.internal:host-gateway\""
    echo ""
    echo "Sonra: cd /opt/ttengamesstudio && docker compose up -d --force-recreate nginx"
    echo "Tekrar: sudo bash $0 ${MODE}"
    echo ""
    echo "Çözüm B — Gateway IP elle verin (yukarıdaki GW testi çalışıyorsa):"
    echo "  sudo PORTFOLIO_HOST=<GW_IP> bash $0 ${MODE}"
    exit 1
  fi
  echo "    Otomatik: ${PORTFOLIO_HOST}"
fi

echo "==> 3/5 Eski portfolio template'leri temizleniyor..."
cleanup_old_templates

echo "==> 4/5 Yeni portfolio.conf.template yükleniyor..."
install_portfolio_template "${SSL_MODE}" "${PORTFOLIO_HOST}"

echo ""
echo "==> 5/5 Nginx yeniden başlatılıyor..."
docker restart "${NGINX_CONTAINER}"
sleep 4
docker exec "${NGINX_CONTAINER}" nginx -t

verify_nginx_config
test_sites

echo ""
if [[ "${SSL_MODE}" == "http" ]]; then
  echo "Sertifika almak için (Cloudflare hata verirse DNS only yapın):"
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
