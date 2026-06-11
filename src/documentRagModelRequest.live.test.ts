import { describe, expect, it } from "vitest";
import { buildDocumentRagContext } from "./documentRagContext";
import { requestDocumentRagLocalModel } from "./documentRagModelRequest";

declare const process: {
  env: Record<string, string | undefined>;
};

const parsedDocument = {
  attachmentName: "상급병원_병리결과.hwp",
  attachmentPath: "/Users/wj/private/상급병원_병리결과.hwp",
  body:
    "[첨부 텍스트 파싱: 상급병원_병리결과.hwp · HWP/HWPX 데스크톱 파서]\n" +
    "자궁경부암 병리 결과: 절제연 음성. HbA1c 7.2%, 혈압 142/88.",
  category: "pathology",
  date: "2026-06-11",
  id: "doc-parsed",
  nextAction: "진료 전 혈당과 혈압 관리 연결 질문",
  reviewStatus: "needs-review",
  tags: "자궁경부암,당뇨,고혈압",
  title: "자궁경부암 병리결과",
} as const;

const endpoint = process.env.CAREVAULT_RAG_MODEL_ENDPOINT?.trim() ?? "";
const model = process.env.CAREVAULT_RAG_MODEL_NAME?.trim() ?? "";
const expectedTerms = (process.env.CAREVAULT_RAG_MODEL_EXPECTED_TERMS ?? "")
  .split(",")
  .map((term) => term.trim())
  .filter(Boolean);
const maybeLiveIt = endpoint || model ? it : it.skip;

describe("documentRagModelRequest live smoke", () => {
  maybeLiveIt(
    "posts source-grounded RAG context to a configured local model endpoint",
    async () => {
      const context = buildDocumentRagContext(
        [parsedDocument],
        "자궁경부암 혈압 당화혈색소",
      );
      const result = await requestDocumentRagLocalModel(context, {
        endpoint,
        model,
      });

      expect(result.ok, result.ok ? "" : `${result.summary}\n${result.warnings.join("\n")}`).toBe(
        true,
      );
      if (!result.ok) return;
      expect(result.text.length).toBeGreaterThan(0);
      expect(result.text).not.toContain("/Users/wj/private");
      expectedTerms.forEach((term) => {
        expect(result.text).toContain(term);
      });
    },
    60_000,
  );
});
