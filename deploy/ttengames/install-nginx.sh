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
TTEN_ENTRYPOINT="${TTEN_ENTRYPOINT:-/opt/ttengamesstudio/docker/nginx/entrypoint.sh}"
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
  local nginx_nets frontend_nets common

  if [[ -n "${PORTFOLIO_TTEN_NETWORK:-}" ]]; then
    echo "${PORTFOLIO_TTEN_NETWORK}"
    return 0
  fi

  if ! docker ps --format '{{.Names}}' | grep -qx ttengamesstudio-frontend; then
    return 1
  fi

  nginx_nets="$(docker inspect "${NGINX_CONTAINER}" --format '{{range $k,$v := .NetworkSettings.Networks}}{{println $k}}{{end}}')"
  frontend_nets="$(docker inspect ttengamesstudio-frontend --format '{{range $k,$v := .NetworkSettings.Networks}}{{println $k}}{{end}}')"
  common="$(comm -12 <(echo "${nginx_nets}" | sort) <(echo "${frontend_nets}" | sort) | head -1)"

  if [[ -n "${common}" ]]; then
    echo "${common}"
    return 0
  fi

  echo "${nginx_nets}" | grep -v '^portfolio' | head -1
}

fetch_url_from_nginx() {
  local url="$1"
  docker exec "${NGINX_CONTAINER}" sh -c "
    if command -v wget >/dev/null 2>&1; then
      wget -qO- --timeout=5 '${url}' || true
    elif command -v curl >/dev/null 2>&1; then
      curl -fsS --max-time 5 '${url}' || true
    fi
  " 2>/dev/null || true
}

