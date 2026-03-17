---
id: 8
title: 'Dedup: No request-level deduplication in HTTP client'
status: backlog
priority: medium
created: 2026-03-17T14:09:40.853998+01:00
updated: 2026-03-17T14:09:40.853998+01:00
tags:
    - discovery
    - dedup
class: standard
---

Files: packages/core/src/httpClient/basicHttpClient.ts, packages/core/src/utils.ts

There is no request deduplication in the HTTP client layer. If two callers simultaneously request the same resource (e.g., client.assets.retrieve([{id: 123}])), two separate HTTP requests are sent. A promiseCache utility exists in utils.ts (line 72) but is not used for API calls.

Improvement: Add an optional dedup layer (keyed by method+path+body hash) to the HTTP client that coalesces identical in-flight requests into a single fetch. This is particularly valuable for GET-like POST endpoints (/list, /byids, /search).
