import { describe, expect, it } from "vitest";
import {
  applyAiProviderPreset,
  aiProviderPresets,
  buildAiEndpointHeaders,
  defaultAiSettings,
  normalizeAiSettings,
  sanitizeAiSettingsForExport,
  validateAiEndpointSettings,
} from "./aiSettings";

describe("aiSettings", () => {
  it("normalizes malformed settings to the safe local preset", () => {
    const settings = normalizeAiSettings({
      chat: {
        endpoint: 42,
        authMode: "bad",
      },
      embedding: null,
      providerId: "unknown",
    });

    expect(settings).toEqual(defaultAiSettings);
    expect(settings.chat.privacyMode).toBe("local-only");
  });

  it("applies GLM/Z.AI preset with remote Bearer authentication defaults", () => {
    const settings = applyAiProviderPreset(defaultAiSettings, "glm-zai");

    expect(settings.providerId).toBe("glm-zai");
    expect(settings.chat).toMatchObject({
      authMode: "bearer",
      endpoint: "https://api.z.ai/api/paas/v4/chat/completions",
      model: "glm-5.2",
      privacyMode: "allow-remote",
    });
    expect(settings.embedding.privacyMode).toBe("allow-remote");
  });

  it("keeps local AnythingLLM and OpenAI presets available for later API setup", () => {
    const presetIds = aiProviderPresets.map((preset) => preset.id);

    expect(presetIds).toEqual([
      "local",
      "anythingllm-local",
      "openai-chat",
      "glm-zai",
      "glm-zai-coding",
      "custom",
    ]);

    expect(applyAiProviderPreset(defaultAiSettings, "anythingllm-local").chat).toMatchObject({
      authMode: "bearer",
      endpoint: "http://127.0.0.1:3001/v1/openai/chat/completions",
      privacyMode: "local-only",
    });
    expect(applyAiProviderPreset(defaultAiSettings, "openai-chat").chat).toMatchObject({
      authMode: "bearer",
      endpoint: "https://api.openai.com/v1/chat/completions",
      model: "gpt-5.5",
      privacyMode: "allow-remote",
    });
  });

  it("requires API keys for remote Bearer endpoints but keeps localhost usable", () => {
    expect(
      validateAiEndpointSettings(
        {
          apiKey: "",
          authMode: "bearer",
          endpoint: "https://api.z.ai/api/paas/v4/chat/completions",
          privacyMode: "allow-remote",
        },
        { endpointLabel: "GLM", requireEndpoint: true },
      ),
    ).toMatchObject({
      ok: false,
      reason: "missing-api-key",
    });

    expect(
      validateAiEndpointSettings(
        {
          apiKey: "",
          authMode: "none",
          endpoint: "http://127.0.0.1:11434/v1/chat/completions",
          privacyMode: "local-only",
        },
        { endpointLabel: "local", requireEndpoint: true },
      ),
    ).toMatchObject({ ok: true });
  });

  it("builds Bearer headers and strips API keys from export settings", () => {
    expect(buildAiEndpointHeaders({ apiKey: "sk-test", authMode: "bearer" })).toEqual({
      Authorization: "Bearer sk-test",
      "Content-Type": "application/json",
    });

    const sanitized = sanitizeAiSettingsForExport({
      ...defaultAiSettings,
      chat: {
        ...defaultAiSettings.chat,
        apiKey: "secret",
      },
      embedding: {
        ...defaultAiSettings.embedding,
        apiKey: "embedding-secret",
      },
    });

    expect(sanitized.chat.apiKey).toBe("");
    expect(sanitized.embedding.apiKey).toBe("");
  });
});
