#!/usr/bin/env bash
# TTEN nginx'e portfolio.conf merge + reload + kısa doğrulama
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
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

echo "==> portfolio.conf güncelleniyor (repo template)..."
bash "${ROOT_DIR}/deploy/render-portfolio-conf.sh" https

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
    echo "Nginx sync tamam."
    exit 0
  fi
  if docker exec "${NGINX_CONTAINER}" wget -qO- --timeout=3 \
    'http://portfolio-prod-backend:3001/socket.io/?EIO=4&transport=polling' 2>/dev/null \
    | head -c 80 | grep -qE 'sid|0\{|opened'; then
    echo "  OK  backend socket.io (doğrudan)"
    echo "  UYARI: HTTPS socket.io başarısız — portfolio.conf merge kontrol edin."
    docker exec "${NGINX_CONTAINER}" nginx -T 2>/dev/null | grep -A2 'location /socket.io' || true
    exit 1
  fi
  echo "  Bekleniyor... socket.io (${attempt}/10)"
  sleep 2
done

echo "  HATA: Socket.IO erişilemedi."
docker exec "${NGINX_CONTAINER}" nginx -T 2>/dev/null | grep -E 'socket.io|api.emrekilic' | head -10 || true
exit 1
