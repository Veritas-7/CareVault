#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const requiredReviewedArtifacts = [
  ["clinical-review-packet", "clinical-review-packet.md"],
  ["clinical-workflow-review-packet", "clinical-workflow-review-packet.md"],
  ["clinical-source-url-smoke-report", "clinical-source-url-smoke-report.json"],
  ["objective-readiness-report", "objective-readiness-report.md"],
];

function fail(message) {
  console.error(message);
  process.exit(2);
}

function isSha256Hex(value) {
  return typeof value === "string" && /^[a-f0-9]{64}$/i.test(value);
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function readJson(path, label) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    fail(`FAIL: Configured ${label} must be valid JSON.`);
  }
}

function assertReadableDirectory(path) {
  try {
    if (!statSync(path).isDirectory()) {
      fail("FAIL: configured external review packet dir is not readable.");
    }
  } catch {
    fail("FAIL: configured external review packet dir is not readable.");
  }
}

function readPacketFile(packetDir, filename) {
  try {
    return readFileSync(join(packetDir, filename));
  } catch {
    fail("FAIL: external review packet is missing required reviewer artifact files.");
  }
}

const [reportPath, packetDir] = process.argv.slice(2);

if (!reportPath || !packetDir) {
  fail("FAIL: external review report path and packet dir are required.");
}

assertReadableDirectory(packetDir);

const report = readJson(reportPath, "external review report");
const reviewedArtifacts = Array.isArray(report?.reviewed_artifacts)
  ? report.reviewed_artifacts
  : [];

const comparableArtifacts = new Map();
for (const [id] of requiredReviewedArtifacts) {
  const artifact = reviewedArtifacts.find((candidate) => candidate?.id === id);
  if (
    !artifact
    || artifact.status !== "reviewed"
    || !isSha256Hex(artifact.sha256)
    || !isPositiveInteger(artifact.bytes)
  ) {
    // Defer schema/shape errors to the existing objective-readiness gate so
    // its more specific failure messages stay stable.
    process.exit(0);
  }
  comparableArtifacts.set(id, artifact);
}

for (const [id, filename] of requiredReviewedArtifacts) {
  const artifact = comparableArtifacts.get(id);
  const bytes = readPacketFile(packetDir, filename);
  const expectedSha256 = createHash("sha256").update(bytes).digest("hex");
  if (artifact.sha256 !== expectedSha256 || artifact.bytes !== bytes.length) {
    fail("FAIL: external review artifact hashes must match the current reviewer packet files.");
  }
}

console.error("External review artifact hashes match reviewer packet files.");
