---
id: 1
title: 'Retry: Honor Retry-After header on 429 responses'
status: backlog
priority: high
created: 2026-03-17T14:09:12.170629+01:00
updated: 2026-03-17T14:09:12.170629+01:00
tags:
    - discovery
    - retry
class: standard
---

File: packages/core/src/httpClient/retryableHttpClient.ts

The retry logic ignores the Retry-After header from 429 (Too Many Requests) responses. When the server tells the client how long to wait, the SDK should respect that instead of using its own exponential backoff calculation. This is especially important for rate-limited APIs where the server knows the optimal wait time.

Fix: In rawRequest(), after detecting a 429, check for a Retry-After header and use its value as the delay instead of the calculated backoff.
