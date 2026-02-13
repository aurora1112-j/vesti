// ============================================================
// --- types/index.ts ---
// All interface definitions for Vesti (kept in sync with frontend)
// ============================================================

export type Platform = "ChatGPT" | "Claude" | "Gemini" | "DeepSeek";

export interface Conversation {
  id: number;
  uuid: string;
  platform: Platform;
  title: string;
  snippet: string;
  url: string;
  created_at: number;
  updated_at: number;
  message_count: number;
  is_archived: boolean;
  is_trash: boolean;
  tags: string[];
}

export interface Message {
  id: number;
  conversation_id: number;
  role: "user" | "ai";
  content_text: string;
  created_at: number;
}

export interface DashboardStats {
  totalConversations: number;
  totalTokens: number;
  activeStreak: number;
  todayCount: number;
  platformDistribution: Record<Platform, number>;
  heatmapData: { date: string; count: number }[];
}

export type CapsuleState = "RECORDING" | "STANDBY" | "PAUSED" | "SAVED";

export type CaptureMode = "full_mirror" | "smart_denoise" | "curator";

export type PageId = "timeline" | "insights" | "dashboard" | "settings";

export type LlmProvider = "modelscope";
export type LlmAccessMode = "demo_proxy" | "custom_byok";
export type StreamMode = "off" | "on";
export type ReasoningPolicy = "off" | "auto" | "force";
export type CapabilitySource = "model_id_heuristic" | "provider_catalog";
export type ThinkHandlingPolicy = "strip" | "keep_debug" | "keep_raw";

export interface LlmConfig {
  provider: LlmProvider;
  baseUrl: string;
  apiKey: string;
  modelId: string;
  temperature: number;
  maxTokens: number;
  updatedAt: number;
  mode?: LlmAccessMode;
  proxyUrl?: string;
  gatewayLock?: "modelscope";
  customModelId?: string;
  streamMode?: StreamMode;
  reasoningPolicy?: ReasoningPolicy;
  capabilitySource?: CapabilitySource;
  thinkHandlingPolicy?: ThinkHandlingPolicy;
}

export type InsightFormat = "plain_text" | "structured_v1" | "fallback_plain_text";
export type InsightStatus = "ok" | "fallback";

export interface ConversationSummaryV1 {
  topic_title: string;
  key_takeaways: string[];
  sentiment: "neutral" | "positive" | "negative";
  action_items?: string[];
  tech_stack_detected: string[];
}

export interface WeeklyReportV1 {
  period_title: string;
  main_themes: string[];
  key_takeaways: string[];
  action_items?: string[];
  tech_stack_detected: string[];
}

export interface SummaryRecord {
  id: number;
  conversationId: number;
  content: string;
  structured?: ConversationSummaryV1 | null;
  format?: InsightFormat;
  status?: InsightStatus;
  schemaVersion?: "conversation_summary.v1";
  modelId: string;
  createdAt: number;
  sourceUpdatedAt: number;
}

export interface WeeklyReportRecord {
  id: number;
  rangeStart: number;
  rangeEnd: number;
  content: string;
  structured?: WeeklyReportV1 | null;
  format?: InsightFormat;
  status?: InsightStatus;
  schemaVersion?: "weekly_report.v1";
  modelId: string;
  createdAt: number;
  sourceHash: string;
}

export type AsyncStatus = "idle" | "loading" | "ready" | "error";
