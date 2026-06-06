import { describe, expect, it } from "vitest";

import { normalizeAppState } from "./appState";

describe("normalizeAppState", () => {
  it("normalizes malformed persisted record scalar fields before rendering", () => {
    const state = normalizeAppState({
      caregiverShareSettings: {
        coverMemo: 42,
        sections: {
          labs: false,
        },
      },
      documents: [
        {
          attachmentName: 42,
          attachmentPath: ["/tmp/result.png"],
          attachmentStatus: 99,
          attachmentStorage: "cloud",
          body: 10,
          category: "unknown",
          date: 20260601,
          history: [
            {
              at: [],
              detail: null,
              id: 9,
              kind: "unknown",
              label: 7,
            },
            "skip",
          ],
          id: null,
          nextAction: null,
          reviewStatus: "unknown",
          tags: false,
          title: ["검사"],
        },
        "skip",
      ],
      foodQuery: 77,
      labResults: [
        {
          date: false,
          id: "",
          lower: 4,
          name: ["WBC"],
          note: null,
          unit: 123,
          upper: 10,
          value: 3.4,
        },
      ],
      profile: {
        age: "abc",
        cancerCareMode: false,
        diabetes: "true",
        heightCm: 164,
        hypertension: false,
        name: 123,
        sex: "unknown",
        waistCm: "",
        weightKg: "-1",
      },
      questions: [
        {
          answer: 1,
          date: {},
          id: undefined,
          priority: "urgent",
          question: 2,
          status: "unknown",
          topic: 3,
        },
      ],
      symptoms: [
        {
          action: [],
          body: 1,
          date: 2,
          id: "",
          medication: {},
          severity: "bad",
          symptom: false,
        },
      ],
      vitals: [
        {
          date: 123,
          diastolic: 80,
          glucoseContext: "bedtime",
          glucoseMgDl: Number.NaN,
          id: 42,
          note: false,
          systolic: "130",
          temperatureC: 36.7,
          type: "pulse",
        },
      ],
      visits: [
        {
          date: null,
          hospital: ["병원"],
          id: {},
          nextDate: 7,
          plan: false,
          reason: 3,
          summary: 4,
        },
      ],
    });

    expect(state.profile.name).toBe("나의 건강 기록");
    expect(state.profile.age).toBe("56");
    expect(state.profile.sex).toBe("other");
    expect(state.profile.diabetes).toBe(true);
    expect(state.profile.hypertension).toBe(false);
    expect(state.profile.weightKg).toBe("62");
    expect(state.foodQuery).toBe("브로콜리, 현미밥, 베이컨, 자몽 주스");

    expect(state.vitals).toEqual([
      {
        date: "",
        diastolic: 80,
        glucoseContext: "bedtime",
        glucoseMgDl: undefined,
        id: "vital-restored-1",
        note: "",
        systolic: undefined,
        temperatureC: 36.7,
        type: "blood-pressure",
      },
    ]);
    expect(state.visits[0]).toMatchObject({
      date: "",
      hospital: "",
      id: "visit-restored-1",
      nextDate: "",
      plan: "",
      reason: "",
      summary: "",
    });

    expect(state.documents).toHaveLength(1);
    expect(state.documents[0]).toMatchObject({
      attachmentName: undefined,
      attachmentPath: undefined,
      attachmentStatus: undefined,
      attachmentStorage: undefined,
      body: "",
      category: "other",
      date: "",
      id: "document-restored-1",
      nextAction: "",
      reviewStatus: "needs-review",
      tags: "",
      title: "",
    });
    expect(state.documents[0].history).toEqual([
      {
        at: "",
        detail: "",
        id: "history-restored-1",
        kind: "created",
        label: "",
      },
    ]);

    expect(state.symptoms[0]).toMatchObject({
      action: "",
      body: "",
      date: "",
      id: "symptom-restored-1",
      medication: "",
      severity: 3,
      symptom: "",
    });
    expect(state.questions[0]).toMatchObject({
      answer: "",
      date: "",
      id: "question-restored-1",
      priority: "next-visit",
      question: "",
      status: "open",
      topic: "",
    });
    expect(state.labResults[0]).toMatchObject({
      date: "",
      id: "lab-restored-1",
      lower: "",
      name: "",
      note: "",
      unit: "",
      upper: "",
      value: "",
    });
    expect(state.caregiverShareSettings.coverMemo).toBe("");
    expect(state.caregiverShareSettings.sections.labs).toBe(false);
  });

  it("recovers restored caregiver share settings that disable every section", () => {
    const state = normalizeAppState({
      caregiverShareSettings: {
        coverMemo: "가져온 공유 설정",
        sections: {
          visits: false,
          questions: false,
          documents: false,
          symptoms: false,
          labs: false,
          food: false,
          vitals: false,
        },
      },
      profile: { name: "나의 건강 기록" },
      vitals: [],
    });

    expect(state.caregiverShareSettings.coverMemo).toBe("가져온 공유 설정");
    expect(state.caregiverShareSettings.sections).toEqual({
      visits: true,
      questions: false,
      documents: false,
      symptoms: false,
      labs: false,
      food: false,
      vitals: false,
    });
  });

  it("clamps restored symptom severity to the 0-10 slider scale", () => {
    const state = normalizeAppState({
      symptoms: [
        {
          id: "negative",
          severity: -3,
        },
        {
          id: "oversized",
          severity: 999,
        },
        {
          id: "decimal",
          severity: 4.6,
        },
        {
          id: "malformed",
          severity: "8",
        },
      ],
    });

    expect(state.symptoms.map((symptom) => symptom.severity)).toEqual([0, 10, 5, 3]);
  });

  it("drops non-positive restored vital measurements before rendering", () => {
    const state = normalizeAppState({
      vitals: [
        {
          id: "bp",
          type: "blood-pressure",
          systolic: -128,
          diastolic: 0,
        },
        {
          glucoseMgDl: -90,
          id: "glucose",
          type: "glucose",
        },
        {
          id: "temperature",
          temperatureC: 0,
          type: "temperature",
        },
        {
          diastolic: 78,
          glucoseMgDl: 146,
          id: "valid",
          systolic: 126,
          temperatureC: 36.8,
          type: "blood-pressure",
        },
      ],
    });

    expect(state.vitals[0]).toMatchObject({
      diastolic: undefined,
      id: "bp",
      systolic: undefined,
    });
    expect(state.vitals[1].glucoseMgDl).toBeUndefined();
    expect(state.vitals[2].temperatureC).toBeUndefined();
    expect(state.vitals[3]).toMatchObject({
      diastolic: 78,
      glucoseMgDl: 146,
      systolic: 126,
      temperatureC: 36.8,
    });
  });

  it("drops malformed restored dates before sorting and reminder logic sees them", () => {
    const state = normalizeAppState({
      deletedDocuments: [
        {
          date: "2026-06-06",
          id: "deleted-valid",
        },
        {
          date: "2026-99-99",
          id: "deleted-invalid",
        },
      ],
      documents: [
        {
          date: "2026-02-31",
          id: "document-invalid",
        },
      ],
      labResults: [
        {
          date: "2026-6-5",
          id: "lab-invalid",
        },
      ],
      questions: [
        {
          date: "2026-06-05T00:00:00Z",
          id: "question-invalid",
        },
      ],
      symptoms: [
        {
          date: " 2026-06-05 ",
          id: "symptom-valid-trimmed",
        },
      ],
      visits: [
        {
          date: "not-a-date",
          id: "visit-invalid",
          nextDate: "2026-13-01",
        },
        {
          date: "2026-06-05",
          id: "visit-valid",
          nextDate: "2026-06-15",
        },
      ],
      vitals: [
        {
          date: "9999-99-99",
          id: "vital-invalid",
        },
        {
          date: "2026-06-05",
          id: "vital-valid",
        },
      ],
    });

    expect(state.deletedDocuments.map((document) => document.date)).toEqual(["2026-06-06", ""]);
    expect(state.documents[0].date).toBe("");
    expect(state.labResults[0].date).toBe("");
    expect(state.questions[0].date).toBe("");
    expect(state.symptoms[0].date).toBe("2026-06-05");
    expect(state.visits.map((visit) => ({ date: visit.date, nextDate: visit.nextDate }))).toEqual([
      { date: "", nextDate: "" },
      { date: "2026-06-05", nextDate: "2026-06-15" },
    ]);
    expect(state.vitals.map((vital) => vital.date)).toEqual(["", "2026-06-05"]);
  });

  it("drops malformed restored document history timestamps before timeline display", () => {
    const state = normalizeAppState({
      documents: [
        {
          history: [
            {
              at: "2026-06-05T03:04:05.006Z",
              id: "history-valid",
            },
            {
              at: "2026-02-31T00:00:00.000Z",
              id: "history-invalid-day",
            },
            {
              at: "not-a-timestamp",
              id: "history-invalid-text",
            },
          ],
          id: "document",
        },
      ],
    });

    const [document] = state.documents;

    expect(document).toBeDefined();
    expect((document?.history ?? []).map((history) => history.at)).toEqual([
      "2026-06-05T03:04:05.006Z",
      "",
      "",
    ]);
  });
});
