import { isRequestMessage } from "../messaging/protocol";
import type { RequestMessage, ResponseMessage } from "../messaging/protocol";
import { deduplicateAndSave } from "../core/middleware/deduplicate";
import {
  listConversations,
  listMessages,
  deleteConversation,
  getDashboardStats,
  getStorageUsage,
  exportAllDataAsJson,
  clearAllData,
} from "../db/repository";
import { logger } from "../utils/logger";

async function handleRequest(message: RequestMessage): Promise<ResponseMessage> {
  try {
    switch (message.type) {
      case "CAPTURE_CONVERSATION": {
        const result = await deduplicateAndSave(
          message.payload.conversation,
          message.payload.messages
        );
        return { ok: true, type: message.type, data: result };
      }
      case "GET_CONVERSATIONS": {
        const data = await listConversations(message.payload);
        return { ok: true, type: message.type, data };
      }
      case "GET_MESSAGES": {
        const data = await listMessages(message.payload.conversationId);
        return { ok: true, type: message.type, data };
      }
      case "DELETE_CONVERSATION": {
        const deleted = await deleteConversation(message.payload.id);
        return { ok: true, type: message.type, data: { deleted } };
      }
      case "GET_DASHBOARD_STATS": {
        const data = await getDashboardStats();
        return { ok: true, type: message.type, data };
      }
      case "GET_STORAGE_USAGE": {
        const data = await getStorageUsage();
        return { ok: true, type: message.type, data };
      }
      case "EXPORT_DATA": {
        const json = await exportAllDataAsJson();
        return { ok: true, type: message.type, data: { json } };
      }
      case "CLEAR_ALL_DATA": {
        const cleared = await clearAllData();
        return { ok: true, type: message.type, data: { cleared } };
      }
      default:
        return {
          ok: false,
          type: message.type,
          error: `Unsupported message type: ${message.type}`,
        };
    }
  } catch (error) {
    logger.error("offscreen", "Request failed", error as Error);
    return {
      ok: false,
      type: message.type,
      error: (error as Error).message || "Unknown error",
    };
  }
}

chrome.runtime.onMessage.addListener(
  (message: unknown, _sender, sendResponse) => {
    if (!isRequestMessage(message)) return;
    if (message.target !== "offscreen") return;

    void (async () => {
      const response = await handleRequest(message);
      sendResponse(response);
    })();

    return true;
  }
);

logger.info("offscreen", "Offscreen handler initialized");
