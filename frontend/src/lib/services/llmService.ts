import type { Conversation, Message, LlmConfig } from "../types";
import { logger } from "../utils/logger";

const SYSTEM_PROMPT = "You are a careful technical summarization assistant.";
const STRICT_JSON_SYSTEM_PROMPT =
  "Output must be a valid JSON object only. Do not include Markdown, code fences, or explanatory text outside JSON.";

export type ModelScopeMode = "plain_text" | "json_mode" | "prompt_json";

export interface CallModelScopeOptions {
  responseFormat?: "json_object";
  systemPrompt?: string;
}

export interface ModelScopeCallResult {
  content: string;
  mode: ModelScopeMode;
}

type ModelScopeMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ModelScopeResponse = {
  choices?: { message?: { content?: string } }[];
};

function ensureConfig(config: LlmConfig): void {
  if (!config.baseUrl) {
    throw new Error("LLM_CONFIG_MISSING:BASE_URL");
  }
  if (!config.apiKey) {
    throw new Error("LLM_CONFIG_MISSING:API_KEY");
  }
  if (!config.modelId) {
    throw new Error("LLM_CONFIG_MISSING:MODEL_ID");
  }
}

function extractContent(data: ModelScopeResponse): string {
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("LLM_RESPONSE_EMPTY");
  }
  return content;
}

async function parseError(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

async function requestModelScope(
  config: LlmConfig,
  messages: ModelScopeMessage[],
  responseFormat?: "json_object"
): Promise<Response> {
  const baseUrl = config.baseUrl.replace(/\/+$/, "");
  const url = `${baseUrl}/chat/completions`;

  const payload: Record<string, unknown> = {
    model: config.modelId,
    temperature: config.temperature,
    max_tokens: config.maxTokens,
    messages,
  };

  if (responseFormat) {
    payload.response_format = { type: responseFormat };
  }

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(payload),
  });
}

function buildConversationLines(messages: Message[]): string {
  return messages
    .map((msg) => {
      const role = msg.role === "user" ? "User" : "AI";
      return `[${role}] ${msg.content_text}`;
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

export function truncateForContext(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}\n[...truncated...]`;
}

export function sanitizeSummaryText(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```[\w-]*\n?/g, "").replace(/```/g, ""))
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function buildSummaryPrompt(messages: Message[], lang: "zh" | "en" = "zh"): string {
  const conversation = buildConversationLines(messages);

  if (lang === "zh") {
    return `请基于以下对话生成中文总结。\n要求：\n1) 输出严格为纯文本，不要使用 Markdown 语法（不要 *, #, -, 代码块）。\n2) 输出 3-6 条简洁句子，每条单独换行。\n3) 聚焦技术决策、调试结论与可执行行动。\n\n对话内容：\n${conversation}`;
  }

  return `Summarize the conversation in plain text.\nRequirements:\n1) No Markdown syntax (no *, #, -, or code fences).\n2) 3-6 concise lines, one sentence per line.\n3) Focus on technical decisions, debugging findings, and action items.\n\nConversation:\n${conversation}`;
}

export function buildWeeklyPrompt(
  conversations: Conversation[],
  lang: "zh" | "en" = "zh"
): string {
  const items = buildWeeklyLines(conversations);

  if (lang === "zh") {
    return `请基于以下会话生成中文周报。\n要求：\n1) 输出严格为纯文本，不要使用 Markdown 语法（不要 *, #, -, 代码块）。\n2) 内容分为主题、关键进展与后续行动。\n3) 每条信息单独换行，保持简洁。\n\n本周会话：\n${items}`;
  }

  return `Write a weekly report in plain text.\nRequirements:\n1) No Markdown syntax (no *, #, -, or code fences).\n2) Cover themes, progress, and next actions.\n3) Keep concise lines.\n\nWeekly conversations:\n${items}`;
}

export function buildWeeklySourceHash(
  conversations: Conversation[],
  rangeStart: number,
  rangeEnd: number
): string {
  const payload = conversations
    .map((conversation) => `${conversation.id}:${conversation.updated_at}`)
    .join("|");
  return `${rangeStart}-${rangeEnd}-${payload}`;
}

export async function callModelScope(
  config: LlmConfig,
  prompt: string,
  options: CallModelScopeOptions = {}
): Promise<ModelScopeCallResult> {
  ensureConfig(config);

  const baseSystemPrompt = options.systemPrompt ?? SYSTEM_PROMPT;
  const baseMessages: ModelScopeMessage[] = [
    { role: "system", content: baseSystemPrompt },
    { role: "user", content: prompt },
  ];

  if (options.responseFormat === "json_object") {
    const jsonResponse = await requestModelScope(config, baseMessages, "json_object");

    if (jsonResponse.ok) {
      const data = (await jsonResponse.json()) as ModelScopeResponse;
      return {
        content: extractContent(data),
        mode: "json_mode",
      };
    }

    const jsonErrorText = await parseError(jsonResponse);
    const shouldFallback =
      [400, 404, 415, 422].includes(jsonResponse.status) ||
      /response_format|json_object|unsupported/i.test(jsonErrorText);

    if (!shouldFallback) {
      logger.error(
        "llm",
        `ModelScope JSON request failed: ${jsonResponse.status}`,
        new Error(jsonErrorText)
      );
      throw new Error(`LLM_REQUEST_FAILED:${jsonResponse.status}`);
    }

    logger.warn("llm", "JSON mode unsupported, fallback to prompt_json", {
      status: jsonResponse.status,
    });

    const promptJsonMessages: ModelScopeMessage[] = [
      { role: "system", content: `${baseSystemPrompt}\n${STRICT_JSON_SYSTEM_PROMPT}` },
      { role: "user", content: prompt },
    ];

    const promptJsonResponse = await requestModelScope(config, promptJsonMessages);
    if (!promptJsonResponse.ok) {
      const promptJsonErrorText = await parseError(promptJsonResponse);
      logger.error(
        "llm",
        `ModelScope prompt_json request failed: ${promptJsonResponse.status}`,
        new Error(promptJsonErrorText)
      );
      throw new Error(`LLM_REQUEST_FAILED:${promptJsonResponse.status}`);
    }

    const promptJsonData = (await promptJsonResponse.json()) as ModelScopeResponse;
    return {
      content: extractContent(promptJsonData),
      mode: "prompt_json",
    };
  }

  const response = await requestModelScope(config, baseMessages);

  if (!response.ok) {
    const errorText = await parseError(response);
    logger.error("llm", `ModelScope request failed: ${response.status}`, new Error(errorText));
    throw new Error(`LLM_REQUEST_FAILED:${response.status}`);
  }

  const data = (await response.json()) as ModelScopeResponse;
  return {
    content: extractContent(data),
    mode: "plain_text",
  };
}
