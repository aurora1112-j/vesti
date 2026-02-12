import type {
  Conversation,
  ConversationSummaryV1,
  InsightFormat,
  InsightStatus,
  LlmConfig,
  Message,
  SummaryRecord,
  WeeklyReportRecord,
  WeeklyReportV1,
} from "../types";
import {
  getConversationById,
  getSummary,
  getWeeklyReport,
  listConversationsByRange,
  listMessages,
  saveSummary,
  saveWeeklyReport,
} from "../db/repository";
import {
  buildSummaryPrompt,
  buildWeeklyPrompt,
  buildWeeklySourceHash,
  callModelScope,
  sanitizeSummaryText,
  truncateForContext,
} from "./llmService";
import {
  insightSchemaHints,
  parseConversationSummaryObject,
  parseJsonObjectFromText,
  parseWeeklyReportObject,
} from "./insightSchemas";
import { logger } from "../utils/logger";

const SUMMARY_MAX_CHARS = 12000;
const WEEKLY_MAX_CHARS = 12000;

type GenerationMode = "plain_text" | "json_mode" | "prompt_json" | "fallback_text";

interface ParseResult<T> {
  data: T | null;
  errors: string[];
}

interface StructuredGenerationResult<T, TVersion extends string> {
  structured: T | null;
  content: string;
  format: InsightFormat;
  status: InsightStatus;
  schemaVersion?: TVersion;
  mode: GenerationMode;
  attempt: number;
  validationErrors: string[];
}

function renderSummaryText(summary: ConversationSummaryV1): string {
  const lines = [summary.topic_title, ...summary.key_takeaways];
  if (summary.action_items?.length) {
    lines.push("Action Items:", ...summary.action_items);
  }
  return sanitizeSummaryText(lines.join("\n"));
}

function renderWeeklyText(report: WeeklyReportV1): string {
  const lines = [report.period_title, ...report.main_themes, ...report.key_takeaways];
  if (report.action_items?.length) {
    lines.push("Action Items:", ...report.action_items);
  }
  return sanitizeSummaryText(lines.join("\n"));
}

