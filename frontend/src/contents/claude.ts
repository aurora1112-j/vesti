import type { PlasmoCSConfig } from "plasmo";
import { ClaudeParser } from "../lib/core/parser/claude/ClaudeParser";
import { ConversationObserver } from "../lib/core/observer/ConversationObserver";
import { CapturePipeline } from "../lib/core/pipeline/capturePipeline";
import { sendRequest } from "../lib/messaging/runtime";
import { logger } from "../lib/utils/logger";

export const config: PlasmoCSConfig = {
  matches: ["https://claude.ai/*"],
  run_at: "document_idle",
};

const parser = new ClaudeParser();
if (!parser.detect()) {
  logger.info("content", "Claude parser not detected on this page");
} else {
  const pipeline = new CapturePipeline(parser, async (payload) => {
    await sendRequest({
      type: "CAPTURE_CONVERSATION",
      target: "offscreen",
      payload,
    });
  });

  const observer = new ConversationObserver(parser, pipeline);
  observer.start();
  logger.info("content", "Claude capture started");
}
