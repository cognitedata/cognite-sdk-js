---
id: 5
title: 'Error: CogniteMultiError unsafe cast on first error'
status: done
priority: medium
created: 2026-03-17T14:09:29.04298+01:00
updated: 2026-03-17T14:47:24.315925+01:00
started: 2026-03-17T14:46:15.565121+01:00
completed: 2026-03-17T14:47:24.315925+01:00
tags:
    - discovery
    - error-parsing
class: standard
---

File: packages/core/src/multiError.ts:61

The constructor does (errors[0] as CogniteError).status and (errors[0] as CogniteError).requestId without checking if errors[0] is actually a CogniteError. If the first error is a plain Error (e.g. network error, JSON parse error), .status will be undefined and could mislead callers.

Fix: Add an instanceof check before accessing CogniteError-specific properties.
