import type { ConversationDraft, ParsedMessage } from "../messaging/protocol";
import type { CaptureDecisionMeta, Platform } from "../types";

export interface TransientCapturePayload {
  conversation: ConversationDraft;
  messages: ParsedMessage[];
}

export interface TransientCaptureStatusSnapshot {
  available: boolean;
  reason: "ok" | "no_transient";
  platform?: Platform;
  sessionUUID?: string;
  transientKey?: string;
  messageCount?: number;
  turnCount?: number;
  lastDecision?: CaptureDecisionMeta;
  updatedAt?: number;
}

interface TransientCaptureState {
  payload: TransientCapturePayload | null;
  lastDecision?: CaptureDecisionMeta;
  updatedAt?: number;
}

function buildTransientKey(platform: Platform, sessionUUID: string): string {
  const suffix = sessionUUID.trim() ? sessionUUID.trim() : "pending";
  return `${platform}:${suffix}`;
}

export function createTransientCaptureStore() {
  const state: TransientCaptureState = {
    payload: null,
  };

  return {
    setPayload(payload: TransientCapturePayload) {
      state.payload = {
        conversation: payload.conversation,
        messages: payload.messages,
      };
      state.updatedAt = Date.now();
    },

    setDecision(decision: CaptureDecisionMeta) {
      state.lastDecision = decision;
      state.updatedAt = Date.now();
    },

    getPayload(): TransientCapturePayload | null {
      return state.payload;
    },

    getStatus(): TransientCaptureStatusSnapshot {
      if (!state.payload) {
        return {
          available: false,
          reason: "no_transient",
          lastDecision: state.lastDecision,
          updatedAt: state.updatedAt,
        };
      }

      const { conversation, messages } = state.payload;
      const sessionUUID = conversation.uuid.trim() || undefined;
      const transientKey = buildTransientKey(conversation.platform, conversation.uuid);

      return {
        available: true,
        reason: "ok",
        platform: conversation.platform,
        sessionUUID,
        transientKey,
        messageCount: messages.length,
        turnCount: Math.floor(messages.length / 2),
        lastDecision: state.lastDecision,
        updatedAt: state.updatedAt,
      };
    },
  };
}
