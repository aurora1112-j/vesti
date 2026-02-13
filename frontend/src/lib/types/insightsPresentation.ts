export interface SummaryMetaData {
  title: string;
  generated_at: string;
  tags: string[];
  fallback: boolean;
}

export interface SummaryProcessStep {
  step: string;
  detail: string;
}

export interface ChatSummaryData {
  meta: SummaryMetaData;
  core: {
    problem: string;
    solution: string;
  };
  process: SummaryProcessStep[];
  key_insights: string[];
  action_items?: string[];
  plain_text?: string;
}

export interface WeeklySummaryData {
  meta: SummaryMetaData & {
    range_label: string;
  };
  core: {
    problem: string;
    solution: string;
  };
  process: SummaryProcessStep[];
  key_insights: string[];
  action_items?: string[];
  plain_text?: string;
}
