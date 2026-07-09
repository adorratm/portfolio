#!/usr/bin/env bash
# Production PostgreSQL major sürüm yükseltmesi (ör. 16 → 18)
#
# Docker volume formatı major sürümler arası uyumlu değildir; önce yedek alınır,
# volume sıfırlanır, yeni image ile postgres ayağa kalkar, yedek geri yüklenir.
#
# Kullanım (sunucuda):
#   cd /opt/portfolio
#   bash deploy/upgrade-postgres.sh
#
# Yerel dump ile birleştirmek için:
#   bash deploy/upgrade-postgres.sh --skip-restore
#   bash deploy/migrate-local-to-prod.sh import
#
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/deploy/.env"
COMPOSE_FILE="${ROOT_DIR}/docker-compose.prod.yml"
ARTIFACTS="${ROOT_DIR}/deploy/artifacts"
BACKUP="${ARTIFACTS}/prod-pre-upgrade-$(date +%Y%m%d-%H%M%S).sql"
SKIP_RESTORE=0
POSTGRES_ONLY=0

for arg in "$@"; do
  case "${arg}" in
    --skip-restore) SKIP_RESTORE=1 ;;
    --postgres-only) POSTGRES_ONLY=1 ;;
    -h|--help)
      echo "Kullanım: bash deploy/upgrade-postgres.sh [--skip-restore] [--postgres-only]"
      exit 0
      ;;
  esac
done

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Hata: ${ENV_FILE} bulunamadı."
  exit 1
fi

# shellcheck disable=SC1090
set -a
source "${ENV_FILE}"
set +a

DATABASE_USER="${DATABASE_USER:-portfolio}"
DATABASE_NAME="${DATABASE_NAME:-portfolio}"
COMPOSE=(docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}")

mkdir -p "${ARTIFACTS}"

echo "==> Portfolio PostgreSQL yükseltmesi"
echo "    Kullanıcı: ${DATABASE_USER}"
echo "    Veritabanı: ${DATABASE_NAME}"
echo ""

if docker ps --format '{{.Names}}' | grep -qx portfolio-prod-postgres; then
  if "${COMPOSE[@]}" exec -T postgres pg_isready -U "${DATABASE_USER}" -d "${DATABASE_NAME}" >/dev/null 2>&1; then
    echo "==> 1/5 Mevcut veritabanı yedekleniyor..."
    "${COMPOSE[@]}" exec -T postgres pg_dump \
      -U "${DATABASE_USER}" \
      -d "${DATABASE_NAME}" \
      --format=plain \
      --clean \
      --if-exists \
      --no-owner \
      --no-acl > "${BACKUP}"
    echo "  + ${BACKUP} ($(du -h "${BACKUP}" | awk '{print $1}'))"
  else
    echo "==> 1/5 Postgres yanıt vermiyor — geçici PG16 container ile yedek deneniyor..."
    VOLUME="$(docker volume ls --format '{{.Name}}' | grep portfolio_postgres_data | head -1)"
    if [[ -n "${VOLUME}" ]]; then
      docker rm -f portfolio-pg16-backup 2>/dev/null || true
      if docker run -d --name portfolio-pg16-backup \
        -v "${VOLUME}:/var/lib/postgresql/data" \
        -e POSTGRES_HOST_AUTH_METHOD=trust \
        postgres:16-alpine >/dev/null; then
        for i in $(seq 1 20); do
          if docker exec portfolio-pg16-backup pg_isready -U "${DATABASE_USER}" -d "${DATABASE_NAME}" >/dev/null 2>&1 \
            || docker exec portfolio-pg16-backup pg_isready -U postgres >/dev/null 2>&1; then
            break
          fi
          sleep 2
        done
        if docker exec portfolio-pg16-backup pg_dump \
          -U "${DATABASE_USER}" \
          -d "${DATABASE_NAME}" \
          --format=plain \
          --clean \
          --if-exists \
          --no-owner \
          --no-acl > "${BACKUP}" 2>/dev/null \
          || docker exec portfolio-pg16-backup pg_dump \
            -U postgres \
            -d "${DATABASE_NAME}" \
            --format=plain \
            --clean \
            --if-exists \
            --no-owner \
            --no-acl > "${BACKUP}" 2>/dev/null; then
          echo "  + ${BACKUP} ($(du -h "${BACKUP}" | awk '{print $1}'))"
        else
          echo "  UYARI: Yedek alınamadı — volume sıfırlanacak."
          BACKUP=""
        fi
        docker rm -f portfolio-pg16-backup 2>/dev/null || true
      else
        echo "  UYARI: Geçici PG16 başlatılamadı — volume sıfırlanacak."
        BACKUP=""
      fi
    else
      BACKUP=""
    fi
  fi
else
  echo "==> 1/5 Postgres container yok — yedek atlandı."
  BACKUP=""
fi

echo "==> 2/5 Uygulama servisleri durduruluyor..."
"${COMPOSE[@]}" stop backend frontend admin pgbouncer postgres 2>/dev/null || true

echo "==> 3/5 Eski Postgres container + volume kaldırılıyor..."
docker rm -f portfolio-prod-postgres 2>/dev/null || true

VOLUME="$(docker volume ls --format '{{.Name}}' | grep portfolio_postgres_data | head -1)"
if [[ -n "${VOLUME}" ]]; then
  echo "    Volume siliniyor: ${VOLUME}"
  docker volume rm "${VOLUME}"
else
  echo "    Eski volume bulunamadı (ilk kurulum olabilir)."
fi

echo "==> 4/5 PostgreSQL 18 başlatılıyor..."
"${COMPOSE[@]}" up -d postgres

echo "    Postgres hazır bekleniyor..."
for i in $(seq 1 30); do
  if "${COMPOSE[@]}" exec -T postgres pg_isready -U "${DATABASE_USER}" >/dev/null 2>&1; then
    echo "    Postgres hazır (${i}. deneme)."
    break
  fi
  if [[ "${i}" -eq 30 ]]; then
    echo "Hata: Postgres 60s içinde hazır olmadı."
    exit 1
  fi
  sleep 2
done

if [[ "${SKIP_RESTORE}" -eq 0 && -n "${BACKUP}" && -s "${BACKUP}" ]]; then
  echo "==> 5/5 Yedek geri yükleniyor..."
  "${COMPOSE[@]}" exec -T postgres psql \
    -U "${DATABASE_USER}" \
    -d "${DATABASE_NAME}" \
    -v ON_ERROR_STOP=1 < "${BACKUP}"
else
  echo "==> 5/5 Geri yükleme atlandı."
  if [[ "${SKIP_RESTORE}" -eq 1 ]]; then
    echo "    Yerel veriyi aktarmak için:"
    echo "    bash deploy/migrate-local-to-prod.sh import"
  fi
fi

echo ""
if [[ "${POSTGRES_ONLY}" -eq 1 ]]; then
  echo "PostgreSQL yükseltmesi tamamlandı (yalnızca postgres)."
else
  echo "==> Kalan servisler başlatılıyor..."
  "${COMPOSE[@]}" up -d
  echo ""
  echo "PostgreSQL yükseltmesi tamamlandı."
fi
docker exec portfolio-prod-postgres psql -U "${DATABASE_USER}" -d "${DATABASE_NAME}" -tAc 'SELECT version();'
