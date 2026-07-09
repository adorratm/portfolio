#!/usr/bin/env bash
# Yerel geliştirme veritabanını (ve isteğe bağlı uploads/) production'a taşır.
#
# Yerel makine — Windows PostgreSQL (backend/.env otomatik okunur):
#   bash deploy/migrate-local-to-prod.sh export
#
# Yerel makine — Docker postgres:
#   LOCAL_PG_MODE=docker bash deploy/migrate-local-to-prod.sh export
#
# Sunucu:
#   bash deploy/migrate-local-to-prod.sh import
#
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARTIFACTS="${ROOT_DIR}/deploy/artifacts"
ENV_FILE="${ROOT_DIR}/deploy/.env"
BACKEND_ENV="${ROOT_DIR}/backend/.env"
COMPOSE_FILE="${ROOT_DIR}/docker-compose.prod.yml"

LOCAL_PG_MODE="${LOCAL_PG_MODE:-auto}"
LOCAL_PG_HOST="${LOCAL_PG_HOST:-localhost}"
LOCAL_PG_PORT="${LOCAL_PG_PORT:-}"
LOCAL_PG_USER="${LOCAL_PG_USER:-}"
LOCAL_PG_PASSWORD="${LOCAL_PG_PASSWORD:-}"
LOCAL_PG_DB="${LOCAL_PG_DB:-portfolio}"
LOCAL_PG_CONTAINER="${LOCAL_PG_CONTAINER:-portfolio-postgres}"

PROD_PG_CONTAINER="${PROD_PG_CONTAINER:-portfolio-prod-postgres}"

LOCAL_API_ORIGIN="${LOCAL_API_ORIGIN:-http://localhost:3001}"
PROD_API_ORIGIN="${PROD_API_ORIGIN:-https://api.emrekilic.web.tr}"

usage() {
  cat <<'EOF'
Kullanım:
  bash deploy/migrate-local-to-prod.sh export
  bash deploy/migrate-local-to-prod.sh import [--dump dosya.sql|dosya.dump]
  bash deploy/migrate-local-to-prod.sh sync-uploads [--archive dosya.tar.gz]

export   — Yerel Postgres yedeği + uploads arşivi
import   — Production Postgres'e yükler, medya URL'lerini günceller
sync-uploads — uploads/ klasörünü production volume'a kopyalar

Kaynak seçimi (export):
  auto   — backend/.env + çalışan Docker container'a göre (varsayılan)
  native — Windows/macOS/Linux kurulu PostgreSQL (pg_dump)
  docker — portfolio-postgres container

Ortam değişkenleri:
  LOCAL_PG_MODE        auto|native|docker
  LOCAL_PG_HOST        (varsayılan: localhost)
  LOCAL_PG_PORT        (varsayılan: backend/.env DATABASE_PORT veya 5432)
  LOCAL_PG_USER        (varsayılan: backend/.env DATABASE_USER veya postgres)
  LOCAL_PG_PASSWORD    (varsayılan: backend/.env DATABASE_PASSWORD)
  LOCAL_PG_DB          (varsayılan: portfolio)
  LOCAL_PG_CONTAINER   (varsayılan: portfolio-postgres)

Not: PgBouncer (6432) üzerinden pg_dump çalışmaz. Doğrudan Postgres portunu
(çoğunlukla 5432) kullanın.
EOF
}

load_backend_env() {
  if [[ ! -f "${BACKEND_ENV}" ]]; then
    return 0
  fi

  # shellcheck disable=SC1090
  set -a
  source "${BACKEND_ENV}"
  set +a

  LOCAL_PG_HOST="${LOCAL_PG_HOST:-${DATABASE_HOST:-localhost}}"
  LOCAL_PG_PORT="${LOCAL_PG_PORT:-${DATABASE_PORT:-5432}}"
  LOCAL_PG_USER="${LOCAL_PG_USER:-${DATABASE_USER:-postgres}}"
  LOCAL_PG_PASSWORD="${LOCAL_PG_PASSWORD:-${DATABASE_PASSWORD:-}}"
  LOCAL_PG_DB="${LOCAL_PG_DB:-${DATABASE_NAME:-portfolio}}"
}

