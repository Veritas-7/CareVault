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

The doctor prints the local Ollama install snapshot, starts a temporary local
Ollama server only when the target port is free, then sends one minimal chat
request and one minimal embedding request directly to Ollama's OpenAI-compatible
endpoints. It isolates Ollama runtime failures from CareVault RAG request
construction and calls out a missing llama-server worker binary.
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
MISSING_LLAMA_SERVER=0
WORKER_LAYOUT_MISSING=0

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

print_worker_snapshot() {
  local checked_labels=""
  local candidate=""
  local command_path=""
  local command_dir=""
  local brew_prefix=""

  command_path="$(command -v ollama 2>/dev/null || true)"
  if [[ -n "$command_path" ]]; then
    command_dir="$(cd "$(dirname "$command_path")" >/dev/null 2>&1 && pwd -P || true)"
    if [[ -n "$command_dir" && -d "$command_dir" ]]; then
      checked_labels="command directory"
      candidate="$(find "$command_dir" -type f \( -name 'llama-server' -o -name '*runner*' \) -print 2>/dev/null | head -n 1 || true)"
    fi
  fi

  if [[ -z "$candidate" ]] && command -v brew >/dev/null 2>&1; then
    brew_prefix="$(brew --prefix ollama 2>/dev/null || true)"
    if [[ -n "$brew_prefix" && -d "$brew_prefix" ]]; then
      if [[ -n "$checked_labels" ]]; then
        checked_labels="${checked_labels}, Homebrew package prefix"
      else
        checked_labels="Homebrew package prefix"
      fi
      candidate="$(find "$brew_prefix" -type f \( -name 'llama-server' -o -name '*runner*' \) -print 2>/dev/null | head -n 1 || true)"
    fi
  fi

  if [[ -n "$candidate" ]]; then
    printf 'Ollama worker binary: found (%s)\n' "$(basename "$candidate")"
    return 0
  fi

  if [[ -n "$checked_labels" ]]; then
    printf 'Ollama worker binary: not found in checked install roots (%s)\n' "$checked_labels"
    WORKER_LAYOUT_MISSING=1
  else
    printf 'Ollama worker binary: install roots unavailable for preflight\n'
  fi
}

print_repair_hint() {
  if [[ "$MISSING_LLAMA_SERVER" -eq 1 ]] || [[ "$WORKER_LAYOUT_MISSING" -eq 1 ]] || grep -qi 'llama-server binary not found' "$OLLAMA_LOG" 2>/dev/null; then
    printf 'Diagnosis: local Ollama can start its API, but its model worker binary `llama-server` is missing; repair or reinstall the Ollama runtime before expecting model-backed CareVault RAG smokes to pass.\n' >&2
    if [[ "$WORKER_LAYOUT_MISSING" -eq 1 ]]; then
      printf 'Repair hint: the current install snapshot did not expose a `llama-server`/runner binary in the checked Ollama command or Homebrew package roots.\n' >&2
    fi
  fi
}

print_install_snapshot() {
  printf 'Ollama command: present\n'
  ollama --version 2>&1 | sanitize_log | sed 's/^/Ollama version: /' || true

  if command -v brew >/dev/null 2>&1; then
    local brew_version
    brew_version="$(brew list --versions ollama 2>/dev/null || true)"
    if [[ -n "$brew_version" ]]; then
      printf 'Homebrew package: %s\n' "$brew_version"
    else
      printf 'Homebrew package: ollama not found\n'
    fi
  fi
  print_worker_snapshot
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
    if grep -qi 'llama-server binary not found' "$response_file"; then
      MISSING_LLAMA_SERVER=1
    fi
  fi
  rm -f "$response_file"
  return 1
}

printf 'CareVault Ollama runtime doctor\n'
printf 'Ollama host: %s\n' "$OLLAMA_HOST_VALUE"
printf 'Model: %s\n' "$MODEL_NAME"
printf 'Embedding model: %s\n' "$EMBEDDING_MODEL_NAME"
print_install_snapshot

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
  print_repair_hint
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
  print_repair_hint
  exit 1
fi

printf 'PASS: Ollama runtime doctor completed.\n'
