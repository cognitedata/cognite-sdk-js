---
id: 14
title: 'Batching: Sequential chunked ops fail-fast skips remaining chunks'
status: backlog
priority: medium
created: 2026-03-17T14:19:57.959968+01:00
updated: 2026-03-17T14:19:57.959968+01:00
tags:
    - discovery
    - batching
class: standard
---

File: packages/core/src/utils.ts:169-182

`promiseEachInSequence` stops on first chunk failure and marks ALL remaining chunks as failed without attempting them:
```ts
} catch (err) {
  throw {
    errors: [err],
    failed: inputs.slice(index),   // everything from here on marked failed
    succeded: inputs.slice(0, index),
    responses: prevResult,
  };
}
```

For create/upsert operations with many chunks, one bad chunk (e.g. a single invalid item) causes every subsequent chunk to be skipped, even though they might succeed independently.

Fix: Add an option for continue-on-error behavior that collects all results before throwing a CogniteMultiError.
