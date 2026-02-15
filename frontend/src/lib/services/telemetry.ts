import type { Platform } from "../types";

export type CardActionType =
  | "copy_text"
  | "open_source_url"
  | "delete_conversation"
  | "rename_title";

export interface CardActionClickPayload {
  action_type: CardActionType;
  platform_source: Platform;
  has_full_text_cache: boolean | null;
  conversation_id: number;
}

const TELEMETRY_DEBUG = true;

export function trackCardActionClick(
  payload: CardActionClickPayload
): void {
  if (!TELEMETRY_DEBUG) return;
  console.info("[vesti.telemetry] card_action_click", payload);
}
