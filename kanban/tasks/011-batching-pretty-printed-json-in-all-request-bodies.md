---
id: 11
title: 'Batching: Pretty-printed JSON in all request bodies'
status: done
priority: low
created: 2026-03-17T14:09:49.856785+01:00
updated: 2026-03-17T14:59:56.280001+01:00
started: 2026-03-17T14:58:57.886287+01:00
completed: 2026-03-17T14:59:56.280001+01:00
tags:
    - discovery
    - batching
class: standard
---

File: packages/core/src/httpClient/basicHttpClient.ts:92

JSON.stringify(data, null, 2) is used for ALL request bodies, adding whitespace indentation. For large payloads (e.g., bulk datapoint inserts), this can add 10-30% to payload size.

Fix: Use JSON.stringify(data) without pretty-printing. The indentation provides no benefit since these are machine-to-machine requests.
