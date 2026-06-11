#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

print_usage() {
  cat <<'EOF'
Usage:
  CAREVAULT_RAG_MODEL_ENDPOINT=http://127.0.0.1:11434/v1/chat/completions \
  CAREVAULT_RAG_MODEL_NAME=local-care-model \
  npm run rag:model:smoke

Optional gate:
  CAREVAULT_RAG_MODEL_EXPECTED_TERMS='문서,근거'

The smoke posts a source-grounded CareVault document RAG context to an
OpenAI-compatible local model endpoint. The app helper blocks remote endpoints
and insufficient evidence before any request is sent.
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

if [[ -z "${CAREVAULT_RAG_MODEL_ENDPOINT:-}" ]]; then
  printf 'FAIL: CAREVAULT_RAG_MODEL_ENDPOINT is required.\n' >&2
  print_usage >&2
  exit 2
fi

if [[ -z "${CAREVAULT_RAG_MODEL_NAME:-}" ]]; then
  printf 'FAIL: CAREVAULT_RAG_MODEL_NAME is required.\n' >&2
  print_usage >&2
  exit 2
fi

node -e '
const endpoint = process.env.CAREVAULT_RAG_MODEL_ENDPOINT || "";
let url;
try {
  url = new URL(endpoint);
} catch {
  console.error("FAIL: CAREVAULT_RAG_MODEL_ENDPOINT is not a valid URL.");
  process.exit(2);
}
const host = url.hostname.toLowerCase();
const allowed = (url.protocol === "http:" || url.protocol === "https:")
  && (host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]" || host.startsWith("127."));
if (!allowed) {
  console.error("FAIL: only localhost/127.0.0.1/[::1] model endpoints are allowed.");
  process.exit(2);
}
'

printf 'CareVault local model RAG smoke\n'
printf 'Endpoint: %s\n' "$CAREVAULT_RAG_MODEL_ENDPOINT"
printf 'Model: %s\n' "$CAREVAULT_RAG_MODEL_NAME"
if [[ -n "${CAREVAULT_RAG_MODEL_EXPECTED_TERMS:-}" ]]; then
  printf 'Expected terms: provided\n'
else
  printf 'Expected terms: not provided, checking non-empty sanitized output only\n'
fi

npm test -- src/documentRagModelRequest.live.test.ts
