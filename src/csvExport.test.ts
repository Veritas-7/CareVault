import { describe, expect, it } from "vitest";
import { buildCareVaultCsv, type CsvExportState } from "./csvExport";

const state: CsvExportState = {
  profile: {
    name: "QA 사용자",
    age: "56",
    sex: "female",
    heightCm: "164",
    weightKg: "62",
    cancerCareMode: true,
    diabetes: true,
    hypertension: true,
  },
  foodQuery: "브로콜리, 현미밥",
  vitals: [
    {
      date: "2026-06-01",
      type: "blood-pressure",
      systolic: 132,
      diastolic: 84,
      note: "아침 측정",
    },
  ],
  visits: [
    {
      date: "2026-06-02",
      hospital: "서울암센터",
      reason: "항암 후 추적",
      summary: "혈액검사 예정",
      plan: "질문 정리",
      nextDate: "2026-06-10",
    },
  ],
  documents: [
    {
      date: "2026-06-03",
      title: "검사 결과",
      category: "lab",
      body: "WBC 확인",
      tags: "항암",
      reviewStatus: "needs-review",
      nextAction: "다음 진료 질문",
      attachmentName: "result.pdf",
      attachmentStatus: "파일 확인됨",
    },
  ],
  deletedDocuments: [],
  symptoms: [
    {
      date: "2026-06-03",
      symptom: "오심",
      severity: 5,
      medication: "항구토제",
      body: "식후 악화",
      action: "진료 때 확인",
    },
  ],
  questions: [
    {
      date: "2026-06-10",
      topic: "부작용",
      question: "오심 조절을 어떻게 볼까요?",
      status: "open",
      answer: "",
    },
  ],
  labResults: [
    {
      date: "2026-06-01",
      name: "WBC",
      value: "3.4",
      unit: "10^3/uL",
      lower: "4.0",
      upper: "10.0",
      note: "낮음",
    },
  ],
};

describe("csvExport", () => {
  it("builds a single spreadsheet-friendly CSV from local records", () => {
    const csv = buildCareVaultCsv(state, "2026-06-03T10:00:00.000Z");

    expect(csv).toContain('"section","date","title","value","status","detail"');
    expect(csv).toContain('"visit","2026-06-02","서울암센터","항암 후 추적","다음 예약 2026-06-10"');
    expect(csv).toContain('"lab","2026-06-01","WBC","3.4 10^3/uL","4.0~10.0","낮음"');
    expect(csv).toContain('"document","2026-06-03","검사 결과","lab","needs-review"');
  });

  it("escapes quotes and excludes local attachment paths", () => {
    const csv = buildCareVaultCsv(
      {
        ...state,
        documents: [
          {
            ...state.documents[0],
            title: '결과 "A"',
            attachmentName: "result.pdf",
          },
        ],
      },
      "2026-06-03T10:00:00.000Z",
    );

    expect(csv).toContain('"결과 ""A"""');
    expect(csv).toContain("첨부: result.pdf");
    expect(csv).not.toContain("/tmp/");
    expect(csv).not.toContain("attachmentPath");
  });
});
