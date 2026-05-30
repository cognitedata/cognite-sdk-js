---
id: 10
title: 'Batching: Sequential create applied to all resource types'
status: done
priority: low
created: 2026-03-17T14:09:47.538585+01:00
updated: 2026-03-17T15:01:56.720615+01:00
started: 2026-03-17T15:00:03.863943+01:00
completed: 2026-03-17T15:01:56.720615+01:00
tags:
    - discovery
    - batching
class: standard
---

File: packages/core/src/baseResourceApi.ts:407-435

callCreateEndpoint() always uses postInSequenceWithAutomaticChunking, which processes chunks one at a time. This is necessary for assets (parent-child ordering) but unnecessary for events, time series, and other resource types without ordering constraints. This significantly slows down bulk creates.

Improvement: Make the sequential vs parallel choice configurable per API, defaulting to parallel. Only AssetsAPI (which already has a custom sort) should use sequential.
