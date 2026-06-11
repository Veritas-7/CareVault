import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildAppStateTableStatement,
  buildAppStateUpsertStatement,
  buildNormalizedMirrorDataStatements,
  buildNormalizedMirrorStatements,
  buildNormalizedSearchStatements,
  buildSqliteBusyTimeoutStatement,
  buildSqlLikePattern,
  isSqliteBusyError,
  loadPersistedState,
  savePersistedState,
  type NormalizedCareVaultMirror,
  parseSqlCount,
  parseSqlCountRow,
  sqlColumnExists,
} from "./storage";

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubBrowserLocalStorage(storage: Pick<Storage, "getItem" | "setItem">) {
  vi.stubGlobal("window", { localStorage: storage });
  vi.stubGlobal("localStorage", storage);
}

const mirror: NormalizedCareVaultMirror = {
  profile: {
    name: "테스트 사용자",
    age: "58",
    sex: "female",
    heightCm: "164",
    weightKg: "62",
    waistCm: "82",
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
    {
      id: "temp-1",
      date: "2026-06-04",
      type: "temperature",
      temperatureC: 38.1,
      note: "오한 동반",
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
      body:
        "[첨부 텍스트 파싱: blood.hwpx · HWPX 본문 XML]\n" +
        "WBC 확인, ANC 1.1 10^3/uL, eGFR 52 mL/min/1.73m2, HbA1c 7.4%, 혈압 149/93",
      tags: "혈액검사 자궁경부암",
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
    {
      documentId: "doc-2",
      attachmentName: "saved-reconnect.png",
      attachmentStorage: "browser-reference",
      attachmentStatus: "브라우저 파일명 참조",
      isDeleted: true,
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
    {
      id: "history-doc-1-next-action",
      documentId: "doc-1",
      at: "2026-06-03T00:01:00.000Z",
      kind: "next-action",
      label: "다음 조치 변경",
      detail: "cmux direct next action",
      isDeleted: false,
    },
    {
      id: "history-doc-2-reattached",
      documentId: "doc-2",
      at: "2026-06-03T00:02:00.000Z",
      kind: "attachment-replaced",
      label: "첨부 재연결",
      detail: "saved-reconnect.png: 브라우저 파일명 참조",
      isDeleted: true,
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
      priority: "high",
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
  it("falls back to memory when browser localStorage reads are blocked", async () => {
    const fallback = { profile: "fallback" };
    const storage = {
      getItem: vi.fn(() => {
        throw new Error("blocked");
      }),
      setItem: vi.fn(),
    };
    stubBrowserLocalStorage(storage);

    await expect(loadPersistedState(fallback)).resolves.toEqual({
      state: fallback,
      backend: "memory",
    });
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("falls back to memory when browser localStorage writes are blocked during load", async () => {
    const fallback = { profile: "fallback" };
    const storage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(() => {
        throw new Error("quota exceeded");
      }),
    };
    stubBrowserLocalStorage(storage);

    await expect(loadPersistedState(fallback)).resolves.toEqual({
      state: fallback,
      backend: "memory",
    });
    expect(storage.setItem).toHaveBeenCalledWith("carevault.v1", JSON.stringify(fallback));
  });

  it("initializes missing browser localStorage with the fallback state during load", async () => {
    const fallback = { profile: "fallback" };
    const storage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    };
    stubBrowserLocalStorage(storage);

    await expect(loadPersistedState(fallback)).resolves.toEqual({
      state: fallback,
      backend: "localStorage",
    });
    expect(storage.setItem).toHaveBeenCalledWith("carevault.v1", JSON.stringify(fallback));
  });

  it("replaces invalid browser localStorage JSON with the fallback state during load", async () => {
    const fallback = { profile: "fallback" };
    const storage = {
      getItem: vi.fn(() => "{invalid-json"),
      setItem: vi.fn(),
    };
    stubBrowserLocalStorage(storage);

    await expect(loadPersistedState(fallback)).resolves.toEqual({
      state: fallback,
      backend: "localStorage",
    });
    expect(storage.setItem).toHaveBeenCalledWith("carevault.v1", JSON.stringify(fallback));
  });

  it("falls back to memory when browser localStorage writes are blocked during save", async () => {
    const state = { profile: "saved" };
    const storage = {
      getItem: vi.fn(),
      setItem: vi.fn(() => {
        throw new Error("quota exceeded");
      }),
    };
    stubBrowserLocalStorage(storage);

    await expect(savePersistedState(state)).resolves.toBe("memory");
    expect(storage.setItem).toHaveBeenCalledWith("carevault.v1", JSON.stringify(state));
  });

  it("normalizes SQLite count return values", () => {
    expect(parseSqlCount(3)).toBe(3);
    expect(parseSqlCount("4")).toBe(4);
    expect(parseSqlCount(" 6 ")).toBe(6);
    expect(parseSqlCount(BigInt(5))).toBe(5);
    expect(parseSqlCount(-1)).toBe(0);
    expect(parseSqlCount(1.5)).toBe(0);
    expect(parseSqlCount(Number.MAX_SAFE_INTEGER + 1)).toBe(0);
    expect(parseSqlCount(BigInt(-1))).toBe(0);
    expect(parseSqlCount(BigInt(Number.MAX_SAFE_INTEGER) + BigInt(1))).toBe(0);
    expect(parseSqlCount(null)).toBe(0);
    expect(parseSqlCount("not-a-count")).toBe(0);
    expect(parseSqlCount("4 rows")).toBe(0);
    expect(parseSqlCount("4.5")).toBe(0);
    expect(parseSqlCount("-1")).toBe(0);
  });

  it("normalizes SQLite count result rows defensively", () => {
    expect(parseSqlCountRow([{ count: "7" }])).toBe(7);
    expect(parseSqlCountRow([{ count: BigInt(8) }])).toBe(8);
    expect(parseSqlCountRow([])).toBe(0);
    expect(parseSqlCountRow(null)).toBe(0);
    expect(parseSqlCountRow({ count: 4 })).toBe(0);
    expect(parseSqlCountRow(["bad-row"])).toBe(0);
    expect(parseSqlCountRow([[{ count: 9 }]])).toBe(0);
  });

  it("checks SQLite schema columns defensively", () => {
    expect(sqlColumnExists([{ name: "waist_cm" }], "waist_cm")).toBe(true);
    expect(sqlColumnExists([{ name: "temperature_c" }], "waist_cm")).toBe(false);
    expect(sqlColumnExists([], "waist_cm")).toBe(false);
    expect(sqlColumnExists(null, "waist_cm")).toBe(false);
    expect(sqlColumnExists({ name: "waist_cm" }, "waist_cm")).toBe(false);
    expect(sqlColumnExists(["bad-row"], "waist_cm")).toBe(false);
    expect(sqlColumnExists([[{ name: "waist_cm" }]], "waist_cm")).toBe(false);
  });

  it("builds escaped SQLite LIKE patterns", () => {
    expect(buildSqlLikePattern(" WBC_100% ")).toBe("%WBC\\_100\\%%");
    expect(buildSqlLikePattern("")).toBeNull();
  });

  it("builds the main app state table before SQLite load/save", () => {
    const statement = buildAppStateTableStatement();

    expect(statement.query).toContain("CREATE TABLE IF NOT EXISTS app_state");
    expect(statement.query).toContain("key TEXT PRIMARY KEY NOT NULL");
    expect(statement.query).toContain("value TEXT NOT NULL");
    expect(statement.query).toContain("updated_at TEXT NOT NULL");
  });

  it("builds a SQLite busy timeout statement for Tauri database connections", () => {
    expect(buildSqliteBusyTimeoutStatement()).toEqual({
      query: "PRAGMA busy_timeout = 5000",
    });
  });

  it("recognizes SQLite busy errors for bounded save retries", () => {
    expect(isSqliteBusyError(new Error("error returned from database: (code: 5) database is locked")))
      .toBe(true);
    expect(isSqliteBusyError("SQLITE_BUSY: database is locked")).toBe(true);
    expect(isSqliteBusyError(new Error("constraint failed"))).toBe(false);
    expect(isSqliteBusyError(null)).toBe(false);
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
    expect(statements.find((statement) => statement.key === "documentRows")?.query).toContain(
      "OR search_text",
    );
    expect(statements.find((statement) => statement.key === "labResultRows")?.query).toContain(
      "FROM lab_results",
    );
    expect(statements.find((statement) => statement.key === "questionRows")?.query).toContain(
      "OR priority",
    );
  });

  it("targets alias-expanded normalized document search text", () => {
    const statements = buildNormalizedSearchStatements("당화혈색소");
    const documentStatement = statements.find((statement) => statement.key === "documentRows");

    expect(documentStatement?.bindValues).toEqual(["%당화혈색소%"]);
    expect(documentStatement?.query).toContain("OR search_text");
  });

  it("builds normalized table creation and mirror statements", () => {
    const statements = buildNormalizedMirrorStatements(mirror, "2026-06-03T00:00:00.000Z");
    const sql = statements.map((statement) => statement.query).join("\n");

    expect(sql).toContain("CREATE TABLE IF NOT EXISTS profile_snapshot");
    expect(sql).toContain("waist_cm TEXT NOT NULL DEFAULT ''");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS vitals");
    expect(sql).toContain("temperature_c REAL");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS visits");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS care_documents");
    expect(sql).toContain("search_text TEXT NOT NULL DEFAULT ''");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS document_attachments");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS document_history");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS food_checks");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS symptoms");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS questions");
    expect(sql).toContain("priority TEXT NOT NULL DEFAULT 'next-visit'");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS lab_results");
    expect(statements.filter((statement) => statement.query.includes("INSERT INTO vitals"))).toHaveLength(2);
    expect(statements.filter((statement) => statement.query.includes("INSERT INTO visits"))).toHaveLength(1);
    expect(
      statements.filter((statement) => statement.query.includes("INSERT INTO care_documents")),
    ).toHaveLength(2);
    expect(
      statements.filter((statement) => statement.query.includes("INSERT INTO document_attachments")),
    ).toHaveLength(2);
    expect(
      statements.filter((statement) => statement.query.includes("INSERT INTO document_history")),
    ).toHaveLength(3);
    expect(statements.filter((statement) => statement.query.includes("INSERT INTO symptoms"))).toHaveLength(1);
    expect(statements.filter((statement) => statement.query.includes("INSERT INTO questions"))).toHaveLength(1);
    expect(
      statements.find((statement) => statement.query.includes("INSERT INTO questions"))
        ?.bindValues,
    ).toContain("high");
    expect(statements.filter((statement) => statement.query.includes("INSERT INTO lab_results"))).toHaveLength(1);
    expect(
      statements.find((statement) => statement.query.includes("INSERT INTO profile_snapshot"))
        ?.bindValues,
    ).toContain(1);
    expect(
      statements.find((statement) => statement.query.includes("INSERT INTO profile_snapshot"))
        ?.bindValues,
    ).toContain("82");
    expect(
      statements.find(
        (statement) =>
          statement.query.includes("INSERT INTO vitals") &&
          statement.bindValues?.[0] === "temp-1",
      )?.bindValues,
    ).toContain(38.1);
    expect(
      statements.find(
        (statement) =>
          statement.query.includes("INSERT INTO care_documents") &&
          statement.bindValues?.[0] === "doc-2",
      )?.bindValues,
    ).toContain(1);
    const documentSearchText = statements.find(
      (statement) =>
        statement.query.includes("INSERT INTO care_documents") &&
        statement.bindValues?.[0] === "doc-1",
    )?.bindValues?.[11];
    expect(documentSearchText).toContain("당화혈색소");
    expect(documentSearchText).toContain("혈압약");
    expect(documentSearchText).toContain("자궁경부세포검사");
    expect(documentSearchText).toContain("검사결과");
    expect(documentSearchText).toContain("ANC");
    expect(documentSearchText).toContain("eGFR");
    expect(documentSearchText).toContain("HWPX 본문 XML");
    expect(
      statements.find(
        (statement) =>
          statement.query.includes("INSERT INTO document_attachments") &&
          statement.bindValues?.[0] === "doc-2",
      )?.bindValues,
    ).toEqual([
      "doc-2",
      "saved-reconnect.png",
      "browser-reference",
      "브라우저 파일명 참조",
      1,
      "2026-06-03T00:00:00.000Z",
    ]);
    expect(
      statements.find(
        (statement) =>
          statement.query.includes("INSERT INTO document_history") &&
          statement.bindValues?.[0] === "history-doc-1-next-action",
      )?.bindValues,
    ).toEqual([
      "history-doc-1-next-action",
      "doc-1",
      "2026-06-03T00:01:00.000Z",
      "next-action",
      "다음 조치 변경",
      "cmux direct next action",
      0,
      "2026-06-03T00:00:00.000Z",
    ]);
    expect(
      statements.find(
        (statement) =>
          statement.query.includes("INSERT INTO document_history") &&
          statement.bindValues?.[0] === "history-doc-2-reattached",
      )?.bindValues,
    ).toEqual([
      "history-doc-2-reattached",
      "doc-2",
      "2026-06-03T00:02:00.000Z",
      "attachment-replaced",
      "첨부 재연결",
      "saved-reconnect.png: 브라우저 파일명 참조",
      1,
      "2026-06-03T00:00:00.000Z",
    ]);
  });

  it("builds mirror data statements without table DDL for transactional saves", () => {
    const statements = buildNormalizedMirrorDataStatements(
      mirror,
      "2026-06-03T00:00:00.000Z",
    );
    const sql = statements.map((statement) => statement.query).join("\n");

    expect(sql).not.toContain("CREATE TABLE");
    expect(statements[0].query).toContain("INSERT INTO profile_snapshot");
    expect(statements).toContainEqual({ query: "DELETE FROM care_documents" });
    expect(
      statements.find(
        (statement) =>
          statement.query.includes("INSERT INTO document_attachments") &&
          statement.bindValues?.[0] === "doc-1",
      )?.bindValues,
    ).toEqual([
      "doc-1",
      "blood.png",
      "tauri-sandbox",
      "파일 확인됨",
      0,
      "2026-06-03T00:00:00.000Z",
    ]);
  });

  it("builds an app state upsert statement for ordered SQLite saves", () => {
    const statement = buildAppStateUpsertStatement(
      { documents: [{ id: "doc-1", attachmentStatus: "파일 확인됨" }] },
      "2026-06-03T00:00:00.000Z",
    );

    expect(statement.query).toContain("INSERT INTO app_state");
    expect(statement.query).toContain("ON CONFLICT(key) DO UPDATE SET");
    expect(statement.bindValues).toEqual([
      "main",
      JSON.stringify({ documents: [{ id: "doc-1", attachmentStatus: "파일 확인됨" }] }),
      "2026-06-03T00:00:00.000Z",
    ]);
  });
});
