---
id: 2
title: 'Retry: POST endpoint list is stale and incomplete'
status: backlog
priority: medium
created: 2026-03-17T14:09:16.72831+01:00
updated: 2026-03-17T14:09:16.72831+01:00
tags:
    - discovery
    - retry
class: standard
---

File: packages/stable/src/retryValidator.ts

The ENDPOINTS_TO_RETRY list only covers a subset of safe POST endpoints (assets, events, files, timeseries). Newer APIs like records, instances, documents, containers, spaces, views, annotations, etc. are missing. Any new POST endpoint requires a manual update here.

Consider: Switch to an opt-out model (retry all POSTs to known-safe patterns like /list, /byids, /search) or use a decorator/annotation approach so each API declares its own retry policy.
