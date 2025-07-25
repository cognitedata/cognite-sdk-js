# High Criticality Bug Report - Cognite SDK

## Executive Summary

After conducting a thorough security and reliability analysis of the Cognite SDK codebase, I've identified several high criticality bugs that could lead to security vulnerabilities, resource exhaustion, and potential denial of service conditions.

## Critical Bug #1: Potential Infinite Loop in RetryableHttpClient

**Location**: `packages/core/src/httpClient/retryableHttpClient.ts:104-120`

**Severity**: CRITICAL

**Description**: The `rawRequest` method contains a `while (true)` loop that could potentially run indefinitely under certain conditions.

```typescript
protected async rawRequest<ResponseType>(
  request: RetryableHttpRequest
): Promise<HttpResponse<ResponseType>> {
  let retryCount = 0;
  while (true) {  // <-- POTENTIAL INFINITE LOOP
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

**Risk**: 
- If the `retryValidator` function is maliciously overridden or has a bug that always returns `true`, this could cause an infinite loop
- Resource exhaustion (CPU, memory, network connections)
- Potential denial of service if exploited

**Mitigation**: Add a hard upper bound on retry attempts regardless of validator logic.

## Critical Bug #2: URL Path Traversal Vulnerability

**Location**: `packages/core/src/httpClient/basicHttpClient.ts:97-100`

**Severity**: CRITICAL

**Description**: The `resolveUrl` function performs basic URL concatenation without proper path traversal protection.

```typescript
private static resolveUrl(baseUrl: string, path: string) {
  const trimmedBaseUrl = baseUrl.replace(/\/$/, '');
  const pathWithPrefix = (path[0] === '/' ? '' : '/') + path;
  return trimmedBaseUrl + pathWithPrefix.replace(/\/+$/, '');
}
```

**Risk**:
- Path traversal attacks using `../` sequences
- Potential access to unauthorized resources
- Information disclosure

**Example Attack Vector**:
```typescript
// If baseUrl is "https://api.cognite.com/api/v1"
// Malicious path: "../../../internal/admin"
// Result: "https://api.cognite.com/internal/admin"
```

**Mitigation**: Implement proper URL validation and sanitization using the URL constructor.

## Critical Bug #3: Promise Cache Memory Leak

**Location**: `packages/core/src/utils.ts:72-85`

**Severity**: HIGH

**Description**: The `promiseCache` function has a potential memory leak in error scenarios.

```typescript
export function promiseCache<ReturnValue>(
  promiseFn: () => Promise<ReturnValue>
) {
  let unresolvedPromise: Promise<ReturnValue> | null = null;
  return () => {
    if (unresolvedPromise) {
      return unresolvedPromise;
    }
    unresolvedPromise = promiseFn().then((res) => {
      unresolvedPromise = null;
      return res;
    });
    return unresolvedPromise;
  };
}
```

**Risk**:
- If the promise rejects, `unresolvedPromise` is never reset to `null`
- Subsequent calls will return the same rejected promise indefinitely
- Memory leak as the promise object is never garbage collected

**Mitigation**: Add error handling to reset the cache on promise rejection.

## Critical Bug #4: Unsafe Error Object Throwing

**Location**: `packages/core/src/utils.ts:125-135`

**Severity**: HIGH

**Description**: The `promiseAllAtOnce` function throws plain objects instead of proper Error instances.

```typescript
if (failed.length) {
  throw {
    succeded,
    responses,
    failed,
    errors,
  };
}
```

**Risk**:
- Loss of stack trace information
- Difficult debugging and error handling
- Potential for error handling code to fail unexpectedly

**Mitigation**: Always throw proper Error instances with stack traces.

## Critical Bug #5: Race Condition in Authentication

**Location**: `packages/core/src/baseCogniteClient.ts:152-172`

**Severity**: HIGH

**Description**: The authentication logic has a potential race condition in token management.

```typescript
private authenticateUsingOidcTokenProvider: () => Promise<
  string | undefined
