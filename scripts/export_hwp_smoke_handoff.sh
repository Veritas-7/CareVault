#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HANDOFF_PATH="$ROOT_DIR/docs/review-templates/carevault-private-hwp-smoke-handoff.md"

print_usage() {
  cat <<'EOF'
Usage:
  npm run --silent hwp:smoke:handoff > /tmp/carevault-private-hwp-smoke-handoff.md

  CAREVAULT_HWP_HANDOFF_PATH=/tmp/carevault-private-hwp-smoke-handoff.md \
  npm run hwp:smoke:handoff

This command validates the private HWP/HWPX smoke harness with fixture tests,
then exports the private-sample smoke handoff. It does not run or invent a real
private sample.
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

if [[ ! -r "$HANDOFF_PATH" ]]; then
  printf 'FAIL: private HWP/HWPX handoff document is not readable.\n' >&2
  exit 2
fi

if [[ -n "${CAREVAULT_HWP_HANDOFF_PATH:-}" ]]; then
  HANDOFF_PARENT="$(dirname "$CAREVAULT_HWP_HANDOFF_PATH")"
  if [[ ! -d "$HANDOFF_PARENT" || ! -w "$HANDOFF_PARENT" ]]; then
    printf 'FAIL: private HWP/HWPX handoff output directory is not writable.\n' >&2
    exit 2
  fi
fi

bash "$ROOT_DIR/scripts/test_hwp_sample_smoke.sh" >&2
bash "$ROOT_DIR/scripts/test_objective_readiness_report_smoke.sh" >&2

if [[ -n "${CAREVAULT_HWP_HANDOFF_PATH:-}" ]]; then
  cp "$HANDOFF_PATH" "$CAREVAULT_HWP_HANDOFF_PATH"
  printf 'Private HWP/HWPX smoke handoff written to %s.\n' "$CAREVAULT_HWP_HANDOFF_PATH"
else
  cat "$HANDOFF_PATH"
fi
