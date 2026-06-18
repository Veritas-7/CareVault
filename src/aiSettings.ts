export type AiProviderPresetId =
  | "local"
  | "anythingllm-local"
  | "openai-chat"
  | "glm-zai"
  | "glm-zai-coding"
  | "custom";
export type AiEndpointAuthMode = "none" | "bearer";
export type AiEndpointPrivacyMode = "local-only" | "allow-remote";

export type AiEndpointSettings = {
  endpoint: string;
  model: string;
  apiKey: string;
  authMode: AiEndpointAuthMode;
  privacyMode: AiEndpointPrivacyMode;
};

export type AiSettings = {
  providerId: AiProviderPresetId;
  chat: AiEndpointSettings;
  embedding: AiEndpointSettings;
  naturalLanguageSearchEnabled: boolean;
};

export type AiProviderPreset = {
  id: AiProviderPresetId;
  label: string;
  description: string;
  chat: AiEndpointSettings;
  embedding: AiEndpointSettings;
};

export type AiEndpointValidation =
  | { ok: true; endpoint: string; warnings: string[] }
  | { ok: false; reason: "missing-endpoint" | "invalid-endpoint" | "remote-endpoint-blocked" | "missing-api-key"; summary: string; warnings: string[] };

const localHostnames = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const localNetworkPrefixes = ["127."];

export const aiProviderPresets: AiProviderPreset[] = [
  {
    id: "local",
    label: "로컬 모델",
    description: "Ollama 또는 localhost OpenAI-compatible endpoint. 개인 의료 데이터 기본값.",
    chat: {
      endpoint: "http://127.0.0.1:11434/v1/chat/completions",
      model: "local-care-model",
      apiKey: "",
      authMode: "none",
      privacyMode: "local-only",
    },
    embedding: {
      endpoint: "http://127.0.0.1:11434/v1/embeddings",
      model: "bge-m3",
      apiKey: "",
      authMode: "none",
      privacyMode: "local-only",
    },
  },
  {
    id: "anythingllm-local",
    label: "AnythingLLM 로컬",
    description:
      "로컬 AnythingLLM OpenAI-compatible endpoint. 인스턴스의 /api/docs에서 실제 endpoint를 확인해 수정하세요.",
    chat: {
      endpoint: "http://127.0.0.1:3001/v1/openai/chat/completions",
      model: "carevault-workspace",
      apiKey: "",
      authMode: "bearer",
      privacyMode: "local-only",
    },
    embedding: {
      endpoint: "",
      model: "",
      apiKey: "",
      authMode: "bearer",
      privacyMode: "local-only",
    },
  },
  {
    id: "openai-chat",
    label: "OpenAI Chat Completions",
    description:
      "OpenAI Chat Completions 호환 설정. 신규 OpenAI 전용 통합은 Responses API가 우선이므로 필요 시 endpoint를 직접 수정하세요.",
    chat: {
      endpoint: "https://api.openai.com/v1/chat/completions",
      model: "gpt-5.5",
      apiKey: "",
      authMode: "bearer",
      privacyMode: "allow-remote",
    },
    embedding: {
      endpoint: "https://api.openai.com/v1/embeddings",
      model: "text-embedding-3-large",
      apiKey: "",
      authMode: "bearer",
      privacyMode: "allow-remote",
    },
  },
  {
    id: "glm-zai",
    label: "GLM / Z.AI",
    description: "Z.AI 일반 API. API key는 Bearer 인증으로 전송됨.",
    chat: {
      endpoint: "https://api.z.ai/api/paas/v4/chat/completions",
      model: "glm-5.2",
      apiKey: "",
      authMode: "bearer",
      privacyMode: "allow-remote",
    },
    embedding: {
      endpoint: "",
      model: "",
      apiKey: "",
      authMode: "bearer",
      privacyMode: "allow-remote",
    },
  },
  {
    id: "glm-zai-coding",
    label: "GLM Coding Plan",
    description: "Z.AI Coding Plan 전용 base. 지원 도구/요금제에서만 사용.",
    chat: {
      endpoint: "https://api.z.ai/api/coding/paas/v4/chat/completions",
      model: "glm-5.2",
      apiKey: "",
      authMode: "bearer",
      privacyMode: "allow-remote",
    },
    embedding: {
      endpoint: "",
      model: "",
      apiKey: "",
      authMode: "bearer",
      privacyMode: "allow-remote",
    },
  },
  {
    id: "custom",
    label: "직접 입력",
    description: "OpenAI-compatible endpoint를 직접 입력. 원격 전송 허용 여부를 직접 확인.",
    chat: {
      endpoint: "",
      model: "",
      apiKey: "",
      authMode: "bearer",
      privacyMode: "allow-remote",
    },
    embedding: {
      endpoint: "",
      model: "",
      apiKey: "",
      authMode: "bearer",
      privacyMode: "allow-remote",
    },
  },
];

export const defaultAiSettings: AiSettings = {
  providerId: "local",
  chat: { ...aiProviderPresets[0].chat },
  embedding: { ...aiProviderPresets[0].embedding },
  naturalLanguageSearchEnabled: true,
};