load_prod_env() {
  if [[ ! -f "${ENV_FILE}" ]]; then
    echo "Hata: ${ENV_FILE} bulunamadı. Önce deploy/.env oluşturun."
    exit 1
  fi
  # shellcheck disable=SC1090
  set -a
  source "${ENV_FILE}"
  set +a
  DATABASE_USER="${DATABASE_USER:-portfolio}"
  DATABASE_NAME="${DATABASE_NAME:-portfolio}"
  POSTGRES_HOST_PORT="${POSTGRES_HOST_PORT:-5433}"
}

require_container() {
  local name="$1"
  if ! docker ps --format '{{.Names}}' | grep -qx "${name}"; then
    echo "Hata: ${name} container'ı çalışmıyor."
    exit 1
  fi
}

docker_pg_running() {
  docker ps --format '{{.Names}}' 2>/dev/null | grep -qx "${LOCAL_PG_CONTAINER}"
}

resolve_export_mode() {
  case "${LOCAL_PG_MODE}" in
    native|docker) echo "${LOCAL_PG_MODE}" ;;
    auto)
      if docker_pg_running; then
        echo "docker"
      else
        echo "native"
      fi
      ;;
    *)
      echo "Hata: LOCAL_PG_MODE=auto|native|docker olmalı." >&2
      exit 1
      ;;
  esac
}

export_via_docker() {
  local outfile="$1"
  require_container "${LOCAL_PG_CONTAINER}"

  echo "==> Docker Postgres dışa aktarılıyor (${LOCAL_PG_CONTAINER})..."
  docker exec "${LOCAL_PG_CONTAINER}" pg_dump \
    -U "${LOCAL_PG_USER:-portfolio}" \
    -d "${LOCAL_PG_DB}" \
    --format=plain \
    --clean \
    --if-exists \
    --no-owner \
    --no-acl \
    -f /tmp/portfolio-local.sql
  docker cp "${LOCAL_PG_CONTAINER}:/tmp/portfolio-local.sql" "${outfile}"
  docker exec "${LOCAL_PG_CONTAINER}" rm -f /tmp/portfolio-local.sql
}

export_via_native() {
  local outfile="$1"
  local pg_dump_bin
  local dump_format="${LOCAL_PG_DUMP_FORMAT:-plain}"

  pg_dump_bin="$(command -v pg_dump || true)"
  if [[ -z "${pg_dump_bin}" ]]; then
    echo "Hata: pg_dump bulunamadı."
    echo ""
    echo "Windows — PostgreSQL bin klasörünü PATH'e ekleyin, örn.:"
    echo '  export PATH="/c/Program Files/PostgreSQL/18/bin:$PATH"'
    exit 1
  fi

  if [[ -z "${LOCAL_PG_PASSWORD}" ]]; then
    echo "Hata: LOCAL_PG_PASSWORD boş. backend/.env içinde DATABASE_PASSWORD ayarlayın."
    exit 1
  fi

  LOCAL_PG_PORT="${LOCAL_PG_PORT:-5432}"

  if [[ "${LOCAL_PG_PORT}" == "6432" ]]; then
    echo "UYARI: Port 6432 genelde PgBouncer'dır; pg_dump için 5432 deneniyor."
    LOCAL_PG_PORT="5432"
  fi

  if [[ "${dump_format}" == "custom" ]]; then
    echo "==> Yerel PostgreSQL dışa aktarılıyor (custom dump — hedef PG18+)..."
    echo "    host=${LOCAL_PG_HOST} port=${LOCAL_PG_PORT} user=${LOCAL_PG_USER} db=${LOCAL_PG_DB}"
    PGPASSWORD="${LOCAL_PG_PASSWORD}" "${pg_dump_bin}" \
      -h "${LOCAL_PG_HOST}" \
      -p "${LOCAL_PG_PORT}" \
      -U "${LOCAL_PG_USER}" \
      -d "${LOCAL_PG_DB}" \
      --format=custom \
      --no-owner \
      --no-acl \
      -f "${outfile}"
    return 0
  fi

  echo "==> Yerel PostgreSQL dışa aktarılıyor (düz SQL)..."
  echo "    host=${LOCAL_PG_HOST} port=${LOCAL_PG_PORT} user=${LOCAL_PG_USER} db=${LOCAL_PG_DB}"

  PGPASSWORD="${LOCAL_PG_PASSWORD}" "${pg_dump_bin}" \
    -h "${LOCAL_PG_HOST}" \
    -p "${LOCAL_PG_PORT}" \
    -U "${LOCAL_PG_USER}" \
    -d "${LOCAL_PG_DB}" \
    --format=plain \
    --clean \
    --if-exists \
    --no-owner \
    --no-acl \
    -f "${outfile}"
}

