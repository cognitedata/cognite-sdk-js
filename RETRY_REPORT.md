## Retry Strategy Audit

### Scope and principles
- **Goal**: Ensure retryable errors are retried without overwhelming the API by using exponential backoff and jitter, and by respecting server guidance (e.g., Retry-After).
- **Assessed areas**: Core HTTP client, retry validator, API modules with polling or ad-hoc retries, and build/codegen utilities.

### Executive summary
- **Strengths**:
  - Centralized HTTP retry via `RetryableHttpClient` with exponential backoff and a clear `RetryValidator` strategy.
  - Sensible default of retrying idempotent methods; explicit allow-list for POST endpoints.
  - Automatic retry for 5xx and 429 responses.
- **Gaps / Risks**:
  - **No jitter** in backoff, which risks request synchronization under load.
  - **Retry-After header is not honored**; the client may retry sooner than the server suggests.
  - **408 (Request Timeout) is not retried**; common transient timeouts will fail unless manually retried.
  - **Network/transport errors (no HTTP response) are not retried**.
  - **Polling loops use fixed delays without jitter or backoff**; could cause thundering herd behavior.
  - **Chunked POST operations run all chunks in parallel with no concurrency limit**, increasing 429 risk.

---

### Core HTTP-layer behavior

- Backoff implementation (exponential, deterministic, no jitter):
```40:43:packages/core/src/httpClient/retryableHttpClient.ts
private static calculateRetryDelayInMs(retryCount: number) {
  const INITIAL_RETRY_DELAY_IN_MS = 250;
  return INITIAL_RETRY_DELAY_IN_MS + ((2 ** retryCount - 1) / 2) * 1000;
}
```
  - Example schedule: 0→250ms, 1→750ms, 2→1750ms, 3→3750ms, 4→7750ms (≈13.75s cumulative). No randomness.

- Retry loop (response-based, no catch for thrown network errors, no Retry-After handling):
```101:122:packages/core/src/httpClient/retryableHttpClient.ts
protected async rawRequest<ResponseType>(
  request: RetryableHttpRequest
): Promise<HttpResponse<ResponseType>> {
  let retryCount = 0;
  while (true) {
    const response = await super.rawRequest<ResponseType>(request);
    const retryValidator = isFunction(request.retryValidator)
      ? request.retryValidator
      : this.retryValidator;
    const shouldRetry =
      retryCount < MAX_RETRY_ATTEMPTS &&
      request.retryValidator !== false &&
      retryValidator(request, response, retryCount);
    if (!shouldRetry) {
      return response;
    }
    const delayInMs = RetryableHttpClient.calculateRetryDelayInMs(retryCount);
    await sleepPromise(delayInMs);
    retryCount++;
  }
}
```
  - Notes:
    - Does not parse or prioritize `Retry-After` headers.
    - Exceptions thrown by `fetch` are not caught here; the loop will not retry on transport errors.

- Retry decision rules (good defaults but 408 missing):
```48:66:packages/core/src/httpClient/retryValidator.ts
export const createUniversalRetryValidator =
  (maxRetries: number = MAX_RETRY_ATTEMPTS): RetryValidator =>
  (request, response, retryCount) => {
    if (retryCount >= maxRetries) {
      return false;
    }
    // Always retry http 429 (Too Many Requests)
    if (response.status === 429) {
      return true;
    }
    // By default, retry requests with HTTP verbs that are meant to be idempotent
    const httpMethodsToRetry = ['GET', 'HEAD', 'OPTIONS', 'DELETE', 'PUT'];
    const isRetryableHttpMethod =
      httpMethodsToRetry.indexOf(request.method.toUpperCase()) !== -1;
    if (!isRetryableHttpMethod) {
      return false;
    }
    return isValidRetryStatusCode(response.status);
  };
```
```68:73:packages/core/src/httpClient/retryValidator.ts
function isValidRetryStatusCode(status: number) {
  return (
    inRange(status, 100, 200) ||
    inRange(status, 429, 430) ||
    inRange(status, 500, 600)
  );
}
```
  - Retries 1xx (unusual but harmless in practice), 429, and 5xx.
  - Does not include 408 (Request Timeout) or other transient client/proxy statuses.

