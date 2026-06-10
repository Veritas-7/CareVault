import { describe, expect, it } from "vitest";
import { buildCervicalCancerCareClipboardSummary } from "./cervicalCancerCareClipboard";
import { buildCervicalCancerCarePanelSummary } from "./cervicalCancerCareMetric";

describe("cervicalCancerCareMetric", () => {
  it("builds panel summary chips for the profile-specific cervical-care note", () => {
    expect(
      buildCervicalCancerCarePanelSummary(
        buildCervicalCancerCareClipboardSummary({ age: "56", sex: "female" }),
      ),
	    ).toEqual({
		      ariaLabel:
				        "전체 161개 · 우선 3개 · 검진요약 1개 · 기록항목 4개 · 경고 4개 · 질문 63개 · 기록/회복/예방 86개 · 공식 출처 71개",
			      items: [
				        { id: "total", label: "전체", value: "161개" },
		        { id: "priority", label: "우선", value: "3개" },
		        { id: "screening", label: "검진요약", value: "1개" },
		        { id: "alert-record-field", label: "기록항목", value: "4개" },
		        { id: "alert", label: "경고", value: "4개" },
				        { id: "prompt", label: "질문", value: "63개" },
				        { id: "record-recovery-prevention", label: "기록/회복/예방", value: "86개" },
				        { id: "source", label: "공식 출처", value: "71개" },
		      ],
	    });
  });

  it("omits screening-summary chips when no profile-specific screening summary is copied", () => {
    expect(
      buildCervicalCancerCarePanelSummary(buildCervicalCancerCareClipboardSummary()),
	    ).toEqual({
		      ariaLabel:
				        "전체 160개 · 우선 3개 · 기록항목 4개 · 경고 4개 · 질문 63개 · 기록/회복/예방 86개 · 공식 출처 71개",
			      items: [
				        { id: "total", label: "전체", value: "160개" },
		        { id: "priority", label: "우선", value: "3개" },
		        { id: "alert-record-field", label: "기록항목", value: "4개" },
		        { id: "alert", label: "경고", value: "4개" },
				        { id: "prompt", label: "질문", value: "63개" },
				        { id: "record-recovery-prevention", label: "기록/회복/예방", value: "86개" },
				        { id: "source", label: "공식 출처", value: "71개" },
		      ],
	    });
  });
});
