#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ESBUILD_BIN="$ROOT_DIR/node_modules/.bin/esbuild"

print_usage() {
  cat <<'EOF'
Usage:
  npm run objective:readiness:export

  CAREVAULT_OBJECTIVE_READINESS_REPORT_PATH=/tmp/carevault-objective-readiness.md \
  CAREVAULT_OBJECTIVE_READINESS_JSON_PATH=/tmp/carevault-objective-readiness.json \
  npm run objective:readiness:export

Optional evidence inputs:
  CAREVAULT_HWP_SMOKE_REPORT_PATH=/tmp/carevault-hwp-smoke-report.json
  CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH=/tmp/carevault-external-review.json

This command exports the current CareVault objective readiness report as
Markdown and, optionally, JSON. It does not create private HWP evidence or
clinical approval; it only summarizes supplied evidence and current blockers.
EOF
}

case "${1:-}" in
  -h | --help)
    print_usage
    exit 0
    ;;
  "")
    ;;
  *)
    print_usage >&2
    exit 2
    ;;
esac

check_readable_input() {
  local env_name="$1"
  local label="$2"
  local value="${!env_name:-}"

  [[ -n "$value" ]] || return 0
  if [[ ! -r "$value" ]]; then
    printf 'FAIL: configured %s is not readable.\n' "$label" >&2
    exit 2
  fi
}

check_writable_parent() {
  local env_name="$1"
  local label="$2"
  local value="${!env_name:-}"
  local parent

  [[ -n "$value" ]] || return 0
  parent="$(dirname "$value")"
  if [[ ! -d "$parent" || ! -w "$parent" ]]; then
    printf 'FAIL: %s output directory is not writable.\n' "$label" >&2
    exit 2
  fi
}

if [[ ! -x "$ESBUILD_BIN" ]]; then
  printf 'FAIL: local esbuild binary is missing; run npm install first.\n' >&2
  exit 2
fi

check_readable_input CAREVAULT_HWP_SMOKE_REPORT_PATH "HWP smoke report"
check_readable_input CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH "external review report"
check_writable_parent CAREVAULT_OBJECTIVE_READINESS_REPORT_PATH "objective readiness Markdown"
check_writable_parent CAREVAULT_OBJECTIVE_READINESS_JSON_PATH "objective readiness JSON"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

"$ESBUILD_BIN" \
  "$ROOT_DIR/scripts/objective_readiness_export_cli.ts" \
  --bundle \
  --platform=node \
  --format=esm \
  --log-level=error \
  --outfile="$TMP_DIR/objective-readiness-export.mjs"

node "$TMP_DIR/objective-readiness-export.mjs"
