// Copyright 2019 Cognite AS

import { createClientWithApiKey } from '../index';

export function createErrorReponse(status: number, message: string) {
  return {
    error: {
      code: status,
      message,
    },
  };
}

export const apiKey = 'TEST_KEY';
export const project = 'TEST_PROJECT';
export const projectId = 123;
export const user = 'user@example.com';
export const loggedInResponse = {
  data: { loggedIn: true, user, project, projectId },
};
export const notLoggedInResponse = {
  data: { loggedIn: false, user: '', project: '' },
};
export const baseUrl = 'https://example.com';
export const authTokens = {
  accessToken: 'abc',
  idToken: 'def',
};
export function setupClient() {
  return createClientWithApiKey({
    project: process.env.COGNITE_PROJECT as string,
    apiKey: process.env.COGNITE_CREDENTIALS as string,
  });
}

test('createErrorResponse', () => {
  expect(createErrorReponse(200, 'Abc')).toEqual({
    error: {
      code: 200,
      message: 'Abc',
    },
  });
});

export function waitSeconds(seconds: number) {
  return new Promise(resolve => {
    setTimeout(resolve, seconds * 1000);
  });
}

export async function retryInSeconds<O>(
  func: () => Promise<O>,
  secondsBetweenRetries = 3,
  statusCodeToRetry = 404,
  finishAfterSeconds: number = 300
): Promise<O> {
  const timeStart = Date.now();
  while (Date.now() - timeStart < finishAfterSeconds * 1000) {
    try {
      return await func();
    } catch (error) {
      if (Number(error.status) !== statusCodeToRetry) {
        throw error;
      }
      await waitSeconds(secondsBetweenRetries);
    }
  }
  throw new Error('Time limit has been exceeded');
}

export const simpleCompare = (a: number, b: number) => a - b;
