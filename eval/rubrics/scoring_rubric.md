# Prompt Eval Scoring Rubric

## Metrics
- **format_compliance_rate**: structured output parsed and required fields are present.
- **information_coverage_rate**: share of required facts covered by candidate output.
- **hallucination_rate**: share of forbidden facts incorrectly introduced by candidate output.
- **user_satisfaction**: heuristic 1-5 score derived from format, coverage, hallucination, and actionability.

## Suggested Gate
- format compliance >= 98
- information coverage >= 85
- hallucination <= 8
- user satisfaction >= 4.0

## Notes
- This suite is a sidecar and does not mutate production data.
- Use `--mode=live` with provider credentials for real prompt regression checks.
- Use `--update-baseline` after manually validating a new trusted run.
