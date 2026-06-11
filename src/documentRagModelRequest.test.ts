import { describe, expect, it, vi } from "vitest";
import { buildDocumentRagContext } from "./documentRagContext";
import {
  buildDocumentRagLocalModelRequest,
  extractDocumentRagLocalModelText,
  requestDocumentRagLocalModel,
  validateDocumentRagLocalModelRequest,
} from "./documentRagModelRequest";

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

function sourceGroundedContext() {
  return buildDocumentRagContext([parsedDocument], "자궁경부암 혈압 당화혈색소");
}

describe("documentRagModelRequest", () => {
  it("builds an OpenAI-compatible local model request from source-grounded RAG context", () => {
    const context = sourceGroundedContext();
    const request = buildDocumentRagLocalModelRequest(context, {
      endpoint: "http://127.0.0.1:11434/v1/chat/completions",
      model: "qwen-local",
    });

    expect(request.ok).toBe(true);
    if (!request.ok) throw new Error("expected ready request");
    expect(request.endpoint).toBe("http://127.0.0.1:11434/v1/chat/completions");
    expect(request.body.model).toBe("qwen-local");
    expect(request.body.temperature).toBe(0.1);
    expect(request.body.messages[0].role).toBe("system");
    expect(request.body.messages[1].content).toContain("[CareVault 문서 RAG 모델 핸드오프]");
    expect(request.body.messages[1].content).toContain("[앱 내 답변 초안]");
    expect(request.body.messages[1].content).toContain("HbA1c 7.2%");
    expect(request.body.messages[1].content).not.toContain("/Users/wj/private");
  });

  it("fails closed for missing, remote, and insufficient local model requests", () => {
    const context = sourceGroundedContext();

    expect(
      validateDocumentRagLocalModelRequest(context, {
        endpoint: "",
        model: "qwen-local",
      }).level,
    ).toBe("missing-endpoint");
    expect(
      validateDocumentRagLocalModelRequest(context, {
        endpoint: "https://api.example.com/v1/chat/completions",
        model: "qwen-local",
      }).level,
    ).toBe("remote-endpoint-blocked");
    expect(
      validateDocumentRagLocalModelRequest(context, {
        endpoint: "http://localhost:11434/v1/chat/completions",
        model: "",
      }).level,
    ).toBe("missing-model");
    expect(
      validateDocumentRagLocalModelRequest(context, {
        endpoint: "http://[::1]:11434/v1/chat/completions",
        model: "qwen-local",
      }).level,
    ).toBe("ready");
    expect(
      buildDocumentRagLocalModelRequest(buildDocumentRagContext([], "혈압"), {
        endpoint: "http://127.0.0.1:11434/v1/chat/completions",
        model: "qwen-local",
      }),
    ).toMatchObject({
      ok: false,
      validation: { level: "insufficient-evidence" },
    });
  });

  it("posts only ready local model requests and extracts OpenAI-compatible text", async () => {
    const context = sourceGroundedContext();
    const fetcher = vi.fn().mockResolvedValue({
      json: async () => ({
        choices: [{ message: { content: "문서 1 근거로 진료팀 확인 질문을 준비합니다." } }],
      }),
      ok: true,
      status: 200,
    });

    const result = await requestDocumentRagLocalModel(
      context,
      {
        endpoint: "http://localhost:11434/v1/chat/completions",
        model: "qwen-local",
      },
      fetcher,
    );

    expect(result).toEqual({
      ok: true,
      text: "문서 1 근거로 진료팀 확인 질문을 준비합니다.",
    });
    expect(fetcher).toHaveBeenCalledWith(
      "http://localhost:11434/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("does not post when local model request validation fails", async () => {
    const fetcher = vi.fn();
    const result = await requestDocumentRagLocalModel(
      buildDocumentRagContext([], "혈압"),
      {
        endpoint: "http://localhost:11434/v1/chat/completions",
        model: "qwen-local",
      },
      fetcher,
    );

    expect(result.ok).toBe(false);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("extracts common local and OpenAI-compatible response shapes", () => {
    expect(
      extractDocumentRagLocalModelText({
        choices: [{ text: "legacy text" }],
      }),
    ).toBe("legacy text");
    expect(
      extractDocumentRagLocalModelText({
        message: { content: "ollama chat text" },
      }),
    ).toBe("ollama chat text");
    expect(extractDocumentRagLocalModelText({ response: "ollama generate text" })).toBe(
      "ollama generate text",
    );
  });
});