cmd_export() {
  local mode dump uploads

  mkdir -p "${ARTIFACTS}"
  dump="${ARTIFACTS}/portfolio-local.sql"
  uploads="${ARTIFACTS}/portfolio-uploads.tar.gz"

  load_backend_env
  mode="$(resolve_export_mode)"

  if [[ "${LOCAL_PG_DUMP_FORMAT:-plain}" == "custom" ]]; then
    dump="${ARTIFACTS}/portfolio-local.dump"
  fi

  case "${mode}" in
    docker) export_via_docker "${dump}" ;;
    native) export_via_native "${dump}" ;;
  esac

  echo "  + ${dump} ($(du -h "${dump}" 2>/dev/null | awk '{print $1}' || stat -c%s "${dump}" 2>/dev/null || echo '?'))"

  if [[ -d "${ROOT_DIR}/backend/uploads" ]] && [[ -n "$(ls -A "${ROOT_DIR}/backend/uploads" 2>/dev/null)" ]]; then
    echo "==> uploads/ arşivleniyor..."
    tar -czf "${uploads}" -C "${ROOT_DIR}/backend" uploads
    echo "  + ${uploads} ($(du -h "${uploads}" 2>/dev/null | awk '{print $1}' || echo '?'))"
  else
    echo "==> backend/uploads boş veya yok — medya arşivi atlandı."
    rm -f "${uploads}"
  fi

  echo ""
  echo "Yedek hazır (mod: ${mode})."
  echo "Sonraki adım:"
  echo "  scp ${dump} root@SUNUCU_IP:/opt/portfolio/deploy/artifacts/"
  if [[ -f "${uploads}" ]]; then
    echo "  scp ${uploads} root@SUNUCU_IP:/opt/portfolio/deploy/artifacts/"
  fi
  echo "  ssh root@SUNUCU_IP 'cd /opt/portfolio && bash deploy/migrate-local-to-prod.sh import'"
}

fix_media_urls() {
  local from="$1"
  local to="$2"
  local sql

  sql=$(cat <<EOSQL
UPDATE projects
SET image_url = replace(image_url, '${from}', '${to}')
WHERE image_url LIKE '${from}%';

UPDATE profile_content
SET image_url = replace(image_url, '${from}', '${to}')
WHERE image_url LIKE '${from}%';

UPDATE tech_stack_items
SET image_url = replace(image_url, '${from}', '${to}')
WHERE image_url LIKE '${from}%';

UPDATE about_content
SET image_url = replace(image_url, '${from}', '${to}')
WHERE image_url LIKE '${from}%';
EOSQL
)

  docker exec -i "${PROD_PG_CONTAINER}" psql -U "${DATABASE_USER}" -d "${DATABASE_NAME}" -v ON_ERROR_STOP=1 <<< "${sql}"
}

