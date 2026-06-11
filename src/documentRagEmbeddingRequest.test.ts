import { describe, expect, it, vi } from "vitest";
import { buildDocumentRagContext } from "./documentRagContext";
import {
  buildDocumentRagEmbeddingRequest,
  requestDocumentRagEmbeddings,
  validateDocumentRagEmbeddingRequest,
} from "./documentRagEmbeddingRequest";

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

const parsedFollowUpDocument = {
  attachmentName: "혈압_혈당_추적.hwpx",
  attachmentPath: "/Users/wj/private/혈압_혈당_추적.hwpx",
  body:
    "[첨부 텍스트 파싱: 혈압_혈당_추적.hwpx · HWPX 본문 XML]\n" +
    "자궁경부암 추적 외래 전 확인. 혈압 150/92, 당화혈색소 7.8%.",
  category: "lab",
  date: "2026-06-12",
  id: "doc-follow-up",
  nextAction: "추적 외래에서 혈압과 당화혈색소 변화 확인",
  reviewStatus: "care-question",
  tags: "자궁경부암,혈압,당화혈색소",
  title: "혈압 혈당 추적",
} as const;

function sourceGroundedContext() {
  return buildDocumentRagContext([parsedDocument], "자궁경부암 혈압 당화혈색소");
}

describe("documentRagEmbeddingRequest", () => {
  it("builds an OpenAI-compatible local embedding request from RAG evidence chunks", () => {
    const request = buildDocumentRagEmbeddingRequest(sourceGroundedContext(), {
      endpoint: "http://127.0.0.1:11434/v1/embeddings",
      model: "bge-m3",
    });

    expect(request.ok).toBe(true);
    if (!request.ok) throw new Error("expected ready embedding request");
    expect(request.endpoint).toBe("http://127.0.0.1:11434/v1/embeddings");
    expect(request.body.model).toBe("bge-m3");
    expect(request.body.input).toHaveLength(2);
    expect(request.body.input[0]).toContain("자궁경부암 혈압 당화혈색소");
    expect(request.body.input[1]).toContain("HbA1c 7.2%");
    expect(request.body.input.join("\n")).not.toContain("/Users/wj/private");
  });

  it("fails closed for missing, remote, and insufficient embedding requests", () => {
    const context = sourceGroundedContext();

    expect(
      validateDocumentRagEmbeddingRequest(context, {
        endpoint: "",
        model: "bge-m3",
      }).level,
    ).toBe("missing-endpoint");
    expect(
      validateDocumentRagEmbeddingRequest(context, {
        endpoint: "https://api.example.com/v1/embeddings",
        model: "bge-m3",
      }).level,
    ).toBe("remote-endpoint-blocked");
    expect(
      validateDocumentRagEmbeddingRequest(context, {
        endpoint: "http://[::1]:11434/v1/embeddings",
        model: "",
      }).level,
    ).toBe("missing-model");
    expect(
      buildDocumentRagEmbeddingRequest(buildDocumentRagContext([], "혈압"), {
        endpoint: "http://127.0.0.1:11434/v1/embeddings",
        model: "bge-m3",
      }),
    ).toMatchObject({
      ok: false,
      validation: { level: "insufficient-evidence" },
    });
  });

  it("posts only ready embedding requests and ranks evidence chunks by cosine similarity", async () => {
    const context = sourceGroundedContext();
    const fetcher = vi.fn().mockResolvedValue({
      json: async () => ({
        data: [
          { embedding: [1, 0, 0], index: 0 },
          { embedding: [0.8, 0.2, 0], index: 1 },
        ],
      }),
      ok: true,
      status: 200,
    });

    const result = await requestDocumentRagEmbeddings(
      context,
      {
        endpoint: "http://localhost:11434/v1/embeddings",
        model: "bge-m3",
      },
      fetcher,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected ranked embeddings");
    expect(result.summary).toBe("로컬 임베딩 RAG 점검 완료 · 근거 조각 1개");
    expect(result.rankedChunks[0]).toMatchObject({
      citationLabel:
        "2026-06-11 · 자궁경부암 병리결과 · 파싱 본문 조각 1 · 조각 원천 HWP/HWPX 데스크톱 파서: 상급병원_병리결과.hwp",
      chunkLabel: "파싱 본문 조각 1",
      documentId: "doc-parsed",
      nextActionSummary: "진료 전 혈당과 혈압 관리 연결 질문",
      similarityPercent: 97,
      statusSummary: "검토 필요",
      titleLine: "2026-06-11 · 자궁경부암 병리결과",
    });
    expect(JSON.stringify(result.rankedChunks)).not.toContain("/Users/wj/private");
    expect(fetcher).toHaveBeenCalledWith(
      "http://localhost:11434/v1/embeddings",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("keeps document provenance on multi-document embedding ranks", async () => {
    const context = buildDocumentRagContext(
      [parsedDocument, parsedFollowUpDocument],
      "자궁경부암 혈압 당화혈색소",
    );
    const fetcher = vi.fn().mockImplementation(async (_input: string, init: { body: string }) => {
      const body = JSON.parse(init.body) as { input: string[] };
      return {
        json: async () => ({
          data: body.input.map((input, index) => ({
            embedding:
              index === 0
                ? [1, 0, 0]
                : input.includes("혈압 혈당 추적")
                  ? [0.98, 0.02, 0]
                  : [0.2, 0.98, 0],
            index,
          })),
        }),
        ok: true,
        status: 200,
      };
    });

    const result = await requestDocumentRagEmbeddings(
      context,
      {
        endpoint: "http://localhost:11434/v1/embeddings",
        model: "bge-m3",
      },
      fetcher,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected ranked embeddings");
    expect(result.rankedChunks).toHaveLength(2);
    expect(result.rankedChunks[0]).toMatchObject({
      citationLabel:
        "2026-06-12 · 혈압 혈당 추적 · 파싱 본문 조각 1 · 조각 원천 HWPX 본문 XML: 혈압_혈당_추적.hwpx",
      documentId: "doc-follow-up",
      nextActionSummary: "추적 외래에서 혈압과 당화혈색소 변화 확인",
      sourceSummary: "HWPX 본문 XML: 혈압_혈당_추적.hwpx",
      statusSummary: "의료진 질문",
      titleLine: "2026-06-12 · 혈압 혈당 추적",
    });
    expect(result.rankedChunks[1]).toMatchObject({
      documentId: "doc-parsed",
      sourceSummary: "HWP/HWPX 데스크톱 파서: 상급병원_병리결과.hwp",
    });
    expect(JSON.stringify(result.rankedChunks)).not.toContain("/Users/wj/private");
  });

  it("reports sanitized endpoint errors for local embedding HTTP failures", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      json: async () => ({
        error: {
          message: "embedding runtime failed at /Users/wj/private/model and /opt/homebrew/ollama",
        },
      }),
      ok: false,
      status: 500,
    });

    const result = await requestDocumentRagEmbeddings(
      sourceGroundedContext(),
      {
        endpoint: "http://localhost:11434/v1/embeddings",
        model: "bge-m3",
      },
      fetcher,
    );

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.summary).toBe("로컬 임베딩 RAG 요청 실패 · HTTP 500");
    expect(result.warnings[0]).toContain("로컬 임베딩 endpoint 오류");
    expect(result.warnings[0]).toContain("[local path]");
    expect(result.warnings[0]).not.toContain("/Users/wj/private");
    expect(result.warnings[0]).not.toContain("/opt/homebrew");
  });
});
