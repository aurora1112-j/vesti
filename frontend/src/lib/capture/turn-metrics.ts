type MessageRoleLike = {
  role: "user" | "ai";
};

function toSafeNonNegativeInt(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }
  if (value <= 0) {
    return 0;
  }
  return Math.floor(value);
}

export function countAiTurns(messages: ReadonlyArray<MessageRoleLike>): number {
  let turns = 0;
  for (const message of messages) {
    if (message.role === "ai") {
      turns += 1;
    }
  }
  return turns;
}

export function resolveTurnCount(
  turnCount: unknown,
  messageCount: unknown
): number {
  const normalizedTurnCount = toSafeNonNegativeInt(turnCount);
  if (normalizedTurnCount > 0 || toSafeNonNegativeInt(messageCount) === 0) {
    return normalizedTurnCount;
  }
  return Math.floor(toSafeNonNegativeInt(messageCount) / 2);
}
