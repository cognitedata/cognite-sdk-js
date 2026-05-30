---
id: 12
title: 'Retry: Path matching uses loose substring — could match wrong endpoints'
status: done
priority: high
created: 2026-03-17T14:19:50.61468+01:00
updated: 2026-03-17T14:33:25.307052+01:00
started: 2026-03-17T14:30:48.124213+01:00
completed: 2026-03-17T14:33:25.307052+01:00
tags:
    - discovery
    - retry
class: standard
---

File: packages/core/src/httpClient/retryValidator.ts:80-82

`matchPathWithEndpoint` uses `indexOf` substring matching:
```ts
function matchPathWithEndpoint(path: string, endpoint: string) {
  return path.toUpperCase().indexOf(endpoint.toUpperCase()) !== -1;
}
```

This means endpoint `/assets/list` would match a path containing `/reassets/listing`. No path boundary checking is done.

Fix: Use path-segment-aware matching (e.g. check for leading `/` boundary) to avoid false positives that could retry non-idempotent endpoints.
