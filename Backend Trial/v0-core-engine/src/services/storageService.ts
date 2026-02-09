import type {
  Conversation,
  Message,
  DashboardStats,
  Platform,
} from "../types";
import { sendRequest } from "../messaging/runtime";

export async function getConversations(filters?: {
  platform?: Platform;
  search?: string;
  dateRange?: { start: number; end: number };
}): Promise<Conversation[]> {
  return sendRequest({
    type: "GET_CONVERSATIONS",
    target: "offscreen",
    payload: filters,
  });
}

export async function getMessages(
  conversationId: number
): Promise<Message[]> {
  return sendRequest({
    type: "GET_MESSAGES",
    target: "offscreen",
    payload: { conversationId },
  });
}

export async function deleteConversation(id: number): Promise<void> {
  await sendRequest({
    type: "DELETE_CONVERSATION",
    target: "offscreen",
    payload: { id },
  });
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return sendRequest({
    type: "GET_DASHBOARD_STATS",
    target: "offscreen",
  });
}

export async function getStorageUsage(): Promise<{ used: number; total: number }> {
  return sendRequest({
    type: "GET_STORAGE_USAGE",
    target: "offscreen",
  });
}

export async function exportData(format: "json"): Promise<Blob> {
  void format;
  const result = await sendRequest({
    type: "EXPORT_DATA",
    target: "offscreen",
    payload: { format: "json" },
  });
  return new Blob([result.json], { type: "application/json" });
}

export async function clearAllData(): Promise<void> {
  await sendRequest({
    type: "CLEAR_ALL_DATA",
    target: "offscreen",
  });
}
