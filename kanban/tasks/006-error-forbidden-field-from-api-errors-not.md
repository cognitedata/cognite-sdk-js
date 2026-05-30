---
id: 6
title: 'Error: forbidden field from API errors not preserved'
status: done
priority: low
created: 2026-03-17T14:09:30.612221+01:00
updated: 2026-03-17T15:07:18.265485+01:00
started: 2026-03-17T15:05:40.894078+01:00
completed: 2026-03-17T15:07:18.265485+01:00
tags:
    - discovery
    - error-parsing
class: standard
---

File: packages/core/src/error.ts, packages/core/src/httpClient/httpError.ts

HttpErrorData.error includes a forbidden?: object[] field, but handleErrorResponse() and CogniteError don't extract or store it. When the API returns a 403 with details about which items were forbidden, that information is silently dropped.

Fix: Add forbidden field to CogniteError and extract it in handleErrorResponse().
