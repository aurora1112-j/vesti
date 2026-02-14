import type { WeeklySummaryData } from "~lib/types/insightsPresentation";

interface StructuredWeeklyCardProps {
  data: WeeklySummaryData;
}

function FallbackBadge() {
  return (
    <span className="tag-paper inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium text-text-tertiary font-sans">
      Fallback plain text
    </span>
  );
}

function LiteBoundaryBadge({ insufficientData }: { insufficientData: boolean }) {
  return (
    <span className="tag-paper inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium text-text-secondary font-sans">
      {insufficientData ? "Weekly Lite · Insufficient Data" : "Weekly Lite"}
    </span>
  );
}

function SectionEyebrow({ children }: { children: string }) {
  return (
    <h4 className="mb-3 text-[12px] font-medium uppercase tracking-[0.05em] text-text-secondary font-sans">
      {children}
    </h4>
  );
}

export function StructuredWeeklyCard({ data }: StructuredWeeklyCardProps) {
  return (
    <article className="vesti-artifact card-shadow-warm rounded-card border border-border-subtle bg-bg-surface px-6 py-6 text-body-lg text-text-primary">
      <header className="mb-6 grid gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[20px] leading-[1.4] text-text-primary font-medium">
            {data.meta.title}
          </h3>
          {data.meta.range_label && (
            <span className="text-[13px] text-text-secondary font-sans">{data.meta.range_label}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <LiteBoundaryBadge insufficientData={data.insufficient_data} />
          {data.meta.tags.map((tag) => (
            <span
              key={tag}
              className="tag-paper inline-flex items-center rounded-[6px] px-2 py-0.5 text-[13px] font-medium text-text-secondary font-sans"
            >
              {tag}
            </span>
          ))}
          {data.meta.fallback && <FallbackBadge />}
        </div>
      </header>

      {data.insufficient_data && (
        <section className="mb-6 rounded-lg border border-border-subtle bg-bg-secondary/70 px-4 py-3 font-sans text-[13px] leading-[1.5] text-text-secondary">
          Weekly Lite 边界提示：本周可用样本较少，本报告仅提供轻量复盘与下一步建议，不包含长期趋势判断。
        </section>
      )}

      <section className="mb-6">
        <SectionEyebrow>Highlights</SectionEyebrow>
        <ul className="list-disc space-y-3 pl-6 text-text-primary">
          {data.highlights.map((item, index) => (
            <li key={`${item}-${index}`} className="pl-1">
              {item}
            </li>
          ))}
        </ul>
      </section>

      {data.recurring_questions.length > 0 && (
        <section className="mb-6">
          <SectionEyebrow>Recurring Questions</SectionEyebrow>
          <ul className="list-disc space-y-3 pl-6 text-text-primary">
            {data.recurring_questions.map((item, index) => (
              <li key={`${item}-${index}`} className="pl-1">
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.unresolved_threads.length > 0 && (
        <section className="mb-6">
          <SectionEyebrow>Unresolved Threads</SectionEyebrow>
          <ul className="list-disc space-y-3 pl-6 text-text-primary">
            {data.unresolved_threads.map((item, index) => (
              <li key={`${item}-${index}`} className="pl-1">
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-6">
        <SectionEyebrow>Suggested Focus</SectionEyebrow>
        <ul className="space-y-3">
          {data.suggested_focus.map((item, index) => (
            <li key={`${item}-${index}`} className="flex items-start gap-2 text-text-primary">
              <input
                aria-label={`weekly-action-item-${index + 1}`}
                type="checkbox"
                disabled
                className="mt-1 h-3.5 w-3.5 rounded border-border-default"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {data.evidence.length > 0 && (
        <section>
          <SectionEyebrow>Evidence</SectionEyebrow>
          <ul className="space-y-2 text-[13px] leading-[1.5] text-text-secondary font-sans">
            {data.evidence.map((item, index) => (
              <li key={`${item.conversation_id}-${index}`}>
                #{item.conversation_id}: {item.note}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
