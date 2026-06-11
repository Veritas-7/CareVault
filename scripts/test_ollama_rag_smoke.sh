#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT="$ROOT_DIR/scripts/smoke_ollama_rag.sh"
TMP_DIR="$(mktemp -d)"

trap 'rm -rf "$TMP_DIR"' EXIT

FAKE_BIN="$TMP_DIR/bin"
mkdir -p "$FAKE_BIN"

cat > "$FAKE_BIN/lsof" <<'EOF'
#!/usr/bin/env bash
exit 1
EOF

cat > "$FAKE_BIN/curl" <<'EOF'
#!/usr/bin/env bash
exit 0
EOF

cat > "$FAKE_BIN/ollama" <<'EOF'
#!/usr/bin/env bash
case "${1:-}" in
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

cat > "$FAKE_BIN/npm" <<'EOF'
#!/usr/bin/env bash
if [[ "$*" == *"rag:model:smoke"* ]]; then
  printf 'FAIL: 로컬 모델 endpoint 오류: error starting llama-server at /Users/wj/private/llama-server and /opt/homebrew/Cellar/ollama/0.30.7/libexec/llama-server\n' >&2
  exit 1
fi
if [[ "$*" == *"rag:embedding:smoke"* ]]; then
  printf 'FAIL: 로컬 임베딩 endpoint 오류: llama-server binary not found at /Users/wj/private/embedder and /opt/homebrew/Cellar/ollama/0.30.7/libexec/llama-server\n' >&2
  exit 1
fi
printf 'unexpected fake npm invocation: %s\n' "$*" >&2
exit 2
EOF

chmod +x "$FAKE_BIN/lsof" "$FAKE_BIN/curl" "$FAKE_BIN/ollama" "$FAKE_BIN/npm"

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

OUTPUT_FILE="$TMP_DIR/ollama-rag-smoke.out"
if PATH="$FAKE_BIN:$PATH" "$SCRIPT" > "$OUTPUT_FILE" 2>&1; then
  printf 'Expected fake Ollama RAG smoke to fail.\n' >&2
  cat "$OUTPUT_FILE" >&2
  exit 1
fi

assert_contains "$OUTPUT_FILE" 'FAIL: Ollama RAG smoke failed. model_status=1 embedding_status=1'
assert_contains "$OUTPUT_FILE" 'Diagnosis: local Ollama can start its API, but its model worker binary `llama-server` is missing'
assert_contains "$OUTPUT_FILE" '[local path]'
assert_not_contains "$OUTPUT_FILE" '/Users/wj/private'
assert_not_contains "$OUTPUT_FILE" '/opt/homebrew/Cellar'

printf 'Ollama RAG smoke fixture tests passed.\n'
