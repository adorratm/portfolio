#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/deploy/.env"
COMPOSE=(docker compose -f docker-compose.prod.yml --env-file "${ENV_FILE}")

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Hata: deploy/.env bulunamadı. Önce deploy/.env.production.example dosyasını kopyalayın."
  exit 1
fi

cd "${ROOT_DIR}"

echo "==> Portfolio production deploy başlıyor: $(date -Is)"

# Aynı sunucudaki diğer siteleri (TTEN Games vb.) korumak için kaynak kullanımını sınırla
export COMPOSE_PARALLEL_LIMIT=1
export DOCKER_BUILDKIT=1
export BUILDKIT_STEP_LOG_MAX_SIZE=10485760

echo "==> Base image'lar çekiliyor..."
"${COMPOSE[@]}" pull postgres redis pgbouncer 2>/dev/null || true

echo "==> Servisler sırayla build ediliyor (RAM dostu)..."
for service in backend frontend admin; do
  echo "--- build: ${service} ($(date -Is))"
  "${COMPOSE[@]}" build --no-cache=false "${service}"
done

echo "==> Container'lar ayağa kaldırılıyor..."
"${COMPOSE[@]}" up -d --no-build --remove-orphans

echo "==> Container durumu:"
"${COMPOSE[@]}" ps

echo "==> Backend health check..."
sleep 8
API_PORT="$(grep '^API_HOST_PORT=' "${ENV_FILE}" | cut -d= -f2)"
API_PORT="${API_PORT:-3102}"
curl -fsS "http://127.0.0.1:${API_PORT}/api/v1/health" && echo ""

echo "Deploy tamamlandı: $(date -Is)"
