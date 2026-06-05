import { describe, expect, it } from "vitest";
import { buildDocumentPanelSummary } from "./documentMetric";

describe("documentMetric", () => {
  it("builds saved-document panel summary chips from review, action, attachment, and archive states", () => {
    expect(
      buildDocumentPanelSummary(
        [
          {
            attachmentStatus: "파일 없음 - 재첨부 필요",
            nextAction: "다음 진료 때 영상 CD 확인",
            reviewStatus: "needs-review",
          },
          {
            nextAction: "",
            reviewStatus: "care-question",
          },
          {
            attachmentStatus: "파일 확인됨",
            nextAction: "결과지 원본 수령",
            reviewStatus: "waiting-result",
          },
          {
            nextAction: "기록 보관",
            reviewStatus: "done",
          },
        ],
        [
          { reviewStatus: "done" },
          { attachmentStatus: "브라우저 파일명 참조", reviewStatus: "needs-review" },
        ],
      ),
    ).toEqual({
      ariaLabel:
        "전체 4개 · 검토 필요 1개 · 의료진 질문 1개 · 결과 대기 1개 · 정리 완료 1개 · 열린 조치 2개 · 첨부 복구 1개 · 삭제 보관 2개",
      careQuestionCount: 1,
      deletedCount: 2,
      doneCount: 1,
      items: [
        { id: "total", label: "전체", value: "4개" },
        { id: "needs-review", label: "검토 필요", value: "1개" },
        { id: "care-question", label: "의료진 질문", value: "1개" },
        { id: "waiting-result", label: "결과 대기", value: "1개" },
        { id: "done", label: "정리 완료", value: "1개" },
        { id: "open-next-action", label: "열린 조치", value: "2개" },
        { id: "recovery", label: "첨부 복구", value: "1개" },
        { id: "deleted", label: "삭제 보관", value: "2개" },
      ],
      needsReviewCount: 1,
      openNextActionCount: 2,
      recoveryCount: 1,
      totalCount: 4,
      waitingResultCount: 1,
    });
  });

  it("builds an empty saved-document panel summary", () => {
    expect(buildDocumentPanelSummary([], [])).toEqual({
      ariaLabel: "전체 0개 · 상태 서류 없음 · 열린 조치 없음 · 첨부 복구 없음 · 삭제 보관 없음",
      careQuestionCount: 0,
      deletedCount: 0,
      doneCount: 0,
      items: [
        { id: "total", label: "전체", value: "0개" },
        { id: "empty", label: "상태", value: "서류 없음" },
        { id: "open-next-action", label: "열린 조치", value: "없음" },
        { id: "recovery", label: "첨부 복구", value: "없음" },
        { id: "deleted", label: "삭제 보관", value: "없음" },
      ],
      needsReviewCount: 0,
      openNextActionCount: 0,
      recoveryCount: 0,
      totalCount: 0,
      waitingResultCount: 0,
    });
  });
});
