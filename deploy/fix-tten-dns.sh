#!/usr/bin/env bash
# TTEN Games bozulması: portfolio compose "frontend" DNS çakışması + nginx merge
# Kullanım (sunucu): cd /opt/portfolio && bash deploy/fix-tten-dns.sh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/deploy/.env"
COMPOSE=(docker compose -f "${ROOT_DIR}/docker-compose.prod.yml")
NGINX_CONTAINER="${NGINX_CONTAINER:-ttengamesstudio-nginx}"
TTEN_NET="${PORTFOLIO_TTEN_NETWORK:-ttengamesstudio_ttengamesstudio-network}"

if [[ -f "${ENV_FILE}" ]]; then
  # shellcheck disable=SC1090
  set -a
  source "${ENV_FILE}"
  set +a
  TTEN_NET="${PORTFOLIO_TTEN_NETWORK:-${TTEN_NET}}"
fi

if [[ -f "${ENV_FILE}" ]]; then
  COMPOSE+=(--env-file "${ENV_FILE}")
fi

echo "==> 1/5 Portfolio container'ları recreate (ttengames compose ağından çıkar)..."
"${COMPOSE[@]}" up -d --no-build --force-recreate frontend admin backend

echo "==> 2/5 TTEN entrypoint conf.d hook (v6) + portfolio.conf..."
if [[ "${EUID}" -eq 0 ]] && [[ -x "${ROOT_DIR}/deploy/ttengames/install-nginx.sh" ]]; then
  bash "${ROOT_DIR}/deploy/ttengames/install-nginx.sh" https
else
  echo "  UYARI: install-nginx root olmadan atlandı — sudo bash deploy/ttengames/install-nginx.sh https"
fi

echo "==> 3/5 Nginx default.conf TTEN şablonundan yenileniyor..."
docker restart "${NGINX_CONTAINER}"
for i in $(seq 1 30); do
  if docker exec "${NGINX_CONTAINER}" nginx -t >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

echo "==> 4/5 Portfolio nginx sync..."
bash "${ROOT_DIR}/deploy/sync-tten-nginx.sh"

echo "==> 5/5 TTEN /_nuxt doğrulama..."
nuxt_path="$(curl -fsS -H 'Host: ttengamesstudio.com.tr' http://127.0.0.1/ 2>/dev/null \
  | grep -oE '/_nuxt/[^"'\'' ]+\.css' | head -1 || true)"

if [[ -n "${nuxt_path}" ]]; then
  code="$(curl -s -o /dev/null -w '%{http_code}' -H 'Host: ttengamesstudio.com.tr' "http://127.0.0.1${nuxt_path}" || echo 000)"
  ctype="$(curl -sI -H 'Host: ttengamesstudio.com.tr' "http://127.0.0.1${nuxt_path}" | grep -i '^content-type:' | tr -d '\r' || true)"
  if [[ "${code}" == "200" ]] && echo "${ctype}" | grep -qi 'text/css'; then
    echo "  OK  ${nuxt_path} → ${code} ${ctype}"
  else
    echo "  UYARI: ${nuxt_path} → HTTP ${code} ${ctype:-}"
    echo "  docker exec ${NGINX_CONTAINER} getent hosts frontend"
    exit 1
  fi
else
  echo "  UYARI: HTML'den _nuxt CSS yolu bulunamadı — tarayıcıdan kontrol edin."
fi

echo "TTEN DNS düzeltmesi tamam."
