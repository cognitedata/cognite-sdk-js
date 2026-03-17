---
id: 13
title: 'Retry: Client hardcodes max retries, ignoring validator config'
status: backlog
priority: medium
created: 2026-03-17T14:19:53.900343+01:00
updated: 2026-03-17T14:19:53.900343+01:00
tags:
    - discovery
    - retry
class: standard
---

Files: packages/core/src/httpClient/retryableHttpClient.ts:116, retryValidator.ts:23,31

The retry client hardcodes `retryCount < MAX_RETRY_ATTEMPTS` (5) at line 116 of retryableHttpClient.ts, while the validator factory accepts a `maxRetries` parameter. The effective max is always `min(5, maxRetries)`, so the validator's parameter can only reduce retries — never increase them.

This is misleading: someone configuring `createRetryValidator(endpoints, 10)` would expect 10 retries but silently gets capped at 5.

Fix: Remove the hardcoded check from the client and let the validator be the single source of truth for retry limits.
