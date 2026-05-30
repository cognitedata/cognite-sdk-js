#!/usr/bin/env bash
set -euo pipefail

# Discovery loop: run Claude Code to find improvement opportunities in the SDK.
# Claude reads the kanban board, explores the codebase, and creates tasks for findings.
# No git/gh allowed — we're on a feature branch, no PRs yet.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Force session auth: headless mode (-p) otherwise prefers ANTHROPIC_API_KEY over
# Cognite Enterprise session, which fails if the key is invalid or unset.
unset ANTHROPIC_API_KEY

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

ALIGNMENT: The Python SDK is cloned at cognite-sdk-python/ and serves as the reference for concrete values. Flag misalignments in tunable parameters only: backoff_factor, max_backoff, max_retries, status_forcelist, error fields (code, isAutoRetryable). Do NOT flag architectural differences (sequential vs parallel, concurrency limits, fail-fast behavior). Python SDK key files: cognite/client/_http_client.py, cognite/client/exceptions.py, cognite/client/_api_client.py, cognite/client/config.py.

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
- Add tags: discovery, plus the area (retry, error-parsing, dedup, or batching). For alignment findings, add alignment too (e.g. --tags discovery,retry,alignment)

Look at existing tasks and review architecture and identify patterns. You can update tasks.

Do not overdo it. It is fine to land on \"the todo list in kanban is now complete\" when you have reviewed all 4 areas and either created tasks or confirmed existing tasks cover the findings."


echo "Running Claude discovery (may take 1-2 min for first response)..."
claude -p \
  --dangerously-skip-permissions \
  --disallowedTools "Bash(git*)" "Bash(gh*)" \
  --max-turns 30 \
  "$PROMPT"
