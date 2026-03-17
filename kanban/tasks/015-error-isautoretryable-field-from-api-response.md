---
id: 15
title: 'Error: isAutoRetryable field from API response silently dropped'
status: backlog
priority: low
created: 2026-03-17T14:20:01.688174+01:00
updated: 2026-03-17T14:20:01.688174+01:00
tags:
    - discovery
    - error-parsing
class: standard
---

Files: packages/core/src/httpClient/httpError.ts:8, packages/core/src/error.ts:69-92

The `HttpErrorData` interface defines `isAutoRetryable?: boolean` but `handleErrorResponse` never extracts it and `CogniteError` has no property for it.

The CDF API provides this hint to indicate whether a failed request can be automatically retried. Dropping it means the retry validator can't use server-side guidance to make better retry decisions.

Fix: Extract `isAutoRetryable` in `handleErrorResponse`, add it to `CogniteError`, and optionally wire it into the retry validator.
