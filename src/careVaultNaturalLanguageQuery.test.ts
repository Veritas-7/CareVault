import { describe, expect, it, vi } from "vitest";
import { defaultState } from "./appState";
import {
  buildCareVaultNaturalLanguageQueryContext,
  buildCareVaultNaturalLanguageQueryRequest,
  requestCareVaultNaturalLanguageAnswer,
  validateCareVaultNaturalLanguageQuery,
} from "./careVaultNaturalLanguageQuery";

const glmConfig = {
  apiKey: "glm-key",
  authMode: "bearer" as const,
  endpoint: "https://api.z.ai/api/paas/v4/chat/completions",
  model: "glm-5.2",
  privacyMode: "allow-remote" as const,
};

describe("careVaultNaturalLanguageQuery", () => {
  it("builds a whole-record natural language context without local attachment paths", () => {
    const context = buildCareVaultNaturalLanguageQueryContext({
      ...defaultState,
      documents: [
        {
          ...defaultState.documents[0],
          attachmentName: "result.hwpx",
          attachmentPath: "/Users/wj/private/result.hwpx",
          body: "HbA1c 7.4%, 혈압 149/93. 다음 진료 질문 필요.",
        },
      ],
    });

    expect(context).toContain("프로필");
    expect(context).toContain("활력");
    expect(context).toContain("진료");
    expect(context).toContain("문서 1");
    expect(context).toContain("검사");
    expect(context).toContain("음식 판단");
    expect(context).toContain("HbA1c 7.4%");
    expect(context).not.toContain("/Users/wj/private");
    expect(context).not.toContain("attachmentPath");
  });

  it("validates query, endpoint, model, and remote API key readiness", () => {
    expect(
      validateCareVaultNaturalLanguageQuery(defaultState, "", glmConfig),
    ).toMatchObject({
      level: "missing-query",
    });
    expect(
      validateCareVaultNaturalLanguageQuery(defaultState, "최근 혈압 알려줘", {
        ...glmConfig,
        apiKey: "",
      }),
    ).toMatchObject({
      level: "missing-api-key",
    });
    expect(
      validateCareVaultNaturalLanguageQuery(defaultState, "최근 혈압 알려줘", {
        ...glmConfig,
        model: "",
      }),
    ).toMatchObject({
      level: "missing-model",
    });
    expect(
      validateCareVaultNaturalLanguageQuery(defaultState, "최근 혈압 알려줘", glmConfig),
    ).toMatchObject({
      level: "ready",
    });
  });

  it("builds an OpenAI-compatible request for all stored records", () => {
    const request = buildCareVaultNaturalLanguageQueryRequest(
      defaultState,
      "최근 혈압과 혈당 관련해서 다음 진료 때 물어볼 것 알려줘",
      glmConfig,
    );

    expect(request.ok).toBe(true);
    if (!request.ok) throw new Error("expected ready request");
    expect(request.endpoint).toBe("https://api.z.ai/api/paas/v4/chat/completions");
    expect(request.body.model).toBe("glm-5.2");
    expect(request.body.messages[0].content).toContain("진단/처방/치료 지시를 하지 않습니다");
    expect(request.body.messages[1].content).toContain("[CareVault 저장 기록 컨텍스트]");
    expect(request.body.messages[1].content).toContain("혈압");
    expect(request.body.messages[1].content).toContain("혈당");
  });

  it("posts natural language queries with saved Bearer auth and blocks unsafe replies", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce({
      json: async () => ({
        choices: [{ message: { content: "최근 기록 근거로 혈압 질문을 준비합니다." } }],
      }),
      ok: true,
      status: 200,
    });

    const result = await requestCareVaultNaturalLanguageAnswer(
      defaultState,
      "최근 혈압 요약",
      glmConfig,
      fetcher,
    );

    expect(result).toEqual({
      ok: true,
      text: "최근 기록 근거로 혈압 질문을 준비합니다.",
    });
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.z.ai/api/paas/v4/chat/completions",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer glm-key",
        }),
      }),
    );

    const unsafeFetcher = vi.fn().mockResolvedValue({
      json: async () => ({
        choices: [{ message: { content: "혈압약을 오늘부터 끊으세요." } }],
      }),
      ok: true,
      status: 200,
    });

    const unsafeResult = await requestCareVaultNaturalLanguageAnswer(
      defaultState,
      "약 조정",
      glmConfig,
      unsafeFetcher,
    );
    expect(unsafeResult.ok).toBe(false);
    if (unsafeResult.ok) throw new Error("expected unsafe response to be blocked");
    expect(unsafeResult.summary).toBe("로컬 모델 RAG 응답 차단 · 의료 안전 경계");
  });
});
