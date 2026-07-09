#!/usr/bin/env bash
# Portfolio nginx: ayrı conf.d dosyası (default.conf'a merge YOK)
set -euo pipefail

PORTFOLIO_CONF_D_BASENAME="${PORTFOLIO_CONF_D_BASENAME:-portfolio-emrekilic.conf}"

strip_portfolio_from_default_conf() {
  local container="${1:?nginx container adı gerekli}"

  docker exec "${container}" sh -c "
    set -e
    conf=/etc/nginx/conf.d/default.conf
    [ -f \"\$conf\" ] || exit 0

    line=\$(grep -n '^# portfolio-merge-boundary' \"\$conf\" 2>/dev/null | head -1 | cut -d: -f1)
    if [ -z \"\$line\" ]; then
      line=\$(grep -n '^map \$http_upgrade \$portfolio_connection_upgrade' \"\$conf\" 2>/dev/null | head -1 | cut -d: -f1)
    fi
    if [ -z \"\$line\" ]; then
      line=\$(grep -n '^# Portfolio — emrekilic' \"\$conf\" 2>/dev/null | head -1 | cut -d: -f1)
    fi
    if [ -n \"\$line\" ]; then
      head -n \$((line - 1)) \"\$conf\" > /tmp/default.strip
      mv /tmp/default.strip \"\$conf\"
    fi

    sed -i '/include \\/etc\\/nginx\\/templates\\/portfolio.conf/d' \"\$conf\" 2>/dev/null || true
    sed -i '/include \\/etc\\/nginx\\/conf.d\\/portfolio-emrekilic.conf/d' \"\$conf\" 2>/dev/null || true
  "
}

install_portfolio_conf_d() {
  local container="${1:?nginx container adı gerekli}"

  docker exec "${container}" sh -c "
    set -e
    tpl=/etc/nginx/templates/portfolio.conf
    dest=/etc/nginx/conf.d/${PORTFOLIO_CONF_D_BASENAME}
    if [ ! -f \"\$tpl\" ]; then
      echo 'portfolio.conf template yok' >&2
      exit 1
    fi
    cp \"\$tpl\" \"\$dest\"
  "
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

apply_portfolio_nginx_config() {
  local container="${1:?nginx container adı gerekli}"

  strip_portfolio_from_default_conf "${container}"
  install_portfolio_conf_d "${container}"

  if reload_nginx_if_valid "${container}"; then
    return 0
  fi

  echo "UYARI: nginx -t başarısız — default.conf temizlenip container yeniden başlatılıyor..."
  restore_nginx_default_conf "${container}" || return 1
  strip_portfolio_from_default_conf "${container}"
  install_portfolio_conf_d "${container}"
  reload_nginx_if_valid "${container}"
}

# Geriye dönük isimler
merge_portfolio_into_default_conf() {
  apply_portfolio_nginx_config "$@"
}

merge_portfolio_with_recovery() {
  apply_portfolio_nginx_config "$@"
}
