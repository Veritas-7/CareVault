#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

print_usage() {
  cat <<'EOF'
Usage:
  CAREVAULT_RAG_EMBEDDING_ENDPOINT=http://127.0.0.1:11434/v1/embeddings \
  CAREVAULT_RAG_EMBEDDING_MODEL=bge-m3 \
  npm run rag:embedding:smoke

The smoke posts source-grounded CareVault document RAG evidence chunks to an
OpenAI-compatible local embeddings endpoint, then verifies that the response can
rank evidence chunks without exposing local paths.
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

if [[ -z "${CAREVAULT_RAG_EMBEDDING_ENDPOINT:-}" ]]; then
  printf 'FAIL: CAREVAULT_RAG_EMBEDDING_ENDPOINT is required.\n' >&2
  print_usage >&2
  exit 2
fi

if [[ -z "${CAREVAULT_RAG_EMBEDDING_MODEL:-}" ]]; then
  printf 'FAIL: CAREVAULT_RAG_EMBEDDING_MODEL is required.\n' >&2
  print_usage >&2
  exit 2
fi

node -e '
const endpoint = process.env.CAREVAULT_RAG_EMBEDDING_ENDPOINT || "";
let url;
try {
  url = new URL(endpoint);
} catch {
  console.error("FAIL: CAREVAULT_RAG_EMBEDDING_ENDPOINT is not a valid URL.");
  process.exit(2);
}
const host = url.hostname.toLowerCase();
const allowed = (url.protocol === "http:" || url.protocol === "https:")
  && (host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]" || host.startsWith("127."));
if (!allowed) {
  console.error("FAIL: only localhost/127.0.0.1/[::1] embedding endpoints are allowed.");
  process.exit(2);
}
'

printf 'CareVault local embedding RAG smoke\n'
printf 'Endpoint: %s\n' "$CAREVAULT_RAG_EMBEDDING_ENDPOINT"
printf 'Model: %s\n' "$CAREVAULT_RAG_EMBEDDING_MODEL"

cd "$ROOT_DIR"
npm test -- src/documentRagEmbeddingRequest.live.test.ts
