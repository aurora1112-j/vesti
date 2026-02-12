import { useEffect, useMemo, useState } from "react";
import { Sparkles, RefreshCw, Loader2, CalendarDays } from "lucide-react";
import type {
  AsyncStatus,
  Conversation,
  SummaryRecord,
  WeeklyReportRecord,
} from "~lib/types";
import {
  generateConversationSummary,
  generateWeeklyReport,
  getConversationSummary,
  getWeeklyReport,
} from "~lib/services/storageService";
import { PlatformTag } from "../components/PlatformTag";
import { StructuredSummaryCard } from "../components/StructuredSummaryCard";
import { StructuredWeeklyCard } from "../components/StructuredWeeklyCard";
import { formatRange } from "../components/insightUiUtils";

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
  const [summaryStatus, setSummaryStatus] = useState<AsyncStatus>("idle");
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [weeklyReport, setWeeklyReport] = useState<WeeklyReportRecord | null>(null);
  const [weeklyStatus, setWeeklyStatus] = useState<AsyncStatus>("idle");
  const [weeklyError, setWeeklyError] = useState<string | null>(null);

  const weeklyRange = useMemo(() => {
    const rangeEnd = Date.now();
    const rangeStart = rangeEnd - 7 * 24 * 60 * 60 * 1000;
    return { rangeStart, rangeEnd };
  }, []);

  useEffect(() => {
    if (!conversation) {
      setSummary(null);
      setSummaryStatus("idle");
      setSummaryError(null);
      return;
    }

    setSummaryStatus("loading");
    setSummaryError(null);

    getConversationSummary(conversation.id)
      .then((data) => {
        setSummary(data);
        setSummaryStatus(data ? "ready" : "idle");
      })
      .catch((error) => {
        setSummary(null);
        setSummaryStatus("error");
        setSummaryError(getErrorMessage(error));
      });
  }, [conversation?.id, refreshToken]);

  useEffect(() => {
    setWeeklyStatus("loading");
    setWeeklyError(null);

    getWeeklyReport(weeklyRange.rangeStart, weeklyRange.rangeEnd)
      .then((data) => {
        setWeeklyReport(data);
        setWeeklyStatus(data ? "ready" : "idle");
      })
      .catch((error) => {
        setWeeklyReport(null);
        setWeeklyStatus("error");
        setWeeklyError(getErrorMessage(error));
      });
  }, [refreshToken, weeklyRange.rangeStart, weeklyRange.rangeEnd]);

  const handleGenerateSummary = async () => {
    if (!conversation) return;

    setSummaryStatus("loading");
    setSummaryError(null);

    try {
      const data = await generateConversationSummary(conversation.id);
      setSummary(data);
      setSummaryStatus("ready");
    } catch (error) {
      setSummaryStatus("error");
      setSummaryError(getErrorMessage(error));
    }
  };

  const handleGenerateWeekly = async () => {
    setWeeklyStatus("loading");
    setWeeklyError(null);

    try {
      const data = await generateWeeklyReport(
        weeklyRange.rangeStart,
        weeklyRange.rangeEnd
      );
      setWeeklyReport(data);
      setWeeklyStatus("ready");
    } catch (error) {
      setWeeklyStatus("error");
      setWeeklyError(getErrorMessage(error));
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
                  onClick={handleGenerateSummary}
                  disabled={summaryStatus === "loading"}
                  className="flex w-fit items-center gap-1 rounded-sm border border-border-default bg-bg-primary px-3 py-1.5 text-vesti-xs font-medium text-text-primary transition-colors duration-[120ms] hover:bg-surface-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {summaryStatus === "loading" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.75} />
                  )}
                  {summary ? "Regenerate" : "Generate"}
                </button>

                <div className="min-h-[140px] rounded-md bg-bg-primary p-3 text-vesti-sm text-text-primary">
                  {summaryStatus === "loading" && !summary && (
                    <div className="flex items-center gap-2 text-text-tertiary">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating summary...
                    </div>
                  )}

                  {summaryStatus === "error" && (
                    <p className="text-vesti-xs text-danger">{summaryError}</p>
                  )}

                  {!summary && summaryStatus !== "loading" && summaryStatus !== "error" && (
                    <p className="text-vesti-xs text-text-tertiary">No summary yet.</p>
                  )}

                  {summary && <StructuredSummaryCard summary={summary} />}
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

        <section>
          <h2 className="mb-2 flex items-center gap-1.5 text-vesti-sm font-medium text-text-secondary">
            <CalendarDays className="h-4 w-4" strokeWidth={1.75} />
            Weekly Report
          </h2>

          <div className="rounded-md bg-surface-card p-3">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-vesti-sm font-medium text-text-primary">Recent 7 days</p>
                  <p className="text-vesti-xs text-text-tertiary">
                    {formatRange(weeklyRange.rangeStart, weeklyRange.rangeEnd)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateWeekly}
                disabled={weeklyStatus === "loading"}
                className="flex w-fit items-center gap-1 rounded-sm border border-border-default bg-bg-primary px-3 py-1.5 text-vesti-xs font-medium text-text-primary transition-colors duration-[120ms] hover:bg-surface-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus disabled:cursor-not-allowed disabled:opacity-60"
              >
                {weeklyStatus === "loading" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.75} />
                )}
                {weeklyReport ? "Regenerate" : "Generate"}
              </button>

              <div className="min-h-[140px] rounded-md bg-bg-primary p-3 text-vesti-sm text-text-primary">
                {weeklyStatus === "loading" && !weeklyReport && (
                  <div className="flex items-center gap-2 text-text-tertiary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating weekly report...
                  </div>
                )}

                {weeklyStatus === "error" && (
                  <p className="text-vesti-xs text-danger">{weeklyError}</p>
                )}

                {!weeklyReport && weeklyStatus !== "loading" && weeklyStatus !== "error" && (
                  <p className="text-vesti-xs text-text-tertiary">No weekly report yet.</p>
                )}

                {weeklyReport && <StructuredWeeklyCard report={weeklyReport} />}
              </div>

              {weeklyReport && (
                <div className="text-vesti-xs text-text-tertiary">
                  Model: {weeklyReport.modelId} · Generated: {formatDateTime(weeklyReport.createdAt)}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
