import { z } from "zod";
import type { ConversationSummaryV1, WeeklyReportV1 } from "../types";

const MAX_TITLE_LENGTH = 80;
const MAX_PERIOD_LENGTH = 120;
const MAX_LIST_ITEM_LENGTH = 280;
const MAX_LIST_ITEMS = 8;

const summarySchema = z.object({
  topic_title: z.string().min(1).max(MAX_TITLE_LENGTH),
  key_takeaways: z.array(z.string().min(1)).min(1),
  sentiment: z.enum(["neutral", "positive", "negative"]),
  action_items: z.array(z.string().min(1)).optional(),
  tech_stack_detected: z.array(z.string().min(1)),
});

const weeklySchema = z.object({
  period_title: z.string().min(1).max(MAX_PERIOD_LENGTH),
  main_themes: z.array(z.string().min(1)).min(1),
  key_takeaways: z.array(z.string().min(1)).min(1),
  action_items: z.array(z.string().min(1)).optional(),
  tech_stack_detected: z.array(z.string().min(1)),
});

function cleanItem(value: string): string {
  return value
    .replace(/^\s*[-*+•]+\s*/g, "")
    .replace(/^\s*\d+[.)]\s*/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_LIST_ITEM_LENGTH);
}

function dedupePreserveOrder(items: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const item of items) {
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(item);
  }
  return normalized;
}

function normalizeList(values: string[] | undefined, limit = MAX_LIST_ITEMS): string[] {
  if (!values) return [];
  const cleaned = values
    .map(cleanItem)
    .filter((item) => item.length > 0)
    .slice(0, limit);
  return dedupePreserveOrder(cleaned).slice(0, limit);
}

export function normalizeConversationSummary(input: {
  topic_title: string;
  key_takeaways: string[];
  sentiment: "neutral" | "positive" | "negative";
  action_items?: string[];
  tech_stack_detected: string[];
}): ConversationSummaryV1 {
  const topicTitle = cleanItem(input.topic_title).slice(0, MAX_TITLE_LENGTH) || "Conversation Summary";
  const takeaways = normalizeList(input.key_takeaways, 6);
  const techStack = normalizeList(input.tech_stack_detected, 10);
  const actionItems = normalizeList(input.action_items, 6);

  const summary: ConversationSummaryV1 = {
    topic_title: topicTitle,
    key_takeaways: takeaways.length > 0 ? takeaways : ["Summary generated, but key takeaways were sparse."],
    sentiment: input.sentiment,
    tech_stack_detected: techStack,
  };

  if (actionItems.length > 0) {
    summary.action_items = actionItems;
  }

  return summary;
}

export function normalizeWeeklyReport(input: {
  period_title: string;
  main_themes: string[];
  key_takeaways: string[];
  action_items?: string[];
  tech_stack_detected: string[];
}): WeeklyReportV1 {
  const periodTitle = cleanItem(input.period_title).slice(0, MAX_PERIOD_LENGTH) || "Weekly Report";
  const themes = normalizeList(input.main_themes, 6);
  const takeaways = normalizeList(input.key_takeaways, 8);
  const actionItems = normalizeList(input.action_items, 8);
  const techStack = normalizeList(input.tech_stack_detected, 12);

  const weekly: WeeklyReportV1 = {
    period_title: periodTitle,
    main_themes: themes.length > 0 ? themes : ["No dominant theme detected."],
    key_takeaways: takeaways.length > 0 ? takeaways : ["No concrete weekly takeaways detected."],
    tech_stack_detected: techStack,
  };

  if (actionItems.length > 0) {
    weekly.action_items = actionItems;
  }

  return weekly;
}

export function parseConversationSummaryObject(value: unknown): {
  success: true;
  data: ConversationSummaryV1;
} | {
  success: false;
  errors: string[];
} {
  const parsed = summarySchema.safeParse(value);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.issues.map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`),
    };
  }

  return {
    success: true,
    data: normalizeConversationSummary(parsed.data),
  };
}

export function parseWeeklyReportObject(value: unknown): {
  success: true;
  data: WeeklyReportV1;
} | {
  success: false;
  errors: string[];
} {
  const parsed = weeklySchema.safeParse(value);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.issues.map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`),
    };
  }

  return {
    success: true,
    data: normalizeWeeklyReport(parsed.data),
  };
}

export function parseJsonObjectFromText(text: string): unknown {
  const trimmed = text.trim();
  const candidates = [trimmed];

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    candidates.push(fenced[1].trim());
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    candidates.push(trimmed.slice(firstBrace, lastBrace + 1));
  }

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      return JSON.parse(candidate);
    } catch {
      // Continue trying the next candidate.
    }
  }

  throw new Error("INVALID_JSON_PAYLOAD");
}

export const insightSchemaHints = {
  summary: {
    topic_title: "string (<= 5 words)",
    key_takeaways: ["string"],
    sentiment: "neutral | positive | negative",
    action_items: ["string (optional)"],
    tech_stack_detected: ["string"],
  },
  weekly: {
    period_title: "string",
    main_themes: ["string"],
    key_takeaways: ["string"],
    action_items: ["string (optional)"],
    tech_stack_detected: ["string"],
  },
};