cmd_import() {
  local dump="${ARTIFACTS}/portfolio-local.sql"
  if [[ "${1:-}" == "--dump" ]]; then
    dump="$2"
  elif [[ ! -f "${dump}" && -f "${ARTIFACTS}/portfolio-local.dump" ]]; then
    dump="${ARTIFACTS}/portfolio-local.dump"
  fi

  if [[ ! -f "${dump}" ]]; then
    echo "Hata: yedek dosyası bulunamadı."
    echo "  Beklenen: ${ARTIFACTS}/portfolio-local.sql"
    echo "  Önce yerelde export çalıştırın ve scp ile sunucuya kopyalayın."
    exit 1
  fi

  load_prod_env
  require_container "${PROD_PG_CONTAINER}"

  echo "==> Uygulama container'ları durduruluyor..."
  docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" stop backend frontend admin 2>/dev/null || true

  echo "==> Production veritabanına yükleniyor (${dump})..."
  docker cp "${dump}" "${PROD_PG_CONTAINER}:/tmp/portfolio-import"

  docker exec "${PROD_PG_CONTAINER}" psql -U "${DATABASE_USER}" -d postgres -v ON_ERROR_STOP=1 -c \
    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DATABASE_NAME}' AND pid <> pg_backend_pid();"

  if [[ "${dump}" == *.sql ]]; then
    docker exec "${PROD_PG_CONTAINER}" psql -U "${DATABASE_USER}" -d postgres -v ON_ERROR_STOP=1 -c \
      "DROP DATABASE IF EXISTS ${DATABASE_NAME};"
    docker exec "${PROD_PG_CONTAINER}" psql -U "${DATABASE_USER}" -d postgres -v ON_ERROR_STOP=1 -c \
      "CREATE DATABASE ${DATABASE_NAME};"
    docker exec "${PROD_PG_CONTAINER}" psql \
      -U "${DATABASE_USER}" \
      -d "${DATABASE_NAME}" \
      -v ON_ERROR_STOP=1 \
      -f /tmp/portfolio-import
  else
    docker exec "${PROD_PG_CONTAINER}" dropdb -U "${DATABASE_USER}" --if-exists "${DATABASE_NAME}"
    docker exec "${PROD_PG_CONTAINER}" createdb -U "${DATABASE_USER}" "${DATABASE_NAME}"
    docker exec "${PROD_PG_CONTAINER}" pg_restore \
      -U "${DATABASE_USER}" \
      -d "${DATABASE_NAME}" \
      --no-owner \
      --no-acl \
      /tmp/portfolio-import
  fi

  docker exec "${PROD_PG_CONTAINER}" rm -f /tmp/portfolio-import

  echo "==> Medya URL'leri güncelleniyor..."
  fix_media_urls "${LOCAL_API_ORIGIN}" "${PROD_API_ORIGIN}"
  fix_media_urls "http://127.0.0.1:3001" "${PROD_API_ORIGIN}"

  echo "==> Uygulama container'ları başlatılıyor..."
  docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" up -d backend frontend admin

  echo ""
  echo "Import tamamlandı."
  echo "Medya dosyaları yerel uploads/ kullanıyorsa:"
  echo "  bash deploy/migrate-local-to-prod.sh sync-uploads"
  echo ""
  echo "Kontrol:"
  echo "  curl -s http://127.0.0.1:${API_HOST_PORT:-3102}/api/v1/health"
}

cmd_sync_uploads() {
  local archive="${ARTIFACTS}/portfolio-uploads.tar.gz"
  if [[ "${1:-}" == "--archive" ]]; then
    archive="$2"
  fi

  if [[ ! -f "${archive}" ]]; then
    echo "Hata: arşiv bulunamadı: ${archive}"
    exit 1
  fi

  load_prod_env

  local volume
  volume="$(docker volume ls --format '{{.Name}}' | grep portfolio_uploads | head -1)"
  if [[ -z "${volume}" ]]; then
    echo "Hata: portfolio_uploads Docker volume bulunamadı."
    exit 1
  fi

  echo "==> uploads → ${volume}..."
  docker run --rm \
    -v "${volume}:/app/uploads" \
    -v "${archive}:/tmp/uploads.tar.gz:ro" \
    alpine:3.20 \
    sh -c 'rm -rf /app/uploads/* && tar -xzf /tmp/uploads.tar.gz -C /app && chown -R 1001:1001 /app/uploads 2>/dev/null || true'

  echo "Uploads senkronize edildi."
}

main() {
  local cmd="${1:-}"
  shift || true

  case "${cmd}" in
    export) cmd_export "$@" ;;
    import) cmd_import "$@" ;;
    sync-uploads) cmd_sync_uploads "$@" ;;
    -h|--help|help|"") usage ;;
    *)
      echo "Bilinmeyen komut: ${cmd}"
      usage
      exit 1
      ;;
  esac
}

main "$@"
