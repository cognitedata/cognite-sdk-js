---
id: 4
title: 'Error: API error code dropped in CogniteError'
status: done
priority: high
created: 2026-03-17T14:09:24.878353+01:00
updated: 2026-03-17T14:37:59.43796+01:00
started: 2026-03-17T14:36:11.650491+01:00
completed: 2026-03-17T14:37:59.43796+01:00
tags:
    - discovery
    - error-parsing
class: standard
---

File: packages/core/src/error.ts:69-92

handleErrorResponse() extracts message, status, missing, duplicated, extra from the API error body, but drops the error.code field. HttpErrorData defines error.code (the API-level error code, distinct from HTTP status), but CogniteError only stores the HTTP status. Consumers cannot distinguish between different API error codes that share the same HTTP status.

Fix: Add an errorCode field to CogniteError and populate it from data.error.code in handleErrorResponse().
