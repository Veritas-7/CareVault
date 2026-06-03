import { describe, expect, it } from "vitest";
import { buildVisitPacketMarkdown, type VisitPacketState } from "./visitPacket";

const sampleState: VisitPacketState = {
  profile: {
    name: "테스트 사용자",
    age: "58",
    sex: "female",
    heightCm: "164",
    weightKg: "62",
    cancerCareMode: true,
    diabetes: true,
    hypertension: true,
  },
  vitals: [
    {
      date: "2026-06-01",
      type: "blood-pressure",
      systolic: 132,
      diastolic: 84,
      note: "아침",
    },
    {
      date: "2026-06-02",
      type: "glucose",
      glucoseMgDl: 181,
      glucoseContext: "after-meal",
      note: "점심 식후",
    },
  ],
  visits: [
    {
      date: "2026-06-03",
      hospital: "종양내과",
      reason: "정기 추적",
      summary: "검사 결과 확인",
      plan: "2주 뒤 재검",
      nextDate: "2026-06-17",
    },
  ],
  documents: [
    {
      date: "2026-06-03",
      title: "혈액검사 결과",
      category: "lab",
      body: "WBC 재확인",
      tags: "혈액검사",
      reviewStatus: "care-question",
      nextAction: "백혈구 감소 시 식사 제한 기준 질문",
      attachmentName: "blood-test.pdf",
    },
  ],
  symptoms: [
    {
      date: "2026-06-02",
      symptom: "오심",
      severity: 5,
      medication: "항구토제",
      body: "점심 이후 심함",
      action: "약 조절 질문",
    },
  ],
  questions: [
    {
      date: "2026-06-17",
      topic: "식사",
      question: "날음식 제한 기준은?",
      status: "open",
      answer: "",
    },
  ],
  labResults: [
    {
      date: "2026-06-03",
      name: "WBC",
      value: "3.4",
      unit: "10^3/uL",
      lower: "4.0",
      upper: "10.0",
      note: "면역저하 질문",
    },
  ],
};

describe("visit packet", () => {
  it("builds a clinician-facing markdown summary from tracked records", () => {
    const markdown = buildVisitPacketMarkdown(sampleState, {
      exportedAt: "2026-06-03T08:00:00.000Z",
      foodQuery: "브로콜리, 베이컨, 자몽 주스",
    });

    expect(markdown).toContain("# CareVault 진료 요약");
    expect(markdown).toContain("## 최근 혈압/혈당");
    expect(markdown).toContain("혈압 132/84 mmHg");
    expect(markdown).toContain("혈당 181 mg/dL");
    expect(markdown).toContain("WBC 3.4 10^3/uL");
    expect(markdown).toContain("[사용자 입력 기준 범위] 기준보다 낮음");
    expect(markdown).toContain("[확인 필요] 식사");
    expect(markdown).toContain("상태: 의료진 질문");
    expect(markdown).toContain("다음 조치: 백혈구 감소 시 식사 제한 기준 질문");
    expect(markdown).toContain("첨부: blood-test.pdf");
    expect(markdown).toContain("브로콜리, 베이컨, 자몽 주스");
    expect(markdown).toContain("[로컬 음식 규칙 라벨] 의료진 확인 필요");
  });

  it("keeps local attachment paths out of the exported summary", () => {
    const markdown = buildVisitPacketMarkdown(
      {
        ...sampleState,
        documents: [
          {
            ...sampleState.documents[0],
            attachmentName: "scan.pdf",
            attachmentPath: "/Users/wj/private/scan.pdf",
          },
        ],
      },
      { exportedAt: "2026-06-03T08:00:00.000Z" },
    );

    expect(markdown).toContain("첨부: scan.pdf");
    expect(markdown).not.toContain("/Users/wj/private/scan.pdf");
  });

  it("filters dated records by the selected visit packet range", () => {
    const rangedState: VisitPacketState = {
      ...sampleState,
      vitals: [
        ...sampleState.vitals,
        {
          date: "2026-05-01",
          type: "blood-pressure",
          systolic: 142,
          diastolic: 90,
          note: "오래된 혈압",
        },
      ],
      documents: [
        ...sampleState.documents,
        {
          date: "2026-05-01",
          title: "오래된 서류",
          category: "visit-note",
          body: "지난달 상담 메모",
          tags: "과거",
        },
      ],
    };

    const recentMarkdown = buildVisitPacketMarkdown(rangedState, {
      exportedAt: "2026-06-03T08:00:00.000Z",
      range: "7d",
    });
    expect(recentMarkdown).toContain("범위: 최근 7일");
    expect(recentMarkdown).toContain("2026-06-01");
    expect(recentMarkdown).not.toContain("2026-05-01");
    expect(recentMarkdown).not.toContain("오래된 서류");

    const allMarkdown = buildVisitPacketMarkdown(rangedState, {
      exportedAt: "2026-06-03T08:00:00.000Z",
      range: "all",
    });
    expect(allMarkdown).toContain("범위: 전체");
    expect(allMarkdown).toContain("2026-05-01");
    expect(allMarkdown).toContain("오래된 서류");
  });
});
