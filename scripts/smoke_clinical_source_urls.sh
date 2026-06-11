#!/usr/bin/env bash

set -euo pipefail

if [[ "${1:-}" == "--help" ]]; then
  cat <<'EOF'
Usage: npm run clinical:sources:smoke

Checks the public HTTPS clinical source URLs embedded in src/healthStandards.ts
and src/healthRules.ts with curl. The local-user-entered-range sentinel is
intentionally excluded because it is not an external source.

Environment:
  CAREVAULT_CLINICAL_SOURCE_TIMEOUT       Per-URL timeout in seconds (default: 15)
  CAREVAULT_CLINICAL_SOURCE_CONNECT_TIMEOUT  Per-URL connect timeout in seconds (default: 6)
  CAREVAULT_CLINICAL_SOURCE_URL_LIMIT     Optional positive integer for a quick prefix smoke
EOF
  exit 0
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TIMEOUT="${CAREVAULT_CLINICAL_SOURCE_TIMEOUT:-15}"
CONNECT_TIMEOUT="${CAREVAULT_CLINICAL_SOURCE_CONNECT_TIMEOUT:-6}"
URL_LIMIT="${CAREVAULT_CLINICAL_SOURCE_URL_LIMIT:-}"
USER_AGENT="CareVault clinical source smoke (+local command verification)"

cd "${REPO_ROOT}"

urls=()
while IFS= read -r url; do
  urls+=("${url}")
done < <(
  rg --no-filename -o "https://[^[:space:]\"')]+" src/healthStandards.ts src/healthRules.ts \
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

failures=()

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
  printf 'Clinical source URL smoke failed: %s/%s failed.\n' "${#failures[@]}" "${#urls[@]}" >&2
  exit 1
fi

printf 'Clinical source URL smoke passed: %s URLs checked.\n' "${#urls[@]}"
