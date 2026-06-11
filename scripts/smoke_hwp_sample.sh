#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

print_usage() {
  cat <<'EOF'
Usage:
  CAREVAULT_HWP_SAMPLE_PATH=/path/to/sample.hwp npm run hwp:smoke

Optional gates:
  CAREVAULT_HWP_SAMPLE_TERMS='자궁경부암,혈압,당화혈색소'
  CAREVAULT_HWP_SAMPLE_MIN_CHARS=200

The script validates a user-private .hwp/.hwpx/.hwpml sample through the same
Tauri Rust command boundary used by the app. It intentionally prints only the
sample basename, not the full local path.
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
    print_usage
    exit 2
    ;;
esac

if [[ -z "${CAREVAULT_HWP_SAMPLE_PATH:-}" ]]; then
  printf 'FAIL: CAREVAULT_HWP_SAMPLE_PATH is required.\n' >&2
  print_usage >&2
  exit 2
fi

sample_name="$(basename "$CAREVAULT_HWP_SAMPLE_PATH")"
extension="$(printf '%s' "${sample_name##*.}" | tr '[:upper:]' '[:lower:]')"

case "$extension" in
  hwp | hwpx | hwpml)
    ;;
  *)
    printf 'FAIL: sample must use .hwp, .hwpx, or .hwpml extension: %s\n' "$sample_name" >&2
    exit 2
    ;;
esac

if [[ ! -f "$CAREVAULT_HWP_SAMPLE_PATH" ]]; then
  printf 'FAIL: sample file is not readable: %s\n' "$sample_name" >&2
  exit 2
fi

printf 'CareVault private HWP/HWPX smoke\n'
printf 'Sample: %s\n' "$sample_name"
printf 'Minimum parsed chars: %s\n' "${CAREVAULT_HWP_SAMPLE_MIN_CHARS:-100}"

if [[ -n "${CAREVAULT_HWP_SAMPLE_TERMS:-}" ]]; then
  printf 'Expected terms: provided\n'
else
  printf 'Expected terms: not provided, running parser/min-length gate only\n'
fi

cargo test \
  --manifest-path "$ROOT_DIR/src-tauri/Cargo.toml" \
  hwp_parser_command_parses_private_sample_when_env_is_set \
  -- \
  --nocapture

printf 'Private HWP/HWPX smoke passed for %s.\n' "$sample_name"
