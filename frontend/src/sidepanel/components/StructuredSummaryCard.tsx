import type { SummaryRecord } from "~lib/types";
import { resolveTechTags } from "./insightUiUtils";

const SENTIMENT_STYLES: Record<"neutral" | "positive" | "negative", string> = {
  neutral: "bg-bg-secondary text-text-secondary",
  positive: "bg-[hsl(var(--success)/0.16)] text-[hsl(var(--success))]",
  negative: "bg-[hsl(var(--danger)/0.16)] text-[hsl(var(--danger))]",
};

interface StructuredSummaryCardProps {
  summary: SummaryRecord;
}

function FallbackBadge() {
  return (
    <span className="inline-flex items-center rounded-md bg-bg-secondary px-2 py-0.5 text-[10px] font-medium text-text-tertiary">
      Fallback plain text
    </span>
  );
}

export function StructuredSummaryCard({ summary }: StructuredSummaryCardProps) {
  const structured = summary.structured;

  if (!structured) {
    return (
      <div className="grid gap-2">
        {summary.status === "fallback" && <FallbackBadge />}
        <pre className="whitespace-pre-wrap font-sans text-vesti-sm leading-[1.7] text-text-primary">
          {summary.content}
        </pre>
      </div>
    );
  }

  const techTags = resolveTechTags(
    structured.tech_stack_detected,
    `${structured.topic_title}\n${structured.key_takeaways.join("\n")}`
  );

  return (
    <div className="grid gap-3 text-vesti-sm text-text-primary">
      <div className="grid gap-2">
        <h3 className="text-vesti-sm font-semibold text-text-primary">{structured.topic_title}</h3>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${SENTIMENT_STYLES[structured.sentiment]}`}
          >
            {structured.sentiment}
          </span>
          {summary.status === "fallback" && <FallbackBadge />}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {techTags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded-md border border-border-default bg-bg-secondary px-2 py-0.5 text-[10px] font-medium text-text-secondary"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="grid gap-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
          Key Takeaways
        </p>
        <ul className="grid list-disc gap-1 pl-5 text-vesti-sm text-text-primary">
          {structured.key_takeaways.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      {structured.action_items?.length ? (
        <div className="grid gap-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
            Action Items
          </p>
          <ul className="grid list-disc gap-1 pl-5 text-vesti-sm text-text-primary">
            {structured.action_items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
