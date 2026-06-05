#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_VITE_PATTERN="$ROOT_DIR/node_modules/.bin/vite"
PROJECT_TAURI_PATTERN="$ROOT_DIR/node_modules/.bin/tauri dev"
PROJECT_DEBUG_PATTERN="$ROOT_DIR/src-tauri/target/debug/carevault"
RELEASE_APP_PATTERN="$ROOT_DIR/src-tauri/target/release/bundle/macos/CareVault.app/Contents/MacOS/carevault"

failures=0

print_section() {
  printf '%s\n' "$1"
}

report_failure() {
  failures=$((failures + 1))
  printf 'FAIL: %s\n' "$1"
}

report_pass() {
  printf 'PASS: %s\n' "$1"
}

matching_processes() {
  local pattern="$1"
  ps -axo pid=,ppid=,command= | grep -F "$pattern" | grep -v 'grep -F' || true
}

matching_processes_command_word() {
  local pattern="$1"
  ps -axo pid=,ppid=,command= | awk -v pattern="$pattern" '{ if ($3 != "awk" && (index($0, pattern " ") || substr($0, length($0) - length(pattern) + 1) == pattern)) print }'
}

port_1420_listeners="$(lsof -nP -iTCP:1420 -sTCP:LISTEN 2>/dev/null || true)"
release_processes="$(matching_processes "$RELEASE_APP_PATTERN")"
debug_processes="$(matching_processes_command_word "$PROJECT_DEBUG_PATTERN")"
tauri_processes="$(matching_processes "$PROJECT_TAURI_PATTERN")"
vite_processes="$(matching_processes_command_word "$PROJECT_VITE_PATTERN")"

print_section "CareVault runtime doctor"
printf 'Project: %s\n' "$ROOT_DIR"

if [[ -n "$port_1420_listeners" ]]; then
  report_failure "port 1420 is already listening"
  printf '%s\n' "$port_1420_listeners"
else
  report_pass "port 1420 is free"
fi

if [[ -n "$release_processes" ]]; then
  report_failure "installed/release CareVault.app process is running and can shadow dev-window evidence"
  printf '%s\n' "$release_processes"
else
  report_pass "no installed/release CareVault.app process is running"
fi

if [[ -n "$debug_processes" || -n "$tauri_processes" || -n "$vite_processes" ]]; then
  report_failure "existing CareVault dev processes are running"
  [[ -z "$tauri_processes" ]] || printf '%s\n' "$tauri_processes"
  [[ -z "$vite_processes" ]] || printf '%s\n' "$vite_processes"
  [[ -z "$debug_processes" ]] || printf '%s\n' "$debug_processes"
else
  report_pass "no CareVault dev processes are running"
fi

if [[ "$failures" -gt 0 ]]; then
  printf 'Runtime is not clean for current-source desktop verification.\n'
  exit 1
fi

printf 'Runtime is clean for current-source desktop verification.\n'
