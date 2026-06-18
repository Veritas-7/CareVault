import type { AppState, CareDocument } from "./appState";
import {
  buildAiEndpointHeaders,
  validateAiEndpointSettings,
  type AiEndpointSettings,
} from "./aiSettings";
import {
  assessDocumentRagLocalModelResponseSafety,
  extractDocumentRagLocalModelError,
  extractDocumentRagLocalModelText,
} from "./documentRagModelRequest";
import { assessCancerFood, parseFiniteNumberText } from "./healthRules";

export type CareVaultNaturalLanguageQueryConfig = AiEndpointSettings & {
  maxTokens?: number;
  temperature?: number;
};

export type CareVaultNaturalLanguageQueryRequestBody = {
  max_tokens: number;
  messages: Array<{
    content: string;
    role: "system" | "user";
  }>;
  model: string;
  temperature: number;
};

export type CareVaultNaturalLanguageQueryValidation = {
  level:
    | "ready"
    | "missing-query"
    | "missing-endpoint"
    | "missing-model"
    | "missing-api-key"
    | "invalid-endpoint"
    | "remote-endpoint-blocked"
    | "insufficient-records";
  summary: string;
  warnings: string[];
};

export type CareVaultNaturalLanguageQueryRequest =
  | {
      ok: true;
      body: CareVaultNaturalLanguageQueryRequestBody;
      endpoint: string;
      summary: string;
      warnings: string[];
    }
  | {
      ok: false;
      summary: string;
      validation: CareVaultNaturalLanguageQueryValidation;
      warnings: string[];
    };

export type CareVaultNaturalLanguageQueryRunResult =
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

const defaultMaxTokens = 850;
const defaultTemperature = 0.1;
const maxLineLength = 420;
const maxDocumentBodyLength = 700;

function compactText(value: string, maxLength = maxLineLength) {
  const compact = value.replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, maxLength - 3).trimEnd()}...`;
}

function pushLine(lines: string[], value: string) {
  const compact = compactText(value);
  if (compact) lines.push(compact);
}

function formatDocumentLine(document: CareDocument, index: number) {
  return [
    `문서 ${index + 1}`,
    `날짜 ${document.date || "미기록"}`,
    `제목 ${document.title || "제목 없음"}`,
    `분류 ${document.category}`,
    `상태 ${document.reviewStatus}`,
    document.nextAction ? `다음 조치 ${document.nextAction}` : "",
    document.tags ? `태그 ${document.tags}` : "",
    document.attachmentName ? `첨부 ${document.attachmentName}` : "",
    document.body ? `본문 ${compactText(document.body, maxDocumentBodyLength)}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

