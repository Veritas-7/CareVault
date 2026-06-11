#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

print_usage() {
  cat <<'EOF'
Usage:
  CAREVAULT_HWP_SAMPLE_PATH=/path/to/sample.hwp npm run hwp:smoke
  CAREVAULT_HWP_SAMPLE_DIR=/path/to/private-samples npm run hwp:smoke

Optional gates:
  CAREVAULT_HWP_SAMPLE_TERMS='자궁경부암,혈압,당화혈색소'
  CAREVAULT_HWP_SAMPLE_MIN_CHARS=200
  CAREVAULT_HWP_SMOKE_REPORT_PATH=/tmp/carevault-hwp-smoke-report.json

CAREVAULT_HWP_SAMPLE_TERMS is optional for parser-only smoke, but required for
objective-readiness evidence.

The script validates user-private .hwp/.hwpx/.hwpml samples through the same
Tauri Rust command boundary used by the app. It intentionally prints only each
sample basename, not the full local path. Use exactly one of
CAREVAULT_HWP_SAMPLE_PATH or CAREVAULT_HWP_SAMPLE_DIR.
When CAREVAULT_HWP_SMOKE_REPORT_PATH is set, the success report also stores only
sample basenames, extensions, expected-term counts, and objective term-group
coverage, never full local paths.
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

if [[ -n "${CAREVAULT_HWP_SAMPLE_PATH:-}" && -n "${CAREVAULT_HWP_SAMPLE_DIR:-}" ]]; then
  printf 'FAIL: set only one of CAREVAULT_HWP_SAMPLE_PATH or CAREVAULT_HWP_SAMPLE_DIR.\n' >&2
  print_usage >&2
  exit 2
fi

if [[ -z "${CAREVAULT_HWP_SAMPLE_PATH:-}" && -z "${CAREVAULT_HWP_SAMPLE_DIR:-}" ]]; then
  printf 'FAIL: CAREVAULT_HWP_SAMPLE_PATH or CAREVAULT_HWP_SAMPLE_DIR is required.\n' >&2
  print_usage >&2
  exit 2
fi

is_supported_sample() {
  local sample_name="$1"
  local extension

  extension="$(printf '%s' "${sample_name##*.}" | tr '[:upper:]' '[:lower:]')"
  case "$extension" in
    hwp | hwpx | hwpml)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

json_string() {
  python3 -c 'import json, sys; print(json.dumps(sys.argv[1], ensure_ascii=False))' "$1"
}

json_bool() {
  if [[ -n "$1" ]]; then
    printf 'true'
  else
    printf 'false'
  fi
}

expected_term_count() {
  python3 - <<'PY'
import os

terms = [
    term.strip()
    for term in os.environ.get("CAREVAULT_HWP_SAMPLE_TERMS", "").split(",")
    if term.strip()
]
print(len(terms))
PY
}

objective_term_group_bool() {
  local group="$1"

  python3 - "$group" <<'PY'
import os
import sys

group = sys.argv[1]
terms = [
    term.strip().lower()
    for term in os.environ.get("CAREVAULT_HWP_SAMPLE_TERMS", "").split(",")
    if term.strip()
]
patterns = {
    "cervical_cancer": ["자궁경부암", "cervical"],
    "hypertension": ["고혈압", "혈압", "hypertension", "blood pressure", "bp"],
    "diabetes": ["당뇨", "혈당", "당화혈색소", "hba1c", "glucose", "diabetes"],
}
covered = any(pattern in term for term in terms for pattern in patterns[group])
print("true" if covered else "false")
PY
}

validate_report_path() {
  local report_path="$1"
  local report_parent

  [[ -n "$report_path" ]] || return 0

  report_parent="$(dirname "$report_path")"
  if [[ ! -d "$report_parent" ]]; then
    printf 'FAIL: report parent directory is not writable.\n' >&2
    exit 2
  fi
  if [[ ! -w "$report_parent" ]]; then
    printf 'FAIL: report parent directory is not writable.\n' >&2
    exit 2
  fi
}

write_success_report() {
  local report_path="$1"
  local temp_report
  local sample_path
  local sample_name
  local extension
  local index=0

  [[ -n "$report_path" ]] || return 0

  temp_report="${report_path}.tmp"
  {
    printf '{\n'
    printf '  "schema": "carevault-hwp-smoke-report.v2",\n'
    printf '  "status": "passed",\n'
    printf '  "sample_count": %s,\n' "${#sample_paths[@]}"
    printf '  "minimum_parsed_chars": %s,\n' "$(json_string "${CAREVAULT_HWP_SAMPLE_MIN_CHARS:-100}")"
    printf '  "expected_terms_provided": %s,\n' "$(json_bool "${CAREVAULT_HWP_SAMPLE_TERMS:-}")"
    printf '  "expected_term_count": %s,\n' "$(expected_term_count)"
    printf '  "objective_term_groups": {\n'
    printf '    "cervical_cancer": %s,\n' "$(objective_term_group_bool cervical_cancer)"
    printf '    "hypertension": %s,\n' "$(objective_term_group_bool hypertension)"
    printf '    "diabetes": %s\n' "$(objective_term_group_bool diabetes)"
    printf '  },\n'
    printf '  "samples": [\n'
    for sample_path in "${sample_paths[@]}"; do
      sample_name="$(basename "$sample_path")"
      extension="$(printf '%s' "${sample_name##*.}" | tr '[:upper:]' '[:lower:]')"
      if [[ "$index" -gt 0 ]]; then
        printf ',\n'
      fi
      printf '    {"basename": %s, "extension": %s, "status": "passed"}' \
        "$(json_string "$sample_name")" \
        "$(json_string "$extension")"
      index=$((index + 1))
    done
    printf '\n  ]\n'
    printf '}\n'
  } > "$temp_report"
  mv "$temp_report" "$report_path"
  printf 'Report: written with basename-only sample evidence.\n'
}

collect_samples() {
  local sample_name

  if [[ -n "${CAREVAULT_HWP_SAMPLE_PATH:-}" ]]; then
    sample_name="$(basename "$CAREVAULT_HWP_SAMPLE_PATH")"
    if ! is_supported_sample "$sample_name"; then
      printf 'FAIL: sample must use .hwp, .hwpx, or .hwpml extension: %s\n' "$sample_name" >&2
      exit 2
    fi
    if [[ ! -f "$CAREVAULT_HWP_SAMPLE_PATH" ]]; then
      printf 'FAIL: sample file is not readable: %s\n' "$sample_name" >&2
      exit 2
    fi
    printf '%s\n' "$CAREVAULT_HWP_SAMPLE_PATH"
    return
  fi

  if [[ ! -d "$CAREVAULT_HWP_SAMPLE_DIR" ]]; then
    printf 'FAIL: sample directory is not readable.\n' >&2
    exit 2
  fi

  find "$CAREVAULT_HWP_SAMPLE_DIR" -maxdepth 1 -type f \( \
    -iname '*.hwp' -o -iname '*.hwpx' -o -iname '*.hwpml' \
  \) -print | LC_ALL=C sort
}

sample_paths=()
while IFS= read -r sample_path; do
  [[ -n "$sample_path" ]] && sample_paths+=("$sample_path")
done < <(collect_samples)
if [[ "${#sample_paths[@]}" -eq 0 ]]; then
  printf 'FAIL: sample directory contains no .hwp/.hwpx/.hwpml files.\n' >&2
  exit 2
fi

printf 'CareVault private HWP/HWPX smoke\n'
printf 'Samples: %s\n' "${#sample_paths[@]}"
printf 'Minimum parsed chars: %s\n' "${CAREVAULT_HWP_SAMPLE_MIN_CHARS:-100}"

if [[ -n "${CAREVAULT_HWP_SAMPLE_TERMS:-}" ]]; then
  printf 'Expected terms: provided\n'
else
  printf 'Expected terms: not provided, running parser/min-length gate only\n'
fi

validate_report_path "${CAREVAULT_HWP_SMOKE_REPORT_PATH:-}"

for sample_path in "${sample_paths[@]}"; do
  sample_name="$(basename "$sample_path")"
  printf 'Sample: %s\n' "$sample_name"

  CAREVAULT_HWP_SAMPLE_PATH="$sample_path" \
    cargo test \
      --manifest-path "$ROOT_DIR/src-tauri/Cargo.toml" \
      hwp_parser_command_parses_private_sample_when_env_is_set \
      -- \
      --nocapture

  printf 'Private HWP/HWPX smoke passed for %s.\n' "$sample_name"
done

write_success_report "${CAREVAULT_HWP_SMOKE_REPORT_PATH:-}"

printf 'Private HWP/HWPX smoke passed for %s sample(s).\n' "${#sample_paths[@]}"
