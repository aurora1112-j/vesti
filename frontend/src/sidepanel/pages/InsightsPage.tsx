import { useEffect, useState } from "react";
import { Sparkles, RefreshCw, Loader2 } from "lucide-react";
import type { Conversation, InsightStatus, SummaryRecord } from "~lib/types";
import {
  getConversationSummary,
  generateConversationSummary,
} from "~lib/services/storageService";
import { PlatformTag } from "../components/PlatformTag";

function formatDateTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

interface InsightsPageProps {
  conversation: Conversation | null;
  refreshToken: number;
}

export function InsightsPage({ conversation, refreshToken }: InsightsPageProps) {
  const [summary, setSummary] = useState<SummaryRecord | null>(null);
  const [status, setStatus] = useState<InsightStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conversation) {
      setSummary(null);
      setStatus("idle");
      setError(null);
      return;
    }
    setStatus("loading");
    setError(null);
    getConversationSummary(conversation.id)
      .then((data) => {
        setSummary(data);
        setStatus(data ? "ready" : "idle");
      })
      .catch((err) => {
        setSummary(null);
        setStatus("error");
        setError(getErrorMessage(err));
      });
  }, [conversation?.id, refreshToken]);

  const handleGenerate = async () => {
    if (!conversation) return;
    setStatus("loading");
    setError(null);
    try {
      const data = await generateConversationSummary(conversation.id);
      setSummary(data);
      setStatus("ready");
    } catch (err) {
      setStatus("error");
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto vesti-scroll bg-bg-tertiary">
      <header className="flex h-8 shrink-0 items-center px-4">
        <h1 className="text-vesti-xl font-semibold text-text-primary">Insights</h1>
      </header>

      <div className="flex flex-col gap-4 p-4">
        <section>
          <h2 className="mb-2 flex items-center gap-1.5 text-vesti-sm font-medium text-text-secondary">
            <Sparkles className="h-4 w-4" strokeWidth={1.75} />
            AI Summary
          </h2>

          <div className="rounded-md bg-surface-card p-3">
            {!conversation && (
              <p className="text-vesti-sm text-text-tertiary">
                Select a conversation from Timeline to generate a summary.
              </p>
            )}

            {conversation && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-vesti-sm font-medium text-text-primary">
                      {conversation.title}
                    </p>
                    <p className="text-vesti-xs text-text-tertiary">
                      {conversation.message_count} turns
                    </p>
                  </div>
                  <PlatformTag platform={conversation.platform} />
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={status === "loading"}
                  className="flex w-fit items-center gap-1 rounded-sm border border-border-default bg-bg-primary px-3 py-1.5 text-vesti-xs font-medium text-text-primary transition-colors duration-[120ms] hover:bg-surface-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "loading" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.75} />
                  )}
                  {summary ? "Regenerate" : "Generate"}
                </button>

                <div className="min-h-[120px] rounded-md bg-bg-primary p-3 text-vesti-sm text-text-primary">
                  {status === "loading" && !summary && (
                    <div className="flex items-center gap-2 text-text-tertiary">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating summary...
                    </div>
                  )}
                  {status === "error" && (
                    <p className="text-vesti-xs text-danger">{error}</p>
                  )}
                  {!summary && status !== "loading" && status !== "error" && (
                    <p className="text-vesti-xs text-text-tertiary">No summary yet.</p>
                  )}
                  {summary && (
                    <pre className="whitespace-pre-wrap font-sans text-vesti-sm leading-[1.7] text-text-primary">
                      {summary.content}
                    </pre>
                  )}
                </div>

                {summary && (
                  <div className="text-vesti-xs text-text-tertiary">
                    Model: {summary.modelId} · Generated: {formatDateTime(summary.createdAt)}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
