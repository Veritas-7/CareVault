import {
  type DocumentRagContext,
  type DocumentRagContextItem,
  type DocumentRagEvidenceChunk,
} from "./documentRagContext";
import { extractDocumentRagLocalModelError } from "./documentRagModelRequest";
import {
  buildAiEndpointHeaders,
  validateAiEndpointSettings,
  type AiEndpointAuthMode,
  type AiEndpointPrivacyMode,
} from "./aiSettings";

export type DocumentRagEmbeddingConfig = {
  apiKey?: string;
  authMode?: AiEndpointAuthMode;
  endpoint: string;
  model: string;
  privacyMode?: AiEndpointPrivacyMode;
};

export type DocumentRagEmbeddingValidation = {
  level:
    | "ready"
    | "missing-endpoint"
    | "missing-model"
    | "missing-api-key"
    | "remote-endpoint-blocked"
    | "invalid-endpoint"
    | "insufficient-evidence";
  summary: string;
  warnings: string[];
};

export type DocumentRagEmbeddingRequestBody = {
  input: string[];
  model: string;
};

export type DocumentRagEmbeddingRequest =
  | {
      corpus: DocumentRagEmbeddingCorpusEntry[];
      ok: true;
      body: DocumentRagEmbeddingRequestBody;
      endpoint: string;
      summary: string;
      warnings: string[];
    }
  | {
      ok: false;
      summary: string;
      validation: DocumentRagEmbeddingValidation;
      warnings: string[];
    };

export type DocumentRagEmbeddingRankedChunk = {
  chunkLabel: string;
  citationLabel: string;
  documentId: string;
  nextActionSummary: string;
  reasonSummary: string;
  similarityPercent: number;
  sourceSummary: string;
  statusSummary: string;
  text: string;
  titleLine: string;
};

export type DocumentRagEmbeddingRunResult =
  | {
      ok: true;
      rankedChunks: DocumentRagEmbeddingRankedChunk[];
      summary: string;
      warnings: string[];
    }
  | {
      ok: false;
      summary: string;
      warnings: string[];
    };

type DocumentRagEmbeddingCorpusEntry = {
  chunk: DocumentRagEvidenceChunk;
  item: DocumentRagContextItem;
  input: string;
};

type Fetcher = (
  input: string,
  init: {
    body: string;
    headers: Record<string, string>;
    method: "POST";
  },
) => Promise<{
  json: () => Promise<unknown>;
  ok: boolean;
  status: number;
}>;

const maxEmbeddingInputLength = 900;

function normalizeEndpoint(endpoint: string) {
  return endpoint.trim();
}

function truncateEmbeddingInput(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxEmbeddingInputLength) return normalized;
  return `${normalized.slice(0, maxEmbeddingInputLength - 3).trimEnd()}...`;
}

function buildEmbeddingCorpus(context: DocumentRagContext): DocumentRagEmbeddingCorpusEntry[] {
  return context.items.flatMap((item) =>
    item.evidenceChunks.map((chunk) => ({
      chunk,
      input: truncateEmbeddingInput(
        [
          `문서: ${item.titleLine}`,
          `상태: ${item.statusSummary}`,
          `다음 조치: ${item.nextActionSummary}`,
          `근거 출처: ${chunk.sourceSummary}`,
          `근거: ${chunk.text}`,
        ].join("\n"),
      ),
      item,
    })),
  );
}

