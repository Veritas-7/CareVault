#!/usr/bin/env bash

set -euo pipefail

print_usage() {
  cat <<'EOF'
Usage:
  CAREVAULT_OBJECTIVE_READINESS_INPUTS_JSON_PATH=/tmp/carevault-readiness-inputs.json \
  npm run objective:readiness:inputs:verify

This command verifies a previously written objective-readiness input doctor JSON
report. It checks schema, path-safety, input-state consistency, blocker
consistency, next-action consistency, and ready-state final gate consistency.
It does not create private HWP evidence or external clinical approval.
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

if [[ -z "${CAREVAULT_OBJECTIVE_READINESS_INPUTS_JSON_PATH:-}" ]]; then
  printf 'FAIL: CAREVAULT_OBJECTIVE_READINESS_INPUTS_JSON_PATH is required.\n' >&2
  print_usage >&2
  exit 2
fi

if [[ ! -r "$CAREVAULT_OBJECTIVE_READINESS_INPUTS_JSON_PATH" ]]; then
  printf 'FAIL: inputs doctor JSON is not readable.\n' >&2
  exit 2
fi

if grep -q -E '/Users/|[A-Za-z]:\\|attachmentPath|private-carevault' "$CAREVAULT_OBJECTIVE_READINESS_INPUTS_JSON_PATH"; then
  printf 'FAIL: inputs doctor JSON contains a local path or attachment path field.\n' >&2
  exit 2
fi

python3 - "$CAREVAULT_OBJECTIVE_READINESS_INPUTS_JSON_PATH" <<'PY'
import json
import pathlib
import sys

path = pathlib.Path(sys.argv[1])


def fail(message: str) -> None:
    print(f"FAIL: {message}", file=sys.stderr)
    raise SystemExit(2)


try:
    report = json.loads(path.read_text())
except Exception:
    fail("inputs doctor JSON must be valid JSON.")

expected_schema = "carevault-objective-readiness-inputs-doctor.v1"
if report.get("schema") != expected_schema:
    fail("inputs doctor JSON schema is unsupported.")

allowed_statuses = {
    "missing-evidence",
    "partial-evidence",
    "ready",
    "invalid-evidence",
}
status = report.get("status")
if status not in allowed_statuses:
    fail("inputs doctor JSON status is unsupported.")

allowed_hwp_statuses = {"missing", "accepted", "rejected"}
allowed_packet_statuses = {"missing", "present", "accepted", "rejected"}
allowed_external_statuses = {
    "missing",
    "waiting-for-packet",
    "accepted",
    "rejected",
}
allowed_final_statuses = {"not-ready", "pass", "rejected"}

inputs = report.get("evidence_inputs")
if not isinstance(inputs, dict):
    fail("inputs doctor JSON evidence_inputs must be an object.")

hwp_status = inputs.get("hwp_smoke_report")
packet_status = inputs.get("external_review_packet")
external_status = inputs.get("external_review_report")
final_status = report.get("final_readiness_gate")

if hwp_status not in allowed_hwp_statuses:
    fail("inputs doctor JSON HWP status is unsupported.")
if packet_status not in allowed_packet_statuses:
    fail("inputs doctor JSON external packet status is unsupported.")
if external_status not in allowed_external_statuses:
    fail("inputs doctor JSON external report status is unsupported.")
if final_status not in allowed_final_statuses:
    fail("inputs doctor JSON final readiness gate is unsupported.")

if report.get("input_paths_included") is not False:
    fail("inputs doctor JSON must keep input_paths_included false.")

blocking = report.get("blocking_requirements")
if not isinstance(blocking, list) or not all(isinstance(item, str) for item in blocking):
    fail("inputs doctor JSON blocking_requirements must be a string array.")

expected_blocking = []
if hwp_status != "accepted":
    expected_blocking.append("real-private-hwp-hwpx-sample")
if packet_status != "accepted" or external_status != "accepted":
    expected_blocking.append("external-clinician-source-review")
if final_status == "pass":
    expected_blocking = []
if blocking != expected_blocking:
    fail("inputs doctor JSON blockers do not match accepted input states.")

if status == "ready":
    if final_status != "pass":
        fail("ready inputs JSON must have final_readiness_gate pass.")
    if blocking:
        fail("ready inputs JSON must not list blocking requirements.")
elif status == "missing-evidence":
    if final_status != "not-ready":
        fail("missing-evidence inputs JSON must have final_readiness_gate not-ready.")
elif status == "invalid-evidence":
    if "rejected" not in {hwp_status, packet_status, external_status, final_status}:
        fail("invalid-evidence inputs JSON must include a rejected input or final gate.")

actions = report.get("next_required_actions")
if not isinstance(actions, list):
    fail("inputs doctor JSON next_required_actions must be an array.")
if status == "ready" and actions:
    fail("ready inputs JSON must not list next required actions.")
if status != "ready" and not actions:
    fail("blocked inputs JSON must list next required actions.")

allowed_action_ids = {
    "run-real-private-hwp-smoke",
    "rerun-real-private-hwp-smoke",
    "complete-external-clinician-source-review",
    "provide-external-review-packet",
    "rerun-external-clinician-source-review",
}
action_ids = []
for action in actions:
    if not isinstance(action, dict):
        fail("inputs doctor JSON next actions must be objects.")
    action_id = action.get("id")
    action_ids.append(action_id)
    if action_id not in allowed_action_ids:
        fail("inputs doctor JSON contains an unsupported next action id.")
    if action.get("blocking_requirement") not in {
        "real-private-hwp-hwpx-sample",
        "external-clinician-source-review",
    }:
        fail("inputs doctor JSON next actions must name a known blocker.")
    commands = action.get("commands")
    required_env = action.get("required_env")
    if not isinstance(commands, list) or not commands or not all(isinstance(item, str) for item in commands):
        fail("inputs doctor JSON next actions must list command names.")
    if not isinstance(required_env, list) or not required_env or not all(isinstance(item, str) for item in required_env):
        fail("inputs doctor JSON next actions must list required env names.")

if hwp_status != "accepted" and not any(
    action_id in {"run-real-private-hwp-smoke", "rerun-real-private-hwp-smoke"}
    for action_id in action_ids
):
    fail("inputs doctor JSON must include an HWP next action when HWP evidence is not accepted.")
if (
    packet_status != "accepted" or external_status != "accepted"
) and not any(
    action_id in {
        "complete-external-clinician-source-review",
        "provide-external-review-packet",
        "rerun-external-clinician-source-review",
    }
    for action_id in action_ids
):
    fail("inputs doctor JSON must include an external review next action when external review evidence is not accepted.")

blockers_text = ", ".join(blocking) if blocking else "none"
actions_text = ", ".join(action_ids) if action_ids else "none"
print("Objective readiness inputs JSON verified.")
print(f"Status: {status}")
print(f"Blocking requirements: {blockers_text}")
print(f"Next actions: {actions_text}")
PY
