#!/usr/bin/env bash
# Pull CI-built images from GHCR and retag for docker-compose.prod.yml.
# Building Next on the VPS starves shared nginx / sibling sites (502).
set -euo pipefail

TAG="${PORTFOLIO_IMAGE_TAG:?PORTFOLIO_IMAGE_TAG required (git sha)}"
PREFIX="${PORTFOLIO_IMAGE_PREFIX:-ghcr.io/adorratm/portfolio}"

echo "==> Pull prebuilt images (tag=$TAG prefix=$PREFIX)"

for svc in backend frontend admin; do
  remote="${PREFIX}/${svc}:${TAG}"
  local_img="portfolio-prod-${svc}"
  echo "--> $remote"
  docker pull "$remote"
  docker tag "$remote" "${local_img}:latest"
  docker tag "$remote" "${local_img}:${TAG}"
  echo "    tagged ${local_img}:latest"
done

echo "==> Prebuilt images ready"