function buildEmbeddingQueryInput(context: DocumentRagContext) {
  return truncateEmbeddingInput(
    [
      `검색 기준: ${context.queryLabel}`,
      `컨텍스트 요약: ${context.summary}`,
      `근거 품질: ${context.evidenceQuality.summary}`,
      context.careBrief.lines.length ? `진료 확인 초점: ${context.careBrief.lines.join(" | ")}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  );
}

export function validateDocumentRagEmbeddingRequest(
  context: DocumentRagContext,
  config: DocumentRagEmbeddingConfig,
): DocumentRagEmbeddingValidation {
  const endpoint = normalizeEndpoint(config.endpoint);
  const model = config.model.trim();
  const corpus = buildEmbeddingCorpus(context);

  if (context.evidenceQuality.level === "insufficient" || !corpus.length) {
    return {
      level: "insufficient-evidence",
      summary: "로컬 임베딩 RAG 요청 차단 · 근거 부족",
      warnings: [
        "저장 서류 근거 조각이 부족해 임베딩 요청을 만들지 않습니다.",
        ...context.evidenceQuality.warnings,
      ],
    };
  }

  const endpointValidation = validateAiEndpointSettings(
    {
      apiKey: config.apiKey ?? "",
      authMode: config.authMode ?? "none",
      endpoint,
      privacyMode: config.privacyMode ?? "local-only",
    },
    { endpointLabel: "임베딩 RAG endpoint", requireEndpoint: true },
  );

  if (!endpointValidation.ok && endpointValidation.reason === "missing-endpoint") {
    return {
      level: "missing-endpoint",
      summary: "로컬 임베딩 RAG 요청 대기 · endpoint 없음",
      warnings: ["OpenAI-compatible 로컬 embeddings endpoint를 입력해야 합니다."],
    };
  }

  if (!endpointValidation.ok && endpointValidation.reason === "invalid-endpoint") {
    return {
      level: "invalid-endpoint",
      summary: "임베딩 RAG 요청 차단 · endpoint 형식 오류",
      warnings: endpointValidation.warnings,
    };
  }

  if (!endpointValidation.ok && endpointValidation.reason === "remote-endpoint-blocked") {
    return {
      level: "remote-endpoint-blocked",
      summary: "로컬 임베딩 RAG 요청 차단 · 로컬 endpoint만 허용",
      warnings: ["개인 의료 서류 근거는 localhost/127.0.0.1/[::1] embeddings endpoint로만 전송할 수 있습니다."],
    };
  }

  if (!endpointValidation.ok && endpointValidation.reason === "missing-api-key") {
    return {
      level: "missing-api-key",
      summary: "임베딩 RAG 요청 대기 · API key 없음",
      warnings: endpointValidation.warnings,
    };
  }

  if (!model) {
    return {
      level: "missing-model",
      summary: "로컬 임베딩 RAG 요청 대기 · 모델명 없음",
      warnings: ["로컬 임베딩 모델명을 입력해야 합니다."],
    };
  }

  return {
    level: "ready",
    summary: `로컬 임베딩 RAG 요청 준비 · 근거 조각 ${corpus.length}개`,
    warnings: context.evidenceQuality.warnings,
  };
}

export function buildDocumentRagEmbeddingRequest(
  context: DocumentRagContext,
  config: DocumentRagEmbeddingConfig,
): DocumentRagEmbeddingRequest {
  const validation = validateDocumentRagEmbeddingRequest(context, config);
  if (validation.level !== "ready") {
    return {
      ok: false,
      summary: validation.summary,
      validation,
      warnings: validation.warnings,
    };
  }

  const corpus = buildEmbeddingCorpus(context);
  return {
    corpus,
    ok: true,
    body: {
      input: [buildEmbeddingQueryInput(context), ...corpus.map((entry) => entry.input)],
      model: config.model.trim(),
    },
    endpoint: normalizeEndpoint(config.endpoint),
    summary: validation.summary,
    warnings: validation.warnings,
  };
}

function extractEmbeddingVector(entry: unknown) {
  if (!entry || typeof entry !== "object") return null;
  const vector = (entry as { embedding?: unknown }).embedding;
  if (!Array.isArray(vector) || !vector.length) return null;
  const numericVector = vector.filter((value): value is number => typeof value === "number");
  return numericVector.length === vector.length ? numericVector : null;
}

function extractEmbeddingVectors(response: unknown) {
  if (!response || typeof response !== "object") return [];
  const data = (response as { data?: unknown }).data;
  if (!Array.isArray(data)) return [];
  return data.map(extractEmbeddingVector);
}

function cosineSimilarity(first: number[], second: number[]) {
  if (!first.length || first.length !== second.length) return null;
  const dot = first.reduce((sum, value, index) => sum + value * second[index], 0);
  const firstMagnitude = Math.sqrt(first.reduce((sum, value) => sum + value * value, 0));
  const secondMagnitude = Math.sqrt(second.reduce((sum, value) => sum + value * value, 0));
  if (!firstMagnitude || !secondMagnitude) return null;
  return dot / (firstMagnitude * secondMagnitude);
}

function formatEmbeddingCitationLabel(item: DocumentRagContextItem, chunk: DocumentRagEvidenceChunk) {
  return `${item.titleLine} · ${chunk.label} · 조각 원천 ${chunk.sourceSummary}`;
}

function rankEmbeddingCorpus(
  corpus: DocumentRagEmbeddingCorpusEntry[],
  vectors: Array<number[] | null>,
) {
  const queryVector = vectors[0];
  if (!queryVector) return [];
  return corpus
    .map((entry, index) => {
      const similarity = cosineSimilarity(queryVector, vectors[index + 1] ?? []);
      if (similarity === null) return null;
      return {
        chunkLabel: entry.chunk.label,
        citationLabel: formatEmbeddingCitationLabel(entry.item, entry.chunk),
        documentId: entry.item.documentId,
        nextActionSummary: entry.item.nextActionSummary,
        reasonSummary: `로컬 임베딩 유사도: ${Math.round(similarity * 100)}%`,
        similarityPercent: Math.round(similarity * 100),
        sourceSummary: entry.chunk.sourceSummary,
        statusSummary: entry.item.statusSummary,
        text: entry.chunk.text,
        titleLine: entry.item.titleLine,
      };
    })
    .filter((entry): entry is DocumentRagEmbeddingRankedChunk => Boolean(entry))
    .sort((first, second) => second.similarityPercent - first.similarityPercent);
}

export async function requestDocumentRagEmbeddings(
  context: DocumentRagContext,
  config: DocumentRagEmbeddingConfig,
  fetcher: Fetcher = fetch,
): Promise<DocumentRagEmbeddingRunResult> {
  const request = buildDocumentRagEmbeddingRequest(context, config);
  if (!request.ok) {
    return {
      ok: false,
      summary: request.summary,
      warnings: request.warnings,
    };
  }

  try {
    const response = await fetcher(request.endpoint, {
      body: JSON.stringify(request.body),
      headers: buildAiEndpointHeaders({
        apiKey: config.apiKey ?? "",
        authMode: config.authMode ?? "none",
      }),
      method: "POST",
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
      const endpointError = extractDocumentRagLocalModelError(json);
      return {
        ok: false,
        summary: `로컬 임베딩 RAG 요청 실패 · HTTP ${response.status}`,
        warnings: [
          ...(endpointError ? [`로컬 임베딩 endpoint 오류: ${endpointError}`] : []),
          ...request.warnings,
        ],
      };
    }

    const rankedChunks = rankEmbeddingCorpus(request.corpus, extractEmbeddingVectors(json));
    if (!rankedChunks.length) {
      return {
        ok: false,
        summary: "로컬 임베딩 RAG 응답 실패 · 벡터 없음",
        warnings: ["모델 응답에서 query/evidence embedding 벡터를 찾지 못했습니다.", ...request.warnings],
      };
    }

    return {
      ok: true,
      rankedChunks,
      summary: `로컬 임베딩 RAG 점검 완료 · 근거 조각 ${rankedChunks.length}개`,
      warnings: request.warnings,
    };
  } catch {
    return {
      ok: false,
      summary: "로컬 임베딩 RAG 요청 실패 · endpoint 연결 실패",
      warnings: request.warnings,
    };
  }
}
