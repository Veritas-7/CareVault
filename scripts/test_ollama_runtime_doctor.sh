#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT="$ROOT_DIR/scripts/doctor_ollama_runtime.sh"
TMP_DIR="$(mktemp -d)"

trap 'rm -rf "$TMP_DIR"' EXIT

FAKE_BIN="$TMP_DIR/bin"
FAKE_OLLAMA_PREFIX="$TMP_DIR/ollama-prefix"
mkdir -p "$FAKE_BIN" "$FAKE_OLLAMA_PREFIX"

cat > "$FAKE_BIN/lsof" <<'EOF'
#!/usr/bin/env bash
exit 1
EOF

cat > "$FAKE_BIN/brew" <<'EOF'
#!/usr/bin/env bash
if [[ "$*" == "list --versions ollama" ]]; then
  printf 'ollama 0.30.7\n'
  exit 0
fi
if [[ "$*" == "--prefix ollama" ]]; then
  printf '%s\n' "$CAREVAULT_FAKE_OLLAMA_PREFIX"
  exit 0
fi
exit 1
EOF

cat > "$FAKE_BIN/curl" <<'EOF'
#!/usr/bin/env bash
output_file=""
previous=""
for argument in "$@"; do
  if [[ "$previous" == "-o" ]]; then
    output_file="$argument"
  fi
  previous="$argument"
done

case "${*: -1}" in
  */api/version)
    exit 0
    ;;
esac

if [[ -n "$output_file" ]]; then
  cat > "$output_file" <<'JSON'
{"error":{"message":"error starting llama-server: llama-server binary not found at /Users/wj/private/llama-server and /opt/homebrew/Cellar/ollama/0.30.7/libexec/llama-server","type":"api_error"}}
JSON
  printf '500'
  exit 0
fi

exit 1
EOF

cat > "$FAKE_BIN/ollama" <<'EOF'
#!/usr/bin/env bash
case "${1:-}" in
  --version)
    printf 'ollama fake client 0.30.7\n'
    ;;
  serve)
    while true; do sleep 1; done
    ;;
  list)
    printf 'NAME             ID              SIZE      MODIFIED\n'
    printf 'llama3.2:1b      fake-chat       1.3 GB    fixture\n'
    printf 'bge-m3:latest    fake-embed      1.2 GB    fixture\n'
    ;;
  *)
    printf 'ollama fake\n'
    ;;
esac
EOF

chmod +x "$FAKE_BIN/lsof" "$FAKE_BIN/brew" "$FAKE_BIN/curl" "$FAKE_BIN/ollama"

assert_contains() {
  local output_file="$1"
  local expected="$2"

  if ! grep -Fq "$expected" "$output_file"; then
    printf 'Expected output to contain: %s\n' "$expected" >&2
    printf '%s\n' '--- output ---' >&2
    cat "$output_file" >&2
    exit 1
  fi
}

assert_not_contains() {
  local output_file="$1"
  local unexpected="$2"

  if grep -Fq "$unexpected" "$output_file"; then
    printf 'Expected output not to contain: %s\n' "$unexpected" >&2
    printf '%s\n' '--- output ---' >&2
    cat "$output_file" >&2
    exit 1
  fi
}

OUTPUT_FILE="$TMP_DIR/ollama-runtime-doctor.out"
if PATH="$FAKE_BIN:$PATH" \
  CAREVAULT_FAKE_OLLAMA_PREFIX="$FAKE_OLLAMA_PREFIX" \
  "$SCRIPT" > "$OUTPUT_FILE" 2>&1; then
  printf 'Expected fake Ollama runtime doctor to fail.\n' >&2
  cat "$OUTPUT_FILE" >&2
  exit 1
fi

assert_contains "$OUTPUT_FILE" 'Homebrew package: ollama 0.30.7'
assert_contains "$OUTPUT_FILE" 'Ollama worker binary: not found in checked install roots'
assert_contains "$OUTPUT_FILE" 'Diagnosis: local Ollama can start its API, but its model worker binary `llama-server` is missing'
assert_contains "$OUTPUT_FILE" 'Repair hint: the current install snapshot did not expose a `llama-server`/runner binary'
assert_contains "$OUTPUT_FILE" '[local path]'
assert_not_contains "$OUTPUT_FILE" '/Users/wj/private'
assert_not_contains "$OUTPUT_FILE" '/opt/homebrew/Cellar'

printf 'Ollama runtime doctor fixture tests passed.\n'
