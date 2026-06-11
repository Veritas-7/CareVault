#!/usr/bin/env bash

set -euo pipefail

print_usage() {
  cat <<'EOF'
Usage:
  npm run rag:ollama:doctor

Optional overrides:
  CAREVAULT_OLLAMA_HOST=127.0.0.1:11434
  CAREVAULT_OLLAMA_MODEL=llama3.2:1b
  CAREVAULT_OLLAMA_EMBEDDING_MODEL=bge-m3:latest

The doctor starts a temporary local Ollama server only when the target port is
free, then sends one minimal chat request and one minimal embedding request
directly to Ollama's OpenAI-compatible endpoints. It isolates Ollama runtime
failures from CareVault RAG request construction.
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
    -e 's#/Users/[^[:space:]"]+#[local path]#g' \
    -e 's#/opt/homebrew/[^[:space:]"]+#[local path]#g' \
    -e 's#/private/[^[:space:]"]+#[local path]#g' \
    -e 's#/var/[^[:space:]"]+#[local path]#g'
}

json_escape() {
  node -e 'process.stdout.write(JSON.stringify(process.argv[1] || "").slice(1, -1))' "$1"
}

require_command curl
require_command lsof
require_command node
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

MODEL_NAME="${CAREVAULT_OLLAMA_MODEL:-llama3.2:1b}"
EMBEDDING_MODEL_NAME="${CAREVAULT_OLLAMA_EMBEDDING_MODEL:-bge-m3:latest}"
MODEL_JSON="$(json_escape "$MODEL_NAME")"
EMBEDDING_MODEL_JSON="$(json_escape "$EMBEDDING_MODEL_NAME")"
OLLAMA_BASE_URL="http://${OLLAMA_HOST_VALUE}"
OLLAMA_LOG="$(mktemp /tmp/carevault-ollama-doctor.XXXXXX.log)"
OLLAMA_PID=""

cleanup() {
  if [[ -n "$OLLAMA_PID" ]] && kill -0 "$OLLAMA_PID" >/dev/null 2>&1; then
    kill "$OLLAMA_PID" >/dev/null 2>&1 || true
    wait "$OLLAMA_PID" >/dev/null 2>&1 || true
  fi
  rm -f "$OLLAMA_LOG"
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

post_json() {
  local label="$1"
  local url="$2"
  local body="$3"
  local response_file
  local status

  response_file="$(mktemp /tmp/carevault-ollama-doctor-response.XXXXXX.json)"
  status="$(curl -sS -o "$response_file" -w '%{http_code}' \
    -H 'Content-Type: application/json' \
    -X POST \
    --data "$body" \
    "$url" || true)"

  if [[ "$status" == "200" ]]; then
    printf 'PASS: %s endpoint returned HTTP 200\n' "$label"
    rm -f "$response_file"
    return 0
  fi

  printf 'FAIL: %s endpoint returned HTTP %s\n' "$label" "$status" >&2
  if [[ -s "$response_file" ]]; then
    printf '%s endpoint body:\n' "$label" >&2
    head -c 1200 "$response_file" | sanitize_log >&2
    printf '\n' >&2
  fi
  rm -f "$response_file"
  return 1
}

printf 'CareVault Ollama runtime doctor\n'
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

CHAT_BODY='{"model":"'"$MODEL_JSON"'","messages":[{"role":"user","content":"Return exactly OK."}],"max_tokens":4,"temperature":0}'
EMBEDDING_BODY='{"model":"'"$EMBEDDING_MODEL_JSON"'","input":["CareVault runtime doctor"]}'

CHAT_STATUS=0
EMBEDDING_STATUS=0
post_json "chat" "${OLLAMA_BASE_URL}/v1/chat/completions" "$CHAT_BODY" || CHAT_STATUS="$?"
post_json "embedding" "${OLLAMA_BASE_URL}/v1/embeddings" "$EMBEDDING_BODY" || EMBEDDING_STATUS="$?"

if [[ "$CHAT_STATUS" -ne 0 || "$EMBEDDING_STATUS" -ne 0 ]]; then
  printf 'FAIL: Ollama runtime doctor failed. chat_status=%s embedding_status=%s\n' \
    "$CHAT_STATUS" "$EMBEDDING_STATUS" >&2
  if [[ -s "$OLLAMA_LOG" ]]; then
    printf 'Ollama log tail:\n' >&2
    tail -20 "$OLLAMA_LOG" | sanitize_log >&2
  fi
  exit 1
fi

printf 'PASS: Ollama runtime doctor completed.\n'
