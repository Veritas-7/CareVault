#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT="$ROOT_DIR/scripts/smoke_hwp_sample.sh"
TMP_DIR="$(mktemp -d)"

trap 'rm -rf "$TMP_DIR"' EXIT

FAKE_BIN="$TMP_DIR/bin"
SAMPLES_DIR="$TMP_DIR/private samples"
CARGO_LOG="$TMP_DIR/cargo.log"
mkdir -p "$FAKE_BIN" "$SAMPLES_DIR"

cat > "$FAKE_BIN/cargo" <<'EOF'
#!/usr/bin/env bash
printf '%s\n' "$(basename "$CAREVAULT_HWP_SAMPLE_PATH")" >> "$CAREVAULT_HWP_SMOKE_FAKE_CARGO_LOG"
exit 0
EOF
chmod +x "$FAKE_BIN/cargo"

touch "$SAMPLES_DIR/01-follow-up.HWP"
touch "$SAMPLES_DIR/02-lab.hwpx"
touch "$SAMPLES_DIR/03-note.hwpml"
touch "$SAMPLES_DIR/ignore.txt"

run_smoke() {
  local output_file="$1"
  shift

  PATH="$FAKE_BIN:$PATH" \
    CAREVAULT_HWP_SMOKE_FAKE_CARGO_LOG="$CARGO_LOG" \
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

expect_success() {
  local name="$1"
  shift
  local output_file="$TMP_DIR/$name.out"

  : > "$CARGO_LOG"
  if ! run_smoke "$output_file" "$@"; then
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

  : > "$CARGO_LOG"
  if run_smoke "$output_file" "$@"; then
    printf 'Expected failure for %s\n' "$name" >&2
    cat "$output_file" >&2
    exit 1
  fi
  printf 'PASS: %s\n' "$name"
}

CAREVAULT_HWP_SAMPLE_DIR="$SAMPLES_DIR" expect_success "directory-batch"
assert_contains "$TMP_DIR/directory-batch.out" "Samples: 3"
assert_contains "$TMP_DIR/directory-batch.out" "Sample: 01-follow-up.HWP"
assert_contains "$TMP_DIR/directory-batch.out" "Sample: 02-lab.hwpx"
assert_contains "$TMP_DIR/directory-batch.out" "Sample: 03-note.hwpml"
assert_not_contains "$TMP_DIR/directory-batch.out" "$SAMPLES_DIR"
if [[ "$(wc -l < "$CARGO_LOG" | tr -d ' ')" != "3" ]]; then
  printf 'Expected fake cargo to run three times.\n' >&2
  cat "$CARGO_LOG" >&2
  exit 1
fi

CAREVAULT_HWP_SAMPLE_PATH="$SAMPLES_DIR/02-lab.hwpx" expect_success "single-file"
assert_contains "$TMP_DIR/single-file.out" "Samples: 1"
assert_contains "$TMP_DIR/single-file.out" "Sample: 02-lab.hwpx"
assert_not_contains "$TMP_DIR/single-file.out" "$SAMPLES_DIR"

EMPTY_DIR="$TMP_DIR/empty"
mkdir -p "$EMPTY_DIR"
CAREVAULT_HWP_SAMPLE_DIR="$EMPTY_DIR" expect_failure "empty-directory"
assert_contains "$TMP_DIR/empty-directory.out" "no .hwp/.hwpx/.hwpml files"

CAREVAULT_HWP_SAMPLE_PATH="$SAMPLES_DIR/ignore.txt" expect_failure "unsupported-extension"
assert_contains "$TMP_DIR/unsupported-extension.out" "sample must use .hwp, .hwpx, or .hwpml extension: ignore.txt"
assert_not_contains "$TMP_DIR/unsupported-extension.out" "$SAMPLES_DIR"

CAREVAULT_HWP_SAMPLE_PATH="$SAMPLES_DIR/02-lab.hwpx" \
  CAREVAULT_HWP_SAMPLE_DIR="$SAMPLES_DIR" \
  expect_failure "path-and-dir-conflict"
assert_contains "$TMP_DIR/path-and-dir-conflict.out" "set only one of CAREVAULT_HWP_SAMPLE_PATH or CAREVAULT_HWP_SAMPLE_DIR"

expect_failure "missing-input"
assert_contains "$TMP_DIR/missing-input.out" "CAREVAULT_HWP_SAMPLE_PATH or CAREVAULT_HWP_SAMPLE_DIR is required"

printf 'HWP/HWPX sample smoke fixture tests passed.\n'