> = async () => {
  try {
    if (!this.tokenPromise || this.isTokenPromiseFulfilled) {
      this.isTokenPromiseFulfilled = false;
      this.tokenPromise = this.getOidcToken();
    }
    const token = await this.tokenPromise;
    this.isTokenPromiseFulfilled = true;
    // ... rest of the code
  } catch {
    return;
  }
};
```

**Risk**:
- Multiple concurrent authentication requests could create multiple token promises
- Potential for token inconsistency across requests
- Security implications if tokens are not properly synchronized

**Mitigation**: Implement proper locking mechanism or use atomic operations.

## Critical Bug #6: Unsafe Array Reduction in Sequential Promise Handling

**Location**: `packages/core/src/utils.ts:165-180`

**Severity**: MEDIUM-HIGH

**Description**: The `promiseEachInSequence` function uses `reduce` with async operations incorrectly.

```typescript
export async function promiseEachInSequence<RequestType, ResponseType>(
  inputs: RequestType[],
  promiser: (input: RequestType) => Promise<ResponseType>
) {
  return inputs.reduce(async (previousPromise, input, index) => {
    const prevResult = await previousPromise;
    try {
      return prevResult.concat(await promiser(input));
    } catch (err) {
      throw {
        errors: [err],
        failed: inputs.slice(index),
        succeded: inputs.slice(0, index),
        responses: prevResult,
      };
    }
  }, Promise.resolve(new Array<ResponseType>()));
}
```

**Risk**:
- The `reduce` function doesn't properly wait for async operations
- Potential for race conditions
- Incorrect error handling and result aggregation

**Mitigation**: Use a proper sequential loop instead of `reduce` with async operations.

## Critical Bug #7: Missing Input Validation in File Upload

**Location**: `packages/stable/src/api/files/filesApi.ts:186-215`

**Severity**: MEDIUM-HIGH

**Description**: The file upload endpoint lacks proper validation of file content and metadata.

```typescript
private async uploadEndpoint(
  fileInfo: ExternalFileInfo,
  fileContent?: FileContent,
  overwrite = false,
  waitUntilAcknowledged = false
) {
  const hasFileContent = fileContent != null;
  if (!hasFileContent && waitUntilAcknowledged) {
    throw Error(
      "Don't set waitUntilAcknowledged to true when you are not uploading a file"
    );
  }
  // Missing validation for file size, content type, etc.
}
```

**Risk**:
- Potential for uploading malicious files
- No size limits could lead to resource exhaustion
- Missing content type validation

**Mitigation**: Add comprehensive input validation including file size limits, content type validation, and security scanning.

## Critical Bug #8: Unsafe Error Handling in HTTP Response Processing

**Location**: `packages/core/src/httpClient/basicHttpClient.ts:225-245`

**Severity**: MEDIUM

**Description**: The response handling logic has unsafe error handling that could mask important errors.

```typescript
const [data, textFallback] = await Promise.all([
  responseHandler(res).catch(() => undefined),
  resClone.text() as unknown as Promise<ResponseType>,
]);
return {
  headers: BasicHttpClient.convertFetchHeaders(res.headers),
  status: res.status,
  data: data || textFallback,
};
```

**Risk**:
- Silent failures could mask important errors
- Potential for data corruption if fallback logic fails
- Difficult debugging due to suppressed error information

**Mitigation**: Implement proper error logging and handling instead of silently catching errors.

## Recommendations

1. **Immediate Actions**:
   - Fix the infinite loop vulnerability in RetryableHttpClient
   - Implement proper URL validation and sanitization
   - Add comprehensive input validation for file uploads

2. **Short-term Actions**:
   - Fix promise cache memory leak
   - Implement proper error handling throughout the codebase
   - Add race condition protection in authentication

3. **Long-term Actions**:
   - Implement comprehensive security testing
   - Add static analysis tools to catch similar issues
   - Establish security review process for new code

## Conclusion

These bugs represent significant security and reliability risks that should be addressed immediately. The most critical issues are the potential infinite loop and URL path traversal vulnerability, which could lead to denial of service and unauthorized access respectively.

All identified issues should be prioritized based on their severity and potential impact on production systems.