---
id: 9
title: 'Batching: No concurrency limit for parallel chunked requests'
status: done
priority: high
created: 2026-03-17T14:09:44.003129+01:00
updated: 2026-03-17T14:35:52.196657+01:00
started: 2026-03-17T14:33:33.833988+01:00
completed: 2026-03-17T14:35:52.196657+01:00
tags:
    - discovery
    - batching
class: standard
---

File: packages/core/src/utils.ts:92-140, packages/core/src/baseResourceApi.ts:386-405

promiseAllAtOnce() fires ALL chunk requests simultaneously with no concurrency limit. For large datasets (e.g., 100k items at chunk size 1000 = 100 concurrent requests), this can overwhelm the API, trigger rate limiting, and create memory pressure from buffering all responses.

Fix: Add a concurrency limiter (e.g., max 5-10 concurrent requests) to promiseAllAtOnce, using a semaphore or p-limit pattern. The concurrency limit should be configurable.
