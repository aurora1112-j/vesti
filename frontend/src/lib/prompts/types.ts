import type { Conversation, Message } from "../types";

export type PromptType = "conversationSummary" | "weeklyDigest";
export type PromptVariant = "current" | "experimental";

export interface ConversationSummaryPromptPayload {
  conversationTitle?: string;
  conversationPlatform?: string;
  conversationCreatedAt?: number;
  messages: Message[];
  locale?: "zh" | "en";
}

export interface WeeklyDigestPromptPayload {
  conversations: Conversation[];
  rangeStart: number;
  rangeEnd: number;
  selectedSummaries?: Array<{
    conversationId: number;
    summary: string;
  }>;
  maxConversations?: number;
  locale?: "zh" | "en";
}

export interface PromptVersion<TPayload> {
  version: string;
  createdAt: string;
  description: string;
  system: string;
  fallbackSystem?: string;
  userTemplate: (payload: TPayload) => string;
  fallbackTemplate: (payload: TPayload) => string;
}

export interface PromptPayloadMap {
  conversationSummary: ConversationSummaryPromptPayload;
  weeklyDigest: WeeklyDigestPromptPayload;
}

export type PromptConfig = {
  [K in keyof PromptPayloadMap]: PromptVersion<PromptPayloadMap[K]>;
};
