import type { PlasmoCSConfig } from "plasmo";
import { ChatGPTParser } from "../lib/core/parser/chatgpt/ChatGPTParser";
import { ConversationObserver } from "../lib/core/observer/ConversationObserver";
import { CapturePipeline } from "../lib/core/pipeline/capturePipeline";
import { sendRequest } from "../lib/messaging/runtime";
import { logger } from "../lib/utils/logger";

export const config: PlasmoCSConfig = {
  matches: ["https://chatgpt.com/*", "https://chat.openai.com/*"],
  run_at: "document_idle",
};

const parser = new ChatGPTParser();
if (!parser.detect()) {
  logger.info("content", "ChatGPT parser not detected on this page");
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
  logger.info("content", "ChatGPT capture started");
}
