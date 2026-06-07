import { describe, expect, it } from "vitest";
import {
  buildExportPreviewSummary,
  formatExportPreviewCompactSummary,
  formatExportPreviewCloseStatus,
  formatExportPreviewCopyDescription,
  formatExportPreviewCopyFailedStatus,
  formatExportPreviewCopyStatus,
  formatExportPreviewCopyUnsupportedStatus,
  formatExportPreviewDisabledActionDescription,
  formatExportPreviewDownloadDescription,
  formatExportPreviewDownloadFallbackLabel,
  formatExportPreviewDownloadStatus,
  formatExportPreviewFreshActionDescription,
  formatExportPreviewFreshActionVisibleLabel,
  formatExportPreviewPrintDescription,
  formatExportPreviewPrintFailedStatus,
  formatExportPreviewPrintUnavailableStatus,
  formatExportPreviewPrintWindowFailedStatus,
  formatExportPreviewPrintStatus,
  formatExportPreviewStaleStatus,
} from "./exportPreviewSummary";

describe("exportPreviewSummary", () => {
  it("counts lines, characters, and UTF-8 bytes for preview content", () => {
    expect(buildExportPreviewSummary("첫 줄\nsecond")).toEqual({
      byteCount: 14,
      byteLabel: "14B",
      characterCount: 10,
      characterLabel: "10자",
      lineCount: 2,
      lineLabel: "2줄",
      sourceMarkerCount: 0,
      sourceMarkerLabel: "근거/출처 0개",
    });
  });

  it("formats empty preview content as zero-size", () => {
    expect(buildExportPreviewSummary("")).toEqual({
      byteCount: 0,
      byteLabel: "0B",
      characterCount: 0,
      characterLabel: "0자",
      lineCount: 0,
      lineLabel: "0줄",
      sourceMarkerCount: 0,
      sourceMarkerLabel: "근거/출처 0개",
    });
  });

  it("counts evidence and source markers in preview content", () => {
    expect(
      buildExportPreviewSummary(
        [
          "질문: 검사 수치 확인",
          "근거: 대한당뇨병학회 당뇨병 관리 목표",
          "출처: 국가암정보센터 자궁경부암 일반적 증상",
        ].join("\n"),
      ),
    ).toMatchObject({
      sourceMarkerCount: 2,
      sourceMarkerLabel: "근거/출처 2개",
    });
  });

  it("counts source markers inside rendered caregiver HTML previews", () => {
    expect(
      buildExportPreviewSummary(
        [
          "<section>",
          '<small>근거: <a href="https://example.test/source">공식 출처</a></small>',
          '<p>출처: 국가암정보센터 자궁경부암 일반적 증상</p>',
          "</section>",
        ].join("\n"),
      ),
    ).toMatchObject({
      lineCount: 4,
      sourceMarkerCount: 2,
      sourceMarkerLabel: "근거/출처 2개",
    });
  });

  it("formats preview action affordances with the same compact summary as visible chips", () => {
    const summary = buildExportPreviewSummary("a\n근거: x");

    expect(formatExportPreviewCompactSummary(summary)).toBe("2줄 · 7자 · 11B · 근거/출처 1개");
    expect(formatExportPreviewCopyDescription("진료 요약", summary)).toBe(
      "진료 요약 복사 · 2줄 · 7자 · 11B · 근거/출처 1개",
    );
    expect(formatExportPreviewCopyStatus("진료 요약", summary)).toBe(
      "진료 요약 미리보기 복사됨 · 2줄 · 7자 · 11B · 근거/출처 1개",
    );
    expect(formatExportPreviewCopyUnsupportedStatus("진료 요약", summary)).toBe(
      "진료 요약 미리보기 복사 미지원 · 브라우저 클립보드 없음 · 2줄 · 7자 · 11B · 근거/출처 1개",
    );
    expect(formatExportPreviewCopyFailedStatus("진료 요약", summary)).toBe(
      "진료 요약 미리보기 복사 실패 · 2줄 · 7자 · 11B · 근거/출처 1개",
    );
    expect(formatExportPreviewPrintDescription("진료 요약", summary)).toBe(
      "진료 요약 인쇄 · 2줄 · 7자 · 11B · 근거/출처 1개",
    );
    expect(formatExportPreviewPrintStatus("진료 요약", summary)).toBe(
      "진료 요약 미리보기 인쇄 준비 · 2줄 · 7자 · 11B · 근거/출처 1개",
    );
    expect(formatExportPreviewPrintUnavailableStatus("진료 요약", summary)).toBe(
      "진료 요약 미리보기 인쇄 준비 미지원 · 2줄 · 7자 · 11B · 근거/출처 1개",
    );
    expect(formatExportPreviewPrintFailedStatus("진료 요약", summary)).toBe(
      "진료 요약 미리보기 인쇄 실패 · 2줄 · 7자 · 11B · 근거/출처 1개",
    );
    expect(formatExportPreviewPrintWindowFailedStatus("진료 요약", summary)).toBe(
      "진료 요약 미리보기 인쇄 창 열기 실패 · 2줄 · 7자 · 11B · 근거/출처 1개",
    );
    expect(formatExportPreviewCloseStatus("진료 요약", summary)).toBe(
      "진료 요약 미리보기 닫힘 · 2줄 · 7자 · 11B · 근거/출처 1개",
    );
    expect(formatExportPreviewDownloadDescription("진료 요약", summary)).toBe(
      "진료 요약 다운로드 · 2줄 · 7자 · 11B · 근거/출처 1개",
    );
    expect(formatExportPreviewDownloadStatus("진료 요약", summary)).toBe(
      "진료 요약 미리보기 다운로드됨 · 2줄 · 7자 · 11B · 근거/출처 1개",
    );
    expect(formatExportPreviewDownloadFallbackLabel("진료 요약")).toBe("진료 요약 미리보기");
  });

  it("keeps stale preview action labels and titles scoped to action plus disabled reason", () => {
    const summary = buildExportPreviewSummary("a\n근거: x");
    const actionDescription = formatExportPreviewCopyDescription("진료 요약", summary);

    expect(
      formatExportPreviewDisabledActionDescription(
        actionDescription,
        "진료 요약 범위가 바뀌어 다시 생성이 필요합니다.",
      ),
    ).toBe(
      "진료 요약 복사 · 2줄 · 7자 · 11B · 근거/출처 1개 · 비활성: 진료 요약 범위가 바뀌어 다시 생성이 필요합니다.",
    );
    expect(formatExportPreviewDisabledActionDescription(actionDescription)).toBe(
      actionDescription,
    );
  });

  it("keeps caregiver settings stale disabled action labels explicit", () => {
    const summary = buildExportPreviewSummary("a\n근거: x");
    const actionDescription = formatExportPreviewCopyDescription("보호자 공유본", summary);

    expect(
      formatExportPreviewDisabledActionDescription(
        actionDescription,
        "공유 설정이 바뀌어 다시 생성이 필요합니다.",
      ),
    ).toBe(
      "보호자 공유본 복사 · 2줄 · 7자 · 11B · 근거/출처 1개 · 비활성: 공유 설정이 바뀌어 다시 생성이 필요합니다.",
    );
  });

  it("keeps stale preview refresh labels scoped to preview type and changed state", () => {
    expect(formatExportPreviewFreshActionVisibleLabel("caregiver-settings")).toBe(
      "공유 설정 반영",
    );
    expect(formatExportPreviewFreshActionDescription("caregiver-settings")).toBe(
      "새 미리보기 생성 · 보호자 공유본 · 변경된 공유 설정 적용",
    );
    expect(formatExportPreviewFreshActionVisibleLabel("caregiver-content")).toBe(
      "공유 기록 반영",
    );
    expect(formatExportPreviewFreshActionDescription("caregiver-content")).toBe(
      "새 미리보기 생성 · 보호자 공유본 · 변경된 보호자 공유 기록 적용",
    );
    expect(formatExportPreviewFreshActionVisibleLabel("visit-range")).toBe(
      "요약 범위 반영",
    );
    expect(formatExportPreviewFreshActionDescription("visit-range")).toBe(
      "새 미리보기 생성 · 진료 요약 · 변경된 범위 적용",
    );
    expect(formatExportPreviewFreshActionVisibleLabel("visit-content")).toBe(
      "요약 기록 반영",
    );
    expect(formatExportPreviewFreshActionDescription("visit-content")).toBe(
      "새 미리보기 생성 · 진료 요약 · 변경된 기록 적용",
    );
    expect(formatExportPreviewFreshActionVisibleLabel("csv-content")).toBe(
      "CSV 기록 반영",
    );
    expect(formatExportPreviewFreshActionDescription("csv-content")).toBe(
      "새 미리보기 생성 · CSV · 변경된 기록 적용",
    );
  });

  it("formats stale preview status feedback with preview type and compact summary", () => {
    const summary = buildExportPreviewSummary("a\n근거: x");

    expect(formatExportPreviewStaleStatus("보호자 공유본", summary, "caregiver-settings")).toBe(
      "보호자 공유본 미리보기 새로 생성 필요 · 변경된 공유 설정 · 2줄 · 7자 · 11B · 근거/출처 1개",
    );
    expect(formatExportPreviewStaleStatus("진료 요약", summary, "visit-range")).toBe(
      "진료 요약 미리보기 새로 생성 필요 · 변경된 진료 요약 범위 · 2줄 · 7자 · 11B · 근거/출처 1개",
    );
    expect(formatExportPreviewStaleStatus("CSV", summary, "csv-content")).toBe(
      "CSV 미리보기 새로 생성 필요 · 변경된 CSV 기록 · 2줄 · 7자 · 11B · 근거/출처 1개",
    );
  });
});
