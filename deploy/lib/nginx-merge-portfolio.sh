#!/usr/bin/env bash
# Portfolio bloğunu default.conf'a güvenli merge (http context)
# Kullanım: merge_portfolio_into_default_conf <nginx_container>
set -euo pipefail

merge_portfolio_into_default_conf() {
  local container="${1:?nginx container adı gerekli}"

  docker exec "${container}" sh -c '
    set -e
    conf=/etc/nginx/conf.d/default.conf
    tpl=/etc/nginx/templates/portfolio.conf

    if [ ! -f "$tpl" ] || [ ! -f "$conf" ]; then
      echo "portfolio.conf veya default.conf yok" >&2
      exit 1
    fi

    # Yalnızca boundary satırında kes — server_name ile kesmek açık server bloğu bırakır
    line=$(grep -n "^# portfolio-merge-boundary" "$conf" 2>/dev/null | head -1 | cut -d: -f1)
    if [ -z "$line" ]; then
      line=$(grep -n "^map \$http_upgrade \$portfolio_connection_upgrade" "$conf" 2>/dev/null | head -1 | cut -d: -f1)
    fi
    if [ -z "$line" ]; then
      line=$(grep -n "^# Portfolio — emrekilic" "$conf" 2>/dev/null | head -1 | cut -d: -f1)
    fi

    if [ -n "$line" ]; then
      head -n $((line - 1)) "$conf" > /tmp/default.clean
    else
      cp "$conf" /tmp/default.clean
    fi

    cat "$tpl" >> /tmp/default.clean
    mv /tmp/default.clean "$conf"
  '
}

reload_nginx_if_valid() {
  local container="${1:?nginx container adı gerekli}"

  if docker exec "${container}" nginx -t 2>&1; then
    docker exec "${container}" nginx -s reload
    return 0
  fi
  return 1
}

restore_nginx_default_conf() {
  local container="${1:?nginx container adı gerekli}"

  echo "==> Nginx container yeniden başlatılıyor (TTEN default.conf şablonundan)..."
  docker restart "${container}"

  local attempt
  for attempt in $(seq 1 30); do
    if docker exec "${container}" nginx -t >/dev/null 2>&1; then
      return 0
    fi
    sleep 2
  done
  return 1
}

merge_portfolio_with_recovery() {
  local container="${1:?nginx container adı gerekli}"

  merge_portfolio_into_default_conf "${container}"

  if reload_nginx_if_valid "${container}"; then
    return 0
  fi

  echo "UYARI: nginx -t başarısız — TTEN tabanı sıfırlanıp merge tekrar denenecek."
  restore_nginx_default_conf "${container}" || return 1
  merge_portfolio_into_default_conf "${container}"
  reload_nginx_if_valid "${container}"
}
