// ============================================================
// --- components/PlatformTag.tsx ---
// Pure display component: renders a colored capsule tag per platform
// ============================================================
"use client";

import type { Platform } from "@/types";

const PLATFORM_STYLES: Record<
  Platform,
  { bg: string; text: string; border: string }
> = {
  ChatGPT: {
    bg: "bg-chatgpt-bg",
    text: "text-chatgpt-text",
    border: "border-chatgpt-border",
  },
  Claude: {
    bg: "bg-claude-bg",
    text: "text-claude-text",
    border: "border-claude-border",
  },
  Gemini: {
    bg: "bg-gemini-bg",
    text: "text-gemini-text",
    border: "border-gemini-border",
  },
  DeepSeek: {
    bg: "bg-deepseek-bg",
    text: "text-deepseek-text",
    border: "border-deepseek-border",
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
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-vesti-xs font-medium leading-none ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      {platform}
    </span>
  );
}
