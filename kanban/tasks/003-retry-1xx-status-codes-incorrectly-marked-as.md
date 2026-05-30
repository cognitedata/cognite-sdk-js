---
id: 3
title: 'Retry: 1xx status codes incorrectly marked as retryable'
status: done
priority: medium
created: 2026-03-17T14:09:18.182184+01:00
updated: 2026-03-17T14:49:14.553597+01:00
started: 2026-03-17T14:47:33.076133+01:00
completed: 2026-03-17T14:49:14.553597+01:00
tags:
    - discovery
    - retry
class: standard
---

File: packages/core/src/httpClient/retryValidator.ts:68-73

isValidRetryStatusCode() includes inRange(status, 100, 200) — meaning 1xx informational responses are considered retryable. These shouldn't normally reach this layer, and retrying them makes no sense. This range should be removed.
