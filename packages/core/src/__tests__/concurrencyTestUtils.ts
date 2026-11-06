// Copyright 2026 Cognite AS

/// <reference lib="es2024.promise" />

import fetch, { Response } from 'cross-fetch';
import { vi } from 'vitest';

// Mock fetch rather than nock to control request and response-body completion
// independently, without timing-based network delays.
export function controlFetch() {
  const requests: {
    url: string;
    options: Parameters<typeof fetch>[1];
    resolve: (response: Response) => void;
    reject: (reason: unknown) => void;
    reply: (data?: unknown, status?: number) => void;
  }[] = [];
  vi.mocked(fetch).mockImplementation((url, options) => {
    const response = Promise.withResolvers<Response>();
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