- POST endpoint allow-list (good practice):
```6:29:packages/stable/src/retryValidator.ts
const ENDPOINTS_TO_RETRY: EndpointList = {
  [HttpMethod.Post]: [
    '/assets/list',
    '/assets/byids',
    '/assets/search',
    '/events/list',
    '/events/byids',
    '/events/search',
    '/files/list',
    '/files/byids',
    '/files/search',
    '/files/initupload',
    '/files/downloadlink',
    '/timeseries/byids',
    '/timeseries/search',
    '/timeseries/data',
    '/timeseries/data/list',
    '/timeseries/data/latest',
    '/timeseries/data/delete',
    '/timeseries/synthetic/query',
  ],
};
```

---

### API modules with polling/ad-hoc retry

- Vision job polling uses fixed interval, no backoff or jitter:
```86:103:packages/stable/src/api/vision/visionApi.ts
private async waitForJobToCompleteAndReturn<T>(
  getJobResult: () => Promise<T>,
  isJobCompleted: (result: T) => boolean,
  pollingTimeMs: number,
  maxRetries: number
) {
  let retryCount = 0;
  do {
    const result = await getJobResult();
    if (isJobCompleted(result)) return result;
    await sleepPromise(pollingTimeMs);
    retryCount++;
  } while (retryCount < maxRetries);
  throw new Error('Timed out while waiting for vision job to complete.');
}
```
  - Risk: synchronized polling across clients; no jitter; no adaptive backoff.

- File upload acknowledgment polling uses fixed interval, no backoff or jitter:
```226:241:packages/stable/src/api/files/filesApi.ts
private async waitUntilFileIsUploaded(
  fileId: CogniteInternalId
): Promise<FileInfo> {
  const MAX_RETRIES = 10;
  const DELAY_IN_MS = 500;
  let retryCount = 0;
  do {
    const [fileInfo] = await this.retrieve([{ id: fileId }]);
    if (fileInfo.uploaded) {
      return fileInfo;
    }
    retryCount++;
    await sleepPromise(DELAY_IN_MS);
  } while (retryCount < MAX_RETRIES);
  throw Error(`File never marked as 'uploaded'`);
}
```
  - Risk: same as above.

- Multipart upload part PUT retries rely on HTTP layer only. Tests show 408 not retried automatically; resume relies on manual re-invocation:
```160:172:packages/stable/src/__tests__/api/filesMultiPart.unit.spec.ts
// ... setup ...
.put('/uploadurl2')
  .delay(100)
  .reply(408, 'timeout');
// ... later ...
await Promise.all(
  fileChunks.map((fileChunk, i) =>
    responseFor5PartUploadPart.uploadPart(i, fileChunk)
  )
);
// ... after manual sleep and re-attempt
uploadNock.put('/uploadurl2').delay(100).once().reply(200);
```
  - Risk: 408 is a common transient timeout; without automatic retry it increases failure rates.

---

### High-concurrency chunking (risk of 429)

- Bulk POSTs are executed for all chunks in parallel with no concurrency limit:
```386:404:packages/core/src/baseResourceApi.ts
protected postInParallelWithAutomaticChunking<
  RequestType,
  ParamsType extends HttpQueryParams,
>({
  path,
  items,
  params,
  queryParams,
  chunkSize = 1000,
}: PostInParallelWithAutomaticChunkingParams<RequestType, ParamsType>) {
  return promiseAllWithData(
    BaseResourceAPI.chunk(items, chunkSize),
    (singleChunk) =>
      this.post<ItemsWrapper<ResponseType[]>>(path, {
        data: { ...params, items: singleChunk },
        params: queryParams,
      }),
    false
  );
}
```
- Risk: Many chunks fire concurrently, increasing likelihood of rate limiting and retries. Without jitter and without honoring `Retry-After`, collisions are likely.

---

### Utilities outside core SDK

- Codegen snapshot downloader uses `fetch` without retry/backoff:
```64:71:packages/codegen/src/snapshot.ts
public downloadFromUrl = async (url?: string): Promise<OpenApiDocument> => {
  try {
    const response = await fetch(url || this.createUrl());
    const json = await response.json();
    return json as OpenApiDocument;
  } catch (error) {
    throw new Error(`Unable to download OpenAPI contract: ${error}`);
  }
};
```
- Risk: flaky network leads to occasional failures during tooling or CI runs.