function formatRangeLabel(rangeStart: number, rangeEnd: number): string {
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

function buildConversationLines(messages: Message[]): string {
  return messages
    .map((message) => {
      const role = message.role === "user" ? "User" : "AI";
      return `[${role}] ${message.content_text}`;
    })
    .join("\n");
}

function buildWeeklyLines(conversations: Conversation[]): string {
  return conversations
    .map((conversation, index) => {
      return `${index + 1}. [${conversation.platform}] ${conversation.title} - ${conversation.snippet}`;
    })
    .join("\n");
}

function buildSummaryJsonPrompt(messages: Message[]): string {
  return `You are a Technical Documentation Specialist.
Analyze the chat history and output valid JSON only.

CONSTRAINTS:
1) Output MUST be valid JSON following this schema exactly: ${JSON.stringify(insightSchemaHints.summary)}
2) Filter conversational filler and keep technical decisions/debugging outcomes.
3) topic_title should be concise (max 5 words).
4) action_items can be omitted when not present.

CHAT HISTORY:
${buildConversationLines(messages)}`;
}

function buildWeeklyJsonPrompt(
  conversations: Conversation[],
  rangeStart: number,
  rangeEnd: number
): string {
  return `You are a Technical Documentation Specialist.
Analyze the weekly conversations and output valid JSON only.

CONSTRAINTS:
1) Output MUST be valid JSON following this schema exactly: ${JSON.stringify(insightSchemaHints.weekly)}
2) Focus on themes, outcomes, and actionable items.
3) period_title should include the weekly period and stay concise.
4) action_items can be omitted when not present.

PERIOD: ${formatRangeLabel(rangeStart, rangeEnd)}
WEEKLY CONVERSATIONS:
${buildWeeklyLines(conversations)}`;
}

function buildRepairPrompt(
  kind: "summary" | "weekly",
  rawOutput: string,
  validationErrors: string[]
): string {
  const schemaHint =
    kind === "summary" ? insightSchemaHints.summary : insightSchemaHints.weekly;

  return `Fix the output below into a valid JSON object.
Return JSON only.

Target schema: ${JSON.stringify(schemaHint)}
Validation errors: ${validationErrors.join("; ") || "JSON parse failed"}

Raw output:
${rawOutput}`;
}

function parseSummaryFromRaw(raw: string): ParseResult<ConversationSummaryV1> {
  try {
    const parsedJson = parseJsonObjectFromText(raw);
    const parsed = parseConversationSummaryObject(parsedJson);
    if (parsed.success) {
      return { data: parsed.data, errors: [] };
    }
    return {
      data: null,
      errors: "errors" in parsed ? parsed.errors : ["SCHEMA_VALIDATION_FAILED"],
    };
  } catch (error) {
    return {
      data: null,
      errors: [(error as Error).message || "INVALID_JSON_PAYLOAD"],
    };
  }
}

function parseWeeklyFromRaw(raw: string): ParseResult<WeeklyReportV1> {
  try {
    const parsedJson = parseJsonObjectFromText(raw);
    const parsed = parseWeeklyReportObject(parsedJson);
    if (parsed.success) {
      return { data: parsed.data, errors: [] };
    }
    return {
      data: null,
      errors: "errors" in parsed ? parsed.errors : ["SCHEMA_VALIDATION_FAILED"],
    };
  } catch (error) {
    return {
      data: null,
      errors: [(error as Error).message || "INVALID_JSON_PAYLOAD"],
    };
  }
}

async function generateStructuredSummary(
  settings: LlmConfig,
  messages: Message[]
): Promise<
  StructuredGenerationResult<ConversationSummaryV1, "conversation_summary.v1">
> {
  const primaryPrompt = truncateForContext(
    buildSummaryJsonPrompt(messages),
    SUMMARY_MAX_CHARS
  );
  const first = await callModelScope(settings, primaryPrompt, {
    responseFormat: "json_object",
  });
  const firstParsed = parseSummaryFromRaw(first.content);

  logger.info("service", "Summary generation attempt", {
    mode: first.mode,
    attempt: 1,
    validationErrors: firstParsed.errors,
  });

  if (firstParsed.data) {
    return {
      structured: firstParsed.data,
      content: renderSummaryText(firstParsed.data),
      format: "structured_v1",
      status: "ok",
      schemaVersion: "conversation_summary.v1",
      mode: first.mode,
      attempt: 1,
      validationErrors: [],
    };
  }

  const repairPrompt = truncateForContext(
    buildRepairPrompt("summary", first.content, firstParsed.errors),
    SUMMARY_MAX_CHARS
  );
  const second = await callModelScope(settings, repairPrompt, {
    responseFormat: "json_object",
  });
  const secondParsed = parseSummaryFromRaw(second.content);

  logger.info("service", "Summary generation attempt", {
    mode: second.mode,
    attempt: 2,
    validationErrors: secondParsed.errors,
  });

  if (secondParsed.data) {
    return {
      structured: secondParsed.data,
      content: renderSummaryText(secondParsed.data),
      format: "structured_v1",
      status: "ok",
      schemaVersion: "conversation_summary.v1",
      mode: second.mode,
      attempt: 2,
      validationErrors: firstParsed.errors,
    };
  }

  const fallbackPrompt = truncateForContext(
    buildSummaryPrompt(messages, "zh"),
    SUMMARY_MAX_CHARS
  );
  const fallbackResponse = await callModelScope(settings, fallbackPrompt);
  const fallbackContent =
    sanitizeSummaryText(fallbackResponse.content) || "摘要生成失败，请重试。";

  return {
    structured: null,
    content: fallbackContent,
    format: "fallback_plain_text",
    status: "fallback",
    mode: "fallback_text",
    attempt: 2,
    validationErrors: [...firstParsed.errors, ...secondParsed.errors],
  };
}

async function generateStructuredWeekly(
  settings: LlmConfig,
  conversations: Conversation[],
  rangeStart: number,
  rangeEnd: number
): Promise<StructuredGenerationResult<WeeklyReportV1, "weekly_report.v1">> {
  if (conversations.length === 0) {
    const emptyReport: WeeklyReportV1 = {
      period_title: `Weekly Report ${formatRangeLabel(rangeStart, rangeEnd)}`,
      main_themes: ["该时间范围内没有可汇总的会话。"],
      key_takeaways: ["暂无关键结论。"],
      tech_stack_detected: ["General"],
    };

    return {
      structured: emptyReport,
      content: renderWeeklyText(emptyReport),
      format: "structured_v1",
      status: "ok",
      schemaVersion: "weekly_report.v1",
      mode: "prompt_json",
      attempt: 0,
      validationErrors: [],
    };
  }

  const primaryPrompt = truncateForContext(
    buildWeeklyJsonPrompt(conversations, rangeStart, rangeEnd),
    WEEKLY_MAX_CHARS
  );
  const first = await callModelScope(settings, primaryPrompt, {
    responseFormat: "json_object",
  });
  const firstParsed = parseWeeklyFromRaw(first.content);

  logger.info("service", "Weekly generation attempt", {
    mode: first.mode,
    attempt: 1,
    validationErrors: firstParsed.errors,
  });

  if (firstParsed.data) {
    return {
      structured: firstParsed.data,
      content: renderWeeklyText(firstParsed.data),
      format: "structured_v1",
      status: "ok",
      schemaVersion: "weekly_report.v1",
      mode: first.mode,
      attempt: 1,
      validationErrors: [],
    };
  }

  const repairPrompt = truncateForContext(
    buildRepairPrompt("weekly", first.content, firstParsed.errors),
    WEEKLY_MAX_CHARS
  );
  const second = await callModelScope(settings, repairPrompt, {
    responseFormat: "json_object",
  });
  const secondParsed = parseWeeklyFromRaw(second.content);

  logger.info("service", "Weekly generation attempt", {
    mode: second.mode,
    attempt: 2,
    validationErrors: secondParsed.errors,
  });

  if (secondParsed.data) {
    return {
      structured: secondParsed.data,
      content: renderWeeklyText(secondParsed.data),
      format: "structured_v1",
      status: "ok",
      schemaVersion: "weekly_report.v1",
      mode: second.mode,
      attempt: 2,
      validationErrors: firstParsed.errors,
    };
  }

  const fallbackPrompt = truncateForContext(
    buildWeeklyPrompt(conversations, "zh"),
    WEEKLY_MAX_CHARS
  );
  const fallbackResponse = await callModelScope(settings, fallbackPrompt);
  const fallbackContent =
    sanitizeSummaryText(fallbackResponse.content) || "周报生成失败，请重试。";

  return {
    structured: null,
    content: fallbackContent,
    format: "fallback_plain_text",
    status: "fallback",
    mode: "fallback_text",
    attempt: 2,
    validationErrors: [...firstParsed.errors, ...secondParsed.errors],
  };
}

export async function generateConversationSummary(
  settings: LlmConfig,
  conversationId: number
): Promise<SummaryRecord> {
  const conversation = await getConversationById(conversationId);
  if (!conversation) {
    throw new Error("CONVERSATION_NOT_FOUND");
  }

  const messages = await listMessages(conversationId);
  if (messages.length === 0) {
    throw new Error("CONVERSATION_MESSAGES_EMPTY");
  }

  const previous = await getSummary(conversationId);
  const generated = await generateStructuredSummary(settings, messages);

  logger.info("service", "Summary generation result", {
    mode: generated.mode,
    attempt: generated.attempt,
    validationErrors: generated.validationErrors,
    format: generated.format,
    status: generated.status,
  });

  if (previous?.status === "fallback" && generated.status === "fallback") {
    logger.warn("service", "Summary hit consecutive fallback", {
      conversationId,
      validationErrors: generated.validationErrors,
    });
  }

  return saveSummary({
    conversationId: conversation.id,
    content: generated.content,
    structured: generated.structured,
    format: generated.format,
    status: generated.status,
    schemaVersion: generated.schemaVersion,
    modelId: settings.modelId,
    createdAt: Date.now(),
    sourceUpdatedAt: conversation.updated_at,
  });
}

export async function generateWeeklyReport(
  settings: LlmConfig,
  rangeStart: number,
  rangeEnd: number
): Promise<WeeklyReportRecord> {
  const conversations = await listConversationsByRange(rangeStart, rangeEnd);
  const sourceHash = buildWeeklySourceHash(conversations, rangeStart, rangeEnd);
  const previous = await getWeeklyReport(rangeStart, rangeEnd);

  const generated = await generateStructuredWeekly(
    settings,
    conversations,
    rangeStart,
    rangeEnd
  );

  logger.info("service", "Weekly generation result", {
    mode: generated.mode,
    attempt: generated.attempt,
    validationErrors: generated.validationErrors,
    format: generated.format,
    status: generated.status,
  });

  if (previous?.status === "fallback" && generated.status === "fallback") {
    logger.warn("service", "Weekly report hit consecutive fallback", {
      rangeStart,
      rangeEnd,
      validationErrors: generated.validationErrors,
    });
  }

  return saveWeeklyReport({
    rangeStart,
    rangeEnd,
    content: generated.content,
    structured: generated.structured,
    format: generated.format,
    status: generated.status,
    schemaVersion: generated.schemaVersion,
    modelId: settings.modelId,
    createdAt: Date.now(),
    sourceHash,
  });
}
