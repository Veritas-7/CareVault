import { describe, expect, it } from "vitest";
import {
  buildCervicalCancerCareClipboardSummary,
  formatCervicalCancerCareClipboardCompactSummary,
  formatCervicalCancerCareClipboardDescription,
  formatCervicalCancerCareClipboardFailedStatus,
  formatCervicalCancerCareClipboardStatus,
  formatCervicalCancerCareClipboardText,
  formatCervicalCancerCareClipboardUnsupportedStatus,
} from "./cervicalCancerCareClipboard";

describe("cervicalCancerCareClipboard", () => {
  it("formats a clinic-prep note from existing cervical-care sections and sources", () => {
    const text = formatCervicalCancerCareClipboardText({
      age: "56",
      sex: "female",
    });

    expect(text).toContain("[자궁경부암 케어 노트]");
    expect(text).toContain("우선 확인 체크리스트");
    expect(text).toContain("- 오늘 증상 기록:");
    expect(text).toContain("출혈·분비물 변화");
    expect(text).toContain("혈뇨/혈변 변화");
    expect(text).toContain("- 다음 진료 질문:");
    expect(text).toContain("산정특례기간 국가검진 유예 여부");
    expect(text).toContain("의심 증상 진단검사 목록");
    expect(text).toContain("치료 선택 기준");
    expect(text).toContain("- 치료 후 생활 상담:");
    expect(text).toContain("골반 방사선 후 폐경·질협착");
    expect(text).toContain("국가암정보센터 자궁경부암 식생활");
    expect(text).toContain("경고 신호 기록 항목");
    expect(text).toContain("- 언제: 새로 시작된 날짜, 반복 횟수, 치료·검사 후 며칠째인지");
    expect(text).toContain("- 무엇이: 출혈·분비물 색/냄새/양, 혈뇨·혈변, 배뇨·배변 변화");
    expect(text).toContain("- 얼마나: 통증 정도와 지속 시간, 복부팽만·구토·배변/가스 변화 동반 여부");
    expect(text).toContain("- 같이: 발열, 열감, 피부 붉어짐, 다리 부종·통증, 상처 동반 여부");
    expect(text).toContain("국가암정보센터 림프부종 치료 전후관리");
    expect(text).toContain("검진 기준 빠른 확인");
    expect(text).toContain("국가암검진 대상 기준 해당");
    expect(text).toContain("2년 간격 자궁경부세포검사");
    expect(text).toContain("산정특례기간");
    expect(text).toContain("국가암정보센터 국가암검진 대상자 선정 및 통보");
    expect(text).toContain("국가암정보센터 국가암검진 검진주기 및 검진방법");
    expect(text).toContain("진료팀에 확인할 신호");
    expect(text).toContain("- 비정상 질출혈");
    expect(text).toContain("진료 질문 초안");
    expect(text).toContain("- 검진·진단검사 구분:");
    expect(text).toContain("골반내진, 자궁경부세포검사, HPV 검사, 질확대경, 조직검사");
    expect(text).toContain("경질초음파, 골반 MRI");
    expect(text).toContain(
      "출처: 국립암센터 자궁경부암 조기 진단과 예방법 - https://www.cancer.go.kr/download.do",
    );
    expect(text).toContain("- 치료 선택 기준:");
    expect(text).toContain("제 병기, 암 크기, 전신상태, 연령, 향후 출산 희망 여부");
    expect(text).toContain("- 골반 방사선 후 폐경:");
    expect(text).toContain("난소부전, 홍조·무월경 같은 폐경 증상");
    expect(text).toContain("질협착, 성욕 변화, 골다공증 위험");
    expect(text).toContain("- 장·방광 후기 변화:");
    expect(text).toContain("6개월 이상 지난 뒤 장폐색, 혈변, 혈뇨 가능성");
    expect(text).toContain("배변/가스 변화");
    expect(text).toContain("국가암정보센터 자궁경부암 치료의 부작용");
    expect(text).toContain("- 식생활·보조식품:");
    expect(text).toContain("민간요법·건강보조식품");
    expect(text).toContain("- 림프부종:");
    expect(text).toContain("피부 붉어짐");
    expect(text).toContain("의료진에게 바로 연락");
    expect(text).toContain(
      "출처: 국가암정보센터 자궁경부암 치료방법 - https://www.cancer.go.kr/",
    );
    expect(text).toContain(
      "출처: 국가암정보센터 방사선치료의 부작용 - https://www.cancer.go.kr/lay1/S1T292C294/contents.do",
    );
    expect(text).toContain(
      "출처: 국가암정보센터 림프부종 치료 전후관리 - https://www.cancer.go.kr/",
    );
    expect(text).toContain(
      "출처: 국가암정보센터 자궁경부암 식생활 - https://www.cancer.go.kr/",
    );
    expect(text).toContain("기록 체크");
    expect(text).toContain("림프부종 감염·악화 신호");
    expect(text).toContain("갑자기 단단해지는 느낌");
    expect(text).toContain("추적검사 일정·결과");
    expect(text).toContain("국가암검진 2년 주기");
    expect(text).toContain("의심 증상 진단검사 준비");
    expect(text).toContain("질확대경·조직검사·경질초음파·골반 MRI");
    expect(text).toContain("병기 설명 메모");
    expect(text).toContain("0기는 자궁경부 상피내암");
    expect(text).toContain("방광·직장점막 침범 또는 원격전이");
    expect(text).toContain("배뇨·배변·출혈 변화 메모");
    expect(text).toContain("혈변·혈뇨");
    expect(text).toContain("장폐색·혈변·혈뇨 연락 메모");
    expect(text).toContain("복부팽만, 구토, 배변/가스 변화");
    expect(text).toContain("치료 종료 시점");
    expect(text).toContain("국가암정보센터 자궁경부암 치료의 부작용");
    expect(text).toContain("회복 일정 메모");
    expect(text).toContain("림프부종 피부·감염 관리");
    expect(text).toContain("열감·통증");
    expect(text).toContain("재발·추적검사 주기 메모");
    expect(text).toContain("첫 2년 3개월마다");
    expect(text).toContain("골반 방사선치료 난소기능·폐경 증상 상담");
    expect(text).toContain("성생활 재개·통증 상담");
    expect(text).toContain("방사선 치료 중과 치료 후 약 2주~1개월");
    expect(text).toContain("국가암정보센터 자궁경부암 성생활");
    expect(text).toContain("임신·출산 계획 상담");
    expect(text).toContain("유산 및 조산 위험");
    expect(text).toContain("국가암정보센터 자궁경부암 임신과 출산");
    expect(text).toContain("식생활·보조식품 확인");
    expect(text).toContain("특별히 피하거나 추천하는 음식은 없고");
    expect(text).toContain("국가암정보센터 자궁경부암 식생활");
    expect(text).toContain("검진·예방 메모");
    expect(text).toContain("자궁경부세포검사 전 확인");
    expect(text).toContain("생리 기간을 피해서");
    expect(text).toContain("HPV 검사를 함께 받을 수");
    expect(text).toContain("결과통보·비용 확인");
    expect(text).toContain("15일 이내");
    expect(text).toContain("전액 무료");
    expect(text).toContain("HPV 백신은 예방용");
    expect(text).toContain("접종 후에도 자궁경부암 선별검사");
    expect(text).toContain("선별검사는 변경 없이");
    expect(text).toContain("HPV 접종 일정·관찰 확인");
    expect(text).toContain("9세 이상");
    expect(text).toContain("만 12세");
    expect(text).toContain("접종 후 20~30분 관찰");
    expect(text).toContain("HPV 접종 지연·추가접종 메모");
    expect(text).toContain("접종시기를 놓친 경우");
    expect(text).toContain("처음부터 다시 시작하지는 않습니다");
    expect(text).toContain("추가접종");
    expect(text).toContain("흡연·성생활 위험요인 메모");
    expect(text).toContain("대부분 성접촉");
    expect(text).toContain("성상대자수");
    expect(text).toContain("콘돔");
    expect(text).toContain("경구피임약");
    expect(text).toContain("면역·감염·출산력 위험요인 메모");
    expect(text).toContain("HIV");
    expect(text).toContain("클라미디아");
    expect(text).toContain("검진 접근");
    expect(text).toContain("출처 목록 (20개)");
    expect(text).toContain("국가암정보센터 자궁경부암 일반적 증상");
    expect(text).toContain(
      "출처: 국가암정보센터 자궁경부암 일반적 증상 - https://www.cancer.go.kr/",
    );
    expect(text).toContain(
      "출처: 국가암정보센터 자궁경부암 치료 후 생활 - https://www.cancer.go.kr/",
    );
    expect(text).toContain("국가암정보센터 자궁경부암 치료방법");
    expect(text).toContain("국립암센터 자궁경부암 조기 진단과 예방법");
    expect(text).toContain("질병관리청 국가건강정보포털 자궁경부암 백신");
    expect(text).toContain("국가암정보센터 자궁경부암 예방법");
  });

  it("keeps the copied care note framed as recording and clinician-confirmation support", () => {
    const text = formatCervicalCancerCareClipboardText({
      age: "56",
      sex: "female",
    });
    const treatmentOrders = ["복용하세요", "중단하세요", "치료하세요", "운동하세요", "투약하세요", "처방하세요"];

    expect(text).toContain("진단·처방·치료 지시가 아니라");
    expect(text).toContain("진료팀 확인");
    expect(treatmentOrders.every((term) => !text.includes(term))).toBe(true);
  });

  it("can still format a generic care note without profile-specific screening status", () => {
    const text = formatCervicalCancerCareClipboardText();

    expect(text).toContain("[자궁경부암 케어 노트]");
    expect(text).not.toContain("검진 기준 빠른 확인");
    expect(text).toContain("우선 확인 체크리스트");
    expect(text).toContain("검진·예방 메모");
    expect(text).toContain("출처 목록 (20개)");
  });

  it("summarizes the copied care note scope for labels and post-copy feedback", () => {
    const profileSummary = buildCervicalCancerCareClipboardSummary({
      age: "56",
      sex: "female",
    });
    const genericSummary = buildCervicalCancerCareClipboardSummary();

    expect(profileSummary).toMatchObject({
      alertCount: 4,
      alertRecordFieldCount: 4,
      preventionCount: 9,
      priorityCount: 3,
      promptCount: 10,
      recordRecoveryPreventionCount: 27,
      recoveryCount: 9,
      screeningSummaryCount: 1,
      sourceCount: 20,
      totalItemCount: 49,
    });
    expect(formatCervicalCancerCareClipboardCompactSummary(profileSummary)).toBe(
      "총 49개 항목 · 우선 3개 · 검진요약 1개 · 기록항목 4개 · 경고 4개 · 질문 10개 · 기록/회복/예방 27개 · 출처 20개",
    );
    expect(formatCervicalCancerCareClipboardDescription(profileSummary)).toBe(
      "자궁경부암 케어 노트 공식 출처 포함 복사 · 총 49개 항목 · 우선 3개 · 검진요약 1개 · 기록항목 4개 · 경고 4개 · 질문 10개 · 기록/회복/예방 27개 · 출처 20개",
    );
    expect(formatCervicalCancerCareClipboardStatus(profileSummary)).toBe(
      "자궁경부암 케어 노트 복사됨 · 총 49개 항목 · 우선 3개 · 검진요약 1개 · 기록항목 4개 · 경고 4개 · 질문 10개 · 기록/회복/예방 27개 · 출처 20개",
    );
    expect(formatCervicalCancerCareClipboardUnsupportedStatus(profileSummary)).toBe(
      "자궁경부암 케어 노트 복사 미지원 · 브라우저 클립보드 없음 · 총 49개 항목 · 우선 3개 · 검진요약 1개 · 기록항목 4개 · 경고 4개 · 질문 10개 · 기록/회복/예방 27개 · 출처 20개",
    );
    expect(formatCervicalCancerCareClipboardFailedStatus(profileSummary)).toBe(
      "자궁경부암 케어 노트 복사 실패 · 총 49개 항목 · 우선 3개 · 검진요약 1개 · 기록항목 4개 · 경고 4개 · 질문 10개 · 기록/회복/예방 27개 · 출처 20개",
    );
    expect(formatCervicalCancerCareClipboardCompactSummary(genericSummary)).toBe(
      "총 48개 항목 · 우선 3개 · 기록항목 4개 · 경고 4개 · 질문 10개 · 기록/회복/예방 27개 · 출처 20개",
    );
  });
});
