#!/usr/bin/env bash
set -euo pipefail

# Discovery loop: run Claude Code to find improvement opportunities in the SDK.
# Claude reads the kanban board, explores the codebase, and creates tasks for findings.
# No git/gh allowed — we're on a feature branch, no PRs yet.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Ensure kanban board exists
if ! kanban-md board --compact 2>/dev/null; then
  kanban-md init --name "cognite-sdk-js"
fi

PROMPT="You are running a discovery pass on the cognite-sdk-js codebase. Read AGENTS.md for project context.

RULES:
- You MUST NOT run any git or gh commands. Do not commit, push, create branches, or PRs.
- First run: kanban-md board --compact and kanban-md list --compact to see existing tasks.
- Do not duplicate tasks. If a finding is already on the board, skip it.
- When done, you may conclude that the discovery is complete and the kanban todo list is sufficient.
- You MAY update AGENTS.md with knowledge you learned (e.g. codebase structure, patterns, conventions) so future sessions have better context.

TASK: Explore the codebase and identify bad coding practices / improvement areas in these 4 focus areas:

1) Retry with exponential backoff and jitter
   Key files: packages/core/src/httpClient/retryableHttpClient.ts, retryValidator.ts, exponentialJitterBackoff.ts, packages/stable/src/retryValidator.ts

2) Error parsing (structured error types, error codes, messages)
   Key files: packages/core/src/error.ts, httpClient/httpError.ts, multiError.ts

3) Deduplication of duplicate calls
   Check if request-level deduplication exists. Key areas: HTTP client layer, API wrappers.

4) Batching + chunking
   Key files: packages/core/src/baseResourceApi.ts, packages/core/src/utils.ts, and API implementations in packages/stable/src/api/

For each finding:
- Create a kanban task: kanban-md create \"TITLE\" --tags discovery --body \"File: path/to/file.ts

Description: what's wrong and what the improvement would be\"
- Use appropriate priority: low, medium, high, critical
- Add a tag matching the area: retry, error-parsing, dedup, or batching

Do not overdo it. It is fine to land on \"the todo list in kanban is now complete\" when you have reviewed all 4 areas and either created tasks or confirmed existing tasks cover the findings."

claude -p \
  --dangerously-skip-permissions \
  --disallowedTools "Bash(git*)" "Bash(gh*)" \
  --max-turns 30 \
  "$PROMPT"
