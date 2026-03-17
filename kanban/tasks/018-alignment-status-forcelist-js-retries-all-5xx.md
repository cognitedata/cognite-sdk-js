---
id: 18
title: 'Alignment: status_forcelist JS retries all 5xx, Python only 502-504'
status: todo
priority: low
created: 2026-03-17T15:27:35.34302+01:00
updated: 2026-03-17T15:27:35.34302+01:00
tags:
    - discovery
    - retry
    - alignment
class: standard
---

File: packages/core/src/httpClient/retryValidator.ts (lines 77-82)

isValidRetryStatusCode() uses inRange(status, 500, 600) which retries ALL 5xx codes (500-599). The Python SDK only retries {429, 502, 503, 504} (config.py line 52).

This means the JS SDK retries on 500 (Internal Server Error), 501 (Not Implemented), 505-599, etc., which are typically permanent failures. Retrying a 500 or 501 wastes time and adds load to the server.

Fix: Narrow the status forcelist to match Python: {429, 502, 503, 504}. Or at minimum exclude 500 and 501.
