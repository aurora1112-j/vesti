import type {
  LlmAccessMode,
  LlmConfig,
  ThinkHandlingPolicy,
} from "../types";

export const MODELSCOPE_BASE_URL = "https://api-inference.modelscope.cn/v1/";
export const DEFAULT_PROXY_URL = "https://vesti-proxy.vercel.app/api/chat";
export const DEFAULT_STABLE_MODEL = "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B";
export const DEFAULT_BACKUP_MODEL = "Qwen/Qwen3-14B";

function normalizeMode(mode: LlmAccessMode | undefined): LlmAccessMode {
  return mode === "custom_byok" ? "custom_byok" : "demo_proxy";
}

function normalizeThinkPolicy(
  policy: ThinkHandlingPolicy | undefined
): ThinkHandlingPolicy {
  if (policy === "keep_debug" || policy === "keep_raw") {
    return policy;
  }
  return "strip";
}

export function buildDefaultLlmSettings(now = Date.now()): LlmConfig {
  return {
    provider: "modelscope",
    baseUrl: MODELSCOPE_BASE_URL,
    apiKey: "",
    modelId: DEFAULT_STABLE_MODEL,
    temperature: 0.3,
    maxTokens: 800,
    updatedAt: now,
    mode: "demo_proxy",
    proxyUrl: DEFAULT_PROXY_URL,
    gatewayLock: "modelscope",
    customModelId: DEFAULT_STABLE_MODEL,
    streamMode: "off",
    reasoningPolicy: "off",
    capabilitySource: "model_id_heuristic",
    thinkHandlingPolicy: "strip",
  };
}

export function normalizeLlmSettings(
  settings: LlmConfig | null | undefined
): LlmConfig {
  const fallback = buildDefaultLlmSettings();
  if (!settings) {
    return fallback;
  }

  const mode = normalizeMode(settings.mode);
  const modelId = (settings.modelId || "").trim() || DEFAULT_STABLE_MODEL;
  const customModelId =
    (settings.customModelId || "").trim() || modelId || DEFAULT_STABLE_MODEL;

  if (mode === "demo_proxy") {
    return {
      ...fallback,
      ...settings,
      provider: "modelscope",
      baseUrl: MODELSCOPE_BASE_URL,
      modelId: DEFAULT_STABLE_MODEL,
      mode,
      proxyUrl: (settings.proxyUrl || "").trim() || DEFAULT_PROXY_URL,
      gatewayLock: "modelscope",
      customModelId: DEFAULT_STABLE_MODEL,
      streamMode: settings.streamMode === "on" ? "on" : "off",
      reasoningPolicy:
        settings.reasoningPolicy === "auto" || settings.reasoningPolicy === "force"
          ? settings.reasoningPolicy
          : "off",
      capabilitySource:
        settings.capabilitySource === "provider_catalog"
          ? "provider_catalog"
          : "model_id_heuristic",
      thinkHandlingPolicy: normalizeThinkPolicy(settings.thinkHandlingPolicy),
    };
  }

  return {
    ...fallback,
    ...settings,
    provider: "modelscope",
    baseUrl: MODELSCOPE_BASE_URL,
    modelId,
    mode,
    proxyUrl: (settings.proxyUrl || "").trim() || DEFAULT_PROXY_URL,
    gatewayLock: "modelscope",
    customModelId,
    streamMode: settings.streamMode === "on" ? "on" : "off",
    reasoningPolicy:
      settings.reasoningPolicy === "auto" || settings.reasoningPolicy === "force"
        ? settings.reasoningPolicy
        : "off",
    capabilitySource:
      settings.capabilitySource === "provider_catalog"
        ? "provider_catalog"
        : "model_id_heuristic",
    thinkHandlingPolicy: normalizeThinkPolicy(settings.thinkHandlingPolicy),
  };
}

export function getLlmAccessMode(settings: LlmConfig): LlmAccessMode {
  return normalizeMode(settings.mode);
}

export function getEffectiveModelId(settings: LlmConfig): string {
  return (settings.customModelId || settings.modelId || DEFAULT_STABLE_MODEL).trim();
}
