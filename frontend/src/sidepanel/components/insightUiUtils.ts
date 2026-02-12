const TECH_KEYWORDS: Array<{ keyword: RegExp; label: string }> = [
  { keyword: /\breact\b/i, label: "React" },
  { keyword: /typescript|\bts\b/i, label: "TypeScript" },
  { keyword: /plasmo/i, label: "Plasmo" },
  { keyword: /tailwind/i, label: "Tailwind CSS" },
  { keyword: /indexeddb|dexie/i, label: "IndexedDB" },
  { keyword: /chrome extension|mv3|manifest/i, label: "Chrome Extension" },
  { keyword: /modelscope|qwen/i, label: "ModelScope" },
  { keyword: /python/i, label: "Python" },
  { keyword: /node\.js|nodejs|node /i, label: "Node.js" },
  { keyword: /zod/i, label: "Zod" },
  { keyword: /parser|selector/i, label: "Parser" },
];

function normalizeTag(tag: string): string {
  return tag.replace(/\s+/g, " ").trim();
}

function dedupe(tags: string[]): string[] {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const tag of tags) {
    const normalized = normalizeTag(tag);
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(normalized);
  }
  return output;
}

export function inferTechTagsFromText(text: string): string[] {
  const tags: string[] = [];
  for (const item of TECH_KEYWORDS) {
    if (item.keyword.test(text)) {
      tags.push(item.label);
    }
    if (tags.length >= 3) break;
  }
  return dedupe(tags);
}

export function resolveTechTags(
  explicitTags: string[] | undefined,
  fallbackText: string
): string[] {
  const explicit = dedupe(explicitTags ?? []).slice(0, 6);
  if (explicit.length > 0) return explicit;

  const inferred = inferTechTagsFromText(fallbackText);
  if (inferred.length > 0) return inferred;

  return ["General"];
}

export function formatRange(rangeStart: number, rangeEnd: number): string {
  const start = new Date(rangeStart).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const end = new Date(rangeEnd).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return `${start} - ${end}`;
}
