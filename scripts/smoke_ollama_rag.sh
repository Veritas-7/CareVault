#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

print_usage() {
  cat <<'EOF'
Usage:
  npm run rag:ollama:smoke

Optional overrides:
  CAREVAULT_OLLAMA_HOST=127.0.0.1:11434
  CAREVAULT_OLLAMA_MODEL=llama3.2:1b
  CAREVAULT_OLLAMA_EMBEDDING_MODEL=bge-m3:latest

The smoke starts a temporary local Ollama server only when the target port is
free, then runs CareVault's existing local model and embedding RAG smokes
against OpenAI-compatible localhost endpoints. If a server is already listening
on the target port, this script uses it and does not stop it.
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

require_command() {
  local command_name="$1"
  if ! command -v "$command_name" >/dev/null 2>&1; then
    printf 'FAIL: required command not found: %s\n' "$command_name" >&2
    exit 2
  fi
}

sanitize_log() {
  sed -E \
    -e 's#/Users/[^[:space:]]+#[local path]#g' \
    -e 's#/opt/homebrew/[^[:space:]]+#[local path]#g' \
    -e 's#/private/[^[:space:]]+#[local path]#g' \
    -e 's#/var/[^[:space:]]+#[local path]#g'
}

require_command curl
require_command lsof
require_command npm
require_command ollama

OLLAMA_HOST_VALUE="${CAREVAULT_OLLAMA_HOST:-127.0.0.1:11434}"
case "$OLLAMA_HOST_VALUE" in
  127.0.0.1:* | localhost:*)
    ;;
  *)
    printf 'FAIL: CAREVAULT_OLLAMA_HOST must be localhost or 127.0.0.1.\n' >&2
    exit 2
    ;;
esac

OLLAMA_PORT="${OLLAMA_HOST_VALUE##*:}"
if [[ ! "$OLLAMA_PORT" =~ ^[0-9]+$ ]]; then
  printf 'FAIL: CAREVAULT_OLLAMA_HOST must include a numeric port.\n' >&2
  exit 2
fi

MODEL_NAME="${CAREVAULT_RAG_MODEL_NAME:-${CAREVAULT_OLLAMA_MODEL:-llama3.2:1b}}"
EMBEDDING_MODEL_NAME="${CAREVAULT_RAG_EMBEDDING_MODEL:-${CAREVAULT_OLLAMA_EMBEDDING_MODEL:-bge-m3:latest}}"
MODEL_ENDPOINT="${CAREVAULT_RAG_MODEL_ENDPOINT:-http://${OLLAMA_HOST_VALUE}/v1/chat/completions}"
EMBEDDING_ENDPOINT="${CAREVAULT_RAG_EMBEDDING_ENDPOINT:-http://${OLLAMA_HOST_VALUE}/v1/embeddings}"
OLLAMA_BASE_URL="http://${OLLAMA_HOST_VALUE}"
OLLAMA_LOG="$(mktemp /tmp/carevault-ollama-rag.XXXXXX.log)"
MODEL_OUTPUT_LOG="$(mktemp /tmp/carevault-rag-model.XXXXXX.log)"
EMBEDDING_OUTPUT_LOG="$(mktemp /tmp/carevault-rag-embedding.XXXXXX.log)"
OLLAMA_PID=""

cleanup() {
  if [[ -n "$OLLAMA_PID" ]] && kill -0 "$OLLAMA_PID" >/dev/null 2>&1; then
    kill "$OLLAMA_PID" >/dev/null 2>&1 || true
    wait "$OLLAMA_PID" >/dev/null 2>&1 || true
  fi
  rm -f "$OLLAMA_LOG" "$MODEL_OUTPUT_LOG" "$EMBEDDING_OUTPUT_LOG"
}
trap cleanup EXIT

wait_for_ollama() {
  local attempt
  for attempt in {1..40}; do
    if curl -fsS "${OLLAMA_BASE_URL}/api/version" >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.25
  done
  return 1
}

report_missing_llama_server_diagnosis() {
  local output_file
  for output_file in "$MODEL_OUTPUT_LOG" "$EMBEDDING_OUTPUT_LOG" "$OLLAMA_LOG"; do
    if [[ -s "$output_file" ]] && grep -Eqi 'llama-server binary not found|error starting llama-server' "$output_file"; then
      printf 'Diagnosis: local Ollama can start its API, but its model worker binary `llama-server` is missing; repair or reinstall the Ollama runtime before expecting model-backed CareVault RAG smokes to pass.\n' >&2
      return 0
    fi
  done
}

printf 'CareVault Ollama RAG smoke\n'
printf 'Ollama host: %s\n' "$OLLAMA_HOST_VALUE"
printf 'Model: %s\n' "$MODEL_NAME"
printf 'Embedding model: %s\n' "$EMBEDDING_MODEL_NAME"

if lsof -nP -iTCP:"$OLLAMA_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  printf 'Ollama listener: existing process on port %s, will not stop it\n' "$OLLAMA_PORT"
else
  printf 'Ollama listener: none, starting temporary ollama serve\n'
  OLLAMA_HOST="$OLLAMA_HOST_VALUE" ollama serve >"$OLLAMA_LOG" 2>&1 &
  OLLAMA_PID="$!"
fi

if ! wait_for_ollama; then
  printf 'FAIL: local Ollama server did not become ready.\n' >&2
  if [[ -s "$OLLAMA_LOG" ]]; then
    printf 'Ollama log tail:\n' >&2
    tail -20 "$OLLAMA_LOG" | sanitize_log >&2
  fi
  exit 1
fi

printf 'Ollama version endpoint: reachable\n'
printf 'Ollama models:\n'
OLLAMA_HOST="$OLLAMA_HOST_VALUE" ollama list || true

cd "$ROOT_DIR"

set +e
CAREVAULT_RAG_MODEL_ENDPOINT="$MODEL_ENDPOINT" \
  CAREVAULT_RAG_MODEL_NAME="$MODEL_NAME" \
  npm run rag:model:smoke 2>&1 | sanitize_log | tee "$MODEL_OUTPUT_LOG"
MODEL_STATUS="${PIPESTATUS[0]}"

CAREVAULT_RAG_EMBEDDING_ENDPOINT="$EMBEDDING_ENDPOINT" \
  CAREVAULT_RAG_EMBEDDING_MODEL="$EMBEDDING_MODEL_NAME" \
  npm run rag:embedding:smoke 2>&1 | sanitize_log | tee "$EMBEDDING_OUTPUT_LOG"
EMBEDDING_STATUS="${PIPESTATUS[0]}"
set -e

if [[ "$MODEL_STATUS" -ne 0 || "$EMBEDDING_STATUS" -ne 0 ]]; then
  printf 'FAIL: Ollama RAG smoke failed. model_status=%s embedding_status=%s\n' \
    "$MODEL_STATUS" "$EMBEDDING_STATUS" >&2
  if [[ -s "$OLLAMA_LOG" ]]; then
    printf 'Ollama log tail:\n' >&2
    tail -20 "$OLLAMA_LOG" | sanitize_log >&2
  fi
  report_missing_llama_server_diagnosis
  exit 1
fi

printf 'PASS: Ollama model and embedding RAG smokes completed.\n'
