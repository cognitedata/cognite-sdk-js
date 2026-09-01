// Copyright 2020 Cognite AS

import { vi } from 'vitest';

import BaseCogniteClient from '../baseCogniteClient';
import { BASE_URL } from '../constants';
import { HttpError } from '../httpClient/httpError';
import { sleepPromise } from '../utils';
export { sleepPromise };

export const project = 'TEST_PROJECT';
export const projectId = 123;
export const user = 'user@example.com';
export const accessToken = 'access_token';
export const loggedInResponse = {
  data: { loggedIn: true, user, project, projectId },
};
export const notLoggedInResponse = {
  data: { loggedIn: false, user: '', project: '' },
};
export const mockBaseUrl = 'https://example.com';
export const authTokens = {
  accessToken: 'abc',
  idToken: 'def',
};

export function setupClient(baseUrl: string = BASE_URL) {
  return new BaseCogniteClient({
    appId: 'JS SDK integration tests',
    project: process.env.COGNITE_PROJECT as string,
    oidcTokenProvider: () =>
      Promise.resolve(process.env.COGNITE_CREDENTIALS as string),
    baseUrl,
  });
}

export function setupLoggedInClient() {
  vi.setConfig({
    testTimeout: 60 * 1000,
  });
  const client = setupClient();
  return client;
}

export function setupMockableClient() {
  const client = setupClient(mockBaseUrl);
  return client;
}

export async function retryInSeconds<ResponseType>(
  func: () => Promise<ResponseType>,
  secondsBetweenRetries = 3,
  statusCodeToRetry = 404,
  finishAfterSeconds = 300
): Promise<ResponseType> {
  const timeStart = Date.now();
  while (Date.now() - timeStart < finishAfterSeconds * 1000) {
    try {
      return await func();
    } catch (error) {
      if (error instanceof HttpError && error.status !== statusCodeToRetry) {
        throw error;
      }
      await sleepPromise(secondsBetweenRetries * 1000);
    }
  }
  throw new Error('Time limit has been exceeded');
}

export async function runTestWithRetryWhenFailing(
  testFunction: () => Promise<void>,
  // Cumulative sleep budget. The default fits the 25s testTimeout; when
  // raising it, pass a matching per-test timeout to vitest as well.
  maxSleepMs = 20_000
) {
  const delayFactor = 2;
  // Capped backoff: uncapped doubling would blow the budget after 5 retries.
  const maxDelayInMs = 2_000;
  let delayInMs = 500;
  let sleptMs = 0;
  let error: unknown;
  do {
    try {
      await testFunction();
      return;
    } catch (err) {
      error = err;
      await sleepPromise(delayInMs);
      sleptMs += delayInMs;
      delayInMs = Math.min(delayInMs * delayFactor, maxDelayInMs);
    }
  } while (sleptMs < maxSleepMs);
  throw error;
}

export function createErrorResponse(
  status: number,
  message: string,
  extra: object = {}
) {
  return {
    error: {
      code: status,
      message,
      ...extra,
    },
  };
}

export function string2arrayBuffer(str: string) {
  const buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
  const bufView = new Uint16Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

export function randomInt() {
  return Math.floor(Math.random() * 10000000000);
}
