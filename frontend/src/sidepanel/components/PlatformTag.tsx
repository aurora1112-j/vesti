import type { Platform } from "~lib/types";

const PLATFORM_STYLES: Record<Platform, { bg: string; text: string }> = {
  ChatGPT: {
    bg: "bg-chatgpt-bg",
    text: "text-chatgpt-text",
  },
  Claude: {
    bg: "bg-claude-bg",
    text: "text-claude-text",
  },
  Gemini: {
    bg: "bg-gemini-bg",
    text: "text-gemini-text",
  },
  DeepSeek: {
    bg: "bg-deepseek-bg",
    text: "text-deepseek-text",
  },
  Qwen: {
    bg: "bg-qwen-bg",
    text: "text-qwen-text",
  },
  Doubao: {
    bg: "bg-doubao-bg",
    text: "text-doubao-text",
  },
};

interface PlatformTagProps {
  platform: Platform;
  className?: string;
}

export function PlatformTag({ platform, className = "" }: PlatformTagProps) {
  const style = PLATFORM_STYLES[platform];
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-vesti-xs font-medium leading-none ${style.bg} ${style.text} ${className}`}
    >
      {platform}
    </span>
  );
}
