import {
  formatDocumentRagModelHandoffClipboardText,
  type DocumentRagContext,
} from "./documentRagContext";

export type DocumentRagLocalModelConfig = {
  endpoint: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
};

export type DocumentRagLocalModelValidation = {
  level: "ready" | "missing-endpoint" | "missing-model" | "remote-endpoint-blocked" | "insufficient-evidence";
  summary: string;
  warnings: string[];
};

export type DocumentRagLocalModelRequestBody = {
  max_tokens: number;
  messages: Array<{
    content: string;
    role: "system" | "user";
  }>;
  model: string;
  temperature: number;
};

export type DocumentRagLocalModelRequest =
  | {
      ok: true;
      body: DocumentRagLocalModelRequestBody;
      endpoint: string;
      summary: string;
      warnings: string[];
    }
  | {
      ok: false;
      summary: string;
      validation: DocumentRagLocalModelValidation;
      warnings: string[];
    };

export type DocumentRagLocalModelRunResult =
  | {
      ok: true;
      text: string;
    }
  | {
      ok: false;
      summary: string;
      warnings: string[];
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

const defaultMaxTokens = 700;
const defaultTemperature = 0.1;
const localHostnames = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const localNetworkPrefixes = ["127."];
const maxEndpointErrorLength = 220;

function normalizeEndpoint(endpoint: string) {
  return endpoint.trim();
}

function parseEndpoint(endpoint: string) {
  try {
    return new URL(endpoint);
  } catch {
    return null;
  }
}

function isAllowedLocalEndpoint(endpoint: string) {
  const url = parseEndpoint(endpoint);
  if (!url) return false;
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  const hostname = url.hostname.toLowerCase();
  return (
    localHostnames.has(hostname) ||
    localNetworkPrefixes.some((prefix) => hostname.startsWith(prefix))
  );
}

export function validateDocumentRagLocalModelRequest(
  context: DocumentRagContext,
  config: DocumentRagLocalModelConfig,
): DocumentRagLocalModelValidation {
  const endpoint = normalizeEndpoint(config.endpoint);
  const model = config.model.trim();

  if (context.evidenceQuality.level === "insufficient") {
    return {
      level: "insufficient-evidence",
      summary: "로컬 모델 RAG 요청 차단 · 근거 부족",
      warnings: [
        "저장 서류 근거가 부족해 로컬 모델 요청을 만들지 않습니다.",
        ...context.evidenceQuality.warnings,
      ],
    };
  }

  if (!endpoint) {
    return {
      level: "missing-endpoint",
      summary: "로컬 모델 RAG 요청 대기 · endpoint 없음",
      warnings: ["OpenAI-compatible 로컬 endpoint를 입력해야 합니다."],
    };
  }

  if (!isAllowedLocalEndpoint(endpoint)) {
    return {
      level: "remote-endpoint-blocked",
      summary: "로컬 모델 RAG 요청 차단 · 로컬 endpoint만 허용",
      warnings: ["개인 의료 서류 근거는 localhost/127.0.0.1/[::1] endpoint로만 전송할 수 있습니다."],
    };
  }

  if (!model) {
    return {
      level: "missing-model",
      summary: "로컬 모델 RAG 요청 대기 · 모델명 없음",
      warnings: ["로컬 모델명을 입력해야 합니다."],
    };
  }

  return {
    level: "ready",
    summary: `로컬 모델 RAG 요청 준비 · ${context.summary}`,
    warnings: context.evidenceQuality.warnings,
  };
}

export function buildDocumentRagLocalModelRequest(
  context: DocumentRagContext,
  config: DocumentRagLocalModelConfig,
): DocumentRagLocalModelRequest {
  const validation = validateDocumentRagLocalModelRequest(context, config);
  if (validation.level !== "ready") {
    return {
      ok: false,
      summary: validation.summary,
      validation,
      warnings: validation.warnings,
    };
  }

  const endpoint = normalizeEndpoint(config.endpoint);
  const prompt = formatDocumentRagModelHandoffClipboardText(context);

  return {
    ok: true,
    body: {
      max_tokens: config.maxTokens ?? defaultMaxTokens,
      messages: [
        {
          content:
            "CareVault 로컬 문서 RAG 보조자입니다. 제공된 근거 밖으로 추론하지 말고 진단, 처방, 치료 지시를 하지 않습니다.",
          role: "system",
        },
        {
          content: prompt,
          role: "user",
        },
      ],
      model: config.model.trim(),
      temperature: config.temperature ?? defaultTemperature,
    },
    endpoint,
    summary: validation.summary,
    warnings: validation.warnings,
  };
}

export function extractDocumentRagLocalModelText(response: unknown) {
  if (!response || typeof response !== "object") return "";
  const maybeResponse = response as {
    choices?: Array<{ message?: { content?: unknown }; text?: unknown }>;
    message?: { content?: unknown };
    response?: unknown;
    text?: unknown;
  };
  const choiceContent = maybeResponse.choices?.[0]?.message?.content;
  if (typeof choiceContent === "string" && choiceContent.trim()) return choiceContent.trim();
  const choiceText = maybeResponse.choices?.[0]?.text;
  if (typeof choiceText === "string" && choiceText.trim()) return choiceText.trim();
  if (typeof maybeResponse.message?.content === "string" && maybeResponse.message.content.trim()) {
    return maybeResponse.message.content.trim();
  }
  if (typeof maybeResponse.response === "string" && maybeResponse.response.trim()) {
    return maybeResponse.response.trim();
  }
  if (typeof maybeResponse.text === "string" && maybeResponse.text.trim()) {
    return maybeResponse.text.trim();
  }
  return "";
}

function sanitizeEndpointErrorText(text: string) {
  return text
    .replace(/\/Users\/[^\s"',)]+/g, "[local path]")
    .replace(/\/opt\/homebrew\/[^\s"',)]+/g, "[local path]")
    .replace(/[A-Za-z]:\\[^\s"',)]+/g, "[local path]")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractDocumentRagLocalModelError(response: unknown) {
  if (!response || typeof response !== "object") return "";
  const maybeResponse = response as {
    detail?: unknown;
    error?: { message?: unknown } | unknown;
    message?: unknown;
  };
  const candidates = [
    typeof maybeResponse.error === "object" && maybeResponse.error
      ? (maybeResponse.error as { message?: unknown }).message
      : maybeResponse.error,
    maybeResponse.message,
    maybeResponse.detail,
  ];
  const detail = candidates.find((candidate) => typeof candidate === "string" && candidate.trim());
  if (typeof detail !== "string") return "";
  const sanitized = sanitizeEndpointErrorText(detail);
  if (sanitized.length <= maxEndpointErrorLength) return sanitized;
  return `${sanitized.slice(0, maxEndpointErrorLength).trimEnd()}...`;
}

export async function requestDocumentRagLocalModel(
  context: DocumentRagContext,
  config: DocumentRagLocalModelConfig,
  fetcher: Fetcher = fetch,
): Promise<DocumentRagLocalModelRunResult> {
  const request = buildDocumentRagLocalModelRequest(context, config);
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
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    if (!response.ok) {
      const endpointError = extractDocumentRagLocalModelError(
        await response.json().catch(() => null),
      );
      return {
        ok: false,
        summary: `로컬 모델 RAG 요청 실패 · HTTP ${response.status}`,
        warnings: [
          ...(endpointError ? [`로컬 모델 endpoint 오류: ${endpointError}`] : []),
          ...request.warnings,
        ],
      };
    }

    const text = extractDocumentRagLocalModelText(await response.json());
    if (!text) {
      return {
        ok: false,
        summary: "로컬 모델 RAG 응답 실패 · 본문 없음",
        warnings: ["모델 응답에서 텍스트를 찾지 못했습니다.", ...request.warnings],
      };
    }

    return {
      ok: true,
      text,
    };
  } catch {
    return {
      ok: false,
      summary: "로컬 모델 RAG 요청 실패 · endpoint 연결 실패",
      warnings: request.warnings,
    };
  }
}
