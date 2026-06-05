import { describe, expect, it } from "vitest";
import {
  buildLabSourceEvidenceParts,
  formatLabNoteWithSourceEvidence,
  formatLabSourceEvidence,
  parseLabSourceEvidence,
  resolveLabPresetSourceEvidence,
} from "./labSourceEvidence";

describe("labSourceEvidence", () => {
  it("splits source-backed lab notes into note body, label, and URL", () => {
    expect(
      parseLabSourceEvidence(
        "대한당뇨병학회 일반 목표 기준입니다.\n출처: 대한당뇨병학회 당뇨병 관리 목표 - https://www.diabetes.or.kr/general/info/treat/treat_01.php",
      ),
    ).toEqual({
      noteBody: "대한당뇨병학회 일반 목표 기준입니다.",
      sourceLabel: "대한당뇨병학회 당뇨병 관리 목표",
      sourceUrl: "https://www.diabetes.or.kr/general/info/treat/treat_01.php",
    });
  });

  it("keeps local result-sheet evidence as a label without a URL", () => {
    expect(
      parseLabSourceEvidence("CBC 백혈구 수치입니다.\n출처: 검사실 결과지 기준 우선"),
    ).toEqual({
      noteBody: "CBC 백혈구 수치입니다.",
      sourceLabel: "검사실 결과지 기준 우선",
      sourceUrl: "",
    });
  });

  it("preserves preset applicability text while splitting the source line", () => {
    expect(
      parseLabSourceEvidence(
        "대한당뇨병학회 일반 목표 기준입니다.\n적용 기준: 여성 기준 적용\n출처: 대한당뇨병학회 당뇨병 관리 목표 - https://example.com",
      ),
    ).toEqual({
      noteBody: "대한당뇨병학회 일반 목표 기준입니다.\n적용 기준: 여성 기준 적용",
      sourceLabel: "대한당뇨병학회 당뇨병 관리 목표",
      sourceUrl: "https://example.com",
    });
  });

  it("leaves ordinary notes unchanged", () => {
    expect(parseLabSourceEvidence("진료 때 재확인")).toEqual({
      noteBody: "진료 때 재확인",
      sourceLabel: "",
      sourceUrl: "",
    });
  });

  it("resolves official preset source evidence from common lab names", () => {
    expect(resolveLabPresetSourceEvidence("WBC")).toMatchObject({
      presetId: "wbc",
      presetLabel: "WBC 백혈구(CBC)",
      sourceLabel: "서울아산병원 전혈구검사 참고치",
    });
    expect(resolveLabPresetSourceEvidence("혈소판 수치")).toMatchObject({
      presetId: "platelets",
      sourceLabel: "서울아산병원 전혈구검사 참고치",
    });
    expect(resolveLabPresetSourceEvidence("ANC")).toMatchObject({
      presetId: "anc",
      sourceLabel: "국가암정보센터 항암 부작용 증상 관리 지침",
    });
    expect(resolveLabPresetSourceEvidence("unknown custom marker")).toBeNull();
  });

  it("adds preset evidence when an older saved lab note has no source line", () => {
    expect(
      buildLabSourceEvidenceParts({
        name: "WBC",
        note: "면역저하 식품 안전 질문과 연결",
      }),
    ).toMatchObject({
      noteBody: "면역저하 식품 안전 질문과 연결",
      sourceLabel: "서울아산병원 전혈구검사 참고치",
      sourceOrigin: "preset",
      sourcePresetLabel: "WBC 백혈구(CBC)",
    });
  });

  it("keeps explicit note evidence ahead of inferred preset evidence", () => {
    expect(
      buildLabSourceEvidenceParts({
        name: "WBC",
        note: "병원 기준 확인\n출처: 검사실 결과지 기준 우선",
      }),
    ).toEqual({
      noteBody: "병원 기준 확인",
      sourceLabel: "검사실 결과지 기준 우선",
      sourceOrigin: "note",
      sourcePresetLabel: "",
      sourceUrl: "",
    });
  });

  it("formats source evidence for queue and export details", () => {
    expect(formatLabSourceEvidence("대한당뇨병학회 당뇨병 관리 목표", "https://example.com")).toBe(
      "근거: 대한당뇨병학회 당뇨병 관리 목표 (https://example.com)",
    );
    expect(formatLabSourceEvidence("검사실 결과지 기준 우선", "")).toBe(
      "근거: 검사실 결과지 기준 우선",
    );
    expect(
      formatLabNoteWithSourceEvidence(
        "대한당뇨병학회 일반 목표 기준입니다.\n출처: 대한당뇨병학회 당뇨병 관리 목표 - https://example.com",
      ),
    ).toBe("대한당뇨병학회 일반 목표 기준입니다. / 근거: 대한당뇨병학회 당뇨병 관리 목표 (https://example.com)");
    expect(formatLabNoteWithSourceEvidence("면역저하 질문", "WBC")).toBe(
      "면역저하 질문 / 근거: 서울아산병원 전혈구검사 참고치 (https://ent.amc.seoul.kr/asan/mobile/healthinfo/management/managementDetail.do?managementId=126)",
    );
  });
});
