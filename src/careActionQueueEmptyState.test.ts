import { describe, expect, it } from "vitest";
import { careActionQueueEmptyRecoveryLinks } from "./careActionQueueEmptyState";

describe("careActionQueueEmptyState", () => {
  it("keeps empty queue recovery links focused on forms that can create queue items", () => {
    expect(careActionQueueEmptyRecoveryLinks).toEqual([
      {
        href: "#records",
        id: "records",
        label: "혈압·혈당 입력",
      },
      {
        href: "#profile",
        id: "profile",
        label: "암 관리 모드 켜기",
      },
      {
        href: "#care-plan",
        id: "care-plan",
        label: "증상·질문 기록",
      },
      {
        href: "#labs",
        id: "labs",
        label: "검사 수치 입력",
      },
      {
        href: "#documents",
        id: "documents",
        label: "서류 조치 추가",
      },
    ]);
  });
});
