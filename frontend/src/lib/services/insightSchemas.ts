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

function removeTrailingCommas(input: string): string {
  let output = "";
  let inString = false;
  let escape = false;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];

    if (inString) {
      output += ch;
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === "\\") {
        escape = true;
      } else if (ch === "\"") {
        inString = false;
      }
      continue;
    }

    if (ch === "\"") {
      inString = true;
      output += ch;
      continue;
    }

    if (ch === ",") {
      let j = i + 1;
      while (j < input.length && /\s/.test(input[j])) {
        j += 1;
      }
      const next = input[j];
      if (next === "}" || next === "]") {
        continue;
      }
    }

    output += ch;
  }

  return output;
}

function extractFencedBlocks(text: string): string[] {
  const blocks: string[] = [];
  const re = /```[a-zA-Z0-9_-]*\s*([\s\S]*?)```/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text))) {
    if (m[1]) {
      blocks.push(m[1].trim());
    }
  }

  return blocks;
}

function extractBalancedJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start < 0) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < text.length; i += 1) {
    const ch = text[i];

    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === "\\") {
        escape = true;
      } else if (ch === "\"") {
        inString = false;
      }
      continue;
    }

    if (ch === "\"") {
      inString = true;
      continue;
    }

    if (ch === "{") depth += 1;
    if (ch === "}") depth -= 1;

    if (depth === 0) {
      return text.slice(start, i + 1);
    }
  }

  return null;
}

function tryParseJsonCandidate(candidate: string): unknown | null {
  const trimmed = candidate.trim().replace(/^\uFEFF/, "");
  const attempts = [trimmed, removeTrailingCommas(trimmed)];

  for (const attempt of attempts) {
    if (!attempt) continue;

    try {
      let value: unknown = JSON.parse(attempt);

      // Handle double-encoded JSON (a JSON string containing JSON).
      for (let i = 0; i < 2; i += 1) {
        if (typeof value !== "string") break;
        const inner = value.trim();
        if (!inner) break;
        if (
          (inner.startsWith("{") && inner.endsWith("}")) ||
          (inner.startsWith("[") && inner.endsWith("]"))
        ) {
          try {
            value = JSON.parse(inner);
            continue;
          } catch {
            break;
          }
        }
        break;
      }

      return value;
    } catch {
      // Keep trying.
    }
  }

  return null;
}

export function parseJsonObjectFromText(text: string): unknown {
  const trimmed = text.trim();
  const candidates: string[] = [];

  if (trimmed) {
    candidates.push(trimmed);
  }

  for (const block of extractFencedBlocks(trimmed)) {
    if (block) {
      candidates.push(block);
    }
  }

  const balanced = extractBalancedJsonObject(trimmed);
  if (balanced) {
    candidates.push(balanced);
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    candidates.push(trimmed.slice(firstBrace, lastBrace + 1));
  }

  for (const candidate of candidates) {
    const parsed = tryParseJsonCandidate(candidate);
    if (parsed === null) continue;
    if (typeof parsed === "object" && parsed !== null) {
      return parsed;
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