export function getAiProviderPreset(id: AiProviderPresetId) {
  return aiProviderPresets.find((preset) => preset.id === id) ?? aiProviderPresets[0];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeText(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function normalizeProviderId(value: unknown): AiProviderPresetId {
  return aiProviderPresets.some((preset) => preset.id === value)
    ? (value as AiProviderPresetId)
    : "local";
}

function normalizeAuthMode(value: unknown, fallback: AiEndpointAuthMode): AiEndpointAuthMode {
  return value === "none" || value === "bearer" ? value : fallback;
}

function normalizePrivacyMode(
  value: unknown,
  fallback: AiEndpointPrivacyMode,
): AiEndpointPrivacyMode {
  return value === "local-only" || value === "allow-remote" ? value : fallback;
}

function normalizeEndpointSettings(
  value: unknown,
  fallback: AiEndpointSettings,
): AiEndpointSettings {
  const input = isRecord(value) ? value : {};
  return {
    endpoint: normalizeText(input.endpoint, fallback.endpoint),
    model: normalizeText(input.model, fallback.model),
    apiKey: normalizeText(input.apiKey, fallback.apiKey),
    authMode: normalizeAuthMode(input.authMode, fallback.authMode),
    privacyMode: normalizePrivacyMode(input.privacyMode, fallback.privacyMode),
  };
}

export function normalizeAiSettings(value: unknown): AiSettings {
  const input = isRecord(value) ? value : {};
  const providerId = normalizeProviderId(input.providerId);
  const preset = getAiProviderPreset(providerId);

  return {
    providerId,
    chat: normalizeEndpointSettings(input.chat, preset.chat),
    embedding: normalizeEndpointSettings(input.embedding, preset.embedding),
    naturalLanguageSearchEnabled:
      typeof input.naturalLanguageSearchEnabled === "boolean"
        ? input.naturalLanguageSearchEnabled
        : defaultAiSettings.naturalLanguageSearchEnabled,
  };
}

export function applyAiProviderPreset(
  current: AiSettings,
  providerId: AiProviderPresetId,
): AiSettings {
  const preset = getAiProviderPreset(providerId);
  const preserveApiKey = current.providerId === providerId;

  return normalizeAiSettings({
    providerId,
    chat: {
      ...preset.chat,
      apiKey: preserveApiKey ? current.chat.apiKey : "",
    },
    embedding: {
      ...preset.embedding,
      apiKey: preserveApiKey ? current.embedding.apiKey : "",
    },
    naturalLanguageSearchEnabled: current.naturalLanguageSearchEnabled,
  });
}

export function sanitizeAiSettingsForExport(settings: AiSettings): AiSettings {
  return normalizeAiSettings({
    ...settings,
    chat: {
      ...settings.chat,
      apiKey: "",
    },
    embedding: {
      ...settings.embedding,
      apiKey: "",
    },
  });
}

function parseEndpoint(endpoint: string) {
  try {
    return new URL(endpoint);
  } catch {
    return null;
  }
}

export function isLocalAiEndpoint(endpoint: string) {
  const url = parseEndpoint(endpoint.trim());
  if (!url) return false;
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  const hostname = url.hostname.toLowerCase();
  return (
    localHostnames.has(hostname) ||
    localNetworkPrefixes.some((prefix) => hostname.startsWith(prefix))
  );
}

export function validateAiEndpointSettings(
  settings: Pick<AiEndpointSettings, "apiKey" | "authMode" | "endpoint" | "privacyMode">,
  options: { endpointLabel: string; requireEndpoint?: boolean } = { endpointLabel: "AI endpoint" },
): AiEndpointValidation {
  const endpoint = settings.endpoint.trim();
  if (!endpoint) {
    return options.requireEndpoint
      ? {
          ok: false,
          reason: "missing-endpoint",
          summary: `${options.endpointLabel} 대기 · endpoint 없음`,
          warnings: [`${options.endpointLabel}를 입력해야 합니다.`],
        }
      : { ok: true, endpoint: "", warnings: [] };
  }

  const url = parseEndpoint(endpoint);
  if (!url || (url.protocol !== "http:" && url.protocol !== "https:")) {
    return {
      ok: false,
      reason: "invalid-endpoint",
      summary: `${options.endpointLabel} 차단 · endpoint 형식 오류`,
      warnings: ["http 또는 https URL 형식의 endpoint를 입력해야 합니다."],
    };
  }

  if (settings.privacyMode !== "allow-remote" && !isLocalAiEndpoint(endpoint)) {
    return {
      ok: false,
      reason: "remote-endpoint-blocked",
      summary: `${options.endpointLabel} 차단 · 로컬 endpoint만 허용`,
      warnings: ["원격 API로 개인 의료 데이터를 보내려면 provider 프리셋 또는 원격 허용 설정이 필요합니다."],
    };
  }

  if (settings.authMode === "bearer" && !settings.apiKey.trim() && !isLocalAiEndpoint(endpoint)) {
    return {
      ok: false,
      reason: "missing-api-key",
      summary: `${options.endpointLabel} 대기 · API key 없음`,
      warnings: ["원격 Bearer 인증 endpoint는 API key 입력 후 사용할 수 있습니다."],
    };
  }

  return { ok: true, endpoint, warnings: [] };
}

export function buildAiEndpointHeaders(settings: Pick<AiEndpointSettings, "apiKey" | "authMode">) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const apiKey = settings.apiKey.trim();
  if (settings.authMode === "bearer" && apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }
  return headers;
}
