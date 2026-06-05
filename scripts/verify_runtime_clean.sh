#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_VITE_PATTERN="$ROOT_DIR/node_modules/.bin/vite"
PROJECT_TAURI_PATTERN="$ROOT_DIR/node_modules/.bin/tauri dev"
PROJECT_DEBUG_PATTERN="$ROOT_DIR/src-tauri/target/debug/carevault"
PROJECT_DEBUG_RELATIVE_PATTERN="target/debug/carevault"
RELEASE_APP_PATTERN="$ROOT_DIR/src-tauri/target/release/bundle/macos/CareVault.app/Contents/MacOS/carevault"

failures=0
mode="clean"

print_usage() {
  cat <<'EOF'
Usage:
  scripts/verify_runtime_clean.sh [--expect-clean]
  scripts/verify_runtime_clean.sh --expect-dev

Modes:
  --expect-clean  Require no port 1420 listener and no CareVault dev/release process.
  --expect-dev    Require current-source Tauri dev to be active and no release app shadow.
EOF
}

case "${1:---expect-clean}" in
  --expect-clean | --clean)
    mode="clean"
    ;;
  --expect-dev | --dev)
    mode="dev"
    ;;
  -h | --help)
    print_usage
    exit 0
    ;;
  *)
    print_usage
    exit 2
    ;;
esac

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

process_pids() {
  printf '%s\n' "$1" | awk 'NF { print $1 }'
}

print_processes_if_any() {
  local processes="$1"
  [[ -z "$processes" ]] || printf '%s\n' "$processes"
}

port_1420_listeners="$(lsof -nP -iTCP:1420 -sTCP:LISTEN 2>/dev/null || true)"
release_processes="$(matching_processes "$RELEASE_APP_PATTERN")"
debug_processes="$(
  {
    matching_processes_command_word "$PROJECT_DEBUG_PATTERN"
    matching_processes_command_word "$PROJECT_DEBUG_RELATIVE_PATTERN"
  } | awk '!seen[$0]++'
)"
tauri_processes="$(matching_processes "$PROJECT_TAURI_PATTERN")"
vite_processes="$(matching_processes_command_word "$PROJECT_VITE_PATTERN")"
port_1420_listener_pids="$(printf '%s\n' "$port_1420_listeners" | awk 'NR > 1 { print $2 }')"
vite_pids="$(process_pids "$vite_processes")"
port_uses_project_vite="false"

for port_pid in $port_1420_listener_pids; do
  if printf '%s\n' "$vite_pids" | grep -qx "$port_pid"; then
    port_uses_project_vite="true"
  fi
done

print_section "CareVault runtime doctor"
printf 'Project: %s\n' "$ROOT_DIR"
printf 'Mode: %s\n' "$mode"

if [[ "$mode" == "clean" ]]; then
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
    print_processes_if_any "$tauri_processes"
    print_processes_if_any "$vite_processes"
    print_processes_if_any "$debug_processes"
  else
    report_pass "no CareVault dev processes are running"
  fi
else
  if [[ -n "$release_processes" ]]; then
    report_failure "installed/release CareVault.app process is running and can shadow dev-window evidence"
    printf '%s\n' "$release_processes"
  else
    report_pass "no installed/release CareVault.app process is running"
  fi

  if [[ -z "$port_1420_listeners" ]]; then
    report_failure "port 1420 is not listening"
  elif [[ "$port_uses_project_vite" == "true" ]]; then
    report_pass "port 1420 is served by this project's Vite process"
    printf '%s\n' "$port_1420_listeners"
  else
    report_failure "port 1420 is listening but not by this project's Vite process"
    printf '%s\n' "$port_1420_listeners"
  fi

  if [[ -n "$tauri_processes" ]]; then
    report_pass "this project's Tauri dev CLI is running"
    printf '%s\n' "$tauri_processes"
  else
    report_failure "this project's Tauri dev CLI is not running"
  fi

  if [[ -n "$vite_processes" ]]; then
    report_pass "this project's Vite process is running"
    printf '%s\n' "$vite_processes"
  else
    report_failure "this project's Vite process is not running"
  fi

  if [[ -n "$debug_processes" ]]; then
    report_pass "this project's debug CareVault binary is running"
    printf '%s\n' "$debug_processes"
  else
    report_failure "this project's debug CareVault binary is not running"
  fi
fi

if [[ "$failures" -gt 0 ]]; then
  if [[ "$mode" == "clean" ]]; then
    printf 'Runtime is not clean for current-source desktop verification.\n'
  else
    printf 'Runtime is not a verified active current-source Tauri dev session.\n'
  fi
  exit 1
fi

if [[ "$mode" == "clean" ]]; then
  printf 'Runtime is clean for current-source desktop verification.\n'
else
  printf 'Runtime is an active current-source Tauri dev session with no release-app shadow.\n'
fi
