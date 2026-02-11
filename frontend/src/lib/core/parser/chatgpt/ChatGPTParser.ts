import type { IParser, ParsedMessage } from "../IParser";
import type { Platform } from "../../../types";
import {
  normalizeCandidateNodes,
  queryAllUnique,
  queryAllWithinUnique,
  queryFirst,
  queryFirstWithin,
  safeTextContent,
  uniqueNodesInDocumentOrder,
} from "../shared/selectorUtils";
import { logger } from "../../../utils/logger";

const SELECTORS = {
  roleAnchors: [
    "[data-message-author-role='user']",
    "[data-message-author-role='assistant']",
  ],
  turnBlocks: [
    "[data-testid^='conversation-turn']",
    "[data-testid*='conversation-turn']",
    "[data-message-id]",
  ],
  messageContent: [
    ".markdown",
    ".prose",
    "[data-testid*='message-content']",
    "[data-message-content]",
    "div[class*='markdown']",
  ],
  title: ["nav h1", "title"],
  generating: [
    ".result-streaming",
    "[data-testid='result-streaming']",
    "[data-testid*='streaming']",
    ".typing",
    "[data-is-streaming='true']",
  ],
  noiseContainers: [
    "form",
    "footer",
    "nav",
    "[role='navigation']",
    "[data-testid*='composer']",
    "[contenteditable='true']",
  ],
  noiseTextPatterns: [
    /^new chat$/i,
    /^search chats$/i,
    /^chatgpt can make mistakes\.?/i,
    /^upgrade plan$/i,
  ],
};

type MessageRole = "user" | "ai";

interface ParserStats {
  totalCandidates: number;
  keptMessages: number;
  roleDistribution: Record<MessageRole, number>;
  droppedUnknownRole: number;
  droppedNoise: number;
}

export class ChatGPTParser implements IParser {
  detect(): Platform | null {
    const host = window.location.hostname;
    if (host.includes("chatgpt.com") || host.includes("chat.openai.com")) {
      return "ChatGPT";
    }
    return null;
  }

  getConversationTitle(): string {
    const titleEl = queryFirst(SELECTORS.title);
    const title = safeTextContent(titleEl);
    if (title) return title;
    return document.title || "Untitled Conversation";
  }

  getMessages(): ParsedMessage[] {
    const rawCandidates = this.collectMessageCandidates();
    const normalized = normalizeCandidateNodes(rawCandidates, {
      minTextLength: 2,
      noiseContainerSelectors: SELECTORS.noiseContainers,
      noiseTextPatterns: SELECTORS.noiseTextPatterns,
    });

    const stats: ParserStats = {
      totalCandidates: rawCandidates.length,
      keptMessages: 0,
      roleDistribution: { user: 0, ai: 0 },
      droppedUnknownRole: 0,
      droppedNoise: normalized.droppedNoise,
    };

    const messages: ParsedMessage[] = [];
    for (const node of normalized.nodes) {
      const parsed = this.parseMessageNode(node);
      if (!parsed) {
        stats.droppedUnknownRole += 1;
        continue;
      }
      if (!parsed.textContent.trim()) {
        stats.droppedNoise += 1;
        continue;
      }

      messages.push(parsed);
      stats.keptMessages += 1;
      stats.roleDistribution[parsed.role] += 1;
    }

    this.logStats(stats, messages);
    return messages;
  }

  isGenerating(): boolean {
    return queryFirst(SELECTORS.generating) !== null;
  }

  getSessionUUID(): string {
    const match = window.location.pathname.match(/\/c\/([a-zA-Z0-9-]+)/);
    if (match && match[1]) return match[1];
    return `chatgpt-${Date.now()}`;
  }

  private collectMessageCandidates(): Element[] {
    const combinedCandidates: Element[] = [...queryAllUnique(SELECTORS.roleAnchors)];

    for (const turnNode of queryAllUnique(SELECTORS.turnBlocks)) {
      const splitNodes = queryAllWithinUnique(turnNode, SELECTORS.roleAnchors);
      if (splitNodes.length > 0) {
        combinedCandidates.push(...splitNodes);
        continue;
      }
      combinedCandidates.push(turnNode);
    }

    return uniqueNodesInDocumentOrder(combinedCandidates);
  }

  private parseMessageNode(node: Element): ParsedMessage | null {
    const role = this.inferRole(node);
    if (!role) return null;

    const contentEl = queryFirstWithin(node, SELECTORS.messageContent);
    const textContent = safeTextContent(contentEl ?? node);

    return {
      role,
      textContent,
      htmlContent: contentEl ? contentEl.innerHTML : undefined,
    };
  }

  private inferRole(node: Element): MessageRole | null {
    const ownRole = this.roleFromAttribute(node.getAttribute("data-message-author-role"));
    if (ownRole) return ownRole;

    const ownTestId = this.roleFromTestId(node.getAttribute("data-testid"));
    if (ownTestId) return ownTestId;

    const roleAncestor = node.parentElement?.closest("[data-message-author-role], [data-testid]");
    if (roleAncestor) {
      const ancestorRole = this.roleFromAttribute(
        roleAncestor.getAttribute("data-message-author-role"),
      );
      if (ancestorRole) return ancestorRole;

      const ancestorTestId = this.roleFromTestId(roleAncestor.getAttribute("data-testid"));
      if (ancestorTestId) return ancestorTestId;
    }

    return null;
  }

  private roleFromAttribute(value: string | null): MessageRole | null {
    if (!value) return null;
    const normalized = value.toLowerCase();
    if (normalized === "user") return "user";
    if (normalized === "assistant") return "ai";
    return null;
  }

  private roleFromTestId(value: string | null): MessageRole | null {
    if (!value) return null;
    const normalized = value.toLowerCase();
    if (normalized.includes("user") || normalized.includes("human")) return "user";
    if (
      normalized.includes("assistant") ||
      normalized.includes("chatgpt") ||
      normalized.includes("model")
    ) {
      return "ai";
    }
    return null;
  }

  private logStats(stats: ParserStats, messages: ParsedMessage[]): void {
    logger.info("parser", "ChatGPT parse stats", stats);

    if (messages.length === 0) return;

    const hasSingleRole =
      stats.roleDistribution.user === 0 || stats.roleDistribution.ai === 0;

    if (hasSingleRole) {
      logger.warn("parser", "ChatGPT parser captured only one role", {
        roleDistribution: stats.roleDistribution,
        samples: messages
          .slice(0, 3)
          .map((message) => message.textContent.replace(/\s+/g, " ").slice(0, 120)),
      });
    }
  }
}
