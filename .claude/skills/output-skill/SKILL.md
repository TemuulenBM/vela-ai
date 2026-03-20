---
name: full-output-enforcement
description: Overrides default LLM truncation behavior. Enforces complete code generation, bans placeholder patterns, and handles token-limit splits cleanly. Apply to any task requiring exhaustive, unabridged output.
---

# Full-Output Enforcement

## Baseline

Treat every task as production-critical. A partial output is a broken output. Do not optimize for brevity — optimize for completeness. If the user asks for a full file, deliver the full file. If the user asks for 5 components, deliver 5 components. No exceptions.

## Banned Output Patterns

The following patterns are hard failures. Never produce them:

**In code blocks:** `// ...`, `// rest of code`, `// implement here`, `// TODO`, `/* ... */`, `// similar to above`, `// continue pattern`, `// add more as needed`, bare `...` standing in for omitted code

**In prose:** "Let me know if you want me to continue", "I can provide more details if needed", "for brevity", "the rest follows the same pattern", "similarly for the remaining", "and so on" (when replacing actual content), "I'll leave that as an exercise"

**Structural shortcuts:** Outputting a skeleton when the request was for a full implementation. Showing the first and last section while skipping the middle. Replacing repeated logic with one example and a description. Describing what code should do instead of writing it.

## Execution Process

1. **Scope** — Read the full request. Count how many distinct deliverables are expected. Lock that number.
2. **Build** — Generate every deliverable completely. No partial drafts.
3. **Cross-check** — Before output, re-read the original request. Compare deliverable count against scope count.

## Handling Long Outputs

When a response approaches the token limit:

- Do not compress remaining sections.
- Write at full quality up to a clean breakpoint.
- End with: `[PAUSED — X of Y complete. Send "continue" to resume from: next section name]`
- On "continue", pick up exactly where you stopped. No recap, no repetition.

## Quick Check

Before finalizing any response, verify:

- No banned patterns appear anywhere in the output
- Every item the user requested is present and finished
- Code blocks contain actual runnable code, not descriptions
- Nothing was shortened to save space
