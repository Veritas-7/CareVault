#!/usr/bin/env bash

set -euo pipefail

if [[ "${1:-}" == "--help" ]]; then
  cat <<'EOF'
Usage: npm run clinical:sources:smoke

Checks the public HTTPS clinical source URLs embedded in CareVault's clinical
source modules with curl. The local-user-entered-range sentinel is intentionally
excluded because it is not an external source.

Environment:
  CAREVAULT_CLINICAL_SOURCE_TIMEOUT       Per-URL timeout in seconds (default: 15)
  CAREVAULT_CLINICAL_SOURCE_CONNECT_TIMEOUT  Per-URL connect timeout in seconds (default: 6)
  CAREVAULT_CLINICAL_SOURCE_URL_LIMIT     Optional positive integer for a quick prefix smoke
  CAREVAULT_CLINICAL_SOURCE_REPORT_PATH   Optional JSON report output path
EOF
  exit 0
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TIMEOUT="${CAREVAULT_CLINICAL_SOURCE_TIMEOUT:-15}"
CONNECT_TIMEOUT="${CAREVAULT_CLINICAL_SOURCE_CONNECT_TIMEOUT:-6}"
URL_LIMIT="${CAREVAULT_CLINICAL_SOURCE_URL_LIMIT:-}"
REPORT_PATH="${CAREVAULT_CLINICAL_SOURCE_REPORT_PATH:-}"
USER_AGENT="CareVault clinical source smoke (+local command verification)"
SOURCE_FILES=(
  src/healthStandards.ts
  src/healthRules.ts
  src/labPresets.ts
)

cd "${REPO_ROOT}"

urls=()
while IFS= read -r url; do
  urls+=("${url}")
done < <(
  rg --no-filename -o "https://[^[:space:]\"')]+" "${SOURCE_FILES[@]}" \
    | sed 's/[),.;]*$//' \
    | sort -u
)

if [[ "${#urls[@]}" -eq 0 ]]; then
  echo "No clinical source URLs found."
  exit 1
fi

if [[ -n "${URL_LIMIT}" ]]; then
  if ! [[ "${URL_LIMIT}" =~ ^[1-9][0-9]*$ ]]; then
    echo "CAREVAULT_CLINICAL_SOURCE_URL_LIMIT must be a positive integer." >&2
    exit 2
  fi
  urls=("${urls[@]:0:${URL_LIMIT}}")
fi

if [[ -n "$REPORT_PATH" ]]; then
  REPORT_PARENT="$(dirname "$REPORT_PATH")"
  if [[ ! -d "$REPORT_PARENT" || ! -w "$REPORT_PARENT" ]]; then
    printf 'Clinical source URL smoke report directory is not writable.\n' >&2
    exit 2
  fi
fi

failures=()

write_json_array() {
  local array_name="$1"
  local indent="$2"
  local length
  local index

  eval "length=\${#${array_name}[@]}"
  for ((index = 0; index < length; index += 1)); do
    local value
    local suffix=","
    eval "value=\${${array_name}[${index}]}"
    if [[ "$index" == "$((length - 1))" ]]; then
      suffix=""
    fi
    printf '%s"%s"%s\n' "$indent" "$value" "$suffix"
  done
}

write_report() {
  local status="$1"

  [[ -n "$REPORT_PATH" ]] || return 0
  {
    printf '{\n'
    printf '  "schema": "carevault-clinical-source-url-smoke.v1",\n'
    printf '  "status": "%s",\n' "$status"
    printf '  "checked_url_count": %s,\n' "${#urls[@]}"
    printf '  "failed_url_count": %s,\n' "${#failures[@]}"
    printf '  "source_files": [\n'
    write_json_array SOURCE_FILES "    "
    printf '  ],\n'
    if [[ -n "$URL_LIMIT" ]]; then
      printf '  "url_limit": %s,\n' "$URL_LIMIT"
    else
      printf '  "url_limit": null,\n'
    fi
    printf '  "checked_urls": [\n'
    write_json_array urls "    "
    printf '  ],\n'
    printf '  "failed_urls": [\n'
    write_json_array failures "    "
    printf '  ]\n'
    printf '}\n'
  } > "$REPORT_PATH"
}

for url in "${urls[@]}"; do
  if curl \
    --fail \
    --location \
    --max-time "${TIMEOUT}" \
    --connect-timeout "${CONNECT_TIMEOUT}" \
    --range 0-2048 \
    --silent \
    --show-error \
    --user-agent "${USER_AGENT}" \
    "${url}" >/dev/null; then
    printf 'OK clinical source URL: %s\n' "${url}"
    continue
  fi
  failures+=("${url}")
  printf 'FAIL clinical source URL: %s\n' "${url}" >&2
done

if [[ "${#failures[@]}" -gt 0 ]]; then
  write_report "failed"
  printf 'Clinical source URL smoke failed: %s/%s failed.\n' "${#failures[@]}" "${#urls[@]}" >&2
  exit 1
fi

write_report "passed"
printf 'Clinical source URL smoke passed: %s URLs checked.\n' "${#urls[@]}"
