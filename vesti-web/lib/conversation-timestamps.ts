import type { Conversation } from './types';

type ConversationTimeLike = Pick<
  Conversation,
  'created_at' | 'updated_at' | 'source_created_at' | 'first_captured_at' | 'last_captured_at'
>;

export function getConversationSourceCreatedAt(
  conversation: ConversationTimeLike
): number | null {
  return typeof conversation.source_created_at === 'number'
    ? conversation.source_created_at
    : null;
}

export function getConversationFirstCapturedAt(
  conversation: ConversationTimeLike
): number {
  return typeof conversation.first_captured_at === 'number'
    ? conversation.first_captured_at
    : conversation.created_at;
}

export function getConversationCaptureFreshnessAt(
  conversation: ConversationTimeLike
): number {
  return typeof conversation.last_captured_at === 'number'
    ? conversation.last_captured_at
    : conversation.updated_at;
}

export function getConversationOriginAt(
  conversation: ConversationTimeLike
): number {
  return (
    getConversationSourceCreatedAt(conversation) ??
    getConversationFirstCapturedAt(conversation) ??
    conversation.created_at
  );
}
