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
import { getPrompt } from "../prompts";
import {
  buildWeeklySourceHash,
  callInference,
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
import { getEffectiveModelId } from "./llmConfig";

const SUMMARY_MAX_CHARS = 12000;
const WEEKLY_MAX_CHARS = 12000;

type PromptType = "conversationSummary" | "weeklyDigest";
type GenerationMode = "plain_text" | "json_mode" | "prompt_json" | "fallback_text";

interface ParseResult<T> {
  data: T | null;
  errors: string[];
}

interface StructuredGenerationResult<T, TVersion extends string> {
  promptType: PromptType;
  promptVersion: string;
  structured: T | null;
  content: string;
  format: InsightFormat;
  status: InsightStatus;
  schemaVersion?: TVersion;
  mode: GenerationMode;
  attempt: number;
  validationErrors: string[];
  fallbackStage?: "none" | "repair_json" | "fallback_text";
}

interface PromptUsageLog {
  promptType: PromptType;
  promptVersion: string;
  mode: GenerationMode;
  attempt: number;
  validationErrors: string[];
  format?: InsightFormat;
  status?: InsightStatus;
  route?: "proxy" | "modelscope";
  fallbackStage?: "none" | "repair_json" | "fallback_text";
  latencyMs: number;
  success: boolean;
}

function logPromptUsage(entry: PromptUsageLog): void {
  const message = entry.success
    ? "Prompt usage"
    : "Prompt usage (fallback or validation issue)";

  if (entry.success) {
    logger.info("service", message, entry);
    return;
  }

  logger.warn("service", message, entry);
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

function toParsableJsonText(raw: string): string {
  return raw.replace(/<think>[\s\S]*?<\/think>/gi, " ").trim();
}

function parseSummaryFromRaw(raw: string): ParseResult<ConversationSummaryV1> {
  try {
    const parsedJson = parseJsonObjectFromText(toParsableJsonText(raw));
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
    const parsedJson = parseJsonObjectFromText(toParsableJsonText(raw));
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
  conversationTitle: string,
  messages: Message[]
): Promise<
  StructuredGenerationResult<ConversationSummaryV1, "conversation_summary.v1">
> {
  const prompt = getPrompt("conversationSummary", { variant: "current" });
  const payload = {
    conversationTitle,
    messages,
    locale: "zh" as const,
  };

  const firstAttemptStartedAt = Date.now();
  const primaryPrompt = truncateForContext(
    prompt.userTemplate(payload),
    SUMMARY_MAX_CHARS
  );
  const first = await callInference(settings, primaryPrompt, {
    responseFormat: "json_object",
    systemPrompt: prompt.system,
  });
  const firstParsed = parseSummaryFromRaw(first.content);

  logPromptUsage({
    promptType: "conversationSummary",
    promptVersion: prompt.version,
    mode: first.mode,
    attempt: 1,
    validationErrors: firstParsed.errors,
    route: first.route,
    fallbackStage: firstParsed.data ? "none" : "repair_json",
    latencyMs: Date.now() - firstAttemptStartedAt,
    success: !!firstParsed.data,
  });

  if (firstParsed.data) {
    return {
      promptType: "conversationSummary",
      promptVersion: prompt.version,
      structured: firstParsed.data,
      content: renderSummaryText(firstParsed.data),
      format: "structured_v1",
      status: "ok",
      schemaVersion: "conversation_summary.v1",
      mode: first.mode,
      attempt: 1,
      validationErrors: [],
      fallbackStage: "none",
    };
  }

  const secondAttemptStartedAt = Date.now();
  const repairPrompt = truncateForContext(
    buildRepairPrompt("summary", first.content, firstParsed.errors),
    SUMMARY_MAX_CHARS
  );
  const second = await callInference(settings, repairPrompt, {
    responseFormat: "json_object",
    systemPrompt: prompt.system,
  });
  const secondParsed = parseSummaryFromRaw(second.content);

  logPromptUsage({
    promptType: "conversationSummary",
    promptVersion: prompt.version,
    mode: second.mode,
    attempt: 2,
    validationErrors: secondParsed.errors,
    route: second.route,
    fallbackStage: secondParsed.data ? "none" : "fallback_text",
    latencyMs: Date.now() - secondAttemptStartedAt,
    success: !!secondParsed.data,
  });

  if (secondParsed.data) {
    return {
      promptType: "conversationSummary",
      promptVersion: prompt.version,
      structured: secondParsed.data,
      content: renderSummaryText(secondParsed.data),
      format: "structured_v1",
      status: "ok",
      schemaVersion: "conversation_summary.v1",
      mode: second.mode,
      attempt: 2,
      validationErrors: firstParsed.errors,
      fallbackStage: "repair_json",
    };
  }

  const fallbackStartedAt = Date.now();
  const fallbackPrompt = truncateForContext(
    prompt.fallbackTemplate(payload),
    SUMMARY_MAX_CHARS
  );
  const fallbackResponse = await callInference(settings, fallbackPrompt, {
    systemPrompt: prompt.fallbackSystem ?? prompt.system,
  });
  const fallbackContent =
    sanitizeSummaryText(fallbackResponse.content) || "摘要生成失败，请重试。";

  logPromptUsage({
    promptType: "conversationSummary",
    promptVersion: prompt.version,
    mode: "fallback_text",
    attempt: 3,
    validationErrors: [...firstParsed.errors, ...secondParsed.errors],
    route: fallbackResponse.route,
    fallbackStage: "fallback_text",
    latencyMs: Date.now() - fallbackStartedAt,
    format: "fallback_plain_text",
    status: "fallback",
    success: false,
  });

  return {
    promptType: "conversationSummary",
    promptVersion: prompt.version,
    structured: null,
    content: fallbackContent,
    format: "fallback_plain_text",
    status: "fallback",
    mode: "fallback_text",
    attempt: 3,
    validationErrors: [...firstParsed.errors, ...secondParsed.errors],
    fallbackStage: "fallback_text",
  };
}

async function generateStructuredWeekly(
  settings: LlmConfig,
  conversations: Conversation[],
  rangeStart: number,
  rangeEnd: number
): Promise<StructuredGenerationResult<WeeklyReportV1, "weekly_report.v1">> {
  const prompt = getPrompt("weeklyDigest", { variant: "current" });
  const payload = {
    conversations,
    rangeStart,
    rangeEnd,
    locale: "zh" as const,
  };

  if (conversations.length === 0) {
    const emptyReport: WeeklyReportV1 = {
      period_title: `Weekly Report ${formatRangeLabel(rangeStart, rangeEnd)}`,
      main_themes: ["该时间范围内没有可汇总的会话。"],
      key_takeaways: ["暂无关键结论。"],
      tech_stack_detected: ["General"],
    };

    return {
      promptType: "weeklyDigest",
      promptVersion: prompt.version,
      structured: emptyReport,
      content: renderWeeklyText(emptyReport),
      format: "structured_v1",
      status: "ok",
      schemaVersion: "weekly_report.v1",
      mode: "prompt_json",
      attempt: 0,
      validationErrors: [],
      fallbackStage: "none",
    };
  }

  const firstAttemptStartedAt = Date.now();
  const primaryPrompt = truncateForContext(
    prompt.userTemplate(payload),
    WEEKLY_MAX_CHARS
  );
  const first = await callInference(settings, primaryPrompt, {
    responseFormat: "json_object",
    systemPrompt: prompt.system,
  });
  const firstParsed = parseWeeklyFromRaw(first.content);

  logPromptUsage({
    promptType: "weeklyDigest",
    promptVersion: prompt.version,
    mode: first.mode,
    attempt: 1,
    validationErrors: firstParsed.errors,
    route: first.route,
    fallbackStage: firstParsed.data ? "none" : "repair_json",
    latencyMs: Date.now() - firstAttemptStartedAt,
    success: !!firstParsed.data,
  });

  if (firstParsed.data) {
    return {
      promptType: "weeklyDigest",
      promptVersion: prompt.version,
      structured: firstParsed.data,
      content: renderWeeklyText(firstParsed.data),
      format: "structured_v1",
      status: "ok",
      schemaVersion: "weekly_report.v1",
      mode: first.mode,
      attempt: 1,
      validationErrors: [],
      fallbackStage: "none",
    };
  }

  const secondAttemptStartedAt = Date.now();
  const repairPrompt = truncateForContext(
    buildRepairPrompt("weekly", first.content, firstParsed.errors),
    WEEKLY_MAX_CHARS
  );
  const second = await callInference(settings, repairPrompt, {
    responseFormat: "json_object",
    systemPrompt: prompt.system,
  });
  const secondParsed = parseWeeklyFromRaw(second.content);

  logPromptUsage({
    promptType: "weeklyDigest",
    promptVersion: prompt.version,
    mode: second.mode,
    attempt: 2,
    validationErrors: secondParsed.errors,
    route: second.route,
    fallbackStage: secondParsed.data ? "none" : "fallback_text",
    latencyMs: Date.now() - secondAttemptStartedAt,
    success: !!secondParsed.data,
  });

  if (secondParsed.data) {
    return {
      promptType: "weeklyDigest",
      promptVersion: prompt.version,
      structured: secondParsed.data,
      content: renderWeeklyText(secondParsed.data),
      format: "structured_v1",
      status: "ok",
      schemaVersion: "weekly_report.v1",
      mode: second.mode,
      attempt: 2,
      validationErrors: firstParsed.errors,
      fallbackStage: "repair_json",
    };
  }

  const fallbackStartedAt = Date.now();
  const fallbackPrompt = truncateForContext(
    prompt.fallbackTemplate(payload),
    WEEKLY_MAX_CHARS
  );
  const fallbackResponse = await callInference(settings, fallbackPrompt, {
    systemPrompt: prompt.fallbackSystem ?? prompt.system,
  });
  const fallbackContent =
    sanitizeSummaryText(fallbackResponse.content) || "周报生成失败，请重试。";

  logPromptUsage({
    promptType: "weeklyDigest",
    promptVersion: prompt.version,
    mode: "fallback_text",
    attempt: 3,
    validationErrors: [...firstParsed.errors, ...secondParsed.errors],
    route: fallbackResponse.route,
    fallbackStage: "fallback_text",
    latencyMs: Date.now() - fallbackStartedAt,
    format: "fallback_plain_text",
    status: "fallback",
    success: false,
  });

  return {
    promptType: "weeklyDigest",
    promptVersion: prompt.version,
    structured: null,
    content: fallbackContent,
    format: "fallback_plain_text",
    status: "fallback",
    mode: "fallback_text",
    attempt: 3,
    validationErrors: [...firstParsed.errors, ...secondParsed.errors],
    fallbackStage: "fallback_text",
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
  const generated = await generateStructuredSummary(
    settings,
    conversation.title,
    messages
  );

  logger.info("service", "Summary generation result", {
    promptType: generated.promptType,
    promptVersion: generated.promptVersion,
    mode: generated.mode,
    attempt: generated.attempt,
    validationErrors: generated.validationErrors,
    format: generated.format,
    status: generated.status,
    fallbackStage: generated.fallbackStage ?? "none",
  });

  if (previous?.status === "fallback" && generated.status === "fallback") {
    logger.warn("service", "Summary hit consecutive fallback", {
      conversationId,
      promptVersion: generated.promptVersion,
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
    modelId: getEffectiveModelId(settings),
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
    promptType: generated.promptType,
    promptVersion: generated.promptVersion,
    mode: generated.mode,
    attempt: generated.attempt,
    validationErrors: generated.validationErrors,
    format: generated.format,
    status: generated.status,
    fallbackStage: generated.fallbackStage ?? "none",
  });

  if (previous?.status === "fallback" && generated.status === "fallback") {
    logger.warn("service", "Weekly report hit consecutive fallback", {
      rangeStart,
      rangeEnd,
      promptVersion: generated.promptVersion,
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
    modelId: getEffectiveModelId(settings),
    createdAt: Date.now(),
    sourceHash,
  });
}