export function buildCareVaultNaturalLanguageQueryContext(state: AppState) {
  const lines: string[] = [];
  const bmiHeight = parseFiniteNumberText(state.profile.heightCm);
  const bmiWeight = parseFiniteNumberText(state.profile.weightKg);
  const foodAssessment = assessCancerFood(state.foodQuery);

  pushLine(
    lines,
    [
      "프로필",
      `이름 ${state.profile.name}`,
      `나이 ${state.profile.age}`,
      `성별 ${state.profile.sex}`,
      `키 ${state.profile.heightCm}cm`,
      `몸무게 ${state.profile.weightKg}kg`,
      state.profile.waistCm ? `허리 ${state.profile.waistCm}cm` : "",
      state.profile.cancerCareMode ? "암 케어 모드" : "",
      state.profile.diabetes ? "당뇨 기록 대상" : "",
      state.profile.hypertension ? "고혈압 기록 대상" : "",
      bmiHeight && bmiWeight ? `BMI ${(bmiWeight / (bmiHeight / 100) ** 2).toFixed(1)}` : "",
    ]
      .filter(Boolean)
      .join(" · "),
  );

  state.vitals.slice(-12).forEach((vital, index) => {
    pushLine(
      lines,
      [
        `활력 ${index + 1}`,
        `날짜 ${vital.date || "미기록"}`,
        `유형 ${vital.type}`,
        vital.systolic && vital.diastolic ? `혈압 ${vital.systolic}/${vital.diastolic}` : "",
        vital.glucoseMgDl ? `혈당 ${vital.glucoseMgDl}` : "",
        vital.glucoseContext ? `혈당맥락 ${vital.glucoseContext}` : "",
        vital.temperatureC ? `체온 ${vital.temperatureC}` : "",
        vital.note ? `메모 ${vital.note}` : "",
      ]
        .filter(Boolean)
        .join(" · "),
    );
  });

  state.visits.slice(-8).forEach((visit, index) => {
    pushLine(
      lines,
      [
        `진료 ${index + 1}`,
        `날짜 ${visit.date || "미기록"}`,
        `병원 ${visit.hospital}`,
        `사유 ${visit.reason}`,
        `요약 ${visit.summary}`,
        `계획 ${visit.plan}`,
        visit.nextDate ? `다음 일정 ${visit.nextDate}` : "",
      ]
        .filter(Boolean)
        .join(" · "),
    );
  });

  state.documents.slice(-10).forEach((document, index) => {
    pushLine(lines, formatDocumentLine(document, index));
  });

  state.symptoms.slice(-10).forEach((symptom, index) => {
    pushLine(
      lines,
      [
        `증상 ${index + 1}`,
        `날짜 ${symptom.date || "미기록"}`,
        `증상 ${symptom.symptom}`,
        `강도 ${symptom.severity}`,
        symptom.medication ? `복용/처치 ${symptom.medication}` : "",
        symptom.body ? `내용 ${symptom.body}` : "",
        symptom.action ? `조치 ${symptom.action}` : "",
      ]
        .filter(Boolean)
        .join(" · "),
    );
  });

  state.questions.slice(-10).forEach((question, index) => {
    pushLine(
      lines,
      [
        `질문 ${index + 1}`,
        `날짜 ${question.date || "미기록"}`,
        `주제 ${question.topic}`,
        `우선순위 ${question.priority}`,
        `상태 ${question.status}`,
        `질문 ${question.question}`,
        question.answer ? `답변 ${question.answer}` : "",
      ]
        .filter(Boolean)
        .join(" · "),
    );
  });

  state.labResults.slice(-12).forEach((lab, index) => {
    pushLine(
      lines,
      [
        `검사 ${index + 1}`,
        `날짜 ${lab.date || "미기록"}`,
        `항목 ${lab.name}`,
        `값 ${lab.value}${lab.unit ? ` ${lab.unit}` : ""}`,
        lab.lower || lab.upper ? `기준 ${lab.lower || "?"}-${lab.upper || "?"}` : "",
        lab.note ? `메모 ${lab.note}` : "",
      ]
        .filter(Boolean)
        .join(" · "),
    );
  });

  pushLine(
    lines,
    [
      "음식 판단",
      `입력 ${state.foodQuery || "없음"}`,
      `판정 ${foodAssessment.label}`,
      foodAssessment.matches.length
        ? `근거 ${foodAssessment.matches.map((match) => `${match.term}:${match.reason}`).join(" | ")}`
        : "근거 없음",
    ].join(" · "),
  );

  return lines.join("\n");
}

function countRecords(state: AppState) {
  return (
    state.vitals.length +
    state.visits.length +
    state.documents.length +
    state.symptoms.length +
    state.questions.length +
    state.labResults.length +
    (state.foodQuery.trim() ? 1 : 0)
  );
}

