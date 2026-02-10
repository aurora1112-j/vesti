import { useState } from "react";
import { MessageSquare, Trash2 } from "lucide-react";
import type { Conversation } from "~lib/types";
import { PlatformTag } from "./PlatformTag";

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

interface ConversationCardProps {
  conversation: Conversation;
  onClick: () => void;
  onDelete?: (id: number) => void;
}

export function ConversationCard({
  conversation,
  onClick,
  onDelete,
}: ConversationCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onFocus={() => setIsHovered(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setIsHovered(false);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group w-full cursor-pointer rounded-md p-3 text-left transition-all duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus ${
        isHovered ? "bg-surface-card-hover shadow-card-hover" : "bg-surface-card"
      }`}
    >
      <div className="flex items-center justify-between">
        <PlatformTag platform={conversation.platform} />
        <span className="text-vesti-xs text-text-tertiary">
          {formatRelativeTime(conversation.updated_at)}
        </span>
      </div>

      <h3 className="mt-1.5 truncate text-vesti-base font-medium text-text-primary tracking-tight">
        {conversation.title}
      </h3>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-150 ease-in-out ${
          isHovered ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="mt-1.5 line-clamp-2 text-vesti-sm text-text-secondary leading-[1.5]">
            {conversation.snippet}
          </p>

          <div className="mt-2 flex items-center justify-between">
            <span className="flex items-center gap-1 text-vesti-xs text-text-tertiary">
              <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.75} />
              {conversation.message_count} turns
            </span>

            <button
              type="button"
              aria-label="Delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(conversation.id);
              }}
              className="flex h-6 w-6 items-center justify-center rounded-sm text-text-tertiary transition-colors duration-[120ms] hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
