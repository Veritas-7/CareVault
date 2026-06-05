#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT="$ROOT_DIR/scripts/verify_runtime_clean.sh"
TMP_DIR="$(mktemp -d)"

trap 'rm -rf "$TMP_DIR"' EXIT

FAKE_BIN="$TMP_DIR/bin"
FAKE_PS="$TMP_DIR/ps.txt"
FAKE_LSOF="$TMP_DIR/lsof.txt"
mkdir -p "$FAKE_BIN"

cat > "$FAKE_BIN/ps" <<'EOF'
#!/usr/bin/env bash
cat "$CAREVAULT_RUNTIME_DOCTOR_FAKE_PS"
EOF

cat > "$FAKE_BIN/lsof" <<'EOF'
#!/usr/bin/env bash
if [[ -s "$CAREVAULT_RUNTIME_DOCTOR_FAKE_LSOF" ]]; then
  cat "$CAREVAULT_RUNTIME_DOCTOR_FAKE_LSOF"
  exit 0
fi
exit 1
EOF

chmod +x "$FAKE_BIN/ps" "$FAKE_BIN/lsof"

TAURI_PROCESS="111 1 node $ROOT_DIR/node_modules/.bin/tauri dev"
VITE_PROCESS="222 111 node $ROOT_DIR/node_modules/.bin/vite"
DEBUG_PROCESS="333 111 target/debug/carevault"
RELEASE_PROCESS="444 1 $ROOT_DIR/src-tauri/target/release/bundle/macos/CareVault.app/Contents/MacOS/carevault"
LSOF_HEADER="COMMAND   PID USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME"
LSOF_VITE="node    222   wj   17u  IPv4 0x0000000000000000      0t0  TCP 127.0.0.1:1420 (LISTEN)"
LSOF_OTHER="node    999   wj   17u  IPv4 0x0000000000000000      0t0  TCP 127.0.0.1:1420 (LISTEN)"

write_fixture() {
  local ps_fixture="$1"
  local lsof_fixture="$2"

  printf '%s' "$ps_fixture" > "$FAKE_PS"
  printf '%s' "$lsof_fixture" > "$FAKE_LSOF"
}

run_doctor() {
  local output_file="$1"
  shift

  PATH="$FAKE_BIN:$PATH" \
    CAREVAULT_RUNTIME_DOCTOR_FAKE_PS="$FAKE_PS" \
    CAREVAULT_RUNTIME_DOCTOR_FAKE_LSOF="$FAKE_LSOF" \
    "$SCRIPT" "$@" > "$output_file" 2>&1
}

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

expect_success() {
  local name="$1"
  shift
  local output_file="$TMP_DIR/$name.out"

  if ! run_doctor "$output_file" "$@"; then
    printf 'Expected success for %s\n' "$name" >&2
    cat "$output_file" >&2
    exit 1
  fi
  printf 'PASS: %s\n' "$name"
}

expect_failure() {
  local name="$1"
  shift
  local output_file="$TMP_DIR/$name.out"

  if run_doctor "$output_file" "$@"; then
    printf 'Expected failure for %s\n' "$name" >&2
    cat "$output_file" >&2
    exit 1
  fi
  printf 'PASS: %s\n' "$name"
}

write_fixture "" ""
expect_success "clean-empty-runtime" --expect-clean
assert_contains "$TMP_DIR/clean-empty-runtime.out" "Runtime is clean for current-source desktop verification."

write_fixture "$TAURI_PROCESS
$VITE_PROCESS
$DEBUG_PROCESS
" "$LSOF_HEADER
$LSOF_VITE
"
expect_success "dev-current-source-runtime" --expect-dev
assert_contains "$TMP_DIR/dev-current-source-runtime.out" "Runtime is an active current-source Tauri dev session with no release-app shadow."

write_fixture "$TAURI_PROCESS
$VITE_PROCESS
$DEBUG_PROCESS
$RELEASE_PROCESS
" "$LSOF_HEADER
$LSOF_VITE
"
expect_failure "dev-release-shadow" --expect-dev
assert_contains "$TMP_DIR/dev-release-shadow.out" "installed/release CareVault.app process is running"

write_fixture "$TAURI_PROCESS
$VITE_PROCESS
$DEBUG_PROCESS
" "$LSOF_HEADER
$LSOF_OTHER
"
expect_failure "dev-port-owner-mismatch" --expect-dev
assert_contains "$TMP_DIR/dev-port-owner-mismatch.out" "port 1420 is listening but not by this project's Vite process"

write_fixture "$DEBUG_PROCESS
" ""
expect_failure "clean-relative-debug-detected" --expect-clean
assert_contains "$TMP_DIR/clean-relative-debug-detected.out" "existing CareVault dev processes are running"
assert_contains "$TMP_DIR/clean-relative-debug-detected.out" "target/debug/carevault"

printf 'Runtime doctor fixture tests passed.\n'