export function validateCareVaultNaturalLanguageQuery(
  state: AppState,
  query: string,
  config: CareVaultNaturalLanguageQueryConfig,
): CareVaultNaturalLanguageQueryValidation {
  if (!query.trim()) {
    return {
      level: "missing-query",
      summary: "자연어 조회 대기 · 질문 없음",
      warnings: ["저장 기록에서 찾을 질문을 입력해야 합니다."],
    };
  }

  if (!countRecords(state)) {
    return {
      level: "insufficient-records",
      summary: "자연어 조회 차단 · 저장 기록 없음",
      warnings: ["조회할 건강 기록이나 서류가 없습니다."],
    };
  }

  const endpointValidation = validateAiEndpointSettings(config, {
    endpointLabel: "자연어 조회 endpoint",
    requireEndpoint: true,
  });
  if (!endpointValidation.ok) {
    const level =
      endpointValidation.reason === "missing-endpoint"
        ? "missing-endpoint"
        : endpointValidation.reason === "invalid-endpoint"
          ? "invalid-endpoint"
          : endpointValidation.reason === "missing-api-key"
            ? "missing-api-key"
            : "remote-endpoint-blocked";
    return {
      level,
      summary: endpointValidation.summary,
      warnings: endpointValidation.warnings,
    };
  }

  if (!config.model.trim()) {
    return {
      level: "missing-model",
      summary: "자연어 조회 대기 · 모델명 없음",
      warnings: ["OpenAI-compatible 모델명을 입력해야 합니다."],
    };
  }

  return {
    level: "ready",
    summary: "자연어 조회 준비됨 · 저장 기록 전체 컨텍스트 사용",
    warnings: [],
  };
}

export function buildCareVaultNaturalLanguageQueryRequest(
  state: AppState,
  query: string,
  config: CareVaultNaturalLanguageQueryConfig,
): CareVaultNaturalLanguageQueryRequest {
  const validation = validateCareVaultNaturalLanguageQuery(state, query, config);
  if (validation.level !== "ready") {
    return {
      ok: false,
      summary: validation.summary,
      validation,
      warnings: validation.warnings,
    };
  }

  const context = buildCareVaultNaturalLanguageQueryContext(state);
  return {
    ok: true,
    body: {
      max_tokens: config.maxTokens ?? defaultMaxTokens,
      messages: [
        {
          role: "system",
          content:
            "CareVault 자연어 조회 보조자입니다. 제공된 저장 기록 안에서만 답하고, 진단/처방/치료 지시를 하지 않습니다. 불확실하면 기록 부족과 의료진 확인 질문으로 정리합니다.",
        },
        {
          role: "user",
          content: [
            "[사용자 질문]",
            query.trim(),
            "",
            "[CareVault 저장 기록 컨텍스트]",
            context,
            "",
            "[응답 형식]",
            "- 근거가 있는 항목만 짧게 답변",
            "- 관련 기록 날짜/제목/항목을 함께 표시",
            "- 치료 결정은 의료진 확인 질문으로 표현",
          ].join("\n"),
        },
      ],
      model: config.model.trim(),
      temperature: config.temperature ?? defaultTemperature,
    },
    endpoint: config.endpoint.trim(),
    summary: validation.summary,
    warnings: validation.warnings,
  };
}

export async function requestCareVaultNaturalLanguageAnswer(
  state: AppState,
  query: string,
  config: CareVaultNaturalLanguageQueryConfig,
  fetcher: Fetcher = fetch,
): Promise<CareVaultNaturalLanguageQueryRunResult> {
  const request = buildCareVaultNaturalLanguageQueryRequest(state, query, config);
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
      headers: buildAiEndpointHeaders(config),
      method: "POST",
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
      const endpointError = extractDocumentRagLocalModelError(json);
      return {
        ok: false,
        summary: `자연어 조회 요청 실패 · HTTP ${response.status}`,
        warnings: [
          ...(endpointError ? [`자연어 조회 endpoint 오류: ${endpointError}`] : []),
          ...request.warnings,
        ],
      };
    }

    const text = extractDocumentRagLocalModelText(json);
    if (!text) {
      return {
        ok: false,
        summary: "자연어 조회 응답 실패 · 본문 없음",
        warnings: ["모델 응답에서 텍스트를 찾지 못했습니다.", ...request.warnings],
      };
    }

    const responseSafety = assessDocumentRagLocalModelResponseSafety(text);
    if (responseSafety.level === "blocked") {
      return {
        ok: false,
        summary: responseSafety.summary,
        warnings: [...responseSafety.warnings, ...request.warnings],
      };
    }

    return {
      ok: true,
      text,
    };
  } catch {
    return {
      ok: false,
      summary: "자연어 조회 요청 실패 · endpoint 연결 실패",
      warnings: request.warnings,
    };
  }
}
