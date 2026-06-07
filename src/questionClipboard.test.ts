import { describe, expect, it } from "vitest";
import { buildVitalStandardQuestionDraft } from "./healthStandards";
import { buildLabQuestionPrompt } from "./labQuestionPrompts";
import {
  formatQuestionClipboardActionSummary,
  formatQuestionClipboardCopyDescription,
  formatQuestionClipboardCopyFailedStatus,
  formatQuestionClipboardCopyStatus,
  formatQuestionClipboardCopyUnsupportedStatus,
  formatQuestionClipboardText,
} from "./questionClipboard";

const kdaTargetUrl = "https://www.diabetes.or.kr/general/info/treat/treat_01.php";
const kdaCareTargetUrl = "https://www.diabetes.or.kr/general/info/treat/treat_01.php";

describe("questionClipboard", () => {
  it("formats a visit question with date, priority, status, and answer memo", () => {
    expect(
      formatQuestionClipboardText({
        answer: "검사 전날부터 기록하기",
        date: "2026-06-10",
        priority: "high",
        question: "검사 전 식사는 어떻게 준비할까요?",
        status: "open",
        topic: "검사 준비",
      }),
    ).toBe(
      [
        "[진료 질문]",
        "요약: 2026-06-10 · 이번 진료 우선 · 확인 필요 · 근거 없음 · 답변 메모 포함",
        "날짜: 2026-06-10",
        "주제: 검사 준비",
        "우선순위: 이번 진료 우선",
        "상태: 확인 필요",
        "질문: 검사 전 식사는 어떻게 준비할까요?",
        "답변 메모: 검사 전날부터 기록하기",
      ].join("\n"),
    );
  });

  it("omits blank answer memos and normalizes unknown priority", () => {
    expect(
      formatQuestionClipboardText({
        answer: "   ",
        date: "2026-06-15",
        priority: "unknown",
        question: "다음 추적검사는 언제인가요?",
        status: "deferred",
        topic: "추적",
      }),
    ).toBe(
      [
        "[진료 질문]",
        "요약: 2026-06-15 · 다음 진료 · 보류 · 근거 없음",
        "날짜: 2026-06-15",
        "주제: 추적",
        "우선순위: 다음 진료",
        "상태: 보류",
        "질문: 다음 추적검사는 언제인가요?",
      ].join("\n"),
    );
  });

  it("replaces malformed restored dates in question copy labels and text", () => {
    const malformedDateQuestion = {
      answer: "",
      date: "2026-06-31",
      priority: "next-visit",
      question: "복구된 질문 날짜를 확인할까요?",
      status: "open",
      topic: "복구 점검",
    };

    expect(formatQuestionClipboardActionSummary(malformedDateQuestion)).toBe(
      "날짜 미입력 · 다음 진료 · 확인 필요 · 근거 없음",
    );
    expect(formatQuestionClipboardCopyDescription(malformedDateQuestion)).toBe(
      "복구 점검 질문 복사 · 날짜 미입력 · 다음 진료 · 확인 필요 · 근거 없음",
    );
    expect(formatQuestionClipboardText(malformedDateQuestion)).toBe(
      [
        "[진료 질문]",
        "요약: 날짜 미입력 · 다음 진료 · 확인 필요 · 근거 없음",
        "날짜: 날짜 미입력",
        "주제: 복구 점검",
        "우선순위: 다음 진료",
        "상태: 확인 필요",
        "질문: 복구된 질문 날짜를 확인할까요?",
      ].join("\n"),
    );
  });

  it("formats source-backed question text as separated evidence", () => {
    expect(
      formatQuestionClipboardText({
        answer: "",
        date: "2026-06-20",
        priority: "next-visit",
        question:
          "성생활 재개 시점을 어떻게 상담할까요?\n출처: 국가암정보센터 자궁경부암 성생활 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=5373",
        status: "open",
        topic: "부작용: 질건조·성교통/성생활 상담",
      }),
    ).toBe(
      [
        "[진료 질문]",
        "요약: 2026-06-20 · 다음 진료 · 확인 필요 · 근거 포함",
        "날짜: 2026-06-20",
        "주제: 부작용: 질건조·성교통/성생활 상담",
        "우선순위: 다음 진료",
        "상태: 확인 필요",
        "질문: 성생활 재개 시점을 어떻게 상담할까요? / 근거: 국가암정보센터 자궁경부암 성생활 (https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=5373)",
      ].join("\n"),
    );
  });

  it("formats generated lab follow-up question evidence as separated grounds", () => {
    const question = buildLabQuestionPrompt(
      {
        date: "2026-06-03",
        name: "HDL-C",
        value: "38",
        unit: "mg/dL",
        lower: "50",
        upper: "",
        note: `대한당뇨병학회 일반 목표 기준입니다.\n적용 기준: 여성 기준 적용\n출처: 대한당뇨병학회 당뇨병 관리 목표 - ${kdaTargetUrl}`,
      },
      {
        flag: "low",
        label: "기준보다 낮음",
        level: "watch",
        summary: "검사실 기준보다 낮습니다.",
      },
    );

    const text = formatQuestionClipboardText({
      answer: "",
      date: "2026-06-15",
      priority: "high",
      question,
      status: "open",
      topic: "검사 수치",
    });

    expect(text).toContain(
      `기존 메모/근거: 대한당뇨병학회 일반 목표 기준입니다. / 적용 기준: 여성 기준 적용 / 근거: 대한당뇨병학회 당뇨병 관리 목표 (${kdaTargetUrl})`,
    );
    expect(text).not.toContain("출처: 대한당뇨병학회 당뇨병 관리 목표");
  });

  it("formats generated vital standard question evidence as separated grounds", () => {
    const draft = buildVitalStandardQuestionDraft({
      assessmentLabel: "주의혈압 범위",
      assessmentSummary: "한국 성인 남녀 공통 기준 주의혈압입니다. 추세가 오르는지 확인하세요.",
      measurementLabel: "혈압 128/78 mmHg",
      standardId: "blood-pressure",
    });

    const text = formatQuestionClipboardText({
      answer: "",
      date: "2026-06-15",
      priority: "next-visit",
      question: draft?.question ?? "",
      status: "open",
      topic: draft?.topic ?? "",
    });

    expect(text).toContain("주제: 혈압 기준 확인");
    expect(text).toContain("혈압 128/78 mmHg 기록");
    expect(text).toContain(
      "근거: 질병관리청 국가건강정보포털 고혈압 (https://health.kdca.go.kr/healthinfo/biz/health/ntcnInfo/healthSourc/thtimtCntnts/thtimtCntntsView.do?thtimt_cntnts_sn=28)",
    );
    expect(text).not.toContain("출처: 질병관리청 국가건강정보포털 고혈압");
    expect(text).not.toContain(".. 근거");
  });

  it("formats generated glucose standard question evidence as separated grounds", () => {
    const draft = buildVitalStandardQuestionDraft({
      assessmentLabel: "식전 목표 범위",
      assessmentSummary:
        "대한당뇨병학회 일반 조절목표는 성인 남녀 공통으로 식전 80-130 mg/dL 범위를 제시합니다.",
      measurementLabel: "혈당 118 mg/dL (식전)",
      standardId: "glucose-care",
    });

    const text = formatQuestionClipboardText({
      answer: "",
      date: "2026-06-15",
      priority: "next-visit",
      question: draft?.question ?? "",
      status: "open",
      topic: draft?.topic ?? "",
    });

    expect(text).toContain("주제: 혈당 기준 확인");
    expect(text).toContain("혈당 118 mg/dL (식전) 기록");
    expect(text).toContain(`근거: 대한당뇨병학회 당뇨병 관리 목표 (${kdaCareTargetUrl})`);
    expect(text).not.toContain("출처: 대한당뇨병학회 당뇨병 관리 목표");
    expect(text).not.toContain(".. 근거");
  });

  it("summarizes question copy actions with priority, status, evidence, and answer memo scope", () => {
    const sourceBackedQuestion = {
      answer: "",
      date: "2026-06-20",
      priority: "next-visit",
      question:
        "성생활 재개 시점을 어떻게 상담할까요?\n출처: 국가암정보센터 자궁경부암 성생활 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=5373",
      status: "open",
      topic: "부작용: 질건조·성교통/성생활 상담",
    };
    const answeredQuestion = {
      answer: "검사 전날부터 기록하기",
      date: "2026-06-10",
      priority: "high",
      question: "검사 전 식사는 어떻게 준비할까요?",
      status: "answered",
      topic: "검사 준비",
    };

    expect(formatQuestionClipboardActionSummary(sourceBackedQuestion)).toBe(
      "2026-06-20 · 다음 진료 · 확인 필요 · 근거 포함",
    );
    expect(formatQuestionClipboardCopyDescription(sourceBackedQuestion)).toBe(
      "부작용: 질건조·성교통/성생활 상담 질문 복사 · 2026-06-20 · 다음 진료 · 확인 필요 · 근거 포함",
    );
    expect(formatQuestionClipboardCopyStatus(sourceBackedQuestion)).toBe(
      "부작용: 질건조·성교통/성생활 상담 질문 복사됨 · 2026-06-20 · 다음 진료 · 확인 필요 · 근거 포함",
    );
    expect(formatQuestionClipboardCopyUnsupportedStatus(sourceBackedQuestion)).toBe(
      "부작용: 질건조·성교통/성생활 상담 질문 복사 미지원 · 브라우저 클립보드 없음 · 2026-06-20 · 다음 진료 · 확인 필요 · 근거 포함",
    );
    expect(formatQuestionClipboardCopyFailedStatus(sourceBackedQuestion)).toBe(
      "부작용: 질건조·성교통/성생활 상담 질문 복사 실패 · 2026-06-20 · 다음 진료 · 확인 필요 · 근거 포함",
    );
    expect(formatQuestionClipboardActionSummary(answeredQuestion)).toBe(
      "2026-06-10 · 이번 진료 우선 · 답변 완료 · 근거 없음 · 답변 메모 포함",
    );
  });
});
