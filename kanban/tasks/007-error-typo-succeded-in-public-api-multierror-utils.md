---
id: 7
title: 'Error: Typo ''succeded'' in public API (MultiError, utils)'
status: backlog
priority: low
created: 2026-03-17T14:09:33.832582+01:00
updated: 2026-03-17T14:09:33.832582+01:00
tags:
    - discovery
    - error-parsing
class: standard
---

Files: packages/core/src/multiError.ts, packages/core/src/utils.ts

The property name 'succeded' is misspelled throughout (should be 'succeeded'). This is in the public API surface (CogniteMultiError.succeded, MultiErrorRawSummary.succeded). Fixing requires a breaking change or backwards-compat alias.

Occurrences: multiError.ts lines 8,26,59 and utils.ts lines 97,115.
