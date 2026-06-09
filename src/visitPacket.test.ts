import { describe, expect, it } from "vitest";
import { buildLabQuestionPrompt } from "./labQuestionPrompts";
import {
  buildSymptomSupportActionNote,
  findSymptomSupportTemplate,
} from "./symptomSupportTemplates";
import {
  buildCervicalCancerAlertSymptomDraft,
  buildCervicalCancerCareItemSymptomDraft,
  cervicalCancerCareAlerts,
  cervicalCancerCareChecks,
  cervicalCancerCarePreventionGuides,
} from "./cervicalCancerCare";
import { buildVitalStandardQuestionDraft } from "./healthStandards";
import {
  buildVisitPacketExportFingerprint,
  buildVisitPacketMarkdown,
  formatVisitPacketExportDescription,
  formatVisitPacketExportStatus,
  formatVisitPacketPreviewDescription,
  formatVisitPacketPreviewStatus,
  type VisitPacketState,
} from "./visitPacket";

const kdcaHypertensionUrl =
  "https://health.kdca.go.kr/healthinfo/biz/health/ntcnInfo/healthSourc/thtimtCntnts/thtimtCntntsView.do?thtimt_cntnts_sn=28";
const kdcaHypoglycemiaUrl =
  "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=2350";
const nccInfectionUrl = "https://www.cancer.go.kr/lay1/S1T435C439/contents.do";
const kdaCareTargetUrl = "https://www.diabetes.or.kr/general/info/treat/treat_01.php";
const kdaTargetUrl = "https://www.diabetes.or.kr/general/info/treat/treat_01.php";
const cervicalWarningDraft = buildCervicalCancerAlertSymptomDraft(cervicalCancerCareAlerts[0]);

