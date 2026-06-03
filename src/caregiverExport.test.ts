import { describe, expect, it } from "vitest";
import { buildCaregiverExportHtml, type CaregiverExportState } from "./caregiverExport";

const state: CaregiverExportState = {
  profile: {
    name: "QA 사용자",
    age: "56",
    sex: "female",
    heightCm: "164",
    weightKg: "62",
  },
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
      title: '검사 결과 "A"',
      category: "lab",
      reviewStatus: "needs-review",
      nextAction: "다음 진료 질문",
      attachmentName: "result.pdf",
      attachmentStatus: "파일 확인됨",
    },
  ],
  symptoms: [
    {
      date: "2026-06-03",
      symptom: "오심",
      severity: 5,
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

describe("caregiverExport", () => {
  it("builds a read-only caregiver HTML summary", () => {
    const html = buildCaregiverExportHtml(state, "2026-06-03T10:00:00.000Z");

    expect(html).toContain("<title>CareVault 보호자 공유본</title>");
    expect(html).toContain("서울암센터");
    expect(html).toContain("오심 조절을 어떻게 볼까요?");
    expect(html).toContain("첨부 파일명: result.pdf");
    expect(html).toContain("진단, 처방, 치료 지시가 아니며");
  });

  it("escapes HTML and excludes local file paths", () => {
    const html = buildCaregiverExportHtml(
      {
        ...state,
        profile: { ...state.profile, name: "<script>alert(1)</script>" },
      },
      "2026-06-03T10:00:00.000Z",
    );

    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).toContain("검사 결과 &quot;A&quot;");
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).not.toContain("/tmp/");
    expect(html).not.toContain("attachmentPath");
  });
});
