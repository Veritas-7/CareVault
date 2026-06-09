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
    expect(text).toContain("항암화학요법 목적·일정 확인");
    expect(text).toContain("전신에 퍼져있는 암세포");
    expect(text).toContain("보조화학요법");
    expect(text).toContain("선행화학요법");
    expect(text).toContain("동시화학요법");
    expect(text).toContain("진찰 및 혈액 검사");
    expect(text).toContain("항암 부작용 개인차·효과 오해 확인");
    expect(text).toContain("부작용 유무와 치료 효과");
    expect(text).toContain("전혀 별개의 문제");
    expect(text).toContain("같은 용량");
    expect(text).toContain("환자마다");
    expect(text).toContain("몇 개월 또는 몇 년");
    expect(text).toContain("영구 지속");
    expect(text).toContain("투여 용량");
    expect(text).toContain("약물 종류 변경");
    expect(text).toContain("재발성 치료 선택 확인");
    expect(text).toContain("골반 내 국소 재발");
    expect(text).toContain("원격 재발");
    expect(text).toContain("재발 부위");
    expect(text).toContain("방사선요법");
    expect(text).toContain("동시항암화학방사선치료");
    expect(text).toContain("골반장기적출술");
    expect(text).toContain("다발성 전이");
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
    expect(text).toContain("전암 단계인 상피내암");
    expect(text).toContain("암의 분류에 속하지");
    expect(text).toContain("질 상부 2/3");
    expect(text).toContain("자궁 옆 결합조직");
    expect(text).toContain("질 하부 1/3");
    expect(text).toContain("요관침윤");
    expect(text).toContain("대동맥주위 림프절");
    expect(text).toContain("방광이나 직장 점막");
    expect(text).toContain("원격전이");
    expect(text).toContain("병리조직 확인 메모");
    expect(text).toContain("자궁경부 상피내이형성증");
    expect(text).toContain("자궁경부상피내암");
    expect(text).toContain("기저막");
    expect(text).toContain("침윤성 암");
    expect(text).toContain("편평상피세포암");
    expect(text).toContain("약 80%");
    expect(text).toContain("선암");
    expect(text).toContain("10-20%");
    expect(text).toContain("혼합 암종");
    expect(text).toContain("2-5%");
    expect(text).toContain("조기검진 준비·한계 메모");
    expect(text).toContain("전구 질환인 자궁경부이형성증");
    expect(text).toContain("상피내암 단계");
    expect(text).toContain("위음성률이 50%");
    expect(text).toContain("액상세포도말검사");
    expect(text).toContain("생리 시작일로부터 10~20일");
    expect(text).toContain("48시간 전");
    expect(text).toContain("성관계, 탐폰 사용, 질 세척");
    expect(text).toContain("증상이 있다면 출혈에 관계없이 검사");
    expect(text).toContain("발생통계 해석 메모");
    expect(text).toContain("2026년에 발표된 중앙암등록본부");
    expect(text).toContain("상피내암을 제외시킨 자궁경부암(C53)");
    expect(text).toContain("3,144건");
    expect(text).toContain("전체 암 발생의 1.1%");
    expect(text).toContain("여자의 암 중에서는 11위");
    expect(text).toContain("조발생률 6.1건");
    expect(text).toContain("40대가 22.8%");
    expect(text).toContain("50대가 22.6%");
    expect(text).toContain("60대가 19.1%");
    expect(text).toContain("암종이 96.6%");
    expect(text).toContain("편평세포암이 40.1%");
    expect(text).toContain("선암이 22.7%");
    expect(text).toContain("개인 위험으로 단정하지 말고");
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
    expect(text).toContain("자녀·가족 설명 준비");
    expect(text).toContain("자녀가 질문하거나 감정을 표현");
    expect(text).toContain("암이 누구의 잘못도 아니며 아이의 잘못도 아니라는");
    expect(text).toContain("자녀·가족 설명 메모");
    expect(text).toContain("네 잘못 때문이 아니고");
    expect(text).toContain("국가암정보센터 암환자의 생활 - 자녀에게 알리는 방법");
    expect(text).toContain("https://www.cancer.go.kr/lay1/S1T327C330/contents.do");
    expect(text).toContain("정서 안정·전문상담 준비");
    expect(text).toContain("항암화학요법을 받을 때");
    expect(text).toContain("암 치료 자체에 대한 불안감");
    expect(text).toContain("일상의 삶이 바뀌는 것");
    expect(text).toContain("항암제 여러 부작용에 대한 두려움");
    expect(text).toContain("일지나 일기");
    expect(text).toContain("의사나 간호사에게 질문");
    expect(text).toContain("가족이나 친구");
    expect(text).toContain("다른 환자");
    expect(text).toContain("정신과 전문의 상담");
    expect(text).toContain("보호자의 공감적 경청");
    expect(text).toContain("정서 안정·전문상담 메모");
    expect(text).toContain("공감의 자세");
    expect(text).toContain("국가암정보센터 암환자의 생활 - 심리적 안정을 위해");
    expect(text).toContain("https://www.cancer.go.kr/lay1/S1T327C329/contents.do");
    expect(text).toContain("보완대체요법 상담 준비");
    expect(text).toContain("주치의와 먼저 상의");
    expect(text).toContain("안전과 안녕");
    expect(text).toContain("장/단점");
    expect(text).toContain("특정 크림이나 약물");
    expect(text).toContain("침을 맞는 것");
    expect(text).toContain("약초나 영양제");
    expect(text).toContain("요법가들의 직접적인 설명");
    expect(text).toContain("앞으로 진행될 의학적 치료");
    expect(text).toContain("보완대체요법·약초 공유 메모");
    expect(text).toContain("국가암정보센터 보완대체요법 상담");
    expect(text).toContain("https://www.cancer.go.kr/lay1/S1T365C368/contents.do");
    expect(text).toContain("임신·출산 계획 상담");
    expect(text).toContain("유산 및 조산 위험");
    expect(text).toContain("국가암정보센터 자궁경부암 임신과 출산");
    expect(text).toContain("- 성생활 재개 상담:");
    expect(text).toContain("수술 후 6주");
    expect(text).toContain("담당의 진찰");
    expect(text).toContain("방사선치료 후 약 2주-1개월");
    expect(text).toContain("국소 호르몬 연고");
    expect(text).toContain("콘돔");
    expect(text).toContain("- 요약·진료 흐름:");
    expect(text).toContain("발생부위와 조직형");
    expect(text).toContain("HPV·위험요인");
    expect(text).toContain("권고안 3년");
    expect(text).toContain("국가암검진사업 2년");
    expect(text).toContain("치료 선택 기준");
    expect(text).toContain("국가암정보센터 자궁경부암 요약설명");
    expect(text).toContain("식생활·보조식품 확인");
    expect(text).toContain("특별히 피해야 하거나 환자에게 추천하는 음식은 없습니다");
    expect(text).toContain("민간요법이나 건강보조식품은 삼갑니다");
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
    expect(text).toContain("HPV 백신 종류·예방범위 확인");
    expect(text).toContain("2가 백신");
    expect(text).toContain("HPV 16, 18형");
    expect(text).toContain("4가 백신");
    expect(text).toContain("HPV 6, 11형");
    expect(text).toContain("9가 백신");
    expect(text).toContain("전체 자궁경부암의 약 70%");
    expect(text).toContain("유전자재조합 백신");
    expect(text).toContain("병을 일으키는 DNA");
    expect(text).toContain("감염의 위험");
    expect(text).toContain("HPV 남성 접종·관련질환 확인");
    expect(text).toContain("4가 및 9가 백신");
    expect(text).toContain("항문암");
    expect(text).toContain("성기암");
    expect(text).toContain("두경부 종양");
    expect(text).toContain("여성의 자궁경부암 예방 효과만큼 높지 않습니다");
    expect(text).toContain("HPV 관련질환 범위 확인");
    expect(text).toContain("자궁경부 전암병변");
    expect(text).toContain("항문 생식기의 사마귀");
    expect(text).toContain("호흡기에 생기는 유두종 병변");
    expect(text).toContain("HPV 치료효과·재발연구 확인");
    expect(text).toContain("예방용 백신");
    expect(text).toContain("상피내종양");
    expect(text).toContain("치료 효과는 없는");
    expect(text).toContain("치료 후 재발 방지");
    expect(text).toContain("연구는 현재 진행 중");
    expect(text).toContain("HPV 허가연령·노출전 효과 확인");
    expect(text).toContain("사람유두종바이러스에 노출되기 전");
    expect(text).toContain("성접촉을 시작하기 전에");
    expect(text).toContain("9세부터 25~26세까지 접종 허가");
    expect(text).toContain("허가 연령 이후");
    expect(text).toContain("암 예방 효과는 입증되지");
    expect(text).toContain("26세 이상");
    expect(text).toContain("HPV에 노출 기회가 적은");
    expect(text).toContain("HPV 접종 후 이상반응·관찰 확인");
    expect(text).toContain("접종 부위 통증");
    expect(text).toContain("부종");
    expect(text).toContain("발적");
    expect(text).toContain("오심");
    expect(text).toContain("메스꺼움");
    expect(text).toContain("근육통");
    expect(text).toContain("약 80%");
    expect(text).toContain("일상 활동을 방해할 정도");
    expect(text).toContain("약 6%");
    expect(text).toContain("수일 내 회복");
    expect(text).toContain("호흡곤란");
    expect(text).toContain("아나필락시스");
    expect(text).toContain("실신");
    expect(text).toContain("앉거나 누운 상태");
    expect(text).toContain("HPV 접종 일정·관찰 확인");
    expect(text).toContain("9세 이상");
    expect(text).toContain("만 12세");
    expect(text).toContain("접종 후 20~30분 관찰");
    expect(text).toContain("HPV 접종 전 임신·급성질환 확인");
    expect(text).toContain("임신 중의 백신 접종은 권장되지");
    expect(text).toContain("나머지 접종은 출산 뒤로");
    expect(text).toContain("중등도 또는 심한 급성기 질환");
    expect(text).toContain("고열을 동반한 감염질환");
    expect(text).toContain("HPV 접종 지연·추가접종 메모");
    expect(text).toContain("접종시기를 놓친 경우");
    expect(text).toContain("처음부터 다시 시작하지는 않습니다");
    expect(text).toContain("추가접종");
    expect(text).toContain("HPV 국가예방접종 대상 메모");
    expect(text).toContain("2026년 5월 6일");
    expect(text).toContain("12세 남성 청소년");
    expect(text).toContain("2014.1.1.~2014.12.31.");
    expect(text).toContain("12~17세 여성 청소년");
    expect(text).toContain("18~26세 저소득층 여성");
    expect(text).toContain("고위험 유전형(16형,18형)");
    expect(text).toContain("성경험 전에 접종을 완료");
    expect(text).toContain("70~90%의 예방효과");
    expect(text).toContain("대상 여부와 접종일정");
    expect(text).toContain("감별진단 확인");
    expect(text).toContain("자궁경부염");
    expect(text).toContain("질암");
    expect(text).toContain("자궁내막암");
    expect(text).toContain("자궁체부암");
    expect(text).toContain("골반 염증성질환");
    expect(text).toContain("제 증상과 검사 결과에서");
    expect(text).toContain("자궁경부세포검사");
    expect(text).toContain("질확대경검사 및 펀치 생검");
    expect(text).toContain("자궁경관 내 소파술");
    expect(text).toContain("CT·MRI");
    expect(text).toContain("- 병리조직 확인:");
    expect(text).toContain("전암단계");
    expect(text).toContain("상피내이형성증");
    expect(text).toContain("자궁경부상피내암");
    expect(text).toContain("기저막");
    expect(text).toContain("침윤성 암");
    expect(text).toContain("편평상피세포암");
    expect(text).toContain("선암");
    expect(text).toContain("혼합 암종");
    expect(text).toContain("병리결과지 용어");
    expect(text).toContain("병기·치료 설명");
    expect(text).toContain("- 병기 설명 확인:");
    expect(text).toContain("상피내암");
    expect(text).toContain("암의 분류");
    expect(text).toContain("1기");
    expect(text).toContain("자궁경부에만 국한");
    expect(text).toContain("2기");
    expect(text).toContain("질벽 상부 2/3");
    expect(text).toContain("자궁 옆 결합조직");
    expect(text).toContain("3기");
    expect(text).toContain("질의 하부 1/3");
    expect(text).toContain("요관침윤");
    expect(text).toContain("골반·대동맥주위 림프절");
    expect(text).toContain("4기");
    expect(text).toContain("방광이나 직장 점막");
    expect(text).toContain("원격전이");
    expect(text).toContain("진단서 병기");
    expect(text).toContain("치료현황 통계 해석");
    expect(text).toContain("2019-2023년");
    expect(text).toContain("5년 상대생존율 79.0%");
    expect(text).toContain("국한 94.5%");
    expect(text).toContain("국소 73.8%");
    expect(text).toContain("원격 29.1%");
    expect(text).toContain("모름 69.5%");
    expect(text).toContain("5년 이상 생존 확률");
    expect(text).toContain("개인 예후");
    expect(text).toContain("치료 반응");
    expect(text).toContain("재발·전이 여부");
    expect(text).toContain("수술 합병증 확인");
    expect(text).toContain("수술 직후 급성 합병증");
    expect(text).toContain("혈관손상");
    expect(text).toContain("요관손상");
    expect(text).toContain("직장 파열");
    expect(text).toContain("폐색전 증");
    expect(text).toContain("방광이나 직장의 기능부전");
    expect(text).toContain("림프 낭종");
    expect(text).toContain("다리나 회음부 림프 부종");
    expect(text).toContain("흡입도관 배액");
    expect(text).toContain("방사선 급성 부작용 확인");
    expect(text).toContain("방사선치료로 인한 합병증");
    expect(text).toContain("장 점막");
    expect(text).toContain("방광점막");
    expect(text).toContain("장운동의 일시적인 증가");
    expect(text).toContain("점막의 손상");
    expect(text).toContain("설사");
    expect(text).toContain("방광염과 비슷한 증상");
    expect(text).toContain("방사선치료 회차");
    expect(text).toContain("소변 통증");
    expect(text).toContain("방사선 질 변화 상담");
    expect(text).toContain("질의 위축 또는 경화");
    expect(text).toContain("호르몬치료");
    expect(text).toContain("국소치료");
    expect(text).toContain("예방과 치료");
    expect(text).toContain("방사선치료 범위");
    expect(text).toContain("질건조");
    expect(text).toContain("성생활 변화");
    expect(text).toContain("호르몬 금기");
    expect(text).toContain("전암성 병변 치료 확인");
    expect(text).toContain("자궁경부이형성증");
    expect(text).toContain("자궁경부상피내암");
    expect(text).toContain("국소파괴요법");
    expect(text).toContain("동결요법");
    expect(text).toContain("고주파요법");
    expect(text).toContain("레이저요법");
    expect(text).toContain("단순자궁절제술");
    expect(text).toContain("조직경계");
    expect(text).toContain("더 진행된 암");
    expect(text).toContain("침윤성 초기 치료 확인");
    expect(text).toContain("침윤성 자궁경부암");
    expect(text).toContain("환자의 연령과 건강상태");
    expect(text).toContain("암의 파급정도");
    expect(text).toContain("동반된 합병증");
    expect(text).toContain("광범위 자궁경부절제술");
    expect(text).toContain("복강경을 이용한 림프절 절제술");
    expect(text).toContain("자궁을 보존");
    expect(text).toContain("광범위 자궁절제술");
    expect(text).toContain("자궁주위 조직");
    expect(text).toContain("골반림프절");
    expect(text).toContain("재발·추적검사");
    expect(text).toContain("첫 2년");
    expect(text).toContain("3개월마다");
    expect(text).toContain("이후 5년까지");
    expect(text).toContain("체중감소");
    expect(text).toContain("하지 부종");
    expect(text).toContain("기침·객혈·흉통");
    expect(text).toContain("문진");
    expect(text).toContain("골반내진");
    expect(text).toContain("세포검사");
    expect(text).toContain("CT·MRI·PET");
    expect(text).toContain("HPV 감염·파트너 상담");
    expect(text).toContain("주로 성접촉으로 전파");
    expect(text).toContain("혈액·체액·장기이식");
    expect(text).toContain("증상 없이 자연소멸");
    expect(text).toContain("HPV 감염·전파 상담 메모");
    expect(text).toContain("혈액, 체액, 장기이식");
    expect(text).toContain("배우자의 성 상대자 수");
    expect(text).toContain("감염을 비난이나 개인 원인으로 단정하지 말고");
    expect(text).toContain("접종기관과 진료팀");
    expect(text).toContain("흡연·성생활 위험요인 메모");
    expect(text).toContain("대부분 성접촉");
    expect(text).toContain("성상대자수");
    expect(text).toContain("콘돔");
    expect(text).toContain("경구피임약");
    expect(text).toContain("경구피임약 장기복용 상담 메모");
    expect(text).toContain("5년 이상의 장기적인 경구피임약 복용은 가능한 하지 않습니다.");
    expect(text).toContain("예방법 종합 체크 메모");
    expect(text).toContain("정기적으로 자궁경부 세포검진");
    expect(text).toContain("사람유두종바이러스 예방 백신접종");
    expect(text).toContain("면역·감염·출산력 위험요인 메모");
    expect(text).toContain("HIV");
    expect(text).toContain("클라미디아");
    expect(text).toContain("검진 접근");
    expect(text).toContain("생활요인 근거 경계 메모");
    expect(text).toContain("연관성은 아직 입증되지");
    expect(text).toContain("일반 암예방수칙");
    expect(text).toContain("치료현황 통계 상담 메모");
    expect(text).toContain("5년 상대생존율 79.0%");
    expect(text).toContain("요약병기별 5년 상대생존율 국한 94.5%");
    expect(text).toContain("개인 예후로 단정하지 말고");
    expect(text).toContain("치료방법 선택 근거 메모");
    expect(text).toContain("수술, 방사선치료, 항암화학요법");
    expect(text).toContain("표적치료와 면역치료");
    expect(text).toContain("향후 출산 희망 여부");
    expect(text).toContain("재발 부위별로 선택지가");
    expect(text).toContain("진단·병기검사 목적 메모");
    expect(text).toContain("암이 맞는지 확인하는 조직검사와 병기 설정 검사");
    expect(text).toContain("의사의 진찰, 자궁경부세포검사, 질확대경검사, 조직검사, 원추절제술");
    expect(text).toContain("방광경 및 에스결장경검사");
    expect(text).toContain("경정맥 신우조영술");
    expect(text).toContain("CT, MRI, PET");
    expect(text).toContain("자궁경부 주위조직 침윤");
    expect(text).toContain("림프절 전이");
    expect(text).toContain("원격전이와 재발");
    expect(text).toContain("감별진단 확인 메모");
    expect(text).toContain("자궁경부염, 질암, 자궁내막암, 자궁체부암, 골반 염증성질환");
    expect(text).toContain("질확대경검사 및 펀치 생검");
    expect(text).toContain("자궁경관 내 소파술");
    expect(text).toContain("CT나 MRI");
    expect(text).toContain("발생부위·구조 메모");
    expect(text).toContain("골반 안");
    expect(text).toContain("앞쪽에는 방광");
    expect(text).toContain("뒤쪽에는 직장");
    expect(text).toContain("상하 약 7cm");
    expect(text).toContain("좌우 약 4cm");
    expect(text).toContain("자궁 상부 2/3");
    expect(text).toContain("자궁체부");
    expect(text).toContain("하부 1/3");
    expect(text).toContain("자궁경부");
    expect(text).toContain("질과 연결");
    expect(text).toContain("신축성 있는 조직");
    expect(text).toContain("요관");
    expect(text).toContain("림프관 및 림프절");
    expect(text).toContain("국가암정보센터 항암화학요법의 이해");
    expect(text).toContain("국가암정보센터 항암화학요법의 부작용");
    expect(text).toContain("출처 목록 (37개)");
    expect(text).toContain("국가암정보센터 자궁경부암 일반적 증상");
    expect(text).toContain("국가암정보센터 자궁경부암 요약설명");
    expect(text).toContain(
      "출처: 국가암정보센터 자궁경부암 일반적 증상 - https://www.cancer.go.kr/",
    );
    expect(text).toContain(
      "출처: 국가암정보센터 자궁경부암 치료 후 생활 - https://www.cancer.go.kr/",
    );
    expect(text).toContain("국가암정보센터 자궁경부암 치료방법");
    expect(text).toContain("국가암정보센터 자궁경부암 진단방법");
    expect(text).toContain("국가암정보센터 자궁경부암 진행단계");
    expect(text).toContain("국가암정보센터 자궁경부암 정의 및 종류");
    expect(text).toContain("국가암정보센터 자궁경부암 발생부위");
    expect(text).toContain("국가암정보센터 자궁경부암 조기검진");
    expect(text).toContain("국가암정보센터 자궁경부암 관련통계");
    expect(text).toContain("국가암정보센터 자궁경부암 감별진단");
    expect(text).toContain("국가암정보센터 자궁경부암 치료현황");
    expect(text).toContain("국가암정보센터 암환자의 생활 - 자녀에게 알리는 방법");
    expect(text).toContain("국가암정보센터 암환자의 생활 - 심리적 안정을 위해");
    expect(text).toContain("국가암정보센터 보완대체요법 상담");
    expect(text).toContain("국립암센터 자궁경부암 조기 진단과 예방법");
    expect(text).toContain("질병관리청 국가건강정보포털 자궁경부암 백신");
    expect(text).toContain("질병관리청 예방접종도우미 HPV 국가예방접종 사업");
    expect(text).toContain("국가암정보센터 사람유두종바이러스 감염");
    expect(text).toContain("국가암정보센터 자궁경부암 예방법");
    expect(text).toContain("국가암정보센터 국민 암예방 수칙 실천지침 자궁경부암");
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
    expect(text).toContain("출처 목록 (37개)");
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
      preventionCount: 22,
      priorityCount: 3,
      promptCount: 29,
      recordRecoveryPreventionCount: 52,
      recoveryCount: 13,
      screeningSummaryCount: 1,
      sourceCount: 37,
      totalItemCount: 93,
    });
    expect(formatCervicalCancerCareClipboardCompactSummary(profileSummary)).toBe(
      "총 93개 항목 · 우선 3개 · 검진요약 1개 · 기록항목 4개 · 경고 4개 · 질문 29개 · 기록/회복/예방 52개 · 출처 37개",
    );
    expect(formatCervicalCancerCareClipboardDescription(profileSummary)).toBe(
      "자궁경부암 케어 노트 공식 출처 포함 복사 · 총 93개 항목 · 우선 3개 · 검진요약 1개 · 기록항목 4개 · 경고 4개 · 질문 29개 · 기록/회복/예방 52개 · 출처 37개",
    );
    expect(formatCervicalCancerCareClipboardStatus(profileSummary)).toBe(
      "자궁경부암 케어 노트 복사됨 · 총 93개 항목 · 우선 3개 · 검진요약 1개 · 기록항목 4개 · 경고 4개 · 질문 29개 · 기록/회복/예방 52개 · 출처 37개",
    );
    expect(formatCervicalCancerCareClipboardUnsupportedStatus(profileSummary)).toBe(
      "자궁경부암 케어 노트 복사 미지원 · 브라우저 클립보드 없음 · 총 93개 항목 · 우선 3개 · 검진요약 1개 · 기록항목 4개 · 경고 4개 · 질문 29개 · 기록/회복/예방 52개 · 출처 37개",
    );
    expect(formatCervicalCancerCareClipboardFailedStatus(profileSummary)).toBe(
      "자궁경부암 케어 노트 복사 실패 · 총 93개 항목 · 우선 3개 · 검진요약 1개 · 기록항목 4개 · 경고 4개 · 질문 29개 · 기록/회복/예방 52개 · 출처 37개",
    );
    expect(formatCervicalCancerCareClipboardCompactSummary(genericSummary)).toBe(
      "총 92개 항목 · 우선 3개 · 기록항목 4개 · 경고 4개 · 질문 29개 · 기록/회복/예방 52개 · 출처 37개",
    );
  });
});
