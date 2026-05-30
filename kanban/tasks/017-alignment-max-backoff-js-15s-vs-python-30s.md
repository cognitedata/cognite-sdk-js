---
id: 17
title: 'Alignment: max_backoff JS=15s vs Python=30s'
status: done
priority: medium
created: 2026-03-17T15:27:31.46703+01:00
updated: 2026-03-17T15:30:15.761413+01:00
started: 2026-03-17T15:30:15.761412+01:00
completed: 2026-03-17T15:30:15.761412+01:00
tags:
    - discovery
    - retry
    - alignment
class: standard
---

File: packages/core/src/httpClient/exponentialJitterBackoff.ts

maxDelayMs defaults to 15000ms (15s) at line 22. The Python SDK defaults to max_retry_backoff=30s (config.py line 27, 55).

With the JS cap at 15s, later retries are capped lower than in Python, reducing the time the SDK waits between attempts when the server is under heavy load. This could lead to more 429 responses and faster retry exhaustion.

Fix: Change the default maxDelayMs from 15000 to 30000 to align with the Python SDK.
