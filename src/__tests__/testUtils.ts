// Copyright 2019 Cognite AS

import * as sleep from 'sleep-promise';
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

export async function retryInSeconds<ResponseType>(
  func: () => Promise<ResponseType>,
  secondsBetweenRetries = 3,
  statusCodeToRetry = 404,
  finishAfterSeconds: number = 300
): Promise<ResponseType> {
  const timeStart = Date.now();
  while (Date.now() - timeStart < finishAfterSeconds * 1000) {
    try {
      return await func();
    } catch (error) {
      if (Number(error.status) !== statusCodeToRetry) {
        throw error;
      }
      await sleep(secondsBetweenRetries * 1000);
    }
  }
  throw new Error('Time limit has been exceeded');
}

export const simpleCompare = (a: number, b: number) => a - b;

export function getSortedPropInArray<T extends { [key: string]: any }>(
  arr: T[],
  propName: string
) {
  return arr.map(elem => elem[propName]).sort(simpleCompare);
}

export function string2arrayBuffer(str: string) {
  const buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
  const bufView = new Uint16Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}
