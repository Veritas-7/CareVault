#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

print_step() {
  printf '\n== %s ==\n' "$1"
}

print_step "runtime clean preflight"
npm run runtime:doctor

print_step "attachment and archive behavior tests"
npm test -- \
  src/documentActionLabels.test.ts \
  src/attachmentRecovery.test.ts \
  src/attachmentPreview.test.ts \
  src/appStateNormalization.test.ts \
  src/storage.test.ts

print_step "current-source web build"
npm run build

print_step "Tauri desktop Rust tests"
cargo test --manifest-path src-tauri/Cargo.toml

printf '\nPASS: desktop attachment/archive readiness smoke completed.\n'
