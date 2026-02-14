import { z } from "zod";
import type {
  ConversationSummaryV1,
  ConversationSummaryV2,
  WeeklyLiteReportV1,
  WeeklyReportV1,
} from "../types";

const MAX_TITLE_LENGTH = 80;
const MAX_PERIOD_LENGTH = 120;
const MAX_LIST_ITEM_LENGTH = 280;
const MAX_LIST_ITEMS = 8;
const MAX_META_LENGTH = 180;

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

const summaryV2Schema = z.object({
  core_question: z.string().min(1).max(MAX_META_LENGTH),
  thinking_journey: z.object({
    initial_state: z.string().min(1).max(MAX_LIST_ITEM_LENGTH),
    key_turns: z.array(z.string().min(1)).min(1).max(8),
    final_understanding: z.string().min(1).max(MAX_LIST_ITEM_LENGTH),
  }),
  key_insights: z.array(z.string().min(1)).min(1).max(8),
  unresolved_threads: z.array(z.string().min(1)).max(8),
  meta_observations: z.object({
    thinking_style: z.string().min(1).max(MAX_META_LENGTH),
    emotional_tone: z.string().min(1).max(MAX_META_LENGTH),
    depth_level: z.enum(["superficial", "moderate", "deep"]),
  }),
  actionable_next_steps: z.array(z.string().min(1)).max(8),
});

const weeklyLiteSchema = z.object({
  time_range: z.object({
    start: z.string().min(1),
    end: z.string().min(1),
    total_conversations: z.number().int().min(0),
  }),
  highlights: z.array(z.string().min(1)).min(1).max(8),
  recurring_questions: z.array(z.string().min(1)).max(8),
  unresolved_threads: z.array(z.string().min(1)).max(8),
  suggested_focus: z.array(z.string().min(1)).min(1).max(8),
  evidence: z.array(
    z.object({
      conversation_id: z.number().int().min(0),
      note: z.string().min(1),
    })
  ).max(10),
  insufficient_data: z.boolean(),
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

function cleanMeta(value: string): string {
  return cleanItem(value).slice(0, MAX_META_LENGTH);
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

export function normalizeConversationSummaryV2(input: {
  core_question: string;
  thinking_journey: {
    initial_state: string;
    key_turns: string[];
    final_understanding: string;
  };
  key_insights: string[];
  unresolved_threads: string[];
  meta_observations: {
    thinking_style: string;
    emotional_tone: string;
    depth_level: "superficial" | "moderate" | "deep";
  };
  actionable_next_steps: string[];
}): ConversationSummaryV2 {
  const keyTurns = normalizeList(input.thinking_journey.key_turns, 5);
  const keyInsights = normalizeList(input.key_insights, 6);
  const unresolvedThreads = normalizeList(input.unresolved_threads, 6);
  const nextSteps = normalizeList(input.actionable_next_steps, 6);

  return {
    core_question: cleanMeta(input.core_question) || "你这次对话想解决的核心问题是什么？",
    thinking_journey: {
      initial_state:
        cleanItem(input.thinking_journey.initial_state) || "你在问题起点存在一些不确定性。",
      key_turns: keyTurns.length > 0 ? keyTurns : ["你通过追问不断澄清关键假设。"],
      final_understanding:
        cleanItem(input.thinking_journey.final_understanding) || "你对问题形成了阶段性理解。",
    },
    key_insights: keyInsights.length > 0 ? keyInsights : ["你获得了可执行的阶段性洞察。"],
    unresolved_threads: unresolvedThreads,
    meta_observations: {
      thinking_style:
        cleanMeta(input.meta_observations.thinking_style) || "你倾向先拆解问题再收敛结论。",
      emotional_tone:
        cleanMeta(input.meta_observations.emotional_tone) || "整体语气以探索和澄清为主。",
      depth_level: input.meta_observations.depth_level,
    },
    actionable_next_steps: nextSteps,
  };
}

export function normalizeWeeklyLiteReport(input: {
  time_range: {
    start: string;
    end: string;
    total_conversations: number;
  };
  highlights: string[];
  recurring_questions: string[];
  unresolved_threads: string[];
  suggested_focus: string[];
  evidence: Array<{
    conversation_id: number;
    note: string;
  }>;
  insufficient_data: boolean;
}): WeeklyLiteReportV1 {
  const highlights = normalizeList(input.highlights, 6);
  const recurringQuestions = normalizeList(input.recurring_questions, 4);
  const unresolvedThreads = normalizeList(input.unresolved_threads, 6);
  const suggestedFocus = normalizeList(input.suggested_focus, 6);
  const evidence = (input.evidence || [])
    .slice(0, 8)
    .map((item) => ({
      conversation_id: item.conversation_id,
      note: cleanItem(item.note),
    }))
    .filter((item) => item.note.length > 0);

  const totalConversations = Math.max(0, Math.floor(input.time_range.total_conversations));
  const insufficientData = input.insufficient_data || totalConversations < 3;

  return {
    time_range: {
      start: input.time_range.start.trim(),
      end: input.time_range.end.trim(),
      total_conversations: totalConversations,
    },
    highlights: highlights.length > 0 ? highlights : ["本周形成了可复用的阶段性结论。"],
    recurring_questions: recurringQuestions,
    unresolved_threads: unresolvedThreads,
    suggested_focus:
      suggestedFocus.length > 0
        ? suggestedFocus
        : ["下周优先推进一个高价值问题并记录验证结果。"],
    evidence,
    insufficient_data: insufficientData,
  };
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

export function parseConversationSummaryV2Object(value: unknown): {
  success: true;
  data: ConversationSummaryV2;
} | {
  success: false;
  errors: string[];
} {
  const parsed = summaryV2Schema.safeParse(value);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.issues.map(
        (issue) => `${issue.path.join(".") || "root"}: ${issue.message}`
      ),
    };
  }

  return {
    success: true,
    data: normalizeConversationSummaryV2(parsed.data),
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

export function parseWeeklyLiteReportObject(value: unknown): {
  success: true;
  data: WeeklyLiteReportV1;
} | {
  success: false;
  errors: string[];
} {
  const parsed = weeklyLiteSchema.safeParse(value);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.issues.map(
        (issue) => `${issue.path.join(".") || "root"}: ${issue.message}`
      ),
    };
  }

  return {
    success: true,
    data: normalizeWeeklyLiteReport(parsed.data),
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
  summary_v2: {
    core_question: "string",
    thinking_journey: {
      initial_state: "string",
      key_turns: ["string"],
      final_understanding: "string",
    },
    key_insights: ["string"],
    unresolved_threads: ["string"],
    meta_observations: {
      thinking_style: "string",
      emotional_tone: "string",
      depth_level: "superficial | moderate | deep",
    },
    actionable_next_steps: ["string"],
  },
  weekly_lite: {
    time_range: {
      start: "YYYY-MM-DD",
      end: "YYYY-MM-DD",
      total_conversations: "number",
    },
    highlights: ["string"],
    recurring_questions: ["string"],
    unresolved_threads: ["string"],
    suggested_focus: ["string"],
    evidence: [{ conversation_id: "number", note: "string" }],
    insufficient_data: "boolean",
  },
};