test_upstream() {
  local url="$1"
  local body
  body="$(fetch_url_from_nginx "${url}")"
  [[ ${#body} -gt 0 ]]
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
  local container rc

  for container in "${PORTFOLIO_CONTAINERS[@]}"; do
    if ! docker ps --format '{{.Names}}' | grep -qx "${container}"; then
      echo "Hata: ${container} çalışmıyor. Önce: cd /opt/portfolio && ./deploy/deploy.sh"
      exit 1
    fi
    if docker network inspect "${tten_net}" --format '{{range .Containers}}{{.Name}} {{end}}' | grep -q "${container}"; then
      echo "    ${container} zaten ${tten_net} ağında"
    else
      echo "    ${container} → ${tten_net}"
      docker network connect "${tten_net}" "${container}"
    fi
  done
  sleep 2
}

diagnose_docker_upstream_failure() {
  local tten_net="$1"
  echo ""
  echo "Docker modu teşhisi:"
  echo "  TTEN ağı: ${tten_net:-<bulunamadı>}"
  echo "  Nginx ağları:"
  docker inspect "${NGINX_CONTAINER}" --format '{{range $k,$v := .NetworkSettings.Networks}}    - {{$k}}{{"\n"}}{{end}}' || true
  echo "  Portfolio container'ları:"
  docker ps --format '    - {{.Names}} ({{.Status}})' | grep portfolio-prod || true
  if [[ -n "${tten_net}" ]]; then
    echo "  ${tten_net} üyeleri:"
    docker network inspect "${tten_net}" --format '{{range .Containers}}    - {{.Name}}{{"\n"}}{{end}}' 2>/dev/null || true
  fi
  echo "  DNS (nginx içinden):"
  docker exec "${NGINX_CONTAINER}" getent hosts portfolio-prod-frontend 2>/dev/null || echo "    portfolio-prod-frontend çözülemedi"
  echo "  HTTP test:"
  local body
  body="$(fetch_url_from_nginx "http://portfolio-prod-frontend:3000/tr")"
  if [[ ${#body} -gt 0 ]]; then
    echo "    OK (${#body} byte)"
  else
    echo "    erişim yok"
  fi
  echo ""
  echo "Manuel:"
  echo "  docker network ls"
  echo "  PORTFOLIO_TTEN_NETWORK=<ağ_adı> sudo PORTFOLIO_UPSTREAM_MODE=docker bash $0 ${SSL_MODE}"
}

detect_docker_upstream() {
  local tten_net

  tten_net="$(detect_tten_network)"
  if [[ -z "${tten_net}" ]]; then
    diagnose_docker_upstream_failure ""
    return 1
  fi

  echo "    TTEN ağı: ${tten_net}"
  connect_portfolio_to_tten_network "${tten_net}"

  if test_upstream "http://portfolio-prod-frontend:3000/tr"; then
    UPSTREAM_MODE="docker"
    UPSTREAM_FRONTEND="portfolio-prod-frontend:3000"
    UPSTREAM_ADMIN="portfolio-prod-admin:3000"
    UPSTREAM_API="portfolio-prod-backend:3001"
    return 0
  fi

  diagnose_docker_upstream_failure "${tten_net}"
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
        if ! detect_docker_upstream; then
          echo "HATA: docker modu başarısız."
          exit 1
        fi
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
  elif detect_docker_upstream; then
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
  rm -f "${TTEN_TEMPLATES}"/portfolio-*.conf.template "${TTEN_TEMPLATES}"/portfolio.conf.template
}

find_tten_main_template() {
  local candidate

  for candidate in \
    "${TTEN_TEMPLATES}/default.conf.template" \
    "${TTEN_TEMPLATES}/default.template" \
    "${TTEN_TEMPLATES}/nginx.conf.template"; do
    if [[ -f "${candidate}" ]]; then
      echo "${candidate}"
      return 0
    fi
  done

  candidate="$(find "${TTEN_TEMPLATES}" -maxdepth 1 -type f -name '*.template' ! -name 'portfolio*.template' 2>/dev/null | head -1)"
  if [[ -n "${candidate}" ]]; then
    echo "${candidate}"
    return 0
  fi

  return 1
}

merge_portfolio_into_nginx() {
  docker exec "${NGINX_CONTAINER}" sh -c '
    if [ -f /etc/nginx/templates/portfolio.conf ]; then
      if ! grep -q "server_name emrekilic.web.tr" /etc/nginx/conf.d/default.conf 2>/dev/null; then
        cat /etc/nginx/templates/portfolio.conf >> /etc/nginx/conf.d/default.conf
      fi
    fi
  '
  docker exec "${NGINX_CONTAINER}" nginx -t
  docker exec "${NGINX_CONTAINER}" nginx -s reload
}

ensure_portfolio_include() {
  local marker="portfolio-merge-v2"
  local main_template
  local merge_block='if [ -f /etc/nginx/templates/portfolio.conf ]; then if ! grep -q "server_name emrekilic.web.tr" /etc/nginx/conf.d/default.conf 2>/dev/null; then cat /etc/nginx/templates/portfolio.conf >> /etc/nginx/conf.d/default.conf; fi; fi'

  if main_template="$(find_tten_main_template)"; then
    if ! grep -qF "server_name emrekilic.web.tr" "${main_template}" 2>/dev/null; then
      echo "==> ${main_template} sonuna portfolio.conf include ekleniyor..."
      {
        echo ""
        echo "# Portfolio (emrekilic.web.tr)"
        echo "include /etc/nginx/templates/portfolio.conf;"
      } >> "${main_template}"
    fi
    return 0
  fi

  if [[ ! -f "${TTEN_ENTRYPOINT}" ]]; then
    echo "Hata: TTEN nginx template veya entrypoint bulunamadı."
    echo "  ls -la ${TTEN_TEMPLATES}"
    echo "  ls -la ${TTEN_ENTRYPOINT}"
    exit 1
  fi

  if grep -qF "${marker}" "${TTEN_ENTRYPOINT}"; then
    echo "==> entrypoint.sh merge hook OK (${marker})"
    return 0
  fi

  echo "==> entrypoint.sh → portfolio merge hook ekleniyor (${marker})..."
  cp "${TTEN_ENTRYPOINT}" "${TTEN_ENTRYPOINT}.bak.portfolio"

  if grep -qE 'exec (\$@|nginx)' "${TTEN_ENTRYPOINT}"; then
    awk -v marker="${marker}" -v block="${merge_block}" '
      /exec (\$@|nginx)/ && !done {
        print "# " marker
        print block
        done=1
      }
      { print }
    ' "${TTEN_ENTRYPOINT}" > "${TTEN_ENTRYPOINT}.new"
    mv "${TTEN_ENTRYPOINT}.new" "${TTEN_ENTRYPOINT}"
    chmod +x "${TTEN_ENTRYPOINT}"
  else
    cat >> "${TTEN_ENTRYPOINT}" << EOF

# ${marker}
${merge_block}
EOF
  fi
}

install_portfolio_conf() {
  local ssl_mode="$1"
  local src="${ROOT_DIR}/deploy/ttengames/${ssl_mode}/portfolio.conf.template"
  local dest="${TTEN_TEMPLATES}/portfolio.conf"

  if [[ ! -f "${src}" ]]; then
    echo "Hata: ${src} bulunamadı."
    exit 1
  fi

  sed \
    -e "s|@FRONTEND_UPSTREAM@|${UPSTREAM_FRONTEND}|g" \
    -e "s|@ADMIN_UPSTREAM@|${UPSTREAM_ADMIN}|g" \
    -e "s|@API_UPSTREAM@|${UPSTREAM_API}|g" \
    -e 's/\$\${/$/g' \
    "${src}" > "${dest}"
  echo "  + ${dest} (${ssl_mode})"
  ensure_portfolio_include
}

verify_nginx_config() {
  echo ""
  echo "==> Nginx server_name kontrolü..."
  docker exec "${NGINX_CONTAINER}" nginx -T 2>/dev/null \
    | grep -E "server_name (emrekilic|admin\.emrekilic|api\.emrekilic|ttengamesstudio)" || true

  if ! docker exec "${NGINX_CONTAINER}" nginx -T 2>/dev/null | grep -q "server_name emrekilic.web.tr"; then
    echo "UYARI: portfolio henüz yüklenmemiş, default.conf'a birleştiriliyor..."
    merge_portfolio_into_nginx
  fi

  if ! docker exec "${NGINX_CONTAINER}" nginx -T 2>/dev/null | grep -q "server_name emrekilic.web.tr"; then
    echo "HATA: portfolio.conf nginx'e yüklenemedi."
    docker exec "${NGINX_CONTAINER}" ls -la /etc/nginx/conf.d/ /etc/nginx/templates/ 2>/dev/null || true
    exit 1
  fi
}

test_sites() {
  echo ""
  echo "==> Site ayrımı testi..."

  local tten_body portfolio_body
  # -L kullanma: HTTP→HTTPS redirect testi bozar
  tten_body="$(curl -s --max-time 5 -H 'Host: ttengamesstudio.com.tr' http://127.0.0.1/ | head -c 800)"
  portfolio_body="$(curl -s --max-time 5 -H 'Host: emrekilic.web.tr' http://127.0.0.1/tr | head -c 800)"

  if echo "${tten_body}" | grep -qiE 'TTENGAMES|ttengames|HOŞ GELDİN'; then
    echo "  OK  ttengamesstudio.com.tr → TTEN"
  elif echo "${tten_body}" | grep -qi '301\|302\|Moved'; then
    echo "  OK  ttengamesstudio.com.tr → TTEN (HTTP yönlendirme — normal)"
  else
    echo "  UYARI ttengamesstudio.com.tr testi belirsiz (tarayıcıdan kontrol edin)"
    echo "       curl -s -H 'Host: ttengamesstudio.com.tr' http://127.0.0.1/ | head -c 200"
  fi

  if echo "${portfolio_body}" | grep -qiE 'Emre|Portfolio|yüklenemedi'; then
    echo "  OK  emrekilic.web.tr → Portfolio"
  else
    echo "  UYARI emrekilic.web.tr testi belirsiz (tarayıcıdan kontrol edin)"
    echo "       curl -s -H 'Host: emrekilic.web.tr' http://127.0.0.1/tr | head -c 200"
  fi
}

SSL_MODE="$(resolve_mode)"

echo "==> İki site kurulumu (mod: ${SSL_MODE})"
echo ""

echo "==> 1/5 Nginx portfolio ağından ayrılıyor (TTEN DNS koruması)..."
docker network disconnect "${PORTFOLIO_NETWORK}" "${NGINX_CONTAINER}" 2>/dev/null || true

setup_upstream

echo "==> 3/5 Eski portfolio dosyaları temizleniyor..."
cleanup_old_templates

echo "==> 4/5 portfolio.conf yükleniyor (default.conf include)..."
install_portfolio_conf "${SSL_MODE}"

echo ""
echo "==> 5/5 Nginx yeniden başlatılıyor..."
docker restart "${NGINX_CONTAINER}"
sleep 4

echo "==> 5b/5 portfolio.conf → default.conf birleştirme..."
merge_portfolio_into_nginx

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
