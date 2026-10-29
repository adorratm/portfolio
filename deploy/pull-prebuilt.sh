#!/usr/bin/env bash
# Pull CI-built images from GHCR and retag for docker-compose.prod.yml.
# Building Next on the VPS starves shared nginx / sibling sites (502).
set -euo pipefail

TAG="${PORTFOLIO_IMAGE_TAG:?PORTFOLIO_IMAGE_TAG required (git sha)}"
PREFIX="${PORTFOLIO_IMAGE_PREFIX:-ghcr.io/adorratm/portfolio}"

echo "==> Pull prebuilt images (tag=$TAG prefix=$PREFIX)"

PREFIX="$(echo "${PREFIX}" | tr '[:upper:]' '[:lower:]')"

for svc in backend frontend admin; do
  remote="${PREFIX}/${svc}:${TAG}"
  local_img="portfolio-prod-${svc}"
  echo "--> $remote"
  if ! docker pull "$remote"; then
    echo "ERROR: GHCR pull denied/failed for ${remote}" >&2
    echo "  1) Repo secret GHCR_TOKEN = classic PAT with read:packages" >&2
    echo "  2) Or package settings → Manage Actions access → add this repo (write)" >&2
    echo "  3) Confirm image exists: ghcr.io/.../${svc}:${TAG}" >&2
    exit 1
  fi
  docker tag "$remote" "${local_img}:latest"
  docker tag "$remote" "${local_img}:${TAG}"
  echo "    tagged ${local_img}:latest"
done

echo "==> Prebuilt images ready"
