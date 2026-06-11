import { describe, expect, it } from "vitest";
import { buildDocumentRagContext } from "./documentRagContext";
import { validateDocumentRagEmbeddingRequest } from "./documentRagEmbeddingRequest";
import { validateDocumentRagLocalModelRequest } from "./documentRagModelRequest";
import { buildDocumentRagReadiness } from "./documentRagReadiness";

const parsedDocument = {
  attachmentName: "follow.hwpx",
  attachmentPath: "/Users/wj/private/follow.hwpx",
  body:
    "[첨부 텍스트 파싱: follow.hwpx · HWPX 본문 XML]\n" +
    "자궁경부암 추적 중 혈압 149/93, HbA1c 7.4%, 당화혈색소 상담 필요.",
  category: "visit-note",
  date: "2026-06-04",
  id: "doc-rag",
  nextAction: "",
  reviewStatus: "care-question",
  tags: "자궁경부암 고혈압 당뇨",
  title: "HWPX 추적 검사",
} as const;

function sourceGroundedContext() {
  return buildDocumentRagContext([parsedDocument], "자궁경부암 혈압 당화혈색소");
}

describe("documentRagReadiness", () => {
  it("keeps deterministic document RAG usable while optional local endpoints are unset", () => {
    const context = sourceGroundedContext();
    const readiness = buildDocumentRagReadiness({
      context,
      embeddingValidation: validateDocumentRagEmbeddingRequest(context, {
        endpoint: "",
        model: "bge-m3",
      }),
      modelValidation: validateDocumentRagLocalModelRequest(context, {
        endpoint: "",
        model: "llama3.2:1b",
      }),
    });

    expect(readiness.level).toBe("local-ready");
    expect(readiness.summary).toContain("문서 RAG 기본 사용 가능");
    expect(readiness.summary).toContain("선택적 로컬 모델/임베딩 설정 대기");
    expect(readiness.summary).toContain("RAG 컨텍스트 1개");
    expect(readiness.warnings.join("\n")).toContain("앱 내 답변 초안");
    expect(readiness.warnings.join("\n")).toContain("endpoint를 입력");
  });

  it("reports ready model-backed RAG only when both model and embedding requests are ready", () => {
    const context = sourceGroundedContext();
    const readiness = buildDocumentRagReadiness({
      context,
      embeddingValidation: validateDocumentRagEmbeddingRequest(context, {
        endpoint: "http://127.0.0.1:11434/v1/embeddings",
        model: "bge-m3",
      }),
      modelValidation: validateDocumentRagLocalModelRequest(context, {
        endpoint: "http://127.0.0.1:11434/v1/chat/completions",
        model: "llama3.2:1b",
      }),
    });

    expect(readiness.level).toBe("model-ready");
    expect(readiness.summary).toContain("로컬 모델/임베딩 요청 가능");
  });

  it("separates Ollama runtime failure from the usable local document evidence path", () => {
    const context = sourceGroundedContext();
    const readiness = buildDocumentRagReadiness({
      context,
      embeddingOutput: {
        status: "error",
        text:
          "로컬 임베딩 RAG 요청 실패 · HTTP 500\n" +
          "로컬 임베딩 endpoint 오류: error starting llama-server at /opt/homebrew/Cellar/ollama/0.30.7/libexec/llama-server",
      },
      embeddingValidation: validateDocumentRagEmbeddingRequest(context, {
        endpoint: "http://127.0.0.1:11434/v1/embeddings",
        model: "bge-m3",
      }),
      modelOutput: {
        status: "error",
        text:
          "로컬 모델 RAG 요청 실패 · HTTP 500\n" +
          "로컬 모델 endpoint 오류: error starting llama-server at /Users/wj/private/llama-server",
      },
      modelValidation: validateDocumentRagLocalModelRequest(context, {
        endpoint: "http://127.0.0.1:11434/v1/chat/completions",
        model: "llama3.2:1b",
      }),
    });

    expect(readiness.level).toBe("blocked");
    expect(readiness.summary).toContain("문서 RAG 기본 사용 가능");
    expect(readiness.summary).toContain("로컬 runtime 수리 필요");
    expect(readiness.warnings.join("\n")).toContain("llama-server");
    expect(readiness.warnings.join("\n")).toContain("저장 서류 근거만으로 계속 사용할 수 있습니다");
    expect(readiness.warnings.join("\n")).toContain("[local path]");
    expect(readiness.warnings.join("\n")).not.toContain("/Users/wj/private");
    expect(readiness.warnings.join("\n")).not.toContain("/opt/homebrew");
  });

  it("blocks remote endpoints before treating model-backed RAG as ready", () => {
    const context = sourceGroundedContext();
    const readiness = buildDocumentRagReadiness({
      context,
      embeddingValidation: validateDocumentRagEmbeddingRequest(context, {
        endpoint: "http://127.0.0.1:11434/v1/embeddings",
        model: "bge-m3",
      }),
      modelValidation: validateDocumentRagLocalModelRequest(context, {
        endpoint: "https://api.example.com/v1/chat/completions",
        model: "remote",
      }),
    });

    expect(readiness.level).toBe("blocked");
    expect(readiness.summary).toContain("원격 endpoint 차단");
    expect(readiness.warnings.join("\n")).toContain("localhost/127.0.0.1/[::1]");
  });

  it("requires usable document evidence before any runtime setup status is considered", () => {
    const context = buildDocumentRagContext([], "혈압");
    const readiness = buildDocumentRagReadiness({
      context,
      embeddingValidation: validateDocumentRagEmbeddingRequest(context, {
        endpoint: "http://127.0.0.1:11434/v1/embeddings",
        model: "bge-m3",
      }),
      modelValidation: validateDocumentRagLocalModelRequest(context, {
        endpoint: "http://127.0.0.1:11434/v1/chat/completions",
        model: "llama3.2:1b",
      }),
    });

    expect(readiness.level).toBe("needs-evidence");
    expect(readiness.summary).toContain("저장 서류 근거 부족");
  });
});
