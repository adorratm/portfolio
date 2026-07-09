#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/deploy/.env"
COMPOSE=(docker compose -f docker-compose.prod.yml --env-file "${ENV_FILE}")

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Hata: deploy/.env bulunamadı. Önce deploy/.env.production.example dosyasını kopyalayın."
  exit 1
fi

postgres_logs() {
  docker logs portfolio-prod-postgres --tail 40 2>&1 || true
}

postgres_needs_major_upgrade() {
  postgres_logs | grep -qiE \
    'incompatible with server|database files are incompatible|major-version-specific directory|configured to store database data in a|/var/lib/postgresql/data'
}

wait_for_postgres() {
  local user="${1:-portfolio}"
  local attempt status

  for attempt in $(seq 1 40); do
    status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}unknown{{end}}' portfolio-prod-postgres 2>/dev/null || echo missing)"
    if [[ "${status}" == "healthy" ]] \
      || "${COMPOSE[@]}" exec -T postgres pg_isready -U "${user}" >/dev/null 2>&1; then
      echo "Postgres hazır (${attempt}. deneme, durum: ${status})."
      return 0
    fi
    if postgres_needs_major_upgrade; then
      echo "Postgres major sürüm uyumsuzluğu tespit edildi (eski volume → yeni image)."
      return 2
    fi
    if [[ "${attempt}" -eq 40 ]]; then
      echo "Hata: Postgres 80s içinde healthy olmadı."
      postgres_logs
      return 1
    fi
    sleep 2
  done
}

ensure_postgres() {
  local user="${1:-portfolio}"
  local rc=0

  echo "==> Postgres başlatılıyor..."
  "${COMPOSE[@]}" up -d postgres || true
  wait_for_postgres "${user}" || rc=$?

  if [[ "${rc}" -eq 2 ]]; then
    echo "==> Otomatik PostgreSQL yükseltmesi çalıştırılıyor..."
    bash "${ROOT_DIR}/deploy/upgrade-postgres.sh" --postgres-only
    wait_for_postgres "${user}" || {
      postgres_logs
      exit 1
    }
  elif [[ "${rc}" -ne 0 ]]; then
    exit 1
  fi
}

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
DATABASE_USER="$(grep '^DATABASE_USER=' "${ENV_FILE}" | cut -d= -f2)"
DATABASE_USER="${DATABASE_USER:-portfolio}"

ensure_postgres "${DATABASE_USER}"

echo "==> Redis + PgBouncer..."
"${COMPOSE[@]}" up -d redis pgbouncer

echo "==> PgBouncer hazır bekleniyor..."
for i in $(seq 1 30); do
  if docker ps --format '{{.Names}}\t{{.Status}}' | grep portfolio-prod-pgbouncer | grep -q 'Up'; then
    break
  fi
  if [[ "${i}" -eq 30 ]]; then
    echo "Hata: PgBouncer başlamadı."
    docker logs portfolio-prod-pgbouncer --tail 30 2>&1 || true
    exit 1
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

# TTEN nginx — portfolio routing (compose ttengames ağı + merge/reload)
if docker network inspect "${PORTFOLIO_TTEN_NETWORK:-ttengamesstudio_ttengamesstudio-network}" >/dev/null 2>&1; then
  bash "${ROOT_DIR}/deploy/sync-tten-nginx.sh" || {
    echo "Nginx sync başarısız — manuel:"
    echo "  bash deploy/sync-tten-nginx.sh"
    exit 1
  }
else
  echo "UYARI: TTEN ağı yok — nginx sync atlandı."
fi

echo "Deploy tamamlandı: $(date -Is)"
