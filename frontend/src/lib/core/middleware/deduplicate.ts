import type { ConversationDraft, ParsedMessage } from "../../messaging/protocol";
import { db } from "../../db/schema";
import type { ConversationRecord, MessageRecord } from "../../db/schema";
import { enforceStorageWriteGuard } from "../../db/storageLimits";

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function buildParsedSignatures(messages: ParsedMessage[]): string[] {
  return messages.map((message) => `${message.role}|${normalizeText(message.textContent)}`);
}

function buildStoredSignatures(messages: MessageRecord[]): string[] {
  return [...messages]
    .sort((a, b) => {
      if (a.created_at !== b.created_at) return a.created_at - b.created_at;
      const aId = a.id ?? 0;
      const bId = b.id ?? 0;
      return aId - bId;
    })
    .map((message) => `${message.role}|${normalizeText(message.content_text)}`);
}

function signaturesMatch(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

function sanitizeIncomingMessages(messages: ParsedMessage[]): ParsedMessage[] {
  return messages.filter((message) => normalizeText(message.textContent).length > 0);
}

export async function deduplicateAndSave(
  conversation: ConversationDraft,
  messages: ParsedMessage[]
): Promise<{ saved: boolean; newMessages: number; conversationId?: number }> {
  const cleanMessages = sanitizeIncomingMessages(messages);
  if (cleanMessages.length === 0) {
    return { saved: false, newMessages: 0 };
  }

  await enforceStorageWriteGuard();

  return db.transaction("rw", db.conversations, db.messages, async () => {
    const existing = await db.conversations
      .where("uuid")
      .equals(conversation.uuid)
      .first();

    if (existing && existing.id !== undefined) {
      const existingMessages = await db.messages
        .where("conversation_id")
        .equals(existing.id)
        .toArray();

      const incomingSignatures = buildParsedSignatures(cleanMessages);
      const storedSignatures = buildStoredSignatures(existingMessages);

      if (signaturesMatch(incomingSignatures, storedSignatures)) {
        return { saved: false, newMessages: 0, conversationId: existing.id };
      }

      await db.messages.where("conversation_id").equals(existing.id).delete();

      const baseTimestamp = Date.now();
      const inserts: MessageRecord[] = cleanMessages.map((message, index) => ({
        conversation_id: existing.id!,
        role: message.role,
        content_text: message.textContent,
        created_at: message.timestamp ?? baseTimestamp + index,
      }));

      await db.messages.bulkAdd(inserts);

      // Keep user-renamed titles stable across recaptures.
      await db.conversations.update(existing.id, {
        updated_at: conversation.updated_at,
        message_count: cleanMessages.length,
        snippet: cleanMessages[0]?.textContent.slice(0, 100) ?? conversation.snippet,
      } as Partial<ConversationRecord>);

      return {
        saved: true,
        newMessages: Math.max(0, cleanMessages.length - existingMessages.length),
        conversationId: existing.id,
      };
    }

    const record: ConversationRecord = {
      ...conversation,
      message_count: cleanMessages.length,
      snippet: cleanMessages[0]?.textContent.slice(0, 100) ?? conversation.snippet,
    };

    const conversationId = await db.conversations.add(record);

    const baseTimestamp = Date.now();
    const inserts: MessageRecord[] = cleanMessages.map((message, index) => ({
      conversation_id: conversationId,
      role: message.role,
      content_text: message.textContent,
      created_at: message.timestamp ?? baseTimestamp + index,
    }));

    await db.messages.bulkAdd(inserts);

    return { saved: true, newMessages: cleanMessages.length, conversationId };
  });
}
