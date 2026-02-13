import { useEffect, useState } from "react";
import { Sparkles, Eye, EyeOff, Loader2 } from "lucide-react";
import type { AsyncStatus, LlmConfig } from "~lib/types";
import {
  buildDefaultLlmSettings,
  DEFAULT_PROXY_URL,
  DEFAULT_STABLE_MODEL,
  getLlmAccessMode,
  MODELSCOPE_BASE_URL,
  normalizeLlmSettings,
} from "~lib/services/llmConfig";
import {
  getLlmSettings,
  setLlmSettings,
  testLlmConnection,
} from "~lib/services/storageService";

const MODEL_OPTIONS = [
  DEFAULT_STABLE_MODEL,
  "Qwen/Qwen3-32B",
  "Qwen/Qwen3-14B",
  "deepseek-ai/DeepSeek-R1",
];

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function resolveSettingsForMode(settings: LlmConfig): LlmConfig {
  const mode = getLlmAccessMode(settings);
  const next = normalizeLlmSettings({
    ...settings,
    baseUrl: MODELSCOPE_BASE_URL,
    gatewayLock: "modelscope",
    updatedAt: Date.now(),
  });

  if (mode === "demo_proxy") {
    return normalizeLlmSettings({
      ...next,
      mode,
      modelId: DEFAULT_STABLE_MODEL,
      proxyUrl: DEFAULT_PROXY_URL,
      thinkHandlingPolicy: next.thinkHandlingPolicy ?? "strip",
    });
  }

  const customModel = (next.customModelId || next.modelId || "").trim();
  return normalizeLlmSettings({
    ...next,
    mode,
    modelId: customModel || DEFAULT_STABLE_MODEL,
    customModelId: customModel || DEFAULT_STABLE_MODEL,
  });
}

