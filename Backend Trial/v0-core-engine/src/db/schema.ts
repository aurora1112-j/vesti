import Dexie, { Table } from "dexie";
import type { Conversation, Message } from "../types";

export type ConversationRecord = Omit<Conversation, "id"> & { id?: number };
export type MessageRecord = Omit<Message, "id"> & { id?: number };

export class MemoryHubDB extends Dexie {
  conversations!: Table<ConversationRecord, number>;
  messages!: Table<MessageRecord, number>;

  constructor() {
    super("MemoryHubDB");
    this.version(1).stores({
      conversations:
        "++id, platform, title, created_at, updated_at, uuid, [platform+created_at]",
      messages:
        "++id, conversation_id, role, created_at, [conversation_id+created_at]",
    });
  }
}

export const db = new MemoryHubDB();
