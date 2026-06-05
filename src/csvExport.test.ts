import { describe, expect, it } from "vitest";
import {
  buildCareVaultCsv,
  buildCsvExportFingerprint,
  buildCsvExportScopeSummary,
  formatCsvExportDescription,
  formatCsvExportScopeSummary,
  formatCsvExportStatus,
  formatCsvPreviewDescription,
  formatCsvPreviewStatus,
  type CsvExportState,
} from "./csvExport";
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

const kdcaHypertensionUrl =
  "https://health.kdca.go.kr/healthinfo/biz/health/ntcnInfo/healthSourc/thtimtCntnts/thtimtCntntsView.do?thtimt_cntnts_sn=28";
const kdcaHypoglycemiaUrl =
  "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=2350";
const nccInfectionUrl = "https://www.cancer.go.kr/lay1/S1T435C439/contents.do";
const kdaCareTargetUrl = "https://www.diabetes.or.kr/general/info/treat/treat_01.php";
const kdaTargetUrl = "https://www.diabetes.or.kr/general/info/treat/treat_01.php";
const cervicalWarningDraft = buildCervicalCancerAlertSymptomDraft(cervicalCancerCareAlerts[0]);

const state: CsvExportState = {
  profile: {
    name: "QA 사용자",
    age: "56",
    sex: "female",
    heightCm: "164",
    weightKg: "62",
    waistCm: "82",
    cancerCareMode: true,
    diabetes: true,
    hypertension: true,
  },
  foodQuery: "브로콜리, 현미밥, 자몽 주스",
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
      date: "2026-06-10",
      topic: "부작용",
      question: "오심 조절을 어떻게 볼까요?",
      priority: "high",
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
  it("summarizes CSV export scope for action labels and status", () => {
    expect(buildCsvExportScopeSummary(state)).toEqual({
      hasCancerCareReferences: true,
      hasFoodCheck: true,
      recordCount: 7,
    });
    expect(formatCsvExportScopeSummary(state)).toBe(
      "기록 7개 · 케어큐 최대 8개 · 자궁경부암 참고 포함 · 음식 판단 포함 · 기준/출처 포함 · 로컬 경로 제외",
    );
    expect(formatCsvExportDescription(state)).toBe(
      "CSV 내보내기 · 기록 7개 · 케어큐 최대 8개 · 자궁경부암 참고 포함 · 음식 판단 포함 · 기준/출처 포함 · 로컬 경로 제외",
    );
    expect(formatCsvExportStatus(state)).toBe(
      "CSV 내보냄 · 기록 7개 · 케어큐 최대 8개 · 자궁경부암 참고 포함 · 음식 판단 포함 · 기준/출처 포함 · 로컬 경로 제외",
    );
    expect(formatCsvPreviewDescription(state)).toBe(
      "CSV 미리보기 · 기록 7개 · 케어큐 최대 8개 · 자궁경부암 참고 포함 · 음식 판단 포함 · 기준/출처 포함 · 로컬 경로 제외",
    );
    expect(formatCsvPreviewStatus(state)).toBe(
      "CSV 미리보기 생성 · 기록 7개 · 케어큐 최대 8개 · 자궁경부암 참고 포함 · 음식 판단 포함 · 기준/출처 포함 · 로컬 경로 제외",
    );
  });

  it("fingerprints CSV-relevant state without local attachment paths", () => {
    const baseline = buildCsvExportFingerprint({
      ...state,
      documents: [
        {
          ...state.documents[0],
          attachmentPath: "/Users/wj/private/result.pdf",
        } as CsvExportState["documents"][number],
      ],
    });
    const sameCsvContent = buildCsvExportFingerprint({
      ...state,
      documents: [
        {
          ...state.documents[0],
          attachmentPath: "/Users/wj/other/private/result.pdf",
        } as CsvExportState["documents"][number],
      ],
    });
    const changedCsvContent = buildCsvExportFingerprint({
      ...state,
      foodQuery: `${state.foodQuery}, 생굴`,
    });

    expect(baseline).toBe(sameCsvContent);
    expect(changedCsvContent).not.toBe(baseline);
    expect(baseline).not.toContain("/Users/wj/private");
    expect(baseline).not.toContain("attachmentPath");
  });

  it("builds a single spreadsheet-friendly CSV from local records", () => {
    const csv = buildCareVaultCsv(state, "2026-06-03T10:00:00.000Z");

    expect(csv).toContain('"section","date","title","value","status","detail"');
    expect(csv).toContain('"56세 / 164cm / 62kg / 허리 82cm"');
    expect(csv).toContain('"profile","","QA 사용자","56세 / 164cm / 62kg / 허리 82cm","여성"');
    expect(csv).toContain('"care_queue","2026-06-03","증상 · 자궁경부암 경고 기록","비정상 질출혈 3/10","watch"');
    expect(csv).toContain("자궁경부암 경고 신호 기록 초안");
    expect(csv).toContain("양·색·냄새/통증 정도");
    expect(csv).toContain("동반 증상");
    expect(csv).toContain("menu_seq=4888");
    expect(csv).toContain('"care_queue","2026-06-10","질문 · 이번 진료 우선","부작용","watch","오심 조절을 어떻게 볼까요?"');
    expect(csv).toContain(
      '"care_queue","2026-06-01","활력 · 고혈압 전단계 범위","혈압 132/84 mmHg","watch","아침 측정 / 한국 성인 남녀 공통 기준 고혈압 전단계입니다.',
    );
    expect(csv).toContain("근거: 질병관리청 국가건강정보포털 고혈압");
    expect(csv).toContain(
      '"care_queue","2026-06-03","자궁경부암 · 국가암검진 대상 기준 해당","자궁경부암 검진 기준 빠른 확인","neutral"',
    );
    expect(csv).toContain("https://www.cancer.go.kr/lay1/S1T553C554/contents.do");
    expect(csv).not.toContain("근거: 출처:");
    expect(csv).toContain(
      '"care_queue","2026-06-01","검사 · 기준보다 낮음","WBC 3.4 10^3/uL","watch","낮음 / 검사실 기준보다 낮습니다. 증상과 함께 진료 때 확인하세요. / 근거: 서울아산병원 전혈구검사 참고치 (https://ent.amc.seoul.kr/asan/mobile/healthinfo/management/managementDetail.do?managementId=126)"',
    );
    expect(csv).toContain('"visit","2026-06-02","서울암센터","항암 후 추적","다음 예약 2026-06-10"');
    expect(csv).toContain(
      '"lab","2026-06-01","WBC","3.4 10^3/uL","사용자 입력 기준 범위 4.0~10.0 10^3/uL","기준보다 낮음 | 낮음 / 근거: 서울아산병원 전혈구검사 참고치 (https://ent.amc.seoul.kr/asan/mobile/healthinfo/management/managementDetail.do?managementId=126)"',
    );
    expect(csv).toContain(
      '"symptom","2026-06-03","오심","5/10","증상 기록 | 항구토제","식후 악화 | 진료 때 확인"',
    );
    expect(csv).toContain(
      '"symptom","2026-06-03","비정상 질출혈","3/10","자궁경부암 경고 기록"',
    );
    expect(csv).toContain(
      '"food_check","","음식 판단 입력","브로콜리, 현미밥, 자몽 주스","공식 출처 기반 음식 규칙"',
    );
    expect(csv).toContain("면역저하 검사 연결: 2026-06-01 WBC 3.4 10^3/uL");
    expect(csv).toContain("입력 기준 하한 4.0 10^3/uL보다 낮게 기록");
    expect(csv).toContain("국가암정보센터 증상별 식생활 - 면역기능의 저하");
    expect(csv).toContain('"question","2026-06-10","부작용","오심 조절을 어떻게 볼까요?","open","이번 진료 우선"');
    expect(csv).toContain(
      "브로콜리: 채소 중심 식단에 적합 (국가암정보센터 암예방 식이 - https://cancer.go.kr/lay1/S1T226C230/contents.do)",
    );
    expect(csv).toContain(
      "자몽: 약물 상호작용 확인 필요 (질병관리청 국가건강정보포털 식이영양 - https://health.kdca.go.kr/",
    );
    expect(csv).toContain('"document","2026-06-03","검사 결과","lab","needs-review"');
    expect(csv).toContain(
      '"standard_boundary","","기준 사용 경계","성인 기준 참고","","성인 기준 참고용입니다.',
    );
    expect(csv).toContain("진료팀 기준을 우선합니다.");
    expect(csv).toContain(
      '"standard_applicability","","성별 기준 요약","남녀 공통","","BMI·혈압·혈당·저혈당·현저한 고혈당·체온 기준 · A1C/FPG/PP2·BUN/Cr/eGFR/UACR·Na/K·총콜레스테롤/LDL/TG·AST/ALT·Alb/Ca/P/요산 기준·ANC/PLT 위험 기준"',
    );
    expect(csv).toContain('"standard_applicability","","성별 기준 요약","성별 분리","","허리둘레 남성 90cm/여성 85cm');
    expect(csv).toContain(
      '"standard_profile_sex","","현재 프로필 성별 적용","BMI·혈압·혈당·신기능·전해질·단백·칼슘·인산·요산","","성인 남녀 공통 기준과 BUN/Cr·eGFR·UACR·Na/K·Alb·Ca·P·요산 입력 보조값',
    );
    expect(csv).toContain('"standard_profile_sex","","현재 프로필 성별 적용","허리둘레","","여성 85cm 이상이면 복부비만 기준 해당"');
    expect(csv).toContain('"standard_profile_sex","","현재 프로필 성별 적용","HDL-C","","여성 프리셋은 50 mg/dL 이상"');
    expect(csv).toContain(
      '"standard_profile_sex","","현재 프로필 성별 적용","헤모글로빈","","여성 프리셋은 12.0-16.0 g/dL',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","BMI 기준","정상","대한비만학회 비만 진료지침 2022","남녀 공통 · 18.5-22.9 kg/m²',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","BMI 기준","비만","대한비만학회 비만 진료지침 2022","남녀 공통 · 1단계 25-29.9, 2단계 30-34.9, 3단계 35 이상 kg/m²',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","허리둘레 기준","남성 복부비만","대한비만학회 비만 진료지침 2022","남성 기준 · 90cm 이상',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","허리둘레 기준","여성 복부비만","대한비만학회 비만 진료지침 2022","여성 기준 · 85cm 이상',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","혈압 기준","정상","질병관리청 국가건강정보포털 고혈압","남녀 공통 · <120/<80 mmHg',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","혈압 기준","주의/전단계","질병관리청 국가건강정보포털 고혈압","남녀 공통 · 주의 120-129/<80',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","혈압 기준","고혈압","질병관리청 국가건강정보포털 고혈압","남녀 공통 · 1기 140/90 이상',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","당뇨 추적 혈당 목표","식전/공복 목표","대한당뇨병학회 당뇨병 관리 목표","남녀 공통 · 80-130 mg/dL',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","저혈당 확인 기준","저혈당","질병관리청 국가건강정보포털 급성 합병증_저혈당","남녀 공통 · 70 mg/dL 미만이면 증상·의식상태와 대처 기준 확인 | https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=2350"',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","현저한 고혈당 확인 기준","현저한 고혈당","질병관리청 국가건강정보포털 고혈당","남녀 공통 · 250 mg/dL 이상이면 현저한 고혈당으로 병원 확인 기준 | https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5304"',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","혈당 선별 기준","공복","질병관리청 국가건강정보포털 당뇨병","남녀 공통 · 정상 <100',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","혈당 선별 기준","무작위","질병관리청 국가건강정보포털 당뇨병","남녀 공통 · 증상과 함께 200 mg/dL 이상',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","A1C 검사 기준","A1C 정상","질병관리청 국가건강정보포털 당뇨병","남녀 공통 · 당화혈색소 <5.7%',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","A1C 검사 기준","A1C 진단 기준","질병관리청 국가건강정보포털 당뇨병","남녀 공통 · 6.5% 이상이면 당뇨병 진단 기준 가능성 확인',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","A1C 검사 기준","A1C 관리 목표","질병관리청 국가건강정보포털 당뇨병","남녀 공통 · 성인 2형 당뇨병 일반 목표 6.5% 미만',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","BUN/Cr 신기능 기준","BUN","질병관리청 국가건강정보포털 임상 화학 검사","남녀 공통 · 10-26 mg/dL',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","BUN/Cr 신기능 기준","Cr","질병관리청 국가건강정보포털 임상 화학 검사","남녀 공통 · 성인 0.7-1.4 mg/dL',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","BUN/Cr 신기능 기준","상승 확인","질병관리청 국가건강정보포털 임상 화학 검사","남녀 공통 · 단독 진단이 아니라 탈수·근육량·약물·소변검사·eGFR',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","eGFR 신장여과율 기준","보존 범위","질병관리청 국가건강정보포털 만성콩팥병","남녀 공통 · 60 mL/min/1.73m² 이상이어도 단백뇨·혈뇨',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","eGFR 신장여과율 기준","60 미만 지속","질병관리청 국가건강정보포털 만성콩팥병","남녀 공통 · 60 미만이 3개월 이상 지속되면 만성콩팥병 기준 가능성 진료팀 확인',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","eGFR 신장여과율 기준","동반 확인","질병관리청 국가건강정보포털 만성콩팥병","남녀 공통 · 알부민뇨·혈뇨·소변검사·혈청 Cr',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","UACR 알부민뇨 기준","A1 낮음","질병관리청 국가건강정보포털 만성콩팥병","남녀 공통 · 알부민뇨 30 mg/g 미만',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","UACR 알부민뇨 기준","A2 증가","질병관리청 국가건강정보포털 만성콩팥병","남녀 공통 · 30-300 mg/g 범위는 반복 정량검사와 eGFR 함께 확인',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","UACR 알부민뇨 기준","A3 고도 증가","질병관리청 국가건강정보포털 만성콩팥병","남녀 공통 · 300 mg/g 이상이면 말기 신부전 진행 위험 평가 진료팀 확인',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","Na/K 전해질 기준","Na","질병관리청 국가건강정보포털 임상 화학 검사","남녀 공통 · 135-145 mmol/L',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","Na/K 전해질 기준","K","질병관리청 국가건강정보포털 임상 화학 검사","남녀 공통 · 3.5-5.5 mmol/L',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","Na/K 전해질 기준","변화 확인","질병관리청 국가건강정보포털 임상 화학 검사","남녀 공통 · 단독 진단이 아니라 구토·설사·탈수·신장 상태',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","지질 검사 기준","적정","질병관리청 국가건강정보포털 이상지질혈증 관리","남녀 공통 · 총콜레스테롤 <200',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","지질 검사 기준","높음","질병관리청 국가건강정보포털 이상지질혈증 관리","남녀 공통 · 총콜레스테롤 240 이상',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","지질 검사 기준","정기검사","질병관리청 국가건강정보포털 이상지질혈증 관리","남녀 공통 · 고위험군은 매년 지질검사, 수치 이상 시 전문의 상담으로 맞춤 치료계획 확인',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","HDL 성별 기준","남성 HDL","대한당뇨병학회 당뇨병 관리 목표","남성 기준 · 40 mg/dL 이상',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","HDL 성별 기준","여성 HDL","대한당뇨병학회 당뇨병 관리 목표","여성 기준 · 50 mg/dL 이상',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","HDL 성별 기준","낮음 확인","대한당뇨병학회 당뇨병 관리 목표","성별 분리 · 남성 40 미만 또는 여성 50 미만',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","GGT 성별 기준","남성 GGT","질병관리청 국가건강정보포털 임상 화학 검사","남성 기준 · 11-63 IU/L',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","GGT 성별 기준","여성 GGT","질병관리청 국가건강정보포털 임상 화학 검사","여성 기준 · 8-35 IU/L',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","GGT 성별 기준","상승 확인","질병관리청 국가건강정보포털 임상 화학 검사","성별 분리 · 간담도·음주·약물 영향',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","AST/ALT 간기능 기준","AST","질병관리청 국가건강정보포털 간기능검사","남녀 공통 · 0-40 IU/L',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","AST/ALT 간기능 기준","ALT","질병관리청 국가건강정보포털 간기능검사","남녀 공통 · 0-40 IU/L',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","AST/ALT 간기능 기준","상승 확인","질병관리청 국가건강정보포털 간기능검사","남녀 공통 · 단독 진단이 아니라 증상·약물·영상',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","알부민/총단백 기준","알부민","질병관리청 국가건강정보포털 임상 화학 검사","남녀 공통 · 3.3-5.2 g/dL',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","알부민/총단백 기준","총단백","질병관리청 국가건강정보포털 임상 화학 검사","남녀 공통 · 6.0-8.0 g/dL',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","알부민/총단백 기준","낮음 확인","질병관리청 국가건강정보포털 임상 화학 검사","남녀 공통 · 단독 진단이 아니라 간질환·신장질환·영양 결핍',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","칼슘 기준","Ca","질병관리청 국가건강정보포털 임상 화학 검사","남녀 공통 · 8.8-10.5 mg/dL',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","칼슘 기준","상승 확인","질병관리청 국가건강정보포털 임상 화학 검사","남녀 공통 · 단독 진단이 아니라 뼈 전이 암·갑상선기능항진증',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","칼슘 기준","감소 확인","질병관리청 국가건강정보포털 임상 화학 검사","남녀 공통 · 부갑상선저하증·신부전·비타민D',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","인산 기준","P","질병관리청 국가건강정보포털 임상 화학 검사","남녀 공통 · 성인 2.5-4.5 mg/dL',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","인산 기준","상승 확인","질병관리청 국가건강정보포털 임상 화학 검사","남녀 공통 · 단독 진단이 아니라 신부전·부갑상선기능저하증',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","인산 기준","감소 확인","질병관리청 국가건강정보포털 임상 화학 검사","남녀 공통 · 고칼슘혈증·이뇨제·장기간 제산제',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","요산 기준","요산","질병관리청 국가건강정보포털 임상 화학 검사","남녀 공통 입력 보조 · 3-7 mg/dL',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","요산 기준","상승 맥락","질병관리청 국가건강정보포털 임상 화학 검사","남녀 공통 · 단독 진단이 아니라 전이암·다발골수종·백혈병·항암치료',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","요산 기준","결과지 우선","질병관리청 국가건강정보포털 임상 화학 검사","남녀 공통 · 병원·검사법·성별 참고치',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","헤모글로빈 입력 보조","남성 헤모글로빈","서울아산병원 혈색소 검사 참고치","남성 입력 보조 · 13.0-17.0 g/dL',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","헤모글로빈 입력 보조","여성 헤모글로빈","서울아산병원 혈색소 검사 참고치","여성 입력 보조 · 12.0-16.0 g/dL',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","헤모글로빈 입력 보조","결과지 우선","서울아산병원 혈색소 검사 참고치","성별·검사실·치료 상태',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","ANC 감염 위험 기준","ANC 발열 기준","국가암정보센터 항암 부작용 증상 관리 지침","암환자 공통 · ANC <500 cells/mm²',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","ANC 감염 위험 기준","항암 후 시기","국가암정보센터 항암 부작용 증상 관리 지침","암환자 공통 · 항암제 주사 후 보통 7-14일',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","ANC 감염 위험 기준","동반 확인","국가암정보센터 항암 부작용 증상 관리 지침","암환자 공통 · 기침·호흡곤란',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","혈소판 출혈 위험 기준","출혈 예방 기준","국가암정보센터 항암 부작용 증상 관리 지침","암환자 공통 · 혈소판 <75,000/mm³',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","혈소판 출혈 위험 기준","의료진 상담 기준","국가암정보센터 항암 부작용 증상 관리 지침","암환자 공통 · 혈소판 <50,000/mm³ 수준',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","혈소판 출혈 위험 기준","응급 확인","국가암정보센터 항암 부작용 증상 관리 지침","암환자 공통 · 10분 이상 압박해도 계속되는 출혈',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","체온·감염 연락 기준","발열·오한 연락","국가암정보센터 감염 의료진 상담 기준","암환자 공통 · 오한 또는 체온 38℃ 이상',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","체온·감염 연락 기준","동반 증상","국가암정보센터 감염 의료진 상담 기준","암환자 공통 · 오심·구토·설사',
    );
    expect(csv).toContain(
      '"standard_numeric_range","","체온·감염 연락 기준","기록 항목","국가암정보센터 감염 의료진 상담 기준","암환자 공통 · 체온, 측정 시간',
    );
    expect(csv).toContain('"standard_coverage","","기준 적용 범위","[판정 적용] 한국 성인 BMI');
    expect(csv).toContain("남성 90cm, 여성 85cm");
    expect(csv).toContain('"standard_coverage","","기준 적용 범위","[입력 보조] 지질 검사 공통 프리셋');
    expect(csv).toContain("총콜레스테롤·LDL·중성지방 성인 공통 입력 보조값");
    expect(csv).toContain('"standard_coverage","","기준 적용 범위","[입력 보조] HDL 콜레스테롤 프리셋');
    expect(csv).toContain("HDL 남성 40 mg/dL 이상, 여성 50 mg/dL 이상 분리");
    expect(csv).toContain('"standard_coverage","","기준 적용 범위","[입력 보조] GGT 감마지티피 프리셋');
    expect(csv).toContain("GGT 남성 11-63 IU/L, 여성 8-35 IU/L 분리");
    expect(csv).toContain('"standard_coverage","","기준 적용 범위","[입력 보조] BUN/Cr 신기능 프리셋');
    expect(csv).toContain("BUN 10-26 mg/dL, 성인 Cr 0.7-1.4 mg/dL");
    expect(csv).toContain('"standard_coverage","","기준 적용 범위","[입력 보조] eGFR 신장여과율 프리셋');
    expect(csv).toContain("eGFR 60 미만이 3개월 이상 지속되거나 알부민뇨");
    expect(csv).toContain('"standard_coverage","","기준 적용 범위","[입력 보조] UACR 알부민뇨 프리셋');
    expect(csv).toContain("알부민뇨 30 mg/g 미만, 30-300 mg/g, 300 mg/g 이상 단계");
    expect(csv).toContain('"standard_coverage","","기준 적용 범위","[입력 보조] Na/K 전해질 프리셋');
    expect(csv).toContain("나트륨 135-145 mmol/L, 칼륨 3.5-5.5 mmol/L");
    expect(csv).toContain('"standard_coverage","","기준 적용 범위","[입력 보조] AST/ALT 간기능 프리셋');
    expect(csv).toContain("AST·ALT 성인 남녀 공통 0-40 IU/L 입력 보조");
    expect(csv).toContain('"standard_coverage","","기준 적용 범위","[입력 보조] 알부민/총단백 프리셋');
    expect(csv).toContain("혈청 알부민 3.3-5.2 g/dL과 총단백 6.0-8.0 g/dL");
    expect(csv).toContain('"standard_coverage","","기준 적용 범위","[입력 보조] 칼슘 프리셋');
    expect(csv).toContain("칼슘 8.8-10.5 mg/dL 보조값");
    expect(csv).toContain('"standard_coverage","","기준 적용 범위","[입력 보조] 인산 프리셋');
    expect(csv).toContain("성인 인산 2.5-4.5 mg/dL 보조값");
    expect(csv).toContain('"standard_coverage","","기준 적용 범위","[입력 보조] 요산 프리셋');
    expect(csv).toContain("요산 3-7 mg/dL 보조값");
    expect(csv).toContain('"standard_coverage","","기준 적용 범위","[입력 보조] 헤모글로빈 성별 프리셋');
    expect(csv).toContain("헤모글로빈 남성 13.0-17.0 g/dL, 여성 12.0-16.0 g/dL 분리");
    expect(csv).toContain('"standard_coverage","","기준 적용 범위","[입력 보조] ANC 감염 위험 프리셋');
    expect(csv).toContain("ANC 500 미만과 발열·오한·호흡기 증상");
    expect(csv).toContain('"standard_coverage","","기준 적용 범위","[입력 보조] 혈소판 출혈 위험 기준');
    expect(csv).toContain("혈소판 감소와 코피·검은 변·혈뇨·비정상 질출혈");
    expect(csv).toContain('"standard_coverage","","기준 적용 범위","[사용자 기준 우선] 기타 검사실 기준');
    expect(csv).toContain("근거: 대한비만학회 비만 진료지침 2022 (https://general.kosso.or.kr/");
    expect(csv).toContain(
      '"cervical_care_reference","","자궁경부암 케어 참고","우선 확인 체크리스트","국가암정보센터·KDCA"',
    );
    expect(csv).toContain("오늘 증상 기록: 출혈·분비물 변화");
    expect(csv).toContain("다음 진료 질문: 병원 추적검사 일정과 국가암검진 2년 주기");
    expect(csv).toContain("의심 증상 진단검사 목록");
    expect(csv).toContain("국립암센터 자궁경부암 조기 진단과 예방법");
    expect(csv).toContain("치료 후 생활 상담: 림프부종 피부 변화");
    expect(csv).toContain("골반 방사선 후 폐경·질협착");
    expect(csv).toContain(
      '"cervical_care_reference","","자궁경부암 케어 참고","경고 신호 기록 항목","국가암정보센터·KDCA"',
    );
    expect(csv).toContain("언제: 새로 시작된 날짜, 반복 횟수, 치료·검사 후 며칠째인지");
    expect(csv).toContain("무엇이: 출혈·분비물 색/냄새/양, 혈뇨·혈변, 배뇨·배변 변화");
    expect(csv).toContain("얼마나: 통증 정도와 지속 시간, 복부팽만·구토·배변/가스 변화 동반 여부");
    expect(csv).toContain("같이: 발열, 열감, 피부 붉어짐, 다리 부종·통증, 상처 동반 여부");
    expect(csv).toContain('"cervical_care_reference","","자궁경부암 케어 참고","진료팀에 확인할 신호"');
    expect(csv).toContain("비정상 질출혈");
    expect(csv).toContain('"cervical_care_reference","","자궁경부암 케어 참고","진료 질문 초안"');
    expect(csv).toContain("검진·진단검사 구분");
    expect(csv).toContain("골반내진, 자궁경부세포검사, HPV 검사, 질확대경, 조직검사");
    expect(csv).toContain("경질초음파, 골반 MRI");
    expect(csv).toContain("치료 선택 기준");
    expect(csv).toContain("제 병기, 암 크기, 전신상태, 연령, 향후 출산 희망 여부");
    expect(csv).toContain("골반 방사선 후 폐경");
    expect(csv).toContain("난소부전, 홍조·무월경 같은 폐경 증상");
    expect(csv).toContain("질협착, 성욕 변화, 골다공증 위험");
    expect(csv).toContain("장·방광 후기 변화");
    expect(csv).toContain("6개월 이상 지난 뒤 장폐색, 혈변, 혈뇨 가능성");
    expect(csv).toContain("배변/가스 변화");
    expect(csv).toContain("식생활·보조식품");
    expect(csv).toContain("민간요법·건강보조식품");
    expect(csv).toContain("림프부종");
    expect(csv).toContain("피부 붉어짐");
    expect(csv).toContain("의료진에게 바로 연락");
    expect(csv).toContain(
      "출처: 국가암정보센터 자궁경부암 치료방법 - https://www.cancer.go.kr/",
    );
    expect(csv).toContain(
      "출처: 국가암정보센터 방사선치료의 부작용 - https://www.cancer.go.kr/lay1/S1T292C294/contents.do",
    );
    expect(csv).toContain(
      "출처: 국가암정보센터 자궁경부암 치료의 부작용 - https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&menu_seq=4894",
    );
    expect(csv).toContain(
      "출처: 국가암정보센터 림프부종 치료 전후관리 - https://www.cancer.go.kr/",
    );
    expect(csv).toContain(
      "출처: 국가암정보센터 자궁경부암 식생활 - https://www.cancer.go.kr/",
    );
    expect(csv).toContain(
      "출처: 국립암센터 자궁경부암 조기 진단과 예방법 - https://www.cancer.go.kr/download.do",
    );
    expect(csv).toContain(
      '"cervical_care_reference","","자궁경부암 케어 참고","검진 기준 빠른 확인","국가암검진 대상 기준 해당"',
    );
    expect(csv).toContain("2년 간격 자궁경부세포검사");
    expect(csv).toContain("산정특례기간");
    expect(csv).toContain("추적검사 일정·결과");
    expect(csv).toContain("국가암검진 2년 주기");
    expect(csv).toContain("림프부종 감염·악화 신호");
    expect(csv).toContain("갑자기 단단해지는 느낌");
    expect(csv).toContain("의심 증상 진단검사 준비");
    expect(csv).toContain("질확대경·조직검사·경질초음파·골반 MRI");
    expect(csv).toContain("병기 설명 메모");
    expect(csv).toContain("0기는 자궁경부 상피내암");
    expect(csv).toContain("방광·직장점막 침범 또는 원격전이");
    expect(csv).toContain("배뇨·배변·출혈 변화 메모");
    expect(csv).toContain("혈변·혈뇨");
    expect(csv).toContain("장폐색·혈변·혈뇨 연락 메모");
    expect(csv).toContain("복부팽만, 구토, 배변/가스 변화, 혈변, 혈뇨");
    expect(csv).toContain("연락 기준을 진료팀에 확인");
    expect(csv).toContain("국가암정보센터 자궁경부암 치료의 부작용");
    expect(csv).toContain("결과통보·비용 확인");
    expect(csv).toContain("15일 이내");
    expect(csv).toContain("전액 무료");
    expect(csv).toContain("국가암정보센터 국가암검진 대상자 선정 및 통보");
    expect(csv).toContain("국가암정보센터 국가암검진 검진주기 및 검진방법");
    expect(csv).toContain('"cervical_care_reference","","자궁경부암 케어 참고","회복 일정 메모"');
    expect(csv).toContain("원추절제술 후 생활 제한");
    expect(csv).toContain(
      "출처: 국가암정보센터 자궁경부암 치료 후 생활 - https://www.cancer.go.kr/",
    );
    expect(csv).toContain("광범위 자궁절제술 후 회복");
    expect(csv).toContain("림프부종 피부·감염 관리");
    expect(csv).toContain("열감·통증");
    expect(csv).toContain("부종 악화 가능성");
    expect(csv).toContain("재발·추적검사 주기 메모");
    expect(csv).toContain("첫 2년 3개월마다");
    expect(csv).toContain("국가암정보센터 자궁경부암 재발 및 전이");
    expect(csv).toContain("골반 방사선치료 난소기능·폐경 증상 상담");
    expect(csv).toContain("국가암정보센터 방사선치료의 부작용");
    expect(csv).toContain("성생활 재개·통증 상담");
    expect(csv).toContain("질건조·질협착");
    expect(csv).toContain("국가암정보센터 자궁경부암 성생활");
    expect(csv).toContain("임신·출산 계획 상담");
    expect(csv).toContain("광범위자궁경부절제수술");
    expect(csv).toContain("국가암정보센터 자궁경부암 임신과 출산");
    expect(csv).toContain("식생활·보조식품 확인");
    expect(csv).toContain("특별히 피하거나 추천하는 음식은 없고");
    expect(csv).toContain("국가암정보센터 자궁경부암 식생활");
    expect(csv).toContain('"cervical_care_reference","","자궁경부암 케어 참고","검진·예방 메모"');
    expect(csv).toContain("20세 이상 여성");
    expect(csv).toContain("자궁경부세포검사 전 확인");
    expect(csv).toContain("생리 기간을 피해서");
    expect(csv).toContain("HPV 검사를 함께 받을 수");
    expect(csv).toContain("HPV 백신은 예방용");
    expect(csv).toContain("접종 후에도 자궁경부암 선별검사");
    expect(csv).toContain("선별검사는 변경 없이");
    expect(csv).toContain("국가암정보센터 자궁경부암 일반적 증상");
  });

  it("exports source-backed fever or chills symptoms as care queue rows", () => {
    const csv = buildCareVaultCsv(
      {
        ...state,
        documents: [],
        foodQuery: "",
        labResults: [],
        profile: { ...state.profile, cancerCareMode: false },
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
      "2026-06-03T10:00:00.000Z",
    );

    expect(csv).toContain(
      '"care_queue","2026-06-03","증상 · 감염 의심 기록","38도 발열과 오한 3/10","watch"',
    );
    expect(csv).toContain("근거: 국가암정보센터 감염 의료진 상담 기준");
    expect(csv).toContain("https://www.cancer.go.kr/lay1/S1T435C439/contents.do");
  });

  it("exports source-backed cancer-pain symptoms as care queue rows", () => {
    const painTemplate = findSymptomSupportTemplate("통증점수와 진통제 효과")!;
    const csv = buildCareVaultCsv(
      {
        ...state,
        documents: [],
        foodQuery: "",
        labResults: [],
        profile: { ...state.profile, cancerCareMode: false },
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
      "2026-06-03T10:00:00.000Z",
    );

    expect(csv).toContain(
      '"care_queue","2026-06-03","증상 · 고위험 증상","등 통증 8/10","watch"',
    );
    expect(csv).toContain("근거: 국가암정보센터 통증평가 항목");
    expect(csv).toContain("https://www.cancer.go.kr/lay1/S1T378C380/contents.do");
    expect(csv).not.toContain("출처: 국가암정보센터 통증평가 항목");
  });

  it("exports generated cervical record-check drafts as source-backed care queue rows", () => {
    const lymphedemaDraft = buildCervicalCancerCareItemSymptomDraft(
      cervicalCancerCareChecks.find((item) => item.label === "림프부종 감염·악화 신호")!,
    );
    const lateBowelBladderDraft = buildCervicalCancerCareItemSymptomDraft(
      cervicalCancerCareChecks.find((item) => item.label === "장폐색·혈변·혈뇨 연락 메모")!,
    );
    const csv = buildCareVaultCsv(
      {
        ...state,
        documents: [],
        foodQuery: "",
        labResults: [],
        profile: { ...state.profile, cancerCareMode: false },
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
        ],
        visits: [],
        vitals: [],
      },
      "2026-06-03T10:00:00.000Z",
    );

    expect(csv).toContain(
      '"care_queue","2026-06-03","증상 · 림프부종 확인 기록","림프부종 감염·악화 신호 3/10","watch"',
    );
    expect(csv).toContain("림프부종 감염·악화 신호 내용을 다음 진료 때 진료팀에 확인");
    expect(csv).toContain(
      "근거: 국가암정보센터 림프부종 치료 전후관리 (https://www.cancer.go.kr/lay1/S1T429C431/contents.do)",
    );
    expect(csv).not.toContain("출처: 국가암정보센터 림프부종 치료 전후관리");
    expect(csv).toContain(
      '"care_queue","2026-06-03","증상 · 장폐색 확인 기록","장폐색·혈변·혈뇨 연락 메모 3/10","watch"',
    );
    expect(csv).toContain("장폐색·혈변·혈뇨 연락 메모 내용을 다음 진료 때 진료팀에 확인");
    expect(csv).toContain("복부팽만, 구토, 배변/가스 변화, 혈변, 혈뇨");
    expect(csv).toContain(
      "근거: 국가암정보센터 자궁경부암 치료의 부작용 (https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&menu_seq=4894)",
    );
    expect(csv).not.toContain("출처: 국가암정보센터 자궁경부암 치료의 부작용");
  });

  it("labels generated cervical memo drafts in direct symptom CSV rows", () => {
    const draft = buildCervicalCancerCareItemSymptomDraft(
      cervicalCancerCarePreventionGuides.find((item) => item.label === "HPV 백신 가족 안내")!,
    );
    const csv = buildCareVaultCsv(
      {
        ...state,
        documents: [],
        foodQuery: "",
        labResults: [],
        profile: { ...state.profile, cancerCareMode: false },
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
      "2026-06-03T10:00:00.000Z",
    );

    expect(csv).toContain(
      '"symptom","2026-06-03","HPV 백신 가족 안내","3/10","자궁경부암 기록 메모"',
    );
    expect(csv).toContain("HPV 백신 가족 안내 내용을 다음 진료 때 진료팀에 확인");
    expect(csv).toContain(
      "근거: 질병관리청 국가건강정보포털 자궁경부암 백신 (https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=3987)",
    );
    expect(csv).not.toContain("출처: 질병관리청 국가건강정보포털 자궁경부암 백신");
  });

  it("labels markerless source-backed cervical warning records in direct symptom CSV rows", () => {
    const csv = buildCareVaultCsv(
      {
        ...state,
        documents: [],
        foodQuery: "",
        labResults: [],
        profile: { ...state.profile, cancerCareMode: false },
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
      "2026-06-03T10:00:00.000Z",
    );

    expect(csv).toContain(
      '"symptom","2026-06-03","성교 후 출혈과 악취 분비물","3/10","자궁경부암 경고 기록"',
    );
    expect(csv).toContain(
      "근거: 국가암정보센터 자궁경부암 일반적 증상 (https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4888)",
    );
    expect(csv).not.toContain("자궁경부암 경고 신호 기록 초안");
  });

  it("exports source-backed cervical general-warning symptoms as care queue rows", () => {
    const csv = buildCareVaultCsv(
      {
        ...state,
        documents: [],
        foodQuery: "",
        labResults: [],
        profile: { ...state.profile, cancerCareMode: false },
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
      "2026-06-03T10:00:00.000Z",
    );

    expect(csv).toContain(
      '"care_queue","2026-06-03","증상 · 자궁경부암 증상 변화 기록","성교 후 출혈과 악취 분비물 3/10","watch"',
    );
    expect(csv).toContain("근거: 국가암정보센터 자궁경부암 일반적 증상");
    expect(csv).toContain(
      "https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4888",
    );
  });

  it("exports source-backed cervical urinary or bowel changes as care queue rows", () => {
    const csv = buildCareVaultCsv(
      {
        ...state,
        documents: [],
        foodQuery: "",
        labResults: [],
        profile: { ...state.profile, cancerCareMode: false },
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
      "2026-06-03T10:00:00.000Z",
    );

    expect(csv).toContain(
      '"care_queue","2026-06-03","증상 · 배뇨·배변 변화 기록","혈뇨와 혈변 4/10","watch"',
    );
    expect(csv).toContain("근거: 국가암정보센터 자궁경부암 치료의 부작용");
    expect(csv).toContain(
      "https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&menu_seq=4894",
    );
  });

  it("exports source-backed cervical bowel-obstruction changes as care queue rows", () => {
    const csv = buildCareVaultCsv(
      {
        ...state,
        documents: [],
        foodQuery: "",
        labResults: [],
        profile: { ...state.profile, cancerCareMode: false },
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
      "2026-06-03T10:00:00.000Z",
    );

    expect(csv).toContain(
      '"care_queue","2026-06-03","증상 · 장폐색 확인 기록","장폐색과 복부팽만 4/10","watch"',
    );
    expect(csv).toContain("근거: 국가암정보센터 자궁경부암 치료의 부작용");
    expect(csv).toContain(
      "https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&menu_seq=4894",
    );
  });

  it("exports source-backed questions with separated evidence", () => {
    const csv = buildCareVaultCsv(
      {
        ...state,
        documents: [],
        foodQuery: "",
        labResults: [],
        profile: { ...state.profile, cancerCareMode: false },
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
      "2026-06-03T10:00:00.000Z",
    );

    expect(csv).toContain(
      '"question","2026-06-20","부작용: 질건조·성교통/성생활 상담","성생활 재개 시점을 어떻게 상담할까요?","open","다음 진료 | 근거: 국가암정보센터 자궁경부암 성생활 (https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=5373)"',
    );
    expect(csv).not.toContain("출처: 국가암정보센터 자궁경부암 성생활");
  });

  it("exports generated lab follow-up questions with separated evidence", () => {
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
    const csv = buildCareVaultCsv(
      {
        ...state,
        documents: [],
        foodQuery: "",
        labResults: [],
        profile: { ...state.profile, cancerCareMode: false },
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
      "2026-06-03T10:00:00.000Z",
    );

    expect(csv).toContain(
      `"question","2026-06-15","검사 수치","2026-06-03 HDL-C 38 mg/dL가 기준 50 mg/dL 이상보다 낮게 기록됐습니다. 원인, 치료 일정 영향, 감염/식사/약 조정에서 주의할 점을 확인해야 할까요? 기존 메모/근거: 대한당뇨병학회 일반 목표 기준입니다. / 적용 기준: 여성 기준 적용","open","이번 진료 우선 | 근거: 대한당뇨병학회 당뇨병 관리 목표 (${kdaTargetUrl})"`,
    );
    expect(csv).not.toContain("출처: 대한당뇨병학회 당뇨병 관리 목표");
  });

  it("exports generated vital standard questions with separated evidence", () => {
    const vitalQuestion = buildVitalStandardQuestionDraft({
      assessmentLabel: "주의혈압 범위",
      assessmentSummary: "한국 성인 남녀 공통 기준 주의혈압입니다. 추세가 오르는지 확인하세요.",
      measurementLabel: "혈압 128/78 mmHg",
      standardId: "blood-pressure",
    });
    const csv = buildCareVaultCsv(
      {
        ...state,
        documents: [],
        foodQuery: "",
        labResults: [],
        profile: { ...state.profile, cancerCareMode: false },
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
      "2026-06-03T10:00:00.000Z",
    );

    expect(csv).toContain(
      `"question","2026-06-15","혈압 기준 확인","혈압 128/78 mmHg 기록을 성인 남녀 공통 한국 성인 혈압 기준과 제 치료 상황에 맞춰 어떻게 해석해야 할까요? 반복 측정 시점, 약·식사·활동 영향, 진료팀 연락 기준을 확인하고 싶습니다. 앱 참고 판정: 주의혈압 범위 - 한국 성인 남녀 공통 기준 주의혈압입니다. 추세가 오르는지 확인하세요.","open","다음 진료 | 근거: 질병관리청 국가건강정보포털 고혈압 (${kdcaHypertensionUrl})"`,
    );
    expect(csv).not.toContain("출처: 질병관리청 국가건강정보포털 고혈압");
  });

  it("exports generated glucose standard questions with separated evidence", () => {
    const vitalQuestion = buildVitalStandardQuestionDraft({
      assessmentLabel: "식전 목표 범위",
      assessmentSummary:
        "대한당뇨병학회 일반 조절목표는 성인 남녀 공통으로 식전 80-130 mg/dL 범위를 제시합니다.",
      measurementLabel: "혈당 118 mg/dL (식전)",
      standardId: "glucose-care",
    });
    const csv = buildCareVaultCsv(
      {
        ...state,
        documents: [],
        foodQuery: "",
        labResults: [],
        profile: { ...state.profile, cancerCareMode: false },
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
      "2026-06-03T10:00:00.000Z",
    );

    expect(csv).toContain(
      `"question","2026-06-15","혈당 기준 확인","혈당 118 mg/dL (식전) 기록을 성인 남녀 공통 당뇨 추적 혈당 기준과 제 치료 상황에 맞춰 어떻게 해석해야 할까요? 반복 측정 시점, 약·식사·활동 영향, 진료팀 연락 기준을 확인하고 싶습니다. 앱 참고 판정: 식전 목표 범위 - 대한당뇨병학회 일반 조절목표는 성인 남녀 공통으로 식전 80-130 mg/dL 범위를 제시합니다.","open","다음 진료 | 근거: 대한당뇨병학회 당뇨병 관리 목표 (${kdaCareTargetUrl})"`,
    );
    expect(csv).not.toContain("출처: 대한당뇨병학회 당뇨병 관리 목표");
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

  it("keeps source-backed lab queue details separated in CSV care_queue rows", () => {
    const csv = buildCareVaultCsv(
      {
        ...state,
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
        profile: { ...state.profile, cancerCareMode: false },
        questions: [],
        symptoms: [],
        visits: [],
        vitals: [],
      },
      "2026-06-04T10:00:00.000Z",
    );

    expect(csv).toContain(
      `"care_queue","2026-06-04","검사 · 기준보다 낮음","HDL-C 38 mg/dL","watch","대한당뇨병학회 일반 목표 기준입니다.\n적용 기준: 여성 기준 적용 / 검사실 기준보다 낮습니다. 증상과 함께 진료 때 확인하세요. / 근거: 대한당뇨병학회 당뇨병 관리 목표 (${kdaTargetUrl})"`,
    );
    expect(csv).toContain(
      `"lab","2026-06-04","HDL-C","38 mg/dL","사용자 입력 기준 범위 50 mg/dL 이상","기준보다 낮음 | 대한당뇨병학회 일반 목표 기준입니다.\n적용 기준: 여성 기준 적용 / 근거: 대한당뇨병학회 당뇨병 관리 목표 (${kdaTargetUrl})"`,
    );
    expect(csv).not.toContain("출처: 대한당뇨병학회 당뇨병 관리 목표");
  });

  it("keeps high-risk vital queue details source-backed in CSV care_queue rows", () => {
    const csv = buildCareVaultCsv(
      {
        ...state,
        documents: [],
        labResults: [],
        profile: { ...state.profile, cancerCareMode: false, diabetes: true },
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
      "2026-06-04T10:00:00.000Z",
    );

    expect(csv).toContain(
      `"care_queue","2026-06-04","활력 · 고혈압 위기 가능 범위","혈압 182/121 mmHg","watch","두통 동반 반복 측정 / 성인 남녀 공통 혈압 기준에서 고혈압 위기 가능 범위입니다. 증상이 있거나 반복되면 즉시 의료진 또는 응급 진료가 필요합니다. / 근거: 질병관리청 국가건강정보포털 고혈압 (${kdcaHypertensionUrl})"`,
    );
    expect(csv).toContain(
      `"care_queue","2026-06-04","활력 · 저혈당 범위","혈당 66 mg/dL (수시)","watch","식은땀과 떨림 / 성인 남녀 공통 혈당 기준에서 70 mg/dL 미만 저혈당 범위입니다. 증상, 의식상태, 약·식사·활동 변화를 함께 기록하고 진료팀 연락 기준을 확인하세요. / 근거: 질병관리청 국가건강정보포털 급성 합병증_저혈당 (${kdcaHypoglycemiaUrl})"`,
    );
  });

  it("keeps cancer-patient fever temperature queue and vital rows source-backed", () => {
    const csv = buildCareVaultCsv(
      {
        ...state,
        documents: [],
        labResults: [],
        profile: { ...state.profile, cancerCareMode: true },
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
      "2026-06-04T10:00:00.000Z",
    );

    expect(csv).toContain(
      `"care_queue","2026-06-04","활력 · 발열 연락 기준","체온 38.1℃","watch","오한 동반 / 암환자 공통 기준에서 체온 38℃ 이상 또는 오한은 즉시 응급실/진료팀 연락 기준으로 확인해야 합니다. / 근거: 국가암정보센터 감염 의료진 상담 기준 (${nccInfectionUrl})"`,
    );
    expect(csv).toContain(
      `"vital","2026-06-04","체온","38.1℃","발열 연락 기준 · 암환자 공통 체온·감염 연락 기준","오한 동반 | 암환자 공통 기준에서 체온 38℃ 이상 또는 오한은 즉시 응급실/진료팀 연락 기준으로 확인해야 합니다. | 근거: 국가암정보센터 감염 의료진 상담 기준 (${nccInfectionUrl})"`,
    );
  });

  it("formats vital export rows with units and Korean glucose context labels", () => {
    const csv = buildCareVaultCsv(
      {
        ...state,
        vitals: [
          ...state.vitals,
          {
            date: "2026-06-04",
            type: "glucose",
            glucoseMgDl: 181,
            glucoseContext: "after-meal",
            note: "점심 식후 2시간",
          },
        ],
      },
      "2026-06-03T10:00:00.000Z",
    );

    expect(csv).toContain(
      `"vital","2026-06-01","혈압","132/84 mmHg","고혈압 전단계 범위 · 성인 남녀 공통 한국 성인 혈압","아침 측정 | 한국 성인 남녀 공통 기준 고혈압 전단계입니다. 생활요인과 추세를 함께 기록하세요. | 근거: 질병관리청 국가건강정보포털 고혈압 (${kdcaHypertensionUrl})"`,
    );
    expect(csv).toContain(
      `"vital","2026-06-04","혈당","181 mg/dL","식후 목표 초과 · 식후 2시간 · 성인 남녀 공통 당뇨 추적 혈당","점심 식후 2시간 | 성인 남녀 공통 식후 2시간 목표를 넘었습니다. 식사 내용, 약, 활동량과 함께 추세를 확인하세요. | 근거: 대한당뇨병학회 당뇨병 관리 목표 (${kdaCareTargetUrl})"`,
    );
  });

  it("does not export partial lab number text as an abnormal numeric result", () => {
    const csv = buildCareVaultCsv(
      {
        ...state,
        documents: [],
        foodQuery: "",
        labResults: [
          {
            date: "2026-06-01",
            name: "WBC",
            value: "3.4 low",
            unit: "10^3/uL",
            lower: "4.0",
            upper: "10.0",
            note: "원문 확인 필요",
          },
        ],
        questions: [],
        symptoms: [],
        visits: [],
        vitals: [],
      },
      "2026-06-03T10:00:00.000Z",
    );

    expect(csv).toContain(
      `"care_queue","2026-06-01","검사 · 값 없음","WBC 3.4 low 10^3/uL","neutral","원문 확인 필요 / 검사 수치를 숫자로 입력하세요. / 근거: 서울아산병원 전혈구검사 참고치 (https://ent.amc.seoul.kr/asan/mobile/healthinfo/management/managementDetail.do?managementId=126)"`,
    );
    expect(csv).toContain(
      `"lab","2026-06-01","WBC","3.4 low 10^3/uL","사용자 입력 기준 범위 4.0~10.0 10^3/uL","값 없음 | 원문 확인 필요 / 근거: 서울아산병원 전혈구검사 참고치 (https://ent.amc.seoul.kr/asan/mobile/healthinfo/management/managementDetail.do?managementId=126)"`,
    );
    expect(csv).not.toContain("검사실 기준보다 낮습니다.");
  });
});
