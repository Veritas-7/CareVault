#!/usr/bin/env bash

set -euo pipefail

print_usage() {
  cat <<'EOF'
Usage:
  CAREVAULT_OBJECTIVE_READINESS_COMPLETE_VERIFY_JSON_PATH=/tmp/carevault-objective-readiness-complete-verify.json \
  npm run objective:readiness:complete:verify

This command verifies a previously written final objective-readiness completion
JSON report. It checks schema, verified-complete status, no blockers, accepted
HWP evidence summary, accepted external review summary, open-finding counts,
and local-path exclusion. It does not create private HWP evidence or external
clinical approval.
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
    print_usage >&2
    exit 2
    ;;
esac

if [[ -z "${CAREVAULT_OBJECTIVE_READINESS_COMPLETE_VERIFY_JSON_PATH:-}" ]]; then
  printf 'FAIL: CAREVAULT_OBJECTIVE_READINESS_COMPLETE_VERIFY_JSON_PATH is required.\n' >&2
  print_usage >&2
  exit 2
fi

if [[ ! -r "$CAREVAULT_OBJECTIVE_READINESS_COMPLETE_VERIFY_JSON_PATH" ]]; then
  printf 'FAIL: completion verify JSON is not readable.\n' >&2
  exit 2
fi

if grep -q -E '/Users/|[A-Za-z]:\\|attachmentPath|private-carevault' "$CAREVAULT_OBJECTIVE_READINESS_COMPLETE_VERIFY_JSON_PATH"; then
  printf 'FAIL: completion verify JSON contains a local path or attachment path field.\n' >&2
  exit 2
fi

python3 - "$CAREVAULT_OBJECTIVE_READINESS_COMPLETE_VERIFY_JSON_PATH" <<'PY'
import json
import pathlib
import sys

path = pathlib.Path(sys.argv[1])


def fail(message: str) -> None:
    print(f"FAIL: {message}", file=sys.stderr)
    raise SystemExit(2)


def require_string_array(value, message: str):
    if not isinstance(value, list) or not all(isinstance(item, str) for item in value):
        fail(message)
    return value


try:
    report = json.loads(path.read_text())
except Exception:
    fail("completion verify JSON must be valid JSON.")

if report.get("schema") != "carevault-objective-readiness-complete-verify.v1":
    fail("completion verify JSON schema is unsupported.")

if report.get("status") != "verified-complete":
    fail("completion verify JSON status must be verified-complete.")

blocking = report.get("blocking_requirements")
if blocking != []:
    fail("completion verify JSON must not list blocking requirements.")

if report.get("input_paths_included") is not False:
    fail("completion verify JSON must keep input_paths_included false.")

hwp = report.get("hwp_smoke")
if not isinstance(hwp, dict):
    fail("completion verify JSON hwp_smoke must be an object.")

sample_count = hwp.get("sample_count")
if not isinstance(sample_count, int) or sample_count <= 0:
    fail("completion verify JSON HWP sample count must be positive.")

sample_basenames = require_string_array(
    hwp.get("sample_basenames"),
    "completion verify JSON HWP sample basenames must be a string array.",
)
if len(sample_basenames) != sample_count:
    fail("completion verify JSON HWP sample count must match basenames.")
for basename in sample_basenames:
    if not basename or "/" in basename or "\\" in basename or ":" in basename:
        fail("completion verify JSON HWP sample basenames must be basename-only.")

try:
    minimum_required = int(hwp.get("minimum_parsed_chars"))
    minimum_observed = int(hwp.get("minimum_observed_parsed_chars"))
except Exception:
    fail("completion verify JSON parsed-character counts must be numeric.")
if minimum_required <= 0 or minimum_observed < minimum_required:
    fail("completion verify JSON observed parsed-character count is too low.")

expected_term_count = hwp.get("expected_term_count")
if not isinstance(expected_term_count, int) or expected_term_count < 3:
    fail("completion verify JSON expected term count must be at least 3.")

groups = hwp.get("objective_term_groups")
if not isinstance(groups, dict):
    fail("completion verify JSON objective term groups must be an object.")
for group in ("cervical_cancer", "hypertension", "diabetes"):
    if groups.get(group) is not True:
        fail("completion verify JSON must cover all objective term groups.")

external = report.get("external_review")
if not isinstance(external, dict):
    fail("completion verify JSON external_review must be an object.")

reviewer = external.get("reviewer_role")
if not isinstance(reviewer, str) or not reviewer.strip():
    fail("completion verify JSON must include reviewer role.")
reviewed_at = external.get("reviewed_at")
if not isinstance(reviewed_at, str) or not reviewed_at.strip():
    fail("completion verify JSON must include review date.")

required_checks = require_string_array(
    external.get("required_check_ids"),
    "completion verify JSON required checks must be a string array.",
)
for check_id in (
    "clinician-source-review",
    "clinical-source-url-reachability",
    "real-workflow-review",
):
    if check_id not in required_checks:
        fail("completion verify JSON must list all required check ids.")

reviewed_artifact_ids = require_string_array(
    external.get("reviewed_artifact_ids"),
    "completion verify JSON reviewed artifact ids must be a string array.",
)
for artifact_id in (
    "clinical-review-packet",
    "clinical-workflow-review-packet",
    "clinical-source-url-smoke-report",
    "objective-readiness-report",
):
    if artifact_id not in reviewed_artifact_ids:
        fail("completion verify JSON must list all reviewed artifact ids.")

counts = external.get("source_registry_counts")
if not isinstance(counts, dict):
    fail("completion verify JSON source registry counts must be an object.")
if not isinstance(counts.get("total"), int) or counts.get("total") <= 0:
    fail("completion verify JSON source registry total must be positive.")
if counts.get("errors") != 0 or counts.get("warnings") != 0:
    fail("completion verify JSON source registry counts must have zero errors and warnings.")

workflow_surface_count = external.get("workflow_surface_count")
if not isinstance(workflow_surface_count, int) or workflow_surface_count < 6:
    fail("completion verify JSON workflow surface count must be at least 6.")

open_findings = external.get("open_findings")
if not isinstance(open_findings, dict):
    fail("completion verify JSON open findings must be an object.")
if open_findings.get("critical") != 0 or open_findings.get("major") != 0:
    fail("completion verify JSON must have zero open critical and major findings.")

print("Objective readiness complete verify JSON verified.")
print("Status: verified-complete")
print("Blocking requirements: none")
print(f"Accepted HWP samples: {sample_count}")
print(f"Accepted external reviewer: {reviewer}")
PY
