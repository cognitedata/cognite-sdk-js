# Task Tracking

Tasks are managed with [kanban-md](https://github.com/jmhobbs/kanban-md) in the `kanban/` directory.

## Setup (first time)

1. Install kanban-md: `brew install jmhobbs/tap/kanban-md` (or see the kanban-md docs for other install methods)
2. Initialize the board: `kanban-md init` inside this directory
3. Install the AI skill: `kanban-md skill install` — choose Claude Code

## Discovery loop

Run `./run-discovery-claude-loop.sh` to have Claude Code explore the codebase and create kanban tasks for improvement opportunities. The script forbids git/gh; it only reads code and manages the board.

## Execute loop

Run `./run-execute-claude-loop.sh` to have Claude Code implement tasks one by one. Picks from todo (then backlog), moves to in-progress, runs Claude to solve, Claude moves to done when complete. Git/gh allowed.

## Tag scheme

| Tag | Use |
|-----|-----|
| `discovery` | Findings from run-discovery-claude-loop.sh |
| `retry` | Retry / exponential backoff / jitter improvements |
| `error-parsing` | Structured error types, error codes, messages |
| `dedup` | Deduplication of duplicate calls |
| `batching` | Batching + chunking improvements |

## Discovery focus areas

The `run-discovery-claude-loop.sh` script explores these 4 areas:

1. **Retry with exponential backoff and jitter** — `packages/core/src/httpClient/retryableHttpClient.ts`, `retryValidator.ts`, `exponentialJitterBackoff.ts`, `packages/stable/src/retryValidator.ts`
2. **Error parsing** — `packages/core/src/error.ts`, `httpClient/httpError.ts`, `multiError.ts`
3. **Deduplication** — HTTP client layer, API wrappers (request-level dedup)
4. **Batching + chunking** — `packages/core/src/baseResourceApi.ts`, `packages/core/src/utils.ts`, API implementations in `packages/stable/src/api/`

## Codebase architecture (HTTP client layer)

The HTTP client uses a layered class hierarchy:

1. **BasicHttpClient** (`packages/core/src/httpClient/basicHttpClient.ts`) — thin wrapper over `cross-fetch`. Handles serialization (`JSON.stringify(data, null, 2)`), query params, response type dispatch.
2. **RetryableHttpClient** (extends BasicHttpClient) — adds retry loop with `ExponentialJitterBackoff` (AWS full-jitter algorithm: `random(0,1) * min(baseDelay * 2^(n+1), maxDelay)`, defaults 250ms–15s). Uses pluggable `retryValidator`.
3. **CDFHttpClient** (extends RetryableHttpClient) — adds CDF auth tokens, 401 refresh, one-time headers, cross-origin token filtering.

Key patterns:
- **Chunking**: `BaseResourceAPI.chunk()` splits items into groups of 1000 (returns `[[]]` for empty input — not `[]`). Parallel ops use `promiseAllAtOnce()` (Promise.all, no concurrency limit). Sequential ops use `promiseEachInSequence()` (fail-fast: first chunk error skips all remaining).
- **Chunk sizes vary by API**: default 1000, but DataPoints latest=100, DataPoints delete=10000, SyntheticTimeSeries=10, SequenceRows=10000, RawRows=5000.
- **Create/upsert** always run sequentially; **retrieve/update/delete** run in parallel.
- **Error aggregation**: `CogniteMultiError` collects successes + failures from chunked operations. Takes `status`/`requestId` from first error via unsafe cast.
- **Error parsing**: `handleErrorResponse()` in `error.ts` converts `HttpError` → `CogniteError`. Uses broad try/catch; drops `forbidden` and `isAutoRetryable` fields from API response.
- **Retry validator**: Allowlist of safe POST endpoints lives in `packages/stable/src/retryValidator.ts`. Idempotent methods (GET/HEAD/OPTIONS/DELETE/PUT) retry automatically on 429/5xx. Path matching uses loose `indexOf` substring match (no path-boundary check). Client hardcodes `MAX_RETRY_ATTEMPTS=5` in addition to validator's own `maxRetries` check.
- **`promiseCache()`** in `packages/core/src/utils.ts` — dedup utility that memoizes an in-flight promise. Exists but is **unused in production** (only tests).

## Conventions

- You may update this file with knowledge you learn (e.g. codebase structure, patterns, conventions) so future sessions have better context.
- Always set `--due YYYY-MM-DD` for tasks with a real deadline.
- Use tags to filter by context: `kanban-md list --compact --tag discovery`
- Priorities: `low`, `medium`, `high`, `critical`
- When creating tasks, default status is `backlog`; move to `todo` when ready to act on.
