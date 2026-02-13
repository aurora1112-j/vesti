import type { ChatSummaryData } from "~lib/types/insightsPresentation";

interface StructuredSummaryCardProps {
  data: ChatSummaryData;
}

function FallbackBadge() {
  return (
    <span className="inline-flex items-center rounded-md border border-border-subtle bg-bg-secondary px-2 py-0.5 text-[10px] font-medium text-text-tertiary">
      Fallback plain text
    </span>
  );
}

export function StructuredSummaryCard({ data }: StructuredSummaryCardProps) {
  return (
    <article className="rounded-lg border border-border-default bg-bg-primary p-4 text-vesti-sm leading-[1.7] text-text-primary">
      <header className="mb-4 grid gap-2">
        <h3 className="text-base font-semibold text-text-primary">{data.meta.title}</h3>
        <div className="flex flex-wrap items-center gap-2">
          {data.meta.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-md border border-border-subtle bg-bg-secondary px-2 py-0.5 text-[11px] font-medium text-text-secondary"
            >
              {tag}
            </span>
          ))}
          {data.meta.fallback && <FallbackBadge />}
        </div>
      </header>

      <section className="mb-4 rounded-r-md border-l-4 border-border-default bg-bg-secondary px-3 py-2.5">
        <p className="mb-1 text-vesti-sm text-text-primary">
          <span className="font-semibold">Q:</span> {data.core.problem}
        </p>
        <p className="text-vesti-sm text-text-primary">
          <span className="font-semibold">A:</span> {data.core.solution}
        </p>
      </section>

      <section className="mb-4">
        <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
          Process
        </h4>
        <ol className="list-inside list-decimal space-y-2 text-text-secondary">
          {data.process.map((item, index) => (
            <li key={`${item.step}-${index}`}>
              <span className="font-semibold text-text-primary">{item.step}:</span> {item.detail}
            </li>
          ))}
        </ol>
      </section>

      <hr className="my-4 border-border-subtle" />

      <section className="mb-4">
        <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
          Key Takeaways
        </h4>
        <ul className="list-inside list-disc space-y-1.5 text-text-secondary">
          {data.key_insights.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      </section>

      {data.action_items?.length ? (
        <section>
          <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
            Next Steps
          </h4>
          <ul className="space-y-2">
            {data.action_items.map((item, index) => (
              <li key={`${item}-${index}`} className="flex items-start gap-2 text-text-secondary">
                <input
                  aria-label={`action-item-${index + 1}`}
                  type="checkbox"
                  disabled
                  className="mt-1 h-3.5 w-3.5 rounded border-border-default"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