const sampleState: VisitPacketState = {
  profile: {
    name: "테스트 사용자",
    age: "58",
    sex: "female",
    heightCm: "164",
    weightKg: "62",
    waistCm: "82",
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
    {
      date: "2026-06-03",
      symptom: cervicalWarningDraft.symptom,
      severity: 3,
      medication: "",
      body: cervicalWarningDraft.body,
      action: cervicalWarningDraft.action,
    },
  ],
  questions: [
    {
      date: "2026-06-17",
      topic: "식사",
      question: "날음식 제한 기준은?",
      priority: "high",
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
  it("formats range-aware export and preview action labels", () => {
    expect(formatVisitPacketExportDescription("7d")).toBe(
      "진료 요약 내보내기 · 범위 최근 7일",
    );
    expect(formatVisitPacketExportStatus("30d")).toBe(
      "진료 요약 내보냄 · 범위 최근 30일",
    );
    expect(formatVisitPacketPreviewDescription("90d")).toBe(
      "진료 요약 미리보기 · 범위 최근 90일",
    );
    expect(formatVisitPacketPreviewStatus("all")).toBe(
      "진료 요약 미리보기 생성 · 범위 전체",
    );
  });

  it("fingerprints visit packet content without local attachment paths", () => {
    const stateWithLocalAttachmentPath: VisitPacketState = {
      ...sampleState,
      documents: [
        {
          ...sampleState.documents[0],
          attachmentPath: "/Users/wj/private/blood-test.pdf",
        },
      ],
    };
    const fingerprint = buildVisitPacketExportFingerprint(
      stateWithLocalAttachmentPath,
      "브로콜리, 베이컨",
    );
    const pathOnlyChangedFingerprint = buildVisitPacketExportFingerprint(
      {
        ...stateWithLocalAttachmentPath,
        documents: [
          {
            ...stateWithLocalAttachmentPath.documents[0],
            attachmentPath: "/Users/wj/another-private-path/blood-test.pdf",
          },
        ],
      },
      "브로콜리, 베이컨",
    );
    const foodChangedFingerprint = buildVisitPacketExportFingerprint(
      stateWithLocalAttachmentPath,
      "브로콜리, 베이컨, 생굴",
    );
    const questionChangedFingerprint = buildVisitPacketExportFingerprint(
      {
        ...stateWithLocalAttachmentPath,
        questions: [
          {
            ...stateWithLocalAttachmentPath.questions[0],
            question: "날음식과 생굴 제한 기준은?",
          },
        ],
      },
      "브로콜리, 베이컨",
    );

    expect(pathOnlyChangedFingerprint).toBe(fingerprint);
    expect(foodChangedFingerprint).not.toBe(fingerprint);
    expect(questionChangedFingerprint).not.toBe(fingerprint);
    expect(fingerprint).not.toContain("/Users/wj/private");
    expect(fingerprint).not.toContain("attachmentPath");
  });

  it("ignores internal record ids in visit packet content fingerprints", () => {
    const stateWithInternalIds = {
      ...sampleState,
      documents: [
        {
          id: "document-internal-1",
          ...sampleState.documents[0],
        },
      ],
      labResults: [
        {
          id: "lab-internal-1",
          ...sampleState.labResults[0],
        },
      ],
      questions: [
        {
          id: "question-internal-1",
          ...sampleState.questions[0],
        },
      ],
      symptoms: [
        {
          id: "symptom-internal-1",
          ...sampleState.symptoms[0],
        },
      ],
      visits: [
        {
          id: "visit-internal-1",
          ...sampleState.visits[0],
        },
      ],
      vitals: [
        {
          id: "vital-internal-1",
          ...sampleState.vitals[0],
        },
      ],
    } as unknown as VisitPacketState;
    const fingerprint = buildVisitPacketExportFingerprint(
      stateWithInternalIds,
      "브로콜리, 베이컨",
    );
    const idOnlyChangedFingerprint = buildVisitPacketExportFingerprint(
      {
        ...stateWithInternalIds,
        documents: [
          {
            ...stateWithInternalIds.documents[0],
            id: "document-internal-2",
          },
        ],
        labResults: [
          {
            ...stateWithInternalIds.labResults[0],
            id: "lab-internal-2",
          },
        ],
        questions: [
          {
            ...stateWithInternalIds.questions[0],
            id: "question-internal-2",
          },
        ],
        symptoms: [
          {
            ...stateWithInternalIds.symptoms[0],
            id: "symptom-internal-2",
          },
        ],
        visits: [
          {
            ...stateWithInternalIds.visits[0],
            id: "visit-internal-2",
          },
        ],
        vitals: [
          {
            ...stateWithInternalIds.vitals[0],
            id: "vital-internal-2",
          },
        ],
      } as unknown as VisitPacketState,
      "브로콜리, 베이컨",
    );

    expect(idOnlyChangedFingerprint).toBe(fingerprint);
    expect(fingerprint).not.toContain("internal-1");
  });

  it("ignores malformed dated records in visit packet content fingerprints", () => {
    const stateWithMalformedDates: VisitPacketState = {
      ...sampleState,
      documents: [
        ...sampleState.documents,
        {
          date: "2026-02-31",
          title: "깨진 fingerprint 서류",
          category: "visit-note",
          body: "fingerprint에 들어오면 안 됨",
          tags: "복원 오류",
        },
      ],
      labResults: [
        ...sampleState.labResults,
        {
          date: "2026-13-01",
          name: "ANC",
          value: "0.4",
          unit: "10^3/uL",
          lower: "1.5",
          upper: "8.0",
          note: "깨진 fingerprint 검사",
        },
      ],
      questions: [
        ...sampleState.questions,
        {
          date: "2026-06-31",
          topic: "깨진 fingerprint 질문",
          question: "fingerprint에 들어오면 안 됨",
          priority: "high",
          status: "open",
          answer: "",
        },
      ],
      symptoms: [
        ...sampleState.symptoms,
        {
          date: "2026-11-31",
          symptom: "고열",
          severity: 8,
          medication: "",
          body: "깨진 fingerprint 증상",
          action: "진료팀 확인",
        },
      ],
      visits: [
        ...sampleState.visits,
        {
          date: "2026-12-32",
          hospital: "깨진 fingerprint 병원",
          reason: "복원 오류",
          summary: "fingerprint에 들어오면 안 됨",
          plan: "",
          nextDate: "",
        },
      ],
      vitals: [
        ...sampleState.vitals,
        {
          date: "2026-06-31",
          type: "blood-pressure",
          systolic: 142,
          diastolic: 92,
          note: "깨진 fingerprint 혈압",
        },
      ],
    };

    const fingerprint = buildVisitPacketExportFingerprint(sampleState, "브로콜리");
    const malformedFingerprint = buildVisitPacketExportFingerprint(
      stateWithMalformedDates,
      "브로콜리",
    );

    expect(malformedFingerprint).toBe(fingerprint);
    expect(malformedFingerprint).not.toContain("깨진 fingerprint");
    expect(malformedFingerprint).not.toContain("2026-02-31");
    expect(malformedFingerprint).not.toContain("2026-13-01");
    expect(malformedFingerprint).not.toContain("2026-06-31");
    expect(malformedFingerprint).not.toContain("2026-11-31");
    expect(malformedFingerprint).not.toContain("2026-12-32");
  });

  it("builds a clinician-facing markdown summary from tracked records", () => {
    const markdown = buildVisitPacketMarkdown(sampleState, {
      exportedAt: "2026-06-03T08:00:00.000Z",
      foodQuery: "브로콜리, 베이컨, 자몽 주스",
    });

    expect(markdown).toContain("# CareVault 진료 요약");
    expect(markdown).toContain("면역저하 검사 연결: 2026-06-03 WBC 3.4 10^3/uL");
    expect(markdown).toContain("입력 기준 하한 4.0 10^3/uL보다 낮게 기록");
    expect(markdown).toContain("국가암정보센터 증상별 식생활 - 면역기능의 저하");
    expect(markdown).toContain("## 기준 적용 범위");
    expect(markdown).toContain("주의: 성인 기준 참고용입니다.");
    expect(markdown).toContain("진료팀 기준을 우선합니다.");
    expect(markdown).toContain("성별 기준 요약");
    expect(markdown).toContain("- 남녀 공통: BMI·혈압·혈당·저혈당·현저한 고혈당·체온 기준");
    expect(markdown).toContain("- 성별 분리: 허리둘레 남성 90cm/여성 85cm");
    expect(markdown).toContain("현재 프로필 성별 적용");
    expect(markdown).toContain("- 허리둘레: 여성 85cm 이상이면 복부비만 기준 해당");
    expect(markdown).toContain("- HDL-C: 여성 프리셋은 50 mg/dL 이상");
    expect(markdown).toContain(
      "신체계측·혈압·혈당·신기능·전해질·지질·간기능·단백·칼슘·인산·요산·혈액·체온 숫자 범위",
    );
    expect(markdown).toContain("- BMI 기준 · 근거: 대한비만학회 비만 진료지침 2022");
    expect(markdown).toContain("  - 정상: 남녀 공통 · 18.5-22.9 kg/m²");
    expect(markdown).toContain(
      "  - 비만: 남녀 공통 · 1단계 25-29.9, 2단계 30-34.9, 3단계 35 이상 kg/m²",
    );
    expect(markdown).toContain("- 허리둘레 기준 · 근거: 대한비만학회 비만 진료지침 2022");
    expect(markdown).toContain("  - 남성 복부비만: 남성 기준 · 90cm 이상");
    expect(markdown).toContain("  - 여성 복부비만: 여성 기준 · 85cm 이상");
    expect(markdown).toContain("- 혈압 기준 · 근거: 질병관리청 국가건강정보포털 고혈압");
    expect(markdown).toContain("  - 정상: 남녀 공통 · <120/<80 mmHg");
    expect(markdown).toContain("  - 주의/전단계: 남녀 공통 · 주의 120-129/<80");
    expect(markdown).toContain("  - 고혈압: 남녀 공통 · 1기 140/90 이상");
    expect(markdown).toContain("  - 식전/공복 목표: 남녀 공통 · 80-130 mg/dL");
    expect(markdown).toContain("- 저혈당 확인 기준 · 근거: 질병관리청 국가건강정보포털 급성 합병증_저혈당");
    expect(markdown).toContain("  - 저혈당: 남녀 공통 · 70 mg/dL 미만");
    expect(markdown).toContain("- 현저한 고혈당 확인 기준 · 근거: 질병관리청 국가건강정보포털 고혈당");
    expect(markdown).toContain("  - 현저한 고혈당: 남녀 공통 · 250 mg/dL 이상");
    expect(markdown).toContain("  - 공복: 남녀 공통 · 정상 <100");
    expect(markdown).toContain("  - 무작위: 남녀 공통 · 증상과 함께 200 mg/dL 이상");
    expect(markdown).toContain("- A1C 검사 기준 · 근거: 질병관리청 국가건강정보포털 당뇨병");
    expect(markdown).toContain("  - A1C 정상: 남녀 공통 · 당화혈색소 <5.7%");
    expect(markdown).toContain(
      "  - A1C 진단 기준: 남녀 공통 · 6.5% 이상이면 당뇨병 진단 기준 가능성 확인",
    );
    expect(markdown).toContain(
      "  - A1C 관리 목표: 남녀 공통 · 성인 2형 당뇨병 일반 목표 6.5% 미만",
    );
    expect(markdown).toContain("- BUN/Cr 신기능 기준 · 근거: 질병관리청 국가건강정보포털 임상 화학 검사");
    expect(markdown).toContain("  - BUN: 남녀 공통 · 10-26 mg/dL");
    expect(markdown).toContain("  - Cr: 남녀 공통 · 성인 0.7-1.4 mg/dL");
    expect(markdown).toContain("  - 상승 확인: 남녀 공통 · 단독 진단이 아니라 탈수·근육량");
    expect(markdown).toContain("- eGFR 신장여과율 기준 · 근거: 질병관리청 국가건강정보포털 만성콩팥병");
    expect(markdown).toContain("  - 보존 범위: 남녀 공통 · 60 mL/min/1.73m² 이상이어도");
    expect(markdown).toContain("  - 60 미만 지속: 남녀 공통 · 60 미만이 3개월 이상 지속되면");
    expect(markdown).toContain("  - 동반 확인: 남녀 공통 · 알부민뇨·혈뇨·소변검사");
    expect(markdown).toContain("- UACR 알부민뇨 기준 · 근거: 질병관리청 국가건강정보포털 만성콩팥병");
    expect(markdown).toContain("  - A1 낮음: 남녀 공통 · 알부민뇨 30 mg/g 미만");
    expect(markdown).toContain("  - A2 증가: 남녀 공통 · 30-300 mg/g 범위는 반복 정량검사");
    expect(markdown).toContain("  - A3 고도 증가: 남녀 공통 · 300 mg/g 이상이면");
    expect(markdown).toContain("- Na/K 전해질 기준 · 근거: 질병관리청 국가건강정보포털 임상 화학 검사");
    expect(markdown).toContain("  - Na: 남녀 공통 · 135-145 mmol/L");
    expect(markdown).toContain("  - K: 남녀 공통 · 3.5-5.5 mmol/L");
    expect(markdown).toContain("  - 변화 확인: 남녀 공통 · 단독 진단이 아니라 구토·설사·탈수");
    expect(markdown).toContain("- 지질 검사 기준 · 근거: 질병관리청 국가건강정보포털 이상지질혈증 관리");
    expect(markdown).toContain("  - 적정: 남녀 공통 · 총콜레스테롤 <200");
    expect(markdown).toContain("  - 높음: 남녀 공통 · 총콜레스테롤 240 이상");
    expect(markdown).toContain("  - 정기검사: 남녀 공통 · 고위험군은 매년 지질검사, 수치 이상 시 전문의 상담으로 맞춤 치료계획 확인");
    expect(markdown).toContain("- HDL 성별 기준 · 근거: 대한당뇨병학회 당뇨병 관리 목표");
    expect(markdown).toContain("  - 남성 HDL: 남성 기준 · 40 mg/dL 이상");
    expect(markdown).toContain("  - 여성 HDL: 여성 기준 · 50 mg/dL 이상");
    expect(markdown).toContain("  - 낮음 확인: 성별 분리 · 남성 40 미만 또는 여성 50 미만");
    expect(markdown).toContain("- GGT 성별 기준 · 근거: 질병관리청 국가건강정보포털 임상 화학 검사");
    expect(markdown).toContain("  - 남성 GGT: 남성 기준 · 11-63 IU/L");
    expect(markdown).toContain("  - 여성 GGT: 여성 기준 · 8-35 IU/L");
    expect(markdown).toContain("  - 상승 확인: 성별 분리 · 간담도·음주·약물 영향");
    expect(markdown).toContain("- AST/ALT 간기능 기준 · 근거: 질병관리청 국가건강정보포털 간기능검사");
    expect(markdown).toContain("  - AST: 남녀 공통 · 0-40 IU/L");
    expect(markdown).toContain("  - ALT: 남녀 공통 · 0-40 IU/L");
    expect(markdown).toContain("  - 상승 확인: 남녀 공통 · 단독 진단이 아니라 증상·약물·영상");
    expect(markdown).toContain("- 알부민/총단백 기준 · 근거: 질병관리청 국가건강정보포털 임상 화학 검사");
    expect(markdown).toContain("  - 알부민: 남녀 공통 · 3.3-5.2 g/dL");
    expect(markdown).toContain("  - 낮음 확인: 남녀 공통 · 단독 진단이 아니라 간질환·신장질환");
    expect(markdown).toContain("- 칼슘 기준 · 근거: 질병관리청 국가건강정보포털 임상 화학 검사");
    expect(markdown).toContain("  - Ca: 남녀 공통 · 8.8-10.5 mg/dL");
    expect(markdown).toContain("  - 상승 확인: 남녀 공통 · 단독 진단이 아니라 뼈 전이 암");
    expect(markdown).toContain("  - 감소 확인: 남녀 공통 · 부갑상선저하증·신부전");
    expect(markdown).toContain("- 인산 기준 · 근거: 질병관리청 국가건강정보포털 임상 화학 검사");
    expect(markdown).toContain("  - P: 남녀 공통 · 성인 2.5-4.5 mg/dL");
    expect(markdown).toContain("  - 상승 확인: 남녀 공통 · 단독 진단이 아니라 신부전·부갑상선기능저하증");
    expect(markdown).toContain("  - 감소 확인: 남녀 공통 · 고칼슘혈증·이뇨제");
    expect(markdown).toContain("- 요산 기준 · 근거: 질병관리청 국가건강정보포털 임상 화학 검사");
    expect(markdown).toContain("  - 요산: 남녀 공통 입력 보조 · 3-7 mg/dL");
    expect(markdown).toContain("- 헤모글로빈 입력 보조 · 근거: 서울아산병원 혈색소 검사 참고치");
    expect(markdown).toContain("  - 남성 헤모글로빈: 남성 입력 보조 · 13.0-17.0 g/dL");
    expect(markdown).toContain("  - 여성 헤모글로빈: 여성 입력 보조 · 12.0-16.0 g/dL");
    expect(markdown).toContain("  - 결과지 우선: 성별·검사실·치료 상태");
    expect(markdown).toContain("- ANC 감염 위험 기준 · 근거: 국가암정보센터 항암 부작용 증상 관리 지침");
    expect(markdown).toContain("  - ANC 발열 기준: 암환자 공통 · ANC <500 cells/mm²");
    expect(markdown).toContain("  - 항암 후 시기: 암환자 공통 · 항암제 주사 후 보통 7-14일");
    expect(markdown).toContain("  - 동반 확인: 암환자 공통 · 기침·호흡곤란");
    expect(markdown).toContain(
      "- 혈소판 출혈 위험 기준 · 근거: 국가암정보센터 항암 부작용 증상 관리 지침",
    );
    expect(markdown).toContain("  - 출혈 예방 기준: 암환자 공통 · 혈소판 <75,000/mm³");
    expect(markdown).toContain("  - 의료진 상담 기준: 암환자 공통 · 혈소판 <50,000/mm³ 수준");
    expect(markdown).toContain("  - 응급 확인: 암환자 공통 · 10분 이상 압박해도 계속되는 출혈");
    expect(markdown).toContain("- 체온·감염 연락 기준 · 근거: 국가암정보센터 감염 의료진 상담 기준");
    expect(markdown).toContain("  - 발열·오한 연락: 암환자 공통 · 오한 또는 체온 38℃ 이상");
    expect(markdown).toContain("  - 동반 증상: 암환자 공통 · 오심·구토·설사");
    expect(markdown).toContain("  - 기록 항목: 암환자 공통 · 체온, 측정 시간");
    expect(markdown).toContain("[판정 적용] 한국 성인 BMI");
    expect(markdown).toContain("남성 90cm, 여성 85cm");
    expect(markdown).toContain("[입력 보조] 지질 검사 공통 프리셋");
    expect(markdown).toContain("총콜레스테롤·LDL·중성지방 성인 공통 입력 보조값");
    expect(markdown).toContain("[입력 보조] HDL 콜레스테롤 프리셋");
    expect(markdown).toContain("HDL 남성 40 mg/dL 이상, 여성 50 mg/dL 이상 분리");
    expect(markdown).toContain("[입력 보조] GGT 감마지티피 프리셋");
    expect(markdown).toContain("GGT 남성 11-63 IU/L, 여성 8-35 IU/L 분리");
    expect(markdown).toContain("[입력 보조] AST/ALT 간기능 프리셋");
    expect(markdown).toContain("AST·ALT 성인 남녀 공통 0-40 IU/L 입력 보조");
    expect(markdown).toContain("[입력 보조] 알부민/총단백 프리셋");
    expect(markdown).toContain("혈청 알부민 3.3-5.2 g/dL과 총단백 6.0-8.0 g/dL");
    expect(markdown).toContain("[입력 보조] 칼슘 프리셋");
    expect(markdown).toContain("칼슘 8.8-10.5 mg/dL 보조값");
    expect(markdown).toContain("[입력 보조] 인산 프리셋");
    expect(markdown).toContain("성인 인산 2.5-4.5 mg/dL 보조값");
    expect(markdown).toContain("[입력 보조] 요산 프리셋");
    expect(markdown).toContain("요산 3-7 mg/dL 보조값");
    expect(markdown).toContain("[입력 보조] 헤모글로빈 성별 프리셋");
    expect(markdown).toContain("헤모글로빈 남성 13.0-17.0 g/dL, 여성 12.0-16.0 g/dL 분리");
    expect(markdown).toContain("[입력 보조] ANC 감염 위험 프리셋");
    expect(markdown).toContain("ANC 500 미만과 발열·오한·호흡기 증상");
    expect(markdown).toContain("[입력 보조] 혈소판 출혈 위험 기준");
    expect(markdown).toContain("혈소판 감소와 코피·검은 변·혈뇨·비정상 질출혈");
    expect(markdown).toContain("[입력 보조] BUN/Cr 신기능 프리셋");
    expect(markdown).toContain("BUN 10-26 mg/dL, 성인 Cr 0.7-1.4 mg/dL");
    expect(markdown).toContain("[입력 보조] eGFR 신장여과율 프리셋");
    expect(markdown).toContain("eGFR 60 미만이 3개월 이상 지속되거나 알부민뇨");
    expect(markdown).toContain("[입력 보조] UACR 알부민뇨 프리셋");
    expect(markdown).toContain("알부민뇨 30 mg/g 미만, 30-300 mg/g, 300 mg/g 이상 단계");
    expect(markdown).toContain("[입력 보조] Na/K 전해질 프리셋");
    expect(markdown).toContain("나트륨 135-145 mmol/L, 칼륨 3.5-5.5 mmol/L");
    expect(markdown).toContain("[사용자 기준 우선] 기타 검사실 기준");
    expect(markdown).toContain("근거: 대한비만학회 비만 진료지침 2022 (https://general.kosso.or.kr/");
    expect(markdown).toContain("## 자궁경부암 케어 참고");
    expect(markdown).toContain("진료 준비용 기록 참고입니다. 진단, 처방, 치료 지시가 아닙니다.");
    expect(markdown).toContain("- 우선 확인 체크리스트:");
    expect(markdown).toContain("오늘 증상 기록: 출혈·분비물 변화");
    expect(markdown).toContain("다음 진료 질문: 병원 추적검사 일정과 국가암검진 2년 주기");
    expect(markdown).toContain("의심 증상 진단검사 목록");
    expect(markdown).toContain("국립암센터 자궁경부암 조기 진단과 예방법");
    expect(markdown).toContain("치료 후 생활 상담: 림프부종 피부 변화");
    expect(markdown).toContain("골반 방사선 후 폐경·질협착");
    expect(markdown).toContain("- 경고 신호 기록 항목:");
    expect(markdown).toContain("언제: 새로 시작된 날짜, 반복 횟수, 치료·검사 후 며칠째인지");
    expect(markdown).toContain("무엇이: 출혈·분비물 색/냄새/양, 혈뇨·혈변, 배뇨·배변 변화");
    expect(markdown).toContain("얼마나: 통증 정도와 지속 시간, 복부팽만·구토·배변/가스 변화 동반 여부");
    expect(markdown).toContain("같이: 발열, 열감, 피부 붉어짐, 다리 부종·통증, 상처 동반 여부");
    expect(markdown).toContain("비정상 질출혈");
    expect(markdown).toContain("자궁경부암 경고 신호 기록 초안");
    expect(markdown).toContain("양·색·냄새/통증 정도");
    expect(markdown).toContain("동반 증상");
    expect(markdown).toContain("menu_seq=4888");
    expect(markdown).toContain("진료 질문 초안");
    expect(markdown).toContain("검진·진단검사 구분");
    expect(markdown).toContain("골반내진, 자궁경부세포검사, HPV 검사, 질확대경, 조직검사");
    expect(markdown).toContain("경질초음파, 골반 MRI");
    expect(markdown).toContain("감별진단 확인");
    expect(markdown).toContain("자궁경부염");
    expect(markdown).toContain("질암");
    expect(markdown).toContain("자궁내막암");
    expect(markdown).toContain("자궁체부암");
    expect(markdown).toContain("골반 염증성질환");
    expect(markdown).toContain("제 증상과 검사 결과에서");
    expect(markdown).toContain("질확대경검사 및 펀치 생검");
    expect(markdown).toContain("자궁경관 내 소파술");
    expect(markdown).toContain("CT·MRI");
    expect(markdown).toContain("병리조직 확인");
    expect(markdown).toContain("전암단계");
    expect(markdown).toContain("상피내이형성증");
    expect(markdown).toContain("자궁경부상피내암");
    expect(markdown).toContain("기저막");
    expect(markdown).toContain("침윤성 암");
    expect(markdown).toContain("편평상피세포암");
    expect(markdown).toContain("선암");
    expect(markdown).toContain("혼합 암종");
    expect(markdown).toContain("병리결과지 용어");
    expect(markdown).toContain("병기·치료 설명");
    expect(markdown).toContain("병기 설명 확인");
    expect(markdown).toContain("상피내암");
    expect(markdown).toContain("암의 분류");
    expect(markdown).toContain("자궁경부에만 국한");
    expect(markdown).toContain("질벽 상부 2/3");
    expect(markdown).toContain("자궁 옆 결합조직");
    expect(markdown).toContain("질의 하부 1/3");
    expect(markdown).toContain("요관침윤");
    expect(markdown).toContain("골반·대동맥주위 림프절");
    expect(markdown).toContain("방광이나 직장 점막");
    expect(markdown).toContain("원격전이");
    expect(markdown).toContain("진단서 병기");
    expect(markdown).toContain("치료 선택 기준");
    expect(markdown).toContain("제 병기, 암 크기, 전신상태, 연령, 향후 출산 희망 여부");
    expect(markdown).toContain("치료현황 통계 해석");
    expect(markdown).toContain("2019-2023년");
    expect(markdown).toContain("5년 상대생존율 79.0%");
    expect(markdown).toContain("국한 94.5%");
    expect(markdown).toContain("국소 73.8%");
    expect(markdown).toContain("원격 29.1%");
    expect(markdown).toContain("모름 69.5%");
    expect(markdown).toContain("5년 이상 생존 확률");
    expect(markdown).toContain("개인 예후");
    expect(markdown).toContain("치료 반응");
    expect(markdown).toContain("재발·전이 여부");
    expect(markdown).toContain("수술 합병증 확인");
    expect(markdown).toContain("수술 직후 급성 합병증");
    expect(markdown).toContain("혈관손상");
    expect(markdown).toContain("요관손상");
    expect(markdown).toContain("직장 파열");
    expect(markdown).toContain("폐색전 증");
    expect(markdown).toContain("방광이나 직장의 기능부전");
    expect(markdown).toContain("림프 낭종");
    expect(markdown).toContain("다리나 회음부 림프 부종");
    expect(markdown).toContain("흡입도관 배액");
    expect(markdown).toContain("방사선 급성 부작용 확인");
    expect(markdown).toContain("방사선치료로 인한 합병증");
    expect(markdown).toContain("장 점막");
    expect(markdown).toContain("방광점막");
    expect(markdown).toContain("장운동의 일시적인 증가");
    expect(markdown).toContain("점막의 손상");
    expect(markdown).toContain("설사");
    expect(markdown).toContain("방광염과 비슷한 증상");
    expect(markdown).toContain("방사선치료 회차");
    expect(markdown).toContain("소변 통증");
    expect(markdown).toContain("방사선 질 변화 상담");
    expect(markdown).toContain("질의 위축 또는 경화");
    expect(markdown).toContain("호르몬치료");
    expect(markdown).toContain("국소치료");
    expect(markdown).toContain("성생활 변화");
    expect(markdown).toContain("호르몬 금기");
    expect(markdown).toContain("전암성 병변 치료 확인");
    expect(markdown).toContain("자궁경부이형성증");
    expect(markdown).toContain("자궁경부상피내암");
    expect(markdown).toContain("국소파괴요법");
    expect(markdown).toContain("동결요법");
    expect(markdown).toContain("고주파요법");
    expect(markdown).toContain("레이저요법");
    expect(markdown).toContain("단순자궁절제술");
    expect(markdown).toContain("조직경계");
    expect(markdown).toContain("침윤성 초기 치료 확인");
    expect(markdown).toContain("침윤성 자궁경부암");
    expect(markdown).toContain("환자의 연령과 건강상태");
    expect(markdown).toContain("암의 파급정도");
    expect(markdown).toContain("동반된 합병증");
    expect(markdown).toContain("광범위 자궁경부절제술");
    expect(markdown).toContain("복강경을 이용한 림프절 절제술");
    expect(markdown).toContain("자궁을 보존");
    expect(markdown).toContain("광범위 자궁절제술");
    expect(markdown).toContain("자궁주위 조직");
    expect(markdown).toContain("골반림프절");
    expect(markdown).toContain("항암화학요법 목적·일정 확인");
    expect(markdown).toContain("전신에 퍼져있는 암세포");
    expect(markdown).toContain("암의 치료(완치)");
    expect(markdown).toContain("암의 조절");
    expect(markdown).toContain("완화");
    expect(markdown).toContain("보조화학요법");
    expect(markdown).toContain("선행화학요법");
    expect(markdown).toContain("동시화학요법");
    expect(markdown).toContain("세포독성");
    expect(markdown).toContain("표적항암제");
    expect(markdown).toContain("면역항암제");
    expect(markdown).toContain("진찰 및 혈액 검사");
    expect(markdown).toContain("항암 부작용 개인차·효과 오해 확인");
    expect(markdown).toContain("부작용 유무와 치료 효과");
    expect(markdown).toContain("전혀 별개의 문제");
    expect(markdown).toContain("같은 항암제");
    expect(markdown).toContain("같은 용량");
    expect(markdown).toContain("환자마다");
    expect(markdown).toContain("몇 개월 또는 몇 년");
    expect(markdown).toContain("영구 지속");
    expect(markdown).toContain("폐·신장·심장·생식기관");
    expect(markdown).toContain("오심·구토");
    expect(markdown).toContain("구강 궤양");
    expect(markdown).toContain("골수기능 저하");
    expect(markdown).toContain("말초신경병증");
    expect(markdown).toContain("투여 용량");
    expect(markdown).toContain("약물 종류 변경");
    expect(markdown).toContain("중단 여부");
    expect(markdown).toContain("재발·추적검사");
    expect(markdown).toContain("첫 2년");
    expect(markdown).toContain("3개월마다");
    expect(markdown).toContain("이후 5년까지");
    expect(markdown).toContain("체중감소");
    expect(markdown).toContain("하지 부종");
    expect(markdown).toContain("기침·객혈·흉통");
    expect(markdown).toContain("문진");
    expect(markdown).toContain("골반내진");
    expect(markdown).toContain("세포검사");
    expect(markdown).toContain("CT·MRI·PET");
    expect(markdown).toContain("재발성 치료 선택 확인");
    expect(markdown).toContain("골반 내 국소 재발");
    expect(markdown).toContain("원격 재발");
    expect(markdown).toContain("재발 부위");
    expect(markdown).toContain("환자의 상태");
    expect(markdown).toContain("방사선요법");
    expect(markdown).toContain("동시항암화학방사선치료");
    expect(markdown).toContain("골반장기적출술");
    expect(markdown).toContain("요로전환술");
    expect(markdown).toContain("장전환술");
    expect(markdown).toContain("단독 병소");
    expect(markdown).toContain("외과적 절제술");
    expect(markdown).toContain("다발성 전이");
    expect(markdown).toContain("골반 방사선 후 폐경");
    expect(markdown).toContain("난소부전, 홍조·무월경 같은 폐경 증상");
    expect(markdown).toContain("질협착, 성욕 변화, 골다공증 위험");
    expect(markdown).toContain("장·방광 후기 변화");
    expect(markdown).toContain("6개월 이상 지난 뒤 장폐색, 혈변, 혈뇨 가능성");
    expect(markdown).toContain("배변/가스 변화");
    expect(markdown).toContain("식생활·보조식품");
    expect(markdown).toContain("민간요법·건강보조식품");
    expect(markdown).toContain("림프부종");
    expect(markdown).toContain("피부 붉어짐");
    expect(markdown).toContain("의료진에게 바로 연락");
    expect(markdown).toContain("요약·진료 흐름");
    expect(markdown).toContain("발생부위와 조직형");
    expect(markdown).toContain("HPV·위험요인");
    expect(markdown).toContain("국가암검진사업 2년");
    expect(markdown).toContain("치료 선택 기준");
    expect(markdown).toContain(
      "출처: 국가암정보센터 자궁경부암 요약설명 - https://www.cancer.go.kr/lay1/program/S1T211C213/cancer/view.do?cancer_seq=4877",
    );
    expect(markdown).toContain("HPV 감염·파트너 상담");
    expect(markdown).toContain("주로 성접촉으로 전파");
    expect(markdown).toContain("혈액·체액·장기이식");
    expect(markdown).toContain("증상 없이 자연소멸");
    expect(markdown).toContain("국가암정보센터 사람유두종바이러스 감염");
    expect(markdown).toContain("병기 설명 메모");
    expect(markdown).toContain("병리조직 확인 메모");
    expect(markdown).toContain("자궁경부 상피내이형성증");
    expect(markdown).toContain("편평상피세포암");
    expect(markdown).toContain("혼합 암종");
    expect(markdown).toContain("조기검진 준비·한계 메모");
    expect(markdown).toContain("위음성률이 50%");
    expect(markdown).toContain("액상세포도말검사");
    expect(markdown).toContain("생리 시작일로부터 10~20일");
    expect(markdown).toContain("성관계, 탐폰 사용, 질 세척");
    expect(markdown).toContain("발생통계 해석 메모");
    expect(markdown).toContain("상피내암을 제외시킨 자궁경부암(C53)");
    expect(markdown).toContain("3,144건");
    expect(markdown).toContain("전체 암 발생의 1.1%");
    expect(markdown).toContain("여자의 암 중에서는 11위");
    expect(markdown).toContain("40대가 22.8%");
    expect(markdown).toContain("암종이 96.6%");
    expect(markdown).toContain("편평세포암이 40.1%");
    expect(markdown).toContain("개인 위험으로 단정하지 말고");
    expect(markdown).toContain("전암 단계인 상피내암");
    expect(markdown).toContain("요관침윤");
    expect(markdown).toContain("대동맥주위 림프절");
    expect(markdown).toContain("방광이나 직장 점막");
    expect(markdown).toContain(
      "출처: 국가암정보센터 자궁경부암 진행단계 - https://www.cancer.go.kr/",
    );
    expect(markdown).toContain(
      "출처: 국가암정보센터 자궁경부암 정의 및 종류 - https://www.cancer.go.kr/",
    );
    expect(markdown).toContain(
      "출처: 국가암정보센터 자궁경부암 조기검진 - https://www.cancer.go.kr/",
    );
    expect(markdown).toContain(
      "출처: 국가암정보센터 자궁경부암 관련통계 - https://www.cancer.go.kr/",
    );
    expect(markdown).toContain(
      "출처: 국가암정보센터 자궁경부암 치료방법 - https://www.cancer.go.kr/",
    );
    expect(markdown).toContain(
      "출처: 국가암정보센터 방사선치료의 부작용 - https://www.cancer.go.kr/lay1/S1T292C294/contents.do",
    );
    expect(markdown).toContain(
      "출처: 국가암정보센터 자궁경부암 치료의 부작용 - https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&menu_seq=4894",
    );
    expect(markdown).toContain(
      "출처: 국가암정보센터 림프부종 치료 전후관리 - https://www.cancer.go.kr/",
    );
    expect(markdown).toContain(
      "출처: 국가암정보센터 자궁경부암 식생활 - https://www.cancer.go.kr/",
    );
    expect(markdown).toContain("회복 일정 메모");
    expect(markdown).toContain("원추절제술 후 생활 제한");
    expect(markdown).toContain(
      "출처: 국가암정보센터 자궁경부암 치료 후 생활 - https://www.cancer.go.kr/",
    );
    expect(markdown).toContain("광범위 자궁절제술 후 회복");
    expect(markdown).toContain("림프부종 피부·감염 관리");
    expect(markdown).toContain("열감·통증");
    expect(markdown).toContain("부종 악화 가능성");
    expect(markdown).toContain("재발·추적검사 주기 메모");
    expect(markdown).toContain("첫 2년 3개월마다");
    expect(markdown).toContain("이후 5년까지 6개월마다");
    expect(markdown).toContain("골반 방사선치료 난소기능·폐경 증상 상담");
    expect(markdown).toContain("국가암정보센터 방사선치료의 부작용");
    expect(markdown).toContain("성생활 재개·통증 상담");
    expect(markdown).toContain("질건조·질협착");
    expect(markdown).toContain("국가암정보센터 자궁경부암 성생활");
    expect(markdown).toContain("성생활 재개 상담");
    expect(markdown).toContain("수술 후 6주");
    expect(markdown).toContain("방사선치료 후 약 2주-1개월");
    expect(markdown).toContain("국소 호르몬 연고");
    expect(markdown).toContain("콘돔");
    expect(markdown).toContain("임신·출산 계획 상담");
    expect(markdown).toContain("광범위자궁경부절제수술");
    expect(markdown).toContain("국가암정보센터 자궁경부암 임신과 출산");
    expect(markdown).toContain("식생활·보조식품 확인");
    expect(markdown).toContain("특별히 피하거나 추천하는 음식은 없고");
    expect(markdown).toContain("국가암정보센터 자궁경부암 식생활");
    expect(markdown).toContain("검진 기준 빠른 확인");
    expect(markdown).toContain("국가암검진 대상 기준 해당");
    expect(markdown).toContain("2년 간격 자궁경부세포검사");
    expect(markdown).toContain("산정특례기간");
    expect(markdown).toContain("국가암정보센터 국가암검진 대상자 선정 및 통보");
    expect(markdown).toContain("국가암정보센터 국가암검진 검진주기 및 검진방법");
    expect(markdown).toContain("검진·예방 메모");
    expect(markdown).toContain("20세 이상 여성");
    expect(markdown).toContain("2년 간격");
    expect(markdown).toContain("추적검사 일정·결과");
    expect(markdown).toContain("국가암검진 2년 주기");
    expect(markdown).toContain("림프부종 감염·악화 신호");
    expect(markdown).toContain("갑자기 단단해지는 느낌");
    expect(markdown).toContain("배뇨·배변·출혈 변화 메모");
    expect(markdown).toContain("혈변·혈뇨");
    expect(markdown).toContain("장폐색·혈변·혈뇨 연락 메모");
    expect(markdown).toContain("복부팽만, 구토, 배변/가스 변화, 혈변, 혈뇨");
    expect(markdown).toContain("연락 기준을 진료팀에 확인");
    expect(markdown).toContain("국가암정보센터 자궁경부암 치료의 부작용");
    expect(markdown).toContain("결과통보·비용 확인");
    expect(markdown).toContain("15일 이내");
    expect(markdown).toContain("전액 무료");
    expect(markdown).toContain("HPV 백신은 예방용");
    expect(markdown).toContain("접종 후에도 자궁경부암 선별검사");
    expect(markdown).toContain("선별검사는 변경 없이");
    expect(markdown).toContain("HPV 접종 일정·관찰 확인");
    expect(markdown).toContain("9세 이상");
    expect(markdown).toContain("만 12세");
    expect(markdown).toContain("접종 후 20~30분 관찰");
    expect(markdown).toContain("HPV 접종 지연·추가접종 메모");
    expect(markdown).toContain("접종시기를 놓친 경우");
    expect(markdown).toContain("처음부터 다시 시작하지는 않습니다");
    expect(markdown).toContain("국가암정보센터 자궁경부암 HPV 예방백신");
    expect(markdown).toContain("HPV 국가예방접종 대상 메모");
    expect(markdown).toContain("2026년 5월 6일");
    expect(markdown).toContain("12세 남성 청소년");
    expect(markdown).toContain("12~17세 여성 청소년");
    expect(markdown).toContain("18~26세 저소득층 여성");
    expect(markdown).toContain("고위험 유전형(16형,18형)");
    expect(markdown).toContain("70~90%의 예방효과");
    expect(markdown).toContain("질병관리청 예방접종도우미 HPV 국가예방접종 사업");
    expect(markdown).toContain("HPV 감염·전파 상담 메모");
    expect(markdown).toContain("혈액, 체액, 장기이식");
    expect(markdown).toContain("배우자의 성 상대자 수");
    expect(markdown).toContain("감염을 비난이나 개인 원인으로 단정하지 말고");
    expect(markdown).toContain("흡연·성생활 위험요인 메모");
    expect(markdown).toContain("대부분 성접촉");
    expect(markdown).toContain("성상대자수");
    expect(markdown).toContain("콘돔");
    expect(markdown).toContain("경구피임약");
    expect(markdown).toContain("국가암정보센터 자궁경부암 예방법");
    expect(markdown).toContain("면역·감염·출산력 위험요인 메모");
    expect(markdown).toContain("HIV");
    expect(markdown).toContain("클라미디아");
    expect(markdown).toContain("검진 접근");
    expect(markdown).toContain("국가암정보센터 자궁경부암 위험요인");
    expect(markdown).toContain("생활요인 근거 경계 메모");
    expect(markdown).toContain("연관성은 아직 입증되지");
    expect(markdown).toContain("일반 암예방수칙");
    expect(markdown).toContain("국가암정보센터 국민 암예방 수칙 실천지침 자궁경부암");
    expect(markdown).toContain("국가암정보센터 자궁경부암 일반적 증상");
    expect(markdown).toContain("## 진료 준비 큐");
    expect(markdown).toContain("저장된 기록에서 가져온 확인 항목입니다.");
    expect(markdown).toContain("[증상 · 자궁경부암 경고 기록] 비정상 질출혈 3/10");
    expect(markdown).toContain("- 2026-06-02: [증상 기록] 오심 5/10 / 약: 항구토제");
    expect(markdown).toContain("- 2026-06-03: [자궁경부암 경고 기록] 비정상 질출혈 3/10");
    expect(markdown).toContain("발생 시기·양·유발 상황을 적고 진료팀 확인");
    expect(markdown).toContain("[질문 · 이번 진료 우선] 식사");
    expect(markdown).toContain("[활력 · 고혈압 전단계 범위] 혈압 132/84 mmHg");
    expect(markdown).toContain("[활력 · 식후 목표 초과] 혈당 181 mg/dL (식후 2시간)");
    expect(markdown).toContain("[자궁경부암 · 국가암검진 대상 기준 해당] 자궁경부암 검진 기준 빠른 확인");
    expect(markdown).toContain("https://www.cancer.go.kr/lay1/S1T553C554/contents.do");
    expect(markdown).not.toContain("근거: 출처:");
    expect(markdown).toContain("## 최근 혈압/혈당");
    expect(markdown).toContain("키/몸무게/허리둘레: 164 cm / 62 kg / 82 cm");
    expect(markdown).toContain("혈압 132/84 mmHg");
    expect(markdown).toContain("고혈압 전단계 범위");
    expect(markdown).toContain(
      `혈압 132/84 mmHg - 고혈압 전단계 범위 · 성인 남녀 공통 한국 성인 혈압 / 아침 / 근거: 질병관리청 국가건강정보포털 고혈압 (${kdcaHypertensionUrl})`,
    );
    expect(markdown).toContain("혈당 181 mg/dL");
    expect(markdown).toContain("식후 목표 초과");
    expect(markdown).toContain(
      `혈당 181 mg/dL (식후 2시간) - 식후 목표 초과 · 성인 남녀 공통 당뇨 추적 혈당 / 점심 식후 / 근거: 대한당뇨병학회 당뇨병 관리 목표 (${kdaCareTargetUrl})`,
    );
    expect(markdown).toContain("WBC 3.4 10^3/uL");
    expect(markdown).toContain("[사용자 입력 기준 범위] 기준보다 낮음");
    expect(markdown).toContain("[확인 필요 · 이번 진료 우선] 식사");
    expect(markdown).toContain("상태: 의료진 질문");
    expect(markdown).toContain("다음 조치: 백혈구 감소 시 식사 제한 기준 질문");
    expect(markdown).toContain("첨부: blood-test.pdf");
    expect(markdown).toContain("브로콜리, 베이컨, 자몽 주스");
    expect(markdown).toContain("[공식 출처 기반 음식 규칙] 의료진 확인 필요");
    expect(markdown).toContain(
      "베이컨: 가공육 (국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do)",
    );
    expect(markdown).toContain(
      "자몽: 약물 상호작용 확인 필요 (질병관리청 국가건강정보포털 식이영양 - https://health.kdca.go.kr/",
    );
  });

  it("does not calculate BMI from partial profile metric text in Markdown", () => {
    const markdown = buildVisitPacketMarkdown(
      {
        ...sampleState,
        profile: {
          ...sampleState.profile,
          heightCm: "164cm",
          weightKg: "62kg",
        },
      },
      { exportedAt: "2026-06-03T08:00:00.000Z" },
    );

    expect(markdown).toContain("- BMI: 계산 불가 - 정보 부족");
    expect(markdown).not.toContain("- BMI: 23.1 - 비만전단계");
  });

  it("exports generated vital standard questions with separated evidence in Markdown", () => {
    const vitalQuestion = buildVitalStandardQuestionDraft({
      assessmentLabel: "주의혈압 범위",
      assessmentSummary: "한국 성인 남녀 공통 기준 주의혈압입니다. 추세가 오르는지 확인하세요.",
      measurementLabel: "혈압 128/78 mmHg",
      standardId: "blood-pressure",
    });
    const markdown = buildVisitPacketMarkdown(
      {
        ...sampleState,
        documents: [],
        labResults: [],
        profile: { ...sampleState.profile, cancerCareMode: false },
        questions: [
          {
            date: "2026-06-15",
            topic: vitalQuestion?.topic ?? "",
            question: vitalQuestion?.question ?? "",
            priority: "next-visit",
            status: "open",
            answer: "",
          },
        ],
        symptoms: [],
        visits: [],
        vitals: [],
      },
      { exportedAt: "2026-06-03T08:00:00.000Z" },
    );

    expect(markdown).toContain("[확인 필요 · 다음 진료] 혈압 기준 확인");
    expect(markdown).toContain("혈압 128/78 mmHg 기록");
    expect(markdown).toContain(`근거: 질병관리청 국가건강정보포털 고혈압 (${kdcaHypertensionUrl})`);
    expect(markdown).not.toContain("출처: 질병관리청 국가건강정보포털 고혈압");
  });

  it("exports generated glucose standard questions with separated evidence in Markdown", () => {
    const vitalQuestion = buildVitalStandardQuestionDraft({
      assessmentLabel: "식전 목표 범위",
      assessmentSummary:
        "대한당뇨병학회 일반 조절목표는 성인 남녀 공통으로 식전 80-130 mg/dL 범위를 제시합니다.",
      measurementLabel: "혈당 118 mg/dL (식전)",
      standardId: "glucose-care",
    });
    const markdown = buildVisitPacketMarkdown(
      {
        ...sampleState,
        documents: [],
        labResults: [],
        profile: { ...sampleState.profile, cancerCareMode: false },
        questions: [
          {
            date: "2026-06-15",
            topic: vitalQuestion?.topic ?? "",
            question: vitalQuestion?.question ?? "",
            priority: "next-visit",
            status: "open",
            answer: "",
          },
        ],
        symptoms: [],
        visits: [],
        vitals: [],
      },
      { exportedAt: "2026-06-03T08:00:00.000Z" },
    );

    expect(markdown).toContain("[확인 필요 · 다음 진료] 혈당 기준 확인");
    expect(markdown).toContain("혈당 118 mg/dL (식전) 기록");
    expect(markdown).toContain(`근거: 대한당뇨병학회 당뇨병 관리 목표 (${kdaCareTargetUrl})`);
    expect(markdown).not.toContain("출처: 대한당뇨병학회 당뇨병 관리 목표");
  });

  it("includes source-backed fever or chills symptoms in the visit packet care queue", () => {
    const markdown = buildVisitPacketMarkdown(
      {
        ...sampleState,
        documents: [],
        labResults: [],
        profile: { ...sampleState.profile, cancerCareMode: false },
        questions: [],
        symptoms: [
          {
            date: "2026-06-03",
            symptom: "38도 발열과 오한",
            severity: 3,
            medication: "",
            body: "체온 38.2℃와 오한 지속",
            action: "배뇨 통증과 카테터 부위 발적 여부 확인",
          },
        ],
        visits: [],
        vitals: [],
      },
      { exportedAt: "2026-06-03T08:00:00.000Z" },
    );

    expect(markdown).toContain(
      "[증상 · 감염 의심 기록] 38도 발열과 오한 3/10",
    );
    expect(markdown).toContain(
      "근거: 국가암정보센터 감염 의료진 상담 기준 (https://www.cancer.go.kr/lay1/S1T435C439/contents.do)",
    );
  });

  it("includes source-backed cancer-pain symptoms in the visit packet care queue", () => {
    const painTemplate = findSymptomSupportTemplate("통증점수와 진통제 효과")!;
    const markdown = buildVisitPacketMarkdown(
      {
        ...sampleState,
        documents: [],
        labResults: [],
        profile: { ...sampleState.profile, cancerCareMode: false },
        questions: [],
        symptoms: [
          {
            date: "2026-06-03",
            symptom: "등 통증",
            severity: 8,
            medication: "",
            body: "밤에 악화",
            action: buildSymptomSupportActionNote(painTemplate),
          },
        ],
        visits: [],
        vitals: [],
      },
      { exportedAt: "2026-06-03T08:00:00.000Z" },
    );

    expect(markdown).toContain("[증상 · 고위험 증상] 등 통증 8/10");
    expect(markdown).toContain(
      "근거: 국가암정보센터 통증평가 항목 (https://www.cancer.go.kr/lay1/S1T378C380/contents.do)",
    );
    expect(markdown).not.toContain("출처: 국가암정보센터 통증평가 항목");
  });

  it("includes source-backed cervical general-warning symptoms in the visit packet care queue", () => {
    const markdown = buildVisitPacketMarkdown(
      {
        ...sampleState,
        documents: [],
        labResults: [],
        profile: { ...sampleState.profile, cancerCareMode: false },
        questions: [],
        symptoms: [
          {
            date: "2026-06-03",
            symptom: "성교 후 출혈과 악취 분비물",
            severity: 3,
            medication: "",
            body: "생리기간이 아닌 출혈과 분비물 색, 냄새, 양 변화",
            action: "발생 시점과 운동·배변·질세척 후 발생 여부를 기록",
          },
        ],
        visits: [],
        vitals: [],
      },
      { exportedAt: "2026-06-03T08:00:00.000Z" },
    );

    expect(markdown).toContain(
      "[증상 · 자궁경부암 증상 변화 기록] 성교 후 출혈과 악취 분비물 3/10",
    );
    expect(markdown).toContain(
      "근거: 국가암정보센터 자궁경부암 일반적 증상 (https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4888)",
    );
  });

  it("includes source-backed cervical urinary or bowel changes in the visit packet care queue", () => {
    const markdown = buildVisitPacketMarkdown(
      {
        ...sampleState,
        documents: [],
        labResults: [],
        profile: { ...sampleState.profile, cancerCareMode: false },
        questions: [],
        symptoms: [
          {
            date: "2026-06-03",
            symptom: "혈뇨와 혈변",
            severity: 4,
            medication: "",
            body: "방사선치료 후 6개월 이상 지난 뒤 소변과 대변 색 변화",
            action: "날짜, 양, 통증, 발열 동반 여부를 기록",
          },
        ],
        visits: [],
        vitals: [],
      },
      { exportedAt: "2026-06-03T08:00:00.000Z" },
    );

    expect(markdown).toContain(
      "[증상 · 배뇨·배변 변화 기록] 혈뇨와 혈변 4/10",
    );
    expect(markdown).toContain(
      "근거: 국가암정보센터 자궁경부암 치료의 부작용 (https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&menu_seq=4894)",
    );
  });

  it("includes generated cervical record-check drafts in visit packet care queues", () => {
    const lymphedemaDraft = buildCervicalCancerCareItemSymptomDraft(
      cervicalCancerCareChecks.find((item) => item.label === "림프부종 감염·악화 신호")!,
    );
    const lateBowelBladderDraft = buildCervicalCancerCareItemSymptomDraft(
      cervicalCancerCareChecks.find((item) => item.label === "장폐색·혈변·혈뇨 연락 메모")!,
    );
    const anatomySiteDraft = buildCervicalCancerCareItemSymptomDraft(
      cervicalCancerCareChecks.find((item) => item.label === "발생부위·구조 메모")!,
    );
    const markdown = buildVisitPacketMarkdown(
      {
        ...sampleState,
        documents: [],
        labResults: [],
        profile: { ...sampleState.profile, cancerCareMode: false },
        questions: [],
        symptoms: [
          {
            date: "2026-06-03",
            symptom: lymphedemaDraft.symptom,
            severity: 3,
            medication: "",
            body: lymphedemaDraft.body,
            action: lymphedemaDraft.action,
          },
          {
            date: "2026-06-03",
            symptom: lateBowelBladderDraft.symptom,
            severity: 3,
            medication: "",
            body: lateBowelBladderDraft.body,
            action: lateBowelBladderDraft.action,
          },
          {
            date: "2026-06-03",
            symptom: anatomySiteDraft.symptom,
            severity: 3,
            medication: "",
            body: anatomySiteDraft.body,
            action: anatomySiteDraft.action,
          },
        ],
        visits: [],
        vitals: [],
      },
      { exportedAt: "2026-06-03T08:00:00.000Z" },
    );

    expect(markdown).toContain(
      "[증상 · 림프부종 확인 기록] 림프부종 감염·악화 신호 3/10",
    );
    expect(markdown).toContain("림프부종 감염·악화 신호 내용을 다음 진료 때 진료팀에 확인");
    expect(markdown).toContain(
      "근거: 국가암정보센터 림프부종 치료 전후관리 (https://www.cancer.go.kr/lay1/S1T429C431/contents.do)",
    );
    expect(markdown).not.toContain("출처: 국가암정보센터 림프부종 치료 전후관리");
    expect(markdown).toContain(
      "[증상 · 장폐색 확인 기록] 장폐색·혈변·혈뇨 연락 메모 3/10",
    );
    expect(markdown).toContain("장폐색·혈변·혈뇨 연락 메모 내용을 다음 진료 때 진료팀에 확인");
    expect(markdown).toContain("복부팽만, 구토, 배변/가스 변화, 혈변, 혈뇨");
    expect(markdown).toContain(
      "근거: 국가암정보센터 자궁경부암 치료의 부작용 (https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&menu_seq=4894)",
    );
    expect(markdown).not.toContain("출처: 국가암정보센터 자궁경부암 치료의 부작용");
    expect(markdown).toContain("[증상 · 자궁경부암 기록 메모] 발생부위·구조 메모 3/10");
    expect(markdown).toContain("자궁 상부 2/3");
    expect(markdown).toContain("하부 1/3");
    expect(markdown).toContain("질과 연결");
    expect(markdown).toContain("요관");
    expect(markdown).toContain("림프관 및 림프절");
    expect(markdown).toContain(
      "근거: 국가암정보센터 자궁경부암 발생부위 (https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4880)",
    );
    expect(markdown).not.toContain("출처: 국가암정보센터 자궁경부암 발생부위");
  });

  it("labels generated cervical memo drafts in direct visit packet symptoms", () => {
    const draft = buildCervicalCancerCareItemSymptomDraft(
      cervicalCancerCarePreventionGuides.find((item) => item.label === "HPV 백신 가족 안내")!,
    );
    const markdown = buildVisitPacketMarkdown(
      {
        ...sampleState,
        documents: [],
        labResults: [],
        profile: { ...sampleState.profile, cancerCareMode: false },
        questions: [],
        symptoms: [
          {
            date: "2026-06-03",
            symptom: draft.symptom,
            severity: 3,
            medication: "",
            body: draft.body,
            action: draft.action,
          },
        ],
        visits: [],
        vitals: [],
      },
      { exportedAt: "2026-06-03T08:00:00.000Z" },
    );

    expect(markdown).toContain(
      "- 2026-06-03: [자궁경부암 기록 메모] HPV 백신 가족 안내 3/10",
    );
    expect(markdown).toContain("HPV 백신 가족 안내 내용을 다음 진료 때 진료팀에 확인");
    expect(markdown).toContain(
      "근거: 질병관리청 국가건강정보포털 자궁경부암 백신 (https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=3987)",
    );
    expect(markdown).not.toContain("출처: 질병관리청 국가건강정보포털 자궁경부암 백신");
  });

  it("labels markerless source-backed cervical warning records in direct visit packet symptoms", () => {
    const markdown = buildVisitPacketMarkdown(
      {
        ...sampleState,
        documents: [],
        labResults: [],
        profile: { ...sampleState.profile, cancerCareMode: false },
        questions: [],
        symptoms: [
          {
            date: "2026-06-03",
            symptom: "성교 후 출혈과 악취 분비물",
            severity: 3,
            medication: "",
            body: "생리기간이 아닌 출혈과 분비물 색, 냄새, 양 변화",
            action:
              "발생 시점과 운동·배변·질세척 후 발생 여부를 기록\n출처: 국가암정보센터 자궁경부암 일반적 증상 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4888",
          },
        ],
        visits: [],
        vitals: [],
      },
      { exportedAt: "2026-06-03T08:00:00.000Z" },
    );

    expect(markdown).toContain(
      "- 2026-06-03: [자궁경부암 경고 기록] 성교 후 출혈과 악취 분비물 3/10",
    );
    expect(markdown).toContain(
      "근거: 국가암정보센터 자궁경부암 일반적 증상 (https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4888)",
    );
    expect(markdown).not.toContain("자궁경부암 경고 신호 기록 초안");
  });

  it("formats source-backed questions with separated evidence in the visit packet", () => {
    const markdown = buildVisitPacketMarkdown(
      {
        ...sampleState,
        documents: [],
        labResults: [],
        profile: { ...sampleState.profile, cancerCareMode: false },
        questions: [
          {
            date: "2026-06-20",
            topic: "부작용: 질건조·성교통/성생활 상담",
            question:
              "성생활 재개 시점을 어떻게 상담할까요?\n출처: 국가암정보센터 자궁경부암 성생활 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=5373",
            priority: "next-visit",
            status: "open",
            answer: "",
          },
        ],
        symptoms: [],
        visits: [],
        vitals: [],
      },
      { exportedAt: "2026-06-03T08:00:00.000Z" },
    );

    expect(markdown).toContain(
      "- 2026-06-20: [확인 필요 · 다음 진료] 부작용: 질건조·성교통/성생활 상담 - 성생활 재개 시점을 어떻게 상담할까요? / 근거: 국가암정보센터 자궁경부암 성생활 (https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=5373)",
    );
    expect(markdown).not.toContain("출처: 국가암정보센터 자궁경부암 성생활");
  });

  it("formats generated lab follow-up question evidence in the visit packet", () => {
    const labQuestion = buildLabQuestionPrompt(
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
    const markdown = buildVisitPacketMarkdown(
      {
        ...sampleState,
        documents: [],
        labResults: [],
        profile: { ...sampleState.profile, cancerCareMode: false },
        questions: [
          {
            date: "2026-06-15",
            topic: "검사 수치",
            question: labQuestion,
            priority: "high",
            status: "open",
            answer: "",
          },
        ],
        symptoms: [],
        visits: [],
        vitals: [],
      },
      { exportedAt: "2026-06-03T08:00:00.000Z" },
    );

    expect(markdown).toContain(
      `- 2026-06-15: [확인 필요 · 이번 진료 우선] 검사 수치 - 2026-06-03 HDL-C 38 mg/dL가 기준 50 mg/dL 이상보다 낮게 기록됐습니다. 원인, 치료 일정 영향, 감염/식사/약 조정에서 주의할 점을 확인해야 할까요? 기존 메모/근거: 대한당뇨병학회 일반 목표 기준입니다. / 적용 기준: 여성 기준 적용 / 근거: 대한당뇨병학회 당뇨병 관리 목표 (${kdaTargetUrl})`,
    );
    expect(markdown).not.toContain("출처: 대한당뇨병학회 당뇨병 관리 목표");
  });

  it("includes source-backed cervical bowel-obstruction changes in the visit packet care queue", () => {
    const markdown = buildVisitPacketMarkdown(
      {
        ...sampleState,
        documents: [],
        labResults: [],
        profile: { ...sampleState.profile, cancerCareMode: false },
        questions: [],
        symptoms: [
          {
            date: "2026-06-03",
            symptom: "장폐색과 복부팽만",
            severity: 4,
            medication: "",
            body: "방사선치료 후 6개월 이상 지난 뒤 배변과 가스 배출 변화",
            action: "복부팽만, 구토, 통증 동반 여부를 기록",
          },
        ],
        visits: [],
        vitals: [],
      },
      { exportedAt: "2026-06-03T08:00:00.000Z" },
    );

    expect(markdown).toContain(
      "[증상 · 장폐색 확인 기록] 장폐색과 복부팽만 4/10",
    );
    expect(markdown).toContain(
      "근거: 국가암정보센터 자궁경부암 치료의 부작용 (https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&menu_seq=4894)",
    );
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

  it("keeps source-backed lab queue details separated in visit packet care queues", () => {
    const markdown = buildVisitPacketMarkdown(
      {
        ...sampleState,
        documents: [],
        labResults: [
          {
            date: "2026-06-04",
            name: "HDL-C",
            value: "38",
            unit: "mg/dL",
            lower: "50",
            upper: "",
            note: `대한당뇨병학회 일반 목표 기준입니다.\n적용 기준: 여성 기준 적용\n출처: 대한당뇨병학회 당뇨병 관리 목표 - ${kdaTargetUrl}`,
          },
        ],
        profile: { ...sampleState.profile, cancerCareMode: false },
        questions: [],
        symptoms: [],
        visits: [],
        vitals: [],
      },
      {
        exportedAt: "2026-06-04T08:00:00.000Z",
      },
    );

    expect(markdown).toContain(
      `- 2026-06-04: [검사 · 기준보다 낮음] HDL-C 38 mg/dL / 대한당뇨병학회 일반 목표 기준입니다.\n적용 기준: 여성 기준 적용 / 검사실 기준보다 낮습니다. 증상과 함께 진료 때 확인하세요. / 근거: 대한당뇨병학회 당뇨병 관리 목표 (${kdaTargetUrl})`,
    );
    expect(markdown).toContain(
      `- 2026-06-04: HDL-C 38 mg/dL (기준 50 mg/dL 이상) - [사용자 입력 기준 범위] 기준보다 낮음 / 대한당뇨병학회 일반 목표 기준입니다.\n적용 기준: 여성 기준 적용 / 근거: 대한당뇨병학회 당뇨병 관리 목표 (${kdaTargetUrl})`,
    );
    expect(markdown).not.toContain("출처: 대한당뇨병학회 당뇨병 관리 목표");
  });

  it("keeps high-risk vital queue details source-backed in visit packet care queues", () => {
    const markdown = buildVisitPacketMarkdown(
      {
        ...sampleState,
        documents: [],
        labResults: [],
        profile: { ...sampleState.profile, cancerCareMode: false, diabetes: true },
        questions: [],
        symptoms: [],
        visits: [],
        vitals: [
          {
            date: "2026-06-04",
            type: "blood-pressure",
            systolic: 182,
            diastolic: 121,
            note: "두통 동반 반복 측정",
          },
          {
            date: "2026-06-04",
            type: "glucose",
            glucoseMgDl: 66,
            glucoseContext: "random",
            note: "식은땀과 떨림",
          },
        ],
      },
      {
        exportedAt: "2026-06-04T08:00:00.000Z",
      },
    );

    expect(markdown).toContain(
      `- 2026-06-04: [활력 · 고혈압 위기 가능 범위] 혈압 182/121 mmHg / 두통 동반 반복 측정 / 성인 남녀 공통 혈압 기준에서 고혈압 위기 가능 범위입니다. 증상이 있거나 반복되면 즉시 의료진 또는 응급 진료가 필요합니다. / 근거: 질병관리청 국가건강정보포털 고혈압 (${kdcaHypertensionUrl})`,
    );
    expect(markdown).toContain(
      `- 2026-06-04: [활력 · 저혈당 범위] 혈당 66 mg/dL (수시) / 식은땀과 떨림 / 성인 남녀 공통 혈당 기준에서 70 mg/dL 미만 저혈당 범위입니다. 증상, 의식상태, 약·식사·활동 변화를 함께 기록하고 진료팀 연락 기준을 확인하세요. / 근거: 질병관리청 국가건강정보포털 급성 합병증_저혈당 (${kdcaHypoglycemiaUrl})`,
    );
  });

  it("keeps cancer-patient fever temperature rows in visit packets", () => {
    const markdown = buildVisitPacketMarkdown(
      {
        ...sampleState,
        documents: [],
        labResults: [],
        profile: { ...sampleState.profile, cancerCareMode: true },
        questions: [],
        symptoms: [],
        visits: [],
        vitals: [
          {
            date: "2026-06-04",
            type: "temperature",
            temperatureC: 38.1,
            note: "오한 동반",
          },
        ],
      },
      {
        exportedAt: "2026-06-04T08:00:00.000Z",
      },
    );

    expect(markdown).toContain(
      `- 2026-06-04: [활력 · 발열 연락 기준] 체온 38.1℃ / 오한 동반 / 암환자 공통 기준에서 체온 38℃ 이상 또는 오한은 즉시 응급실/진료팀 연락 기준으로 확인해야 합니다. / 근거: 국가암정보센터 감염 의료진 상담 기준 (${nccInfectionUrl})`,
    );
    expect(markdown).toContain(
      `- 2026-06-04: 체온 38.1℃ - 발열 연락 기준 · 암환자 공통 체온·감염 연락 기준 / 오한 동반 / 근거: 국가암정보센터 감염 의료진 상담 기준 (${nccInfectionUrl})`,
    );
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

  it("excludes malformed dated records from bounded visit packet ranges", () => {
    const markdown = buildVisitPacketMarkdown(
      {
        ...sampleState,
        documents: [
          {
            date: "not-a-date",
            title: "깨진 날짜 서류",
            category: "visit-note",
            body: "최근 범위에 들어오면 안 됨",
            tags: "복원 오류",
          },
        ],
        labResults: [],
        questions: [],
        symptoms: [],
        visits: [],
        vitals: [
          {
            date: "unknown",
            type: "blood-pressure",
            systolic: 142,
            diastolic: 92,
            note: "깨진 날짜 혈압",
          },
        ],
      },
      { exportedAt: "2026-06-03T08:00:00.000Z", range: "7d" },
    );

    expect(markdown).toContain("범위: 최근 7일");
    expect(markdown).not.toContain("깨진 날짜 서류");
    expect(markdown).not.toContain("깨진 날짜 혈압");
  });

  it("excludes malformed dated records from all-range visit packet summaries", () => {
    const markdown = buildVisitPacketMarkdown(
      {
        ...sampleState,
        documents: [
          ...sampleState.documents,
          {
            date: "2026-02-31",
            title: "깨진 전체 기간 서류",
            category: "visit-note",
            body: "전체 기간에도 들어오면 안 됨",
            tags: "복원 오류",
          },
        ],
        labResults: [
          ...sampleState.labResults,
          {
            date: "2026-13-01",
            name: "ANC",
            value: "0.4",
            unit: "10^3/uL",
            lower: "1.5",
            upper: "8.0",
            note: "깨진 전체 기간 검사",
          },
        ],
        questions: [
          ...sampleState.questions,
          {
            date: "2026-06-31",
            topic: "깨진 전체 기간 질문",
            question: "전체 기간 질문에 들어오면 안 됨",
            priority: "high",
            status: "open",
            answer: "",
          },
        ],
        symptoms: [
          ...sampleState.symptoms,
          {
            date: "2026-11-31",
            symptom: "고열",
            severity: 8,
            medication: "",
            body: "전체 기간 증상에 들어오면 안 됨",
            action: "진료팀 확인",
          },
        ],
        visits: [
          ...sampleState.visits,
          {
            date: "2026-12-32",
            hospital: "깨진 전체 기간 병원",
            reason: "복원 오류",
            summary: "전체 기간 방문에 들어오면 안 됨",
            plan: "",
            nextDate: "",
          },
        ],
        vitals: [
          ...sampleState.vitals,
          {
            date: "2026-06-31",
            type: "blood-pressure",
            systolic: 142,
            diastolic: 92,
            note: "깨진 전체 기간 혈압",
          },
        ],
      },
      { exportedAt: "2026-06-03T08:00:00.000Z", range: "all" },
    );

    expect(markdown).toContain("범위: 전체");
    expect(markdown).toContain("혈액검사 결과");
    expect(markdown).toContain("2026-06-03");
    expect(markdown).not.toContain("깨진 전체 기간 서류");
    expect(markdown).not.toContain("깨진 전체 기간 검사");
    expect(markdown).not.toContain("깨진 전체 기간 질문");
    expect(markdown).not.toContain("깨진 전체 기간 증상");
    expect(markdown).not.toContain("깨진 전체 기간 병원");
    expect(markdown).not.toContain("깨진 전체 기간 혈압");
    expect(markdown).not.toContain("2026-02-31");
    expect(markdown).not.toContain("2026-13-01");
    expect(markdown).not.toContain("2026-06-31");
    expect(markdown).not.toContain("2026-11-31");
    expect(markdown).not.toContain("2026-12-32");
  });

  it("omits malformed follow-up dates from visit packet visit rows", () => {
    const markdown = buildVisitPacketMarkdown(
      {
        ...sampleState,
        visits: [
          {
            date: "2026-06-03",
            hospital: "종양내과",
            reason: "정기 추적",
            summary: "검사 결과 확인",
            plan: "2주 뒤 재검",
            nextDate: "2026-06-31",
          },
        ],
      },
      { exportedAt: "2026-06-03T08:00:00.000Z", range: "all" },
    );

    expect(markdown).toContain("종양내과 / 정기 추적");
    expect(markdown).toContain("2주 뒤 재검");
    expect(markdown).not.toContain("다음 일정: 2026-06-31");
    expect(markdown).not.toContain("2026-06-31");
  });
});
