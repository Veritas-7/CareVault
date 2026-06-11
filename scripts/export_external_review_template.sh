#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMPLATE_PATH="$ROOT_DIR/docs/review-templates/carevault-external-review-report-template.json"
VITEST_BIN="$ROOT_DIR/node_modules/.bin/vitest"

print_usage() {
  cat <<'EOF'
Usage:
  npm run --silent clinical:external-review:template > /tmp/carevault-external-review.json

  CAREVAULT_EXTERNAL_REVIEW_TEMPLATE_PATH=/tmp/carevault-external-review.json \
  npm run clinical:external-review:template

This command exports a draft external clinician/source review report template.
It validates the checked-in template against the current clinical and workflow
review packets before printing or writing it.
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

if [[ ! -r "$TEMPLATE_PATH" ]]; then
  printf 'FAIL: external review template is not readable.\n' >&2
  exit 2
fi

if [[ ! -x "$VITEST_BIN" ]]; then
  printf 'FAIL: local Vitest binary is missing; run npm install first.\n' >&2
  exit 2
fi

"$VITEST_BIN" run src/carevaultExternalReviewTemplate.test.ts >&2

if [[ -n "${CAREVAULT_EXTERNAL_REVIEW_TEMPLATE_PATH:-}" ]]; then
  TEMPLATE_PARENT="$(dirname "$CAREVAULT_EXTERNAL_REVIEW_TEMPLATE_PATH")"
  if [[ ! -d "$TEMPLATE_PARENT" ]]; then
    printf 'FAIL: external review template output directory does not exist.\n' >&2
    exit 2
  fi
  cp "$TEMPLATE_PATH" "$CAREVAULT_EXTERNAL_REVIEW_TEMPLATE_PATH"
  printf 'External clinician/source review draft template written to %s.\n' "$CAREVAULT_EXTERNAL_REVIEW_TEMPLATE_PATH"
else
  cat "$TEMPLATE_PATH"
fi
