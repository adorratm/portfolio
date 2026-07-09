#!/usr/bin/env bash
# deploy/ttengames/https/portfolio.conf.template → TTEN templates/portfolio.conf
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/deploy/.env"
TTEN_TPL="${TTEN_TEMPLATES:-/opt/ttengamesstudio/docker/nginx/templates}"
SSL_MODE="${1:-https}"

if [[ -f "${ENV_FILE}" ]]; then
  # shellcheck disable=SC1090
  set -a
  source "${ENV_FILE}"
  set +a
fi

API_HOST="${PORTFOLIO_API_HOST:-portfolio-prod-backend}"
API_PORT="${PORTFOLIO_API_PORT:-3001}"
FRONTEND_HOST="${PORTFOLIO_FRONTEND_HOST:-portfolio-prod-frontend}"
FRONTEND_PORT="${PORTFOLIO_FRONTEND_PORT:-3000}"
ADMIN_HOST="${PORTFOLIO_ADMIN_HOST:-portfolio-prod-admin}"
ADMIN_PORT="${PORTFOLIO_ADMIN_PORT:-3000}"

src="${ROOT_DIR}/deploy/ttengames/${SSL_MODE}/portfolio.conf.template"
dest="${TTEN_TPL}/portfolio.conf"

if [[ ! -f "${src}" ]]; then
  echo "Hata: ${src} bulunamadı." >&2
  exit 1
fi

mkdir -p "${TTEN_TPL}"

sed \
  -e "s|@FRONTEND_HOST@|${FRONTEND_HOST}|g" \
  -e "s|@FRONTEND_PORT@|${FRONTEND_PORT}|g" \
  -e "s|@ADMIN_HOST@|${ADMIN_HOST}|g" \
  -e "s|@ADMIN_PORT@|${ADMIN_PORT}|g" \
  -e "s|@API_HOST@|${API_HOST}|g" \
  -e "s|@API_PORT@|${API_PORT}|g" \
  -e 's/\$\${/$/g' \
  "${src}" > "${dest}"

echo "${dest}"
