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
				        "전체 147개 · 우선 3개 · 검진요약 1개 · 기록항목 4개 · 경고 4개 · 질문 56개 · 기록/회복/예방 79개 · 공식 출처 64개",
			      items: [
				        { id: "total", label: "전체", value: "147개" },
		        { id: "priority", label: "우선", value: "3개" },
		        { id: "screening", label: "검진요약", value: "1개" },
		        { id: "alert-record-field", label: "기록항목", value: "4개" },
		        { id: "alert", label: "경고", value: "4개" },
				        { id: "prompt", label: "질문", value: "56개" },
				        { id: "record-recovery-prevention", label: "기록/회복/예방", value: "79개" },
				        { id: "source", label: "공식 출처", value: "64개" },
		      ],
	    });
  });

  it("omits screening-summary chips when no profile-specific screening summary is copied", () => {
    expect(
      buildCervicalCancerCarePanelSummary(buildCervicalCancerCareClipboardSummary()),
	    ).toEqual({
		      ariaLabel:
				        "전체 146개 · 우선 3개 · 기록항목 4개 · 경고 4개 · 질문 56개 · 기록/회복/예방 79개 · 공식 출처 64개",
			      items: [
				        { id: "total", label: "전체", value: "146개" },
		        { id: "priority", label: "우선", value: "3개" },
		        { id: "alert-record-field", label: "기록항목", value: "4개" },
		        { id: "alert", label: "경고", value: "4개" },
				        { id: "prompt", label: "질문", value: "56개" },
				        { id: "record-recovery-prevention", label: "기록/회복/예방", value: "79개" },
				        { id: "source", label: "공식 출처", value: "64개" },
		      ],
	    });
  });
});
