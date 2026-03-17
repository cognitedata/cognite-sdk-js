---
id: 16
title: 'Alignment: max_retries JS=5 vs Python=10'
status: todo
priority: medium
created: 2026-03-17T15:27:27.785854+01:00
updated: 2026-03-17T15:27:27.785854+01:00
tags:
    - discovery
    - retry
    - alignment
class: standard
---

File: packages/core/src/httpClient/retryValidator.ts

MAX_RETRY_ATTEMPTS is set to 5 (line 20). The Python SDK defaults to max_retries=10 (config.py line 24, 53).

This means the JS SDK gives up on transient errors twice as fast as the Python SDK. For customers experiencing intermittent 429/5xx errors, the JS SDK will fail where the Python SDK would succeed.

Fix: Change MAX_RETRY_ATTEMPTS from 5 to 10 to align with the Python SDK default.