---

### Detailed findings and recommendations

1) Add jitter to HTTP-layer backoff
- Issue: Deterministic backoff increases synchronized retry bursts.
- Recommendation: Apply full jitter or equal jitter (e.g., random in [0, baseDelay]) to each delay.
  - Example: `delay = random(0, cap * 2**retryCount)` or `delay = base * 2**retryCount * random(0.5, 1.5)`.

2) Honor Retry-After for 429/503 and similar
- Issue: Client ignores server guidance, potentially retrying too early.
- Recommendation: In the retry loop, when `response.headers['retry-after']` is present, parse it (seconds or HTTP-date) and use it as the delay (bounded by a max cap). Combine with jitter.

3) Include 408 (Request Timeout) in retryable statuses
- Issue: 408s aren’t retried.
- Recommendation: Extend `isValidRetryStatusCode` to include 408; consider 425 Too Early if relevant.

4) Retry on network/transport errors
- Issue: Thrown exceptions from `fetch` break out of the loop and are not retried.
- Recommendation: Wrap `super.rawRequest` in try/catch. For transient network errors (TypeError in browsers, ECONNRESET/ETIMEDOUT in Node), apply the same backoff policy (with jitter) and continue, up to `MAX_RETRY_ATTEMPTS`.

5) Polling loops (Vision, file acknowledgment)
- Issue: Fixed intervals without jitter/backoff.
- Recommendation: Use exponential backoff with jitter; optionally bound by a max interval (e.g., 5–10s). Consider honoring `Retry-After` when polling endpoints respond with 429.

6) Concurrency limiting for chunked operations
- Issue: All chunks run in parallel, causing rate spikes.
- Recommendation: Gate chunk submission with a configurable concurrency limit (e.g., 4–8 concurrent requests) and add small per-request jitter to start times.

7) Configurability and observability
- Add client options to tune `maxRetries`, base delay, cap, jitter strategy, and concurrency limits.
- Expose hooks/metrics for retry attempts and backoff delays for monitoring.

8) Coverage and tests
- Add unit tests for:
  - Honor `Retry-After` (seconds and date formats) and precedence over computed delay.
  - Jitter distribution (within bounds) and deterministic seeding option for tests.
  - 408 retry behavior.
  - Network error retry (simulated `fetch` rejections).
  - Concurrency limiter observance and fairness.
  - Polling with jitter/backoff, including tolerance windows.

---

### Suggested implementation touchpoints
- `packages/core/src/httpClient/retryableHttpClient.ts`
  - Implement jitter and `Retry-After` delay computation in the retry loop.
  - Catch transport errors and classify as retryable.
- `packages/core/src/httpClient/retryValidator.ts`
  - Add 408 to retryable statuses; optionally review the necessity of retrying 1xx.
- `packages/core/src/baseResourceApi.ts`
  - Introduce a concurrency limiter for `postInParallelWithAutomaticChunking` and optionally for retrieve/delete chunked flows.
- `packages/stable/src/api/vision/visionApi.ts` and `packages/stable/src/api/files/filesApi.ts`
  - Replace fixed sleeps with exponential backoff + jitter.
- `packages/codegen/src/snapshot.ts`
  - Add simple retry with backoff/jitter for robustness.

---

### Appendix: Observed backoff schedule (current)
- Attempts (0-based):
  - 0: 250 ms
  - 1: 750 ms
  - 2: 1,750 ms
  - 3: 3,750 ms
  - 4: 7,750 ms
- Cumulative delay after 5 attempts: ~13.75 s

### Appendix: What’s currently retried
- 429 Too Many Requests and all 5xx
- 1xx statuses (unusual to receive via fetch)
- Idempotent methods (GET/HEAD/OPTIONS/DELETE/PUT) by default
- Selected POST endpoints in `packages/stable/src/retryValidator.ts` (e.g., `/assets/list`, `/files/byids`, `/timeseries/data/list`, etc.)

### Appendix: What is not currently retried (risk)
- 408 Request Timeout (commonly transient)
- Transport-level failures (no HTTP response)
- Polling loops use fixed sleeps without backoff/jitter
- Parallel chunking without concurrency limits may trigger rate limiting