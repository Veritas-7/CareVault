import { describe, expect, it } from "vitest";
import {
  buildNormalizedMirrorStatements,
  buildNormalizedSearchStatements,
  buildSqlLikePattern,
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
  documentAttachments: [
    {
      documentId: "doc-1",
      attachmentName: "blood.png",
      attachmentStorage: "tauri-sandbox",
      attachmentStatus: "파일 확인됨",
      isDeleted: false,
    },
  ],
  documentHistory: [
    {
      id: "history-doc-1-created",
      documentId: "doc-1",
      at: "2026-06-03T00:00:00.000Z",
      kind: "created",
      label: "서류 저장",
      detail: "혈액검사 기록 생성",
      isDeleted: false,
    },
  ],
  symptoms: [
    {
      id: "symptom-1",
      date: "2026-06-02",
      symptom: "오심",
      severity: 4,
      medication: "항구토제",
      body: "점심 이후 메스꺼움",
      action: "다음 진료 때 질문",
    },
  ],
  questions: [
    {
      id: "question-1",
      date: "2026-06-17",
      topic: "혈액검사",
      question: "재검 필요성 확인",
      status: "open",
      answer: "",
    },
  ],
  labResults: [
    {
      id: "lab-1",
      date: "2026-06-03",
      name: "WBC",
      value: "3.4",
      unit: "10^3/uL",
      lower: "4.0",
      upper: "10.0",
      note: "낮음",
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

  it("builds escaped SQLite LIKE patterns", () => {
    expect(buildSqlLikePattern(" WBC_100% ")).toBe("%WBC\\_100\\%%");
    expect(buildSqlLikePattern("")).toBeNull();
  });

  it("builds normalized search count statements", () => {
    const statements = buildNormalizedSearchStatements("혈액검사");

    expect(statements.map((statement) => statement.key)).toEqual([
      "vitalRows",
      "visitRows",
      "documentRows",
      "documentAttachmentRows",
      "documentHistoryRows",
      "symptomRows",
      "questionRows",
      "labResultRows",
      "foodCheckRows",
    ]);
    expect(statements.every((statement) => statement.bindValues?.[0] === "%혈액검사%")).toBe(true);
    expect(statements.find((statement) => statement.key === "documentRows")?.query).toContain(
      "FROM care_documents",
    );
    expect(statements.find((statement) => statement.key === "labResultRows")?.query).toContain(
      "FROM lab_results",
    );
  });

  it("builds normalized table creation and mirror statements", () => {
    const statements = buildNormalizedMirrorStatements(mirror, "2026-06-03T00:00:00.000Z");
    const sql = statements.map((statement) => statement.query).join("\n");

    expect(sql).toContain("CREATE TABLE IF NOT EXISTS profile_snapshot");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS vitals");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS visits");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS care_documents");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS document_attachments");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS document_history");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS food_checks");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS symptoms");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS questions");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS lab_results");
    expect(statements.filter((statement) => statement.query.includes("INSERT INTO vitals"))).toHaveLength(1);
    expect(statements.filter((statement) => statement.query.includes("INSERT INTO visits"))).toHaveLength(1);
    expect(
      statements.filter((statement) => statement.query.includes("INSERT INTO care_documents")),
    ).toHaveLength(2);
    expect(
      statements.filter((statement) => statement.query.includes("INSERT INTO document_attachments")),
    ).toHaveLength(1);
    expect(
      statements.filter((statement) => statement.query.includes("INSERT INTO document_history")),
    ).toHaveLength(1);
    expect(statements.filter((statement) => statement.query.includes("INSERT INTO symptoms"))).toHaveLength(1);
    expect(statements.filter((statement) => statement.query.includes("INSERT INTO questions"))).toHaveLength(1);
    expect(statements.filter((statement) => statement.query.includes("INSERT INTO lab_results"))).toHaveLength(1);
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
