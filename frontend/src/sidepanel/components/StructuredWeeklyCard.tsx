import type { WeeklyReportRecord } from "~lib/types";
import { formatRange, resolveTechTags } from "./insightUiUtils";

interface StructuredWeeklyCardProps {
  report: WeeklyReportRecord;
}

function FallbackBadge() {
  return (
    <span className="inline-flex items-center rounded-md bg-bg-secondary px-2 py-0.5 text-[10px] font-medium text-text-tertiary">
      Fallback plain text
    </span>
  );
}

export function StructuredWeeklyCard({ report }: StructuredWeeklyCardProps) {
  const structured = report.structured;
  const rangeLabel = formatRange(report.rangeStart, report.rangeEnd);

  if (!structured) {
    return (
      <div className="grid gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-text-tertiary">{rangeLabel}</span>
          {report.status === "fallback" && <FallbackBadge />}
        </div>
        <pre className="whitespace-pre-wrap font-sans text-vesti-sm leading-[1.7] text-text-primary">
          {report.content}
        </pre>
      </div>
    );
  }

  const tags = resolveTechTags(
    structured.tech_stack_detected,
    `${structured.period_title}\n${structured.main_themes.join("\n")}\n${structured.key_takeaways.join("\n")}`
  );

  return (
    <div className="grid gap-3 text-vesti-sm text-text-primary">
      <div className="grid gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-vesti-sm font-semibold text-text-primary">{structured.period_title}</h3>
          <span className="text-[11px] text-text-tertiary">{rangeLabel}</span>
          {report.status === "fallback" && <FallbackBadge />}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded-md border border-border-default bg-bg-secondary px-2 py-0.5 text-[10px] font-medium text-text-secondary"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="grid gap-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">Main Themes</p>
        <ul className="grid list-disc gap-1 pl-5 text-vesti-sm text-text-primary">
          {structured.main_themes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
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
