#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/deploy/.env"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Hata: deploy/.env bulunamadı. Önce deploy/.env.production.example dosyasını kopyalayın."
  exit 1
fi

cd "${ROOT_DIR}"

echo "==> Portfolio production deploy başlıyor..."
docker compose -f docker-compose.prod.yml --env-file "${ENV_FILE}" pull --ignore-pull-failures 2>/dev/null || true
docker compose -f docker-compose.prod.yml --env-file "${ENV_FILE}" up -d --build --remove-orphans

echo "==> Container durumu:"
docker compose -f docker-compose.prod.yml --env-file "${ENV_FILE}" ps

echo "==> Backend health check..."
sleep 5
curl -fsS "http://127.0.0.1:$(grep API_HOST_PORT "${ENV_FILE}" | cut -d= -f2)/api/v1/health" && echo ""

echo "Deploy tamamlandı."
