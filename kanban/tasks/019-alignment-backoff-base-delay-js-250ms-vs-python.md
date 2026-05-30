---
id: 19
title: 'Alignment: backoff base delay JS=250ms vs Python=500ms'
status: done
priority: low
created: 2026-03-17T15:27:42.158921+01:00
updated: 2026-03-17T15:34:14.155391+01:00
started: 2026-03-17T15:34:14.155391+01:00
completed: 2026-03-17T15:34:14.155391+01:00
tags:
    - discovery
    - retry
    - alignment
class: standard
---

File: packages/core/src/httpClient/exponentialJitterBackoff.ts

baseDelayMs defaults to 250ms (line 22), giving formula: random(0,1) * min(250 * 2^(n+1), maxDelay) = random(0,1) * min(500 * 2^n, maxDelay). Python uses backoff_factor=0.5s with formula: 0.5 * 2^n * random(0,1) = same structure but 500 * 2^n base.

At retry 0: JS max=500ms, Python max=1000ms. The JS SDK backs off half as aggressively on initial retries. Combined with the lower max_backoff (15s vs 30s), the JS SDK is significantly more aggressive.

Fix: Change baseDelayMs from 250 to 500 to align with Python SDK. This gives the same effective delay curve: random(0,1) * min(500 * 2^(n+1), maxDelay) which equals random(0,1) * min(1000 * 2^n, maxDelay). Actually, to match Python exactly (0.5 * 2^n), baseDelayMs should be 250 and the formula should use 2^n instead of 2^(n+1). Current formula effectively starts at 2x the base.
