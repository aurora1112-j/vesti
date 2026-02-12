
import { isRequestMessage } from "../lib/messaging/protocol";
import type { RequestMessage, ResponseMessage } from "../lib/messaging/protocol";
import { deduplicateAndSave } from "../lib/core/middleware/deduplicate";
import {
  listConversations,
  listMessages,
  deleteConversation,
  getDashboardStats,
  getStorageUsage,
  exportAllDataAsJson,
  clearAllData,
  getSummary,
  getWeeklyReport,
} from "../lib/db/repository";
import { getLlmSettings, setLlmSettings } from "../lib/services/llmSettingsService";
import { callModelScope } from "../lib/services/llmService";
import {
  generateConversationSummary,
  generateWeeklyReport,
} from "../lib/services/insightGenerationService";
import type { LlmConfig } from "../lib/types";
import { logger } from "../lib/utils/logger";

function requireSettings(settings: LlmConfig | null): LlmConfig {
  if (!settings) {
    throw new Error("LLM_CONFIG_MISSING");
  }
  if (!settings.apiKey || !settings.modelId || !settings.baseUrl) {
    throw new Error("LLM_CONFIG_MISSING");
  }
  return settings;
}

async function handleRequest(message: RequestMessage): Promise<ResponseMessage> {
  const messageType = message.type;
  try {
    switch (message.type) {
      case "CAPTURE_CONVERSATION": {
        const result = await deduplicateAndSave(
          message.payload.conversation,
          message.payload.messages
        );
        return { ok: true, type: messageType, data: result };
      }
      case "GET_CONVERSATIONS": {
        const data = await listConversations(message.payload);
        return { ok: true, type: messageType, data };
      }
      case "GET_MESSAGES": {
        const data = await listMessages(message.payload.conversationId);
        return { ok: true, type: messageType, data };
      }
      case "DELETE_CONVERSATION": {
        const deleted = await deleteConversation(message.payload.id);
        return { ok: true, type: messageType, data: { deleted } };
      }
      case "GET_DASHBOARD_STATS": {
        const data = await getDashboardStats();
        return { ok: true, type: messageType, data };
      }
      case "GET_STORAGE_USAGE": {
        const data = await getStorageUsage();
        return { ok: true, type: messageType, data };
      }
      case "EXPORT_DATA": {
        const json = await exportAllDataAsJson();
        return { ok: true, type: messageType, data: { json } };
      }
      case "CLEAR_ALL_DATA": {
        const cleared = await clearAllData();
        return { ok: true, type: messageType, data: { cleared } };
      }
      case "GET_LLM_SETTINGS": {
        const settings = await getLlmSettings();
        return { ok: true, type: messageType, data: { settings } };
      }
      case "SET_LLM_SETTINGS": {
        await setLlmSettings(message.payload.settings);
        return { ok: true, type: messageType, data: { saved: true } };
      }
      case "TEST_LLM_CONNECTION": {
        const settings = requireSettings(await getLlmSettings());
        const result = await callModelScope(settings, "Reply with OK only.");
        return {
          ok: true,
          type: messageType,
          data: { ok: true, message: result.content },
        };
      }
      case "GET_CONVERSATION_SUMMARY": {
        const data = await getSummary(message.payload.conversationId);
        return { ok: true, type: messageType, data };
      }
      case "GENERATE_CONVERSATION_SUMMARY": {
        const settings = requireSettings(await getLlmSettings());
        const record = await generateConversationSummary(
          settings,
          message.payload.conversationId
        );
        return { ok: true, type: messageType, data: record };
      }
      case "GET_WEEKLY_REPORT": {
        const data = await getWeeklyReport(
          message.payload.rangeStart,
          message.payload.rangeEnd
        );
        return { ok: true, type: messageType, data };
      }
      case "GENERATE_WEEKLY_REPORT": {
        const settings = requireSettings(await getLlmSettings());
        const record = await generateWeeklyReport(
          settings,
          message.payload.rangeStart,
          message.payload.rangeEnd
        );
        return { ok: true, type: messageType, data: record };
      }
      default:
        return {
          ok: false,
          type: messageType,
          error: `Unsupported message type: ${messageType}`,
        };
    }
  } catch (error) {
    logger.error("background", "Request failed", error as Error);
    return {
      ok: false,
      type: messageType,
      error: (error as Error).message || "Unknown error",
    };
  }
}

function openSidepanelForTab(tabId: number): void {
  if (!chrome?.sidePanel?.open) {
    logger.warn("background", "sidePanel API not available");
    return;
  }
  chrome.sidePanel.setOptions({ tabId, path: "sidepanel.html", enabled: true }, () => {
    chrome.sidePanel.open({ tabId }, () => {
      void chrome.runtime.lastError;
    });
  });
}

chrome.runtime.onMessage.addListener((message: unknown, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  if (!message || typeof message !== "object") return;
  const type = (message as { type?: string }).type;
  if (type !== "OPEN_SIDEPANEL") return;

  const tabId = sender.tab?.id;
  if (typeof tabId === "number") {
    openSidepanelForTab(tabId);
    sendResponse?.({ ok: true });
    return;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeId = tabs[0]?.id;
    if (typeof activeId === "number") {
      openSidepanelForTab(activeId);
    }
    sendResponse?.({ ok: true });
  });

  return true;
});
chrome.runtime.onMessage.addListener(
  (message: unknown, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    if (!isRequestMessage(message)) return;
    if (message.target !== "offscreen") return;

    void (async () => {
      const response = await handleRequest(message);
      sendResponse(response);
    })();

    return true;
  }
);

