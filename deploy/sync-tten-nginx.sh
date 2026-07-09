#!/usr/bin/env bash
# TTEN nginx'e portfolio.conf merge + reload + kısa doğrulama
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=lib/nginx-merge-portfolio.sh
source "${ROOT_DIR}/deploy/lib/nginx-merge-portfolio.sh"
ENV_FILE="${ROOT_DIR}/deploy/.env"
NGINX_CONTAINER="${NGINX_CONTAINER:-ttengamesstudio-nginx}"
TTEN_TPL="${TTEN_TEMPLATES:-/opt/ttengamesstudio/docker/nginx/templates}"
TTEN_NET="${PORTFOLIO_TTEN_NETWORK:-ttengamesstudio_ttengamesstudio-network}"

if [[ -f "${ENV_FILE}" ]]; then
  # shellcheck disable=SC1090
  set -a
  source "${ENV_FILE}"
  set +a
  TTEN_NET="${PORTFOLIO_TTEN_NETWORK:-${TTEN_NET}}"
fi

PORTFOLIO_CONTAINERS=(portfolio-prod-frontend portfolio-prod-admin portfolio-prod-backend)

verify_tten_frontend_dns() {
  if ! docker ps --format '{{.Names}}' | grep -qx ttengamesstudio-frontend; then
    return 0
  fi

  local frontend_ip portfolio_ip tten_ip
  frontend_ip="$(docker exec "${NGINX_CONTAINER}" getent hosts frontend 2>/dev/null | awk '{print $1; exit}')"
  portfolio_ip="$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}' portfolio-prod-frontend 2>/dev/null | awk '{print $1}')"
  tten_ip="$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}' ttengamesstudio-frontend 2>/dev/null | awk '{print $1}')"

  if [[ -n "${frontend_ip}" && -n "${portfolio_ip}" && "${frontend_ip}" == "${portfolio_ip}" ]]; then
    echo "  HATA: 'frontend' DNS portfolio'ya çözülüyor — TTEN /_nuxt 404 verir."
    echo "  Çözüm: docker compose -f docker-compose.prod.yml up -d --force-recreate frontend admin backend"
    echo "          ardından bu scripti tekrar çalıştırın."
    return 1
  fi

  if [[ -n "${frontend_ip}" && -n "${tten_ip}" && "${frontend_ip}" == "${tten_ip}" ]]; then
    echo "  OK  frontend → ttengamesstudio-frontend (${frontend_ip})"
  elif [[ -n "${frontend_ip}" ]]; then
    echo "  UYARI: frontend → ${frontend_ip} (TTEN IP: ${tten_ip:-?})"
  fi
  return 0
}

ensure_portfolio_on_tten_network() {
  local container on_net

  if ! docker network inspect "${TTEN_NET}" >/dev/null 2>&1; then
    echo "TTEN ağı yok (${TTEN_NET}) — atlanıyor."
    return 1
  fi

  echo "==> Portfolio → ${TTEN_NET} ağı..."
  for container in "${PORTFOLIO_CONTAINERS[@]}"; do
    if ! docker ps --format '{{.Names}}' | grep -qx "${container}"; then
      echo "  UYARI: ${container} çalışmıyor"
      continue
    fi
    on_net="$(docker network inspect "${TTEN_NET}" --format '{{range .Containers}}{{.Name}} {{end}}' | grep -ow "${container}" || true)"
    if [[ -n "${on_net}" ]]; then
      echo "  OK  ${container}"
    else
      echo "  + ${container} bağlanıyor..."
      docker network connect "${TTEN_NET}" "${container}"
    fi
  done
  return 0
}

wait_for_nginx_upstream() {
  local attempt

  for attempt in $(seq 1 15); do
    if docker exec "${NGINX_CONTAINER}" wget -q --spider --timeout=3 http://portfolio-prod-frontend:3000/tr 2>/dev/null; then
      echo "  OK  portfolio-prod-frontend:3000 (${attempt}. deneme)"
      return 0
    fi
    echo "  Bekleniyor... frontend upstream (${attempt}/15)"
    ensure_portfolio_on_tten_network || true
    sleep 2
  done
  return 1
}