export function SettingsPage() {
  const [llmSettings, setLlmSettingsState] = useState<LlmConfig>(
    buildDefaultLlmSettings()
  );
  const [showApiKey, setShowApiKey] = useState(false);
  const [status, setStatus] = useState<AsyncStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getLlmSettings()
      .then((settings) => {
        if (settings) {
          setLlmSettingsState(normalizeLlmSettings(settings));
        } else {
          setLlmSettingsState(buildDefaultLlmSettings());
        }
      })
      .catch(() => {});
  }, []);

  const mode = getLlmAccessMode(llmSettings);
  const isCustomMode = mode === "custom_byok";

  const setMode = (custom: boolean) => {
    setLlmSettingsState((prev) =>
      resolveSettingsForMode({
        ...prev,
        mode: custom ? "custom_byok" : "demo_proxy",
      })
    );
    setMessage(null);
    setStatus("idle");
  };

  const handleSave = async () => {
    setStatus("loading");
    setMessage(null);

    try {
      const next = resolveSettingsForMode(llmSettings);
      if (getLlmAccessMode(next) === "custom_byok" && !next.apiKey.trim()) {
        setStatus("error");
        setMessage("API key is required in custom mode.");
        return;
      }

      await setLlmSettings(next);
      setLlmSettingsState(next);
      setStatus("ready");
      setMessage("Saved");
    } catch (error) {
      setStatus("error");
      setMessage(getErrorMessage(error));
    }
  };

  const handleTest = async () => {
    setStatus("loading");
    setMessage(null);

    try {
      const next = resolveSettingsForMode(llmSettings);
      if (getLlmAccessMode(next) === "custom_byok" && !next.apiKey.trim()) {
        setStatus("error");
        setMessage("API key is required in custom mode.");
        return;
      }

      await setLlmSettings(next);
      setLlmSettingsState(next);
      const result = await testLlmConnection();
      setStatus(result.ok ? "ready" : "error");
      setMessage(result.message || (result.ok ? "OK" : "Failed"));
    } catch (error) {
      setStatus("error");
      setMessage(getErrorMessage(error));
    }
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto vesti-scroll bg-bg-tertiary">
      <header className="flex h-8 shrink-0 items-center px-4">
        <h1 className="text-vesti-xl font-semibold text-text-primary">Settings</h1>
      </header>

      <div className="flex flex-col gap-4 p-4">
        <section>
          <h2 className="mb-2 flex items-center gap-1.5 text-vesti-sm font-medium text-text-secondary">
            <Sparkles className="h-4 w-4" strokeWidth={1.75} />
            Model Access
          </h2>

          <div className="rounded-md bg-surface-card p-3">
            <div className="grid gap-3">
              <div className="flex items-center justify-between rounded-sm border border-border-subtle bg-bg-primary px-3 py-2">
                <div className="grid gap-0.5">
                  <span className="text-vesti-xs font-medium text-text-primary">
                    Use Custom Configuration (Expert Mode)
                  </span>
                  <span className="text-[10px] text-text-tertiary">
                    {isCustomMode
                      ? "Custom BYOK mode: direct request to ModelScope"
                      : "Demo mode: proxy route with developer-managed credentials"}
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isCustomMode}
                  onClick={() => setMode(!isCustomMode)}
                  className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
                    isCustomMode ? "bg-info" : "bg-border-subtle"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200 ${
                      isCustomMode ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {!isCustomMode ? (
                <div className="grid gap-2 rounded-sm border border-border-subtle bg-bg-primary p-3">
                  <div className="inline-flex w-fit items-center rounded-md border border-border-default bg-bg-secondary px-2 py-0.5 text-[10px] font-semibold text-text-primary">
                    Demo Channel Active
                  </div>
                  <p className="text-vesti-xs text-text-secondary">
                    Running on {DEFAULT_STABLE_MODEL}
                  </p>
                  <p className="text-[10px] text-text-tertiary">
                    Gateway locked to modelscope.cn · Route: Proxy ({DEFAULT_PROXY_URL})
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTest}
                      className="rounded-sm border border-border-default bg-bg-primary px-3 py-1.5 text-vesti-xs font-medium text-text-primary transition-colors duration-200 hover:bg-surface-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                    >
                      Test Connection
                    </button>
                    {status === "loading" && (
                      <div className="flex items-center gap-1 text-vesti-xs text-text-tertiary">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Working...
                      </div>
                    )}
                    {message && status !== "loading" && (
                      <span
                        className={`text-vesti-xs ${
                          status === "error" ? "text-danger" : "text-text-secondary"
                        }`}
                      >
                        {message}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid gap-3 rounded-sm border border-border-subtle bg-bg-primary p-3 transition-all duration-200">
                  <div className="grid gap-1">
                    <label className="text-[10px] text-text-tertiary">Model</label>
                    <select
                      value={llmSettings.customModelId ?? llmSettings.modelId}
                      onChange={(e) =>
                        setLlmSettingsState((prev) =>
                          normalizeLlmSettings({
                            ...prev,
                            customModelId: e.target.value,
                            modelId: e.target.value,
                          })
                        )
                      }
                      className="h-8 rounded-sm border border-border-default bg-bg-primary px-2 text-vesti-xs text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                    >
                      {MODEL_OPTIONS.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-1">
                    <label className="text-[10px] text-text-tertiary">API Key</label>
                    <div className="relative">
                      <input
                        type={showApiKey ? "text" : "password"}
                        value={llmSettings.apiKey}
                        onChange={(e) =>
                          setLlmSettingsState((prev) => ({ ...prev, apiKey: e.target.value }))
                        }
                        className="h-8 w-full rounded-sm border border-border-default bg-bg-primary px-2 pr-8 text-vesti-xs text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                        placeholder="ms-..."
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey((prev) => !prev)}
                        className="absolute right-1 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-sm text-text-tertiary transition-colors duration-200 hover:bg-surface-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                        aria-label="Toggle visibility"
                      >
                        {showApiKey ? (
                          <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                        ) : (
                          <Eye className="h-4 w-4" strokeWidth={1.75} />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-text-tertiary">
                    Gateway locked to modelscope.cn · Route: Direct ({MODELSCOPE_BASE_URL})
                  </p>

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleTest}
                      className="rounded-sm border border-border-default bg-transparent px-3 py-1.5 text-vesti-xs font-medium text-text-primary transition-colors duration-200 hover:bg-surface-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                    >
                      Test
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="rounded-sm border border-border-default bg-text-primary px-3 py-1.5 text-vesti-xs font-medium text-bg-primary transition-colors duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                    >
                      Save
                    </button>
                    {status === "loading" && (
                      <div className="flex items-center gap-1 text-vesti-xs text-text-tertiary">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Working...
                      </div>
                    )}
                    {message && status !== "loading" && (
                      <span
                        className={`text-vesti-xs ${
                          status === "error" ? "text-danger" : "text-text-secondary"
                        }`}
                      >
                        {message}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
