import { describe, expect, it } from "vitest";
import {
  buildNormalizedMirrorStatements,
  type NormalizedCareVaultMirror,
  parseSqlCount,
} from "./storage";

const mirror: NormalizedCareVaultMirror = {
  profile: {
    name: "테스트 사용자",
    age: "58",
    sex: "female",
    heightCm: "164",
    weightKg: "62",
    cancerCareMode: true,
    diabetes: true,
    hypertension: false,
  },
  vitals: [
    {
      id: "bp-1",
      date: "2026-06-03",
      type: "blood-pressure",
      systolic: 132,
      diastolic: 84,
      note: "아침",
    },
  ],
  visits: [
    {
      id: "visit-1",
      date: "2026-06-03",
      hospital: "종양내과",
      reason: "정기 추적",
      summary: "검사 확인",
      plan: "2주 뒤 재검",
      nextDate: "2026-06-17",
    },
  ],
  documents: [
    {
      id: "doc-1",
      date: "2026-06-03",
      title: "혈액검사",
      category: "lab",
      body: "WBC 확인",
      tags: "혈액검사",
      reviewStatus: "care-question",
      nextAction: "감염 주의 기준 질문",
      attachmentName: "blood.png",
      attachmentStorage: "tauri-sandbox",
      attachmentStatus: "파일 확인됨",
      isDeleted: false,
    },
    {
      id: "doc-2",
      date: "2026-06-01",
      title: "이전 메모",
      category: "visit-note",
      body: "복구 가능",
      tags: "보관",
      reviewStatus: "done",
      nextAction: "",
      isDeleted: true,
    },
  ],
  foodCheck: {
    id: "current",
    query: "브로콜리, 베이컨",
    level: "watch",
    label: "제한 또는 소량 권장",
    summary: "가공육 포함",
    matchesJson: '[{"term":"베이컨"}]',
  },
};

describe("storage normalized mirror", () => {
  it("normalizes SQLite count return values", () => {
    expect(parseSqlCount(3)).toBe(3);
    expect(parseSqlCount("4")).toBe(4);
    expect(parseSqlCount(BigInt(5))).toBe(5);
    expect(parseSqlCount(null)).toBe(0);
    expect(parseSqlCount("not-a-count")).toBe(0);
  });

  it("builds normalized table creation and mirror statements", () => {
    const statements = buildNormalizedMirrorStatements(mirror, "2026-06-03T00:00:00.000Z");
    const sql = statements.map((statement) => statement.query).join("\n");

    expect(sql).toContain("CREATE TABLE IF NOT EXISTS profile_snapshot");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS vitals");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS visits");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS care_documents");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS food_checks");
    expect(statements.filter((statement) => statement.query.includes("INSERT INTO vitals"))).toHaveLength(1);
    expect(statements.filter((statement) => statement.query.includes("INSERT INTO visits"))).toHaveLength(1);
    expect(
      statements.filter((statement) => statement.query.includes("INSERT INTO care_documents")),
    ).toHaveLength(2);
    expect(
      statements.find((statement) => statement.query.includes("INSERT INTO profile_snapshot"))
        ?.bindValues,
    ).toContain(1);
    expect(
      statements.find(
        (statement) =>
          statement.query.includes("INSERT INTO care_documents") &&
          statement.bindValues?.[0] === "doc-2",
      )?.bindValues,
    ).toContain(1);
  });
});