if ! docker ps --format '{{.Names}}' | grep -qx "${NGINX_CONTAINER}"; then
  echo "TTEN nginx yok (${NGINX_CONTAINER}) — atlanıyor."
  exit 0
fi

if [[ ! -f "${TTEN_TPL}/portfolio.conf" ]]; then
  echo "portfolio.conf yok (${TTEN_TPL}) — nginx sync atlandı."
  exit 0
fi

ensure_portfolio_on_tten_network || exit 0

verify_tten_frontend_dns || exit 1

echo "==> portfolio.conf güncelleniyor (repo template)..."
bash "${ROOT_DIR}/deploy/render-portfolio-conf.sh" https

echo "==> Nginx portfolio merge + reload..."
merge_portfolio_with_recovery "${NGINX_CONTAINER}"

echo "==> Nginx → portfolio upstream testi..."
if ! wait_for_nginx_upstream; then
  echo "  HATA: nginx container'ından frontend erişilemedi."
  docker network inspect "${TTEN_NET}" --format '{{range .Containers}}{{.Name}} {{end}}' 2>/dev/null || true
  docker logs portfolio-prod-frontend --tail 20 2>&1 || true
  exit 1
fi

for attempt in $(seq 1 10); do
  if curl -fsSI --resolve emrekilic.web.tr:443:127.0.0.1 https://emrekilic.web.tr/tr -k 2>/dev/null | head -1 | grep -qE 'HTTP/2 200|HTTP/1.1 200|301|302'; then
    echo "  OK  https://emrekilic.web.tr/tr"
    break
  fi
  if [[ "${attempt}" -eq 10 ]]; then
    echo "  HATA: HTTPS frontend testi başarısız."
    docker exec "${NGINX_CONTAINER}" tail -10 /var/log/nginx/error.log 2>/dev/null || true
    exit 1
  fi
  echo "  Bekleniyor... HTTPS site (${attempt}/10)"
  sleep 2
done

echo "==> Socket.IO testi (admin metrikleri)..."
for attempt in $(seq 1 10); do
  if curl -fsS --resolve api.emrekilic.web.tr:443:127.0.0.1 \
    'https://api.emrekilic.web.tr/socket.io/?EIO=4&transport=polling' -k 2>/dev/null \
    | head -c 80 | grep -qE 'sid|0\{|opened'; then
    echo "  OK  https://api.emrekilic.web.tr/socket.io (polling)"
    break
  fi
  if [[ "${attempt}" -eq 10 ]]; then
    echo "  HATA: Socket.IO erişilemedi."
    docker exec "${NGINX_CONTAINER}" nginx -T 2>/dev/null | grep -E 'socket.io|api.emrekilic' | head -10 || true
    exit 1
  fi
  echo "  Bekleniyor... socket.io (${attempt}/10)"
  sleep 2
done

echo "==> TTEN /_nuxt statik dosya testi..."
nuxt_path="$(curl -fsS -H 'Host: ttengamesstudio.com.tr' http://127.0.0.1/ 2>/dev/null \
  | grep -oE '/_nuxt/[^"'\'' ]+\.css' | head -1 || true)"
if [[ -n "${nuxt_path}" ]]; then
  code="$(curl -s -o /dev/null -w '%{http_code}' -H 'Host: ttengamesstudio.com.tr' "http://127.0.0.1${nuxt_path}" || echo 000)"
  ctype="$(curl -sI -H 'Host: ttengamesstudio.com.tr' "http://127.0.0.1${nuxt_path}" | grep -i '^content-type:' | tr -d '\r' || true)"
  if [[ "${code}" == "200" ]] && echo "${ctype}" | grep -qi 'text/css'; then
    echo "  OK  ttengamesstudio.com.tr${nuxt_path}"
  else
    echo "  HATA: TTEN statik dosya → HTTP ${code} ${ctype:-} (portfolio frontend DNS çakışması?)"
    docker exec "${NGINX_CONTAINER}" getent hosts frontend 2>/dev/null || true
    exit 1
  fi
else
  echo "  UYARI: _nuxt CSS yolu bulunamadı (TTEN HTML kontrol edin)"
fi

echo "Nginx sync tamam."
exit 0
