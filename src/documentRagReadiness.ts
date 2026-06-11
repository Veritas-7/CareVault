import type { DocumentRagContext } from "./documentRagContext";
import type {
  DocumentRagEmbeddingValidation,
} from "./documentRagEmbeddingRequest";
import type {
  DocumentRagLocalModelValidation,
} from "./documentRagModelRequest";

export type DocumentRagRuntimeOutput = {
  status: "error" | "pending" | "success";
  text: string;
};

export type DocumentRagReadiness = {
  level: "blocked" | "checking" | "local-ready" | "model-ready" | "needs-evidence";
  summary: string;
  warnings: string[];
};

type BuildDocumentRagReadinessInput = {
  context: DocumentRagContext;
  embeddingOutput?: DocumentRagRuntimeOutput | null;
  embeddingValidation: DocumentRagEmbeddingValidation;
  modelOutput?: DocumentRagRuntimeOutput | null;
  modelValidation: DocumentRagLocalModelValidation;
};

function sanitizeReadinessText(value: string) {
  return value
    .replace(/\/Users\/[^\s"',)]+/g, "[local path]")
    .replace(/\/opt\/homebrew\/[^\s"',)]+/g, "[local path]")
    .replace(/[A-Za-z]:\\[^\s"',)]+/g, "[local path]")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateReadinessText(value: string, maxLength = 260) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 3).trimEnd()}...`;
}

function uniqueWarnings(values: string[]) {
  return Array.from(
    new Set(values.map(sanitizeReadinessText).filter((value) => value.length > 0)),
  );
}

function isRemoteBlocked(
  modelValidation: DocumentRagLocalModelValidation,
  embeddingValidation: DocumentRagEmbeddingValidation,
) {
  return (
    modelValidation.level === "remote-endpoint-blocked" ||
    embeddingValidation.level === "remote-endpoint-blocked"
  );
}

function isReady(
  modelValidation: DocumentRagLocalModelValidation,
  embeddingValidation: DocumentRagEmbeddingValidation,
) {
  return modelValidation.level === "ready" && embeddingValidation.level === "ready";
}

function isSetupOnly(
  modelValidation: DocumentRagLocalModelValidation,
  embeddingValidation: DocumentRagEmbeddingValidation,
) {
  const setupLevels = new Set(["missing-endpoint", "missing-model", "ready"]);
  return setupLevels.has(modelValidation.level) && setupLevels.has(embeddingValidation.level);
}

function summarizeRuntimeError(output: DocumentRagRuntimeOutput | null | undefined) {
  if (!output || output.status !== "error") return "";
  const sanitized = sanitizeReadinessText(output.text);
  if (/llama-server/i.test(sanitized)) {
    return `Ollama runtime worker \`llama-server\` 수리가 필요합니다. 상세: ${truncateReadinessText(sanitized)}`;
  }
  return sanitized || "로컬 RAG runtime 요청이 실패했습니다.";
}

export function buildDocumentRagReadiness({
  context,
  embeddingOutput,
  embeddingValidation,
  modelOutput,
  modelValidation,
}: BuildDocumentRagReadinessInput): DocumentRagReadiness {
  if (context.evidenceQuality.level === "insufficient" || !context.items.length) {
    return {
      level: "needs-evidence",
      summary: "문서 RAG 준비 안 됨 · 저장 서류 근거 부족",
      warnings: uniqueWarnings([
        context.evidenceQuality.summary,
        ...context.evidenceQuality.warnings,
        modelValidation.summary,
        embeddingValidation.summary,
      ]),
    };
  }

  const runtimeErrors = uniqueWarnings([
    summarizeRuntimeError(modelOutput),
    summarizeRuntimeError(embeddingOutput),
  ]);
  if (runtimeErrors.length) {
    return {
      level: "blocked",
      summary: `문서 RAG 기본 사용 가능 · 로컬 runtime 수리 필요 · ${context.summary}`,
      warnings: uniqueWarnings([
        ...runtimeErrors,
        "앱 내 답변 초안, 근거 복사, 다운로드, export는 저장 서류 근거만으로 계속 사용할 수 있습니다.",
      ]),
    };
  }

  if (modelOutput?.status === "pending" || embeddingOutput?.status === "pending") {
    return {
      level: "checking",
      summary: `문서 RAG runtime 점검 중 · ${context.summary}`,
      warnings: uniqueWarnings([modelValidation.summary, embeddingValidation.summary]),
    };
  }

  if (isRemoteBlocked(modelValidation, embeddingValidation)) {
    return {
      level: "blocked",
      summary: `문서 RAG 안전 차단 · 원격 endpoint 차단 · ${context.summary}`,
      warnings: uniqueWarnings([
        ...modelValidation.warnings,
        ...embeddingValidation.warnings,
        "개인 의료 서류 근거는 로컬 endpoint로만 전송합니다.",
      ]),
    };
  }

  if (isReady(modelValidation, embeddingValidation)) {
    return {
      level: "model-ready",
      summary: `문서 RAG 준비됨 · 로컬 모델/임베딩 요청 가능 · ${context.summary}`,
      warnings: uniqueWarnings([
        ...modelValidation.warnings,
        ...embeddingValidation.warnings,
      ]),
    };
  }

  if (isSetupOnly(modelValidation, embeddingValidation)) {
    return {
      level: "local-ready",
      summary: `문서 RAG 기본 사용 가능 · 선택적 로컬 모델/임베딩 설정 대기 · ${context.summary}`,
      warnings: uniqueWarnings([
        "앱 내 답변 초안, 근거 복사, 다운로드, export는 저장 서류 근거만으로 사용할 수 있습니다.",
        ...modelValidation.warnings,
        ...embeddingValidation.warnings,
      ]),
    };
  }

  return {
    level: "blocked",
    summary: `문서 RAG 요청 차단 · ${context.summary}`,
    warnings: uniqueWarnings([
      ...modelValidation.warnings,
      ...embeddingValidation.warnings,
    ]),
  };
}
