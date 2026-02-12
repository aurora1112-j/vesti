import { useEffect, useState } from "react";
import { Sparkles, Eye, EyeOff, Loader2 } from "lucide-react";
import type { AsyncStatus, LlmConfig } from "~lib/types";
import {
  getLlmSettings,
  setLlmSettings,
  testLlmConnection,
} from "~lib/services/storageService";

const DEFAULT_BASE_URL = "https://api-inference.modelscope.cn/v1/";

function buildDefaultSettings(): LlmConfig {
  return {
    provider: "modelscope",
    baseUrl: DEFAULT_BASE_URL,
    apiKey: "",
    modelId: "",
    temperature: 0.3,
    maxTokens: 800,
    updatedAt: Date.now(),
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function SettingsPage() {
  const [llmSettings, setLlmSettingsState] = useState<LlmConfig>(buildDefaultSettings());
  const [showApiKey, setShowApiKey] = useState(false);
  const [status, setStatus] = useState<AsyncStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getLlmSettings()
      .then((settings) => {
        if (settings) {
          setLlmSettingsState(settings);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setStatus("loading");
    setMessage(null);
    try {
      const next = { ...llmSettings, baseUrl: DEFAULT_BASE_URL, updatedAt: Date.now() };
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
      const next = { ...llmSettings, baseUrl: DEFAULT_BASE_URL, updatedAt: Date.now() };
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
            ModelScope
          </h2>

          <div className="rounded-md bg-surface-card p-3">
            <div className="grid gap-3">
              <div className="grid gap-1">
                <label className="text-[10px] text-text-tertiary">Model ID</label>
                <input
                  type="text"
                  value={llmSettings.modelId}
                  onChange={(e) =>
                    setLlmSettingsState((prev) => ({ ...prev, modelId: e.target.value }))
                  }
                  className="h-8 rounded-sm border border-border-default bg-bg-primary px-2 text-vesti-xs text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                  placeholder="e.g. Qwen/Qwen2.5-14B-Instruct"
                />
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
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey((prev) => !prev)}
                    className="absolute right-1 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-sm text-text-tertiary transition-colors duration-[120ms] hover:bg-surface-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
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

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-sm border border-border-default bg-bg-primary px-3 py-1.5 text-vesti-xs font-medium text-text-primary transition-colors duration-[120ms] hover:bg-surface-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleTest}
                  className="rounded-sm border border-border-default bg-bg-primary px-3 py-1.5 text-vesti-xs font-medium text-text-primary transition-colors duration-[120ms] hover:bg-surface-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                >
                  Test
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

              <p className="text-vesti-xs text-text-tertiary">
                Base URL is fixed to {DEFAULT_BASE_URL}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
