import type { SummaryRecord, WeeklyReportRecord } from "../types";
import type {
  ChatSummaryData,
  SummaryProcessStep,
  WeeklySummaryData,
} from "../types/insightsPresentation";

const TECH_KEYWORDS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\breact\b/i, label: "React" },
  { pattern: /typescript|\bts\b/i, label: "TypeScript" },
  { pattern: /plasmo/i, label: "Plasmo" },
  { pattern: /tailwind/i, label: "Tailwind CSS" },
  { pattern: /dexie|indexeddb/i, label: "IndexedDB" },
  { pattern: /parser|selector/i, label: "Parser" },
  { pattern: /modelscope|qwen/i, label: "ModelScope" },
  { pattern: /prompt|schema/i, label: "Prompt Engineering" },
];

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function dedupe(items: string[]): string[] {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const item of items) {
    const normalized = normalizeText(item);
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(normalized);
  }
  return output;
}

function inferTags(explicitTags: string[] | undefined, fallbackText: string): string[] {
  const fromExplicit = dedupe(explicitTags ?? []).slice(0, 6);
  if (fromExplicit.length > 0) {
    return fromExplicit;
  }

  const inferred: string[] = [];
  for (const item of TECH_KEYWORDS) {
    if (item.pattern.test(fallbackText)) {
      inferred.push(item.label);
    }
    if (inferred.length >= 3) {
      break;
    }
  }

  const deduped = dedupe(inferred);
  if (deduped.length > 0) {
    return deduped;
  }

  return ["General"];
}

function toLines(text: string): string[] {
  return dedupe(
    text
      .split(/\r?\n/)
      .map((line) => line.replace(/^[-*\d.)\s]+/, "").trim())
      .filter((line) => line.length > 0)
  );
}

function toProcessFromInsights(
  insights: string[],
  prefix: string = "Step"
): SummaryProcessStep[] {
  const source = insights.length > 0 ? insights : ["暂无可提取过程，请参考完整摘要文本。"];
  return source.slice(0, 4).map((detail, index) => ({
    step: `${prefix} ${index + 1}`,
    detail,
  }));
}

function toIsoTime(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

function toRangeLabel(rangeStart: number, rangeEnd: number): string {
  const start = new Date(rangeStart).toLocaleDateString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
  });
  const end = new Date(rangeEnd).toLocaleDateString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
  });
  return `${start} - ${end}`;
}

export function toChatSummaryData(
  summary: SummaryRecord,
  options?: { conversationTitle?: string }
): ChatSummaryData {
  const fallbackLines = toLines(summary.content);
  const structured = summary.structured;

  if (!structured) {
    const firstLine = fallbackLines[0] ?? options?.conversationTitle ?? "Conversation Summary";
    const secondLine = fallbackLines[1] ?? fallbackLines[0] ?? "暂无可提取结论";

    return {
      meta: {
        title: options?.conversationTitle ?? firstLine,
        generated_at: toIsoTime(summary.createdAt),
        tags: inferTags([], summary.content),
        fallback: true,
      },
      core: {
        problem: options?.conversationTitle
          ? `你在这次对话中主要讨论了：${options.conversationTitle}`
          : firstLine,
        solution: secondLine,
      },
      process: toProcessFromInsights(fallbackLines),
      key_insights: fallbackLines.slice(0, 4),
      action_items: fallbackLines
        .filter((line) => /下一步|TODO|行动|待办|next/i.test(line))
        .slice(0, 4),
      plain_text: summary.content,
    };
  }

  const keyInsights = dedupe(structured.key_takeaways).slice(0, 6);
  const actionItems = dedupe(structured.action_items ?? []).slice(0, 6);
  const tags = inferTags(
    structured.tech_stack_detected,
    `${structured.topic_title}\n${keyInsights.join("\n")}`
  );

  return {
    meta: {
      title: options?.conversationTitle ?? structured.topic_title,
      generated_at: toIsoTime(summary.createdAt),
      tags,
      fallback: summary.status === "fallback",
    },
    core: {
      problem: `你这次对话聚焦的问题：${options?.conversationTitle ?? structured.topic_title}`,
      solution: keyInsights[0] ?? "暂无明确结论",
    },
    process: toProcessFromInsights(keyInsights),
    key_insights: keyInsights,
    action_items: actionItems.length > 0 ? actionItems : undefined,
    plain_text: summary.content,
  };
}

export function toWeeklySummaryData(report: WeeklyReportRecord): WeeklySummaryData {
  const fallbackLines = toLines(report.content);
  const rangeLabel = toRangeLabel(report.rangeStart, report.rangeEnd);
  const structured = report.structured;

  if (!structured) {
    const firstLine = fallbackLines[0] ?? `Weekly Summary ${rangeLabel}`;
    const secondLine = fallbackLines[1] ?? fallbackLines[0] ?? "暂无可提取结论";

    return {
      meta: {
        title: firstLine,
        generated_at: toIsoTime(report.createdAt),
        tags: inferTags([], report.content),
        fallback: true,
        range_label: rangeLabel,
      },
      core: {
        problem: `这一周期（${rangeLabel}）你主要在推进哪些议题？`,
        solution: secondLine,
      },
      process: toProcessFromInsights(fallbackLines, "Stage"),
      key_insights: fallbackLines.slice(0, 5),
      action_items: fallbackLines
        .filter((line) => /下一步|TODO|行动|待办|next/i.test(line))
        .slice(0, 4),
      plain_text: report.content,
    };
  }

  const themes = dedupe(structured.main_themes).slice(0, 6);
  const keyInsights = dedupe(structured.key_takeaways).slice(0, 8);
  const actionItems = dedupe(structured.action_items ?? []).slice(0, 6);
  const tags = inferTags(
    structured.tech_stack_detected,
    `${structured.period_title}\n${themes.join("\n")}\n${keyInsights.join("\n")}`
  );

  return {
    meta: {
      title: structured.period_title || `Weekly Summary ${rangeLabel}`,
      generated_at: toIsoTime(report.createdAt),
      tags,
      fallback: report.status === "fallback",
      range_label: rangeLabel,
    },
    core: {
      problem: `这一周期（${rangeLabel}）你主要在推进哪些议题？`,
      solution: keyInsights[0] ?? themes[0] ?? "暂无明确结论",
    },
    process: themes.length
      ? themes.map((detail, index) => ({
          step: `Theme ${index + 1}`,
          detail,
        }))
      : toProcessFromInsights(keyInsights, "Theme"),
    key_insights: keyInsights,
    action_items: actionItems.length > 0 ? actionItems : undefined,
    plain_text: report.content,
  };
}
