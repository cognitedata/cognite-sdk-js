// Copyright 2026 Cognite AS

import { setImmediate } from 'node:timers';
import fetch, { Response } from 'cross-fetch';
import { vi } from 'vitest';

export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

export const flushRequests = () =>
  new Promise<void>((resolve) => setImmediate(resolve));

export function controlFetch() {
  const requests: {
    url: string;
    options: Parameters<typeof fetch>[1];
    resolve: (response: Response) => void;
    reject: (reason: unknown) => void;
    reply: (data?: unknown, status?: number) => void;
  }[] = [];
  vi.mocked(fetch).mockImplementation((url, options) => {
    const response = deferred<Response>();
    requests.push({
      url: String(url),
      options,
      resolve: response.resolve,
      reject: response.reject,
      reply: (data = {}, status = 200) =>
        response.resolve(new Response(JSON.stringify(data), { status })),
    });
    return response.promise;
  });
  return requests;
}
