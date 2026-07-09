#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/deploy/.env"
COMPOSE=(docker compose -f docker-compose.prod.yml --env-file "${ENV_FILE}")

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Hata: deploy/.env bulunamadı. Önce deploy/.env.production.example dosyasını kopyalayın."
  exit 1
fi

wait_for_health() {
  local port="${1:-3102}"
  local path="${2:-/api/v1/health}"
  local max_attempts="${3:-30}"
  local attempt=1

  while (( attempt <= max_attempts )); do
    if curl -fsS "http://127.0.0.1:${port}${path}" >/dev/null 2>&1; then
      echo "Backend hazır (${attempt}. deneme)."
      curl -fsS "http://127.0.0.1:${port}${path}" && echo ""
      return 0
    fi
    echo "Backend bekleniyor... (${attempt}/${max_attempts})"
    sleep 3
    ((attempt++))
  done

  echo "Hata: Backend ${max_attempts} denemede ayağa kalkmadı."
  echo "==> portfolio-prod-backend logları:"
  docker logs portfolio-prod-backend --tail 80 2>&1 || true
  return 1
}

cd "${ROOT_DIR}"

echo "==> Portfolio production deploy başlıyor: $(date -Is)"

export COMPOSE_PARALLEL_LIMIT=1
export DOCKER_BUILDKIT=1
export BUILDKIT_STEP_LOG_MAX_SIZE=10485760

echo "==> Altyapı servisleri..."
"${COMPOSE[@]}" up -d postgres redis pgbouncer

DATABASE_USER="$(grep '^DATABASE_USER=' "${ENV_FILE}" | cut -d= -f2)"
DATABASE_USER="${DATABASE_USER:-portfolio}"

echo "==> Postgres hazır olana kadar bekleniyor..."
for i in $(seq 1 30); do
  if "${COMPOSE[@]}" exec -T postgres pg_isready -U "${DATABASE_USER}" >/dev/null 2>&1; then
    echo "Postgres hazır."
    break
  fi
  sleep 2
done

echo "==> Servisler sırayla build ediliyor (RAM dostu)..."
for service in backend frontend admin; do
  echo "--- build: ${service} ($(date -Is))"
  "${COMPOSE[@]}" build "${service}"
done

echo "==> Uygulama container'ları ayağa kaldırılıyor..."
"${COMPOSE[@]}" up -d --no-build backend frontend admin

echo "==> Container durumu:"
"${COMPOSE[@]}" ps

API_PORT="$(grep '^API_HOST_PORT=' "${ENV_FILE}" | cut -d= -f2)"
API_PORT="${API_PORT:-3102}"

echo "==> Backend health check..."
wait_for_health "${API_PORT}" "/api/v1/health" 40

echo "Deploy tamamlandı: $(date -Is)"
