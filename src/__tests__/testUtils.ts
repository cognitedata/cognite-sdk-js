// Copyright 2019 Cognite AS

import * as sleep from 'sleep-promise';
import CogniteClient from '../cogniteClient';

export function createErrorReponse(
  status: number,
  message: string,
  extra: any = {}
) {
  return {
    error: {
      code: status,
      message,
      ...extra,
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
  return new CogniteClient({ appId: 'JS SDK integration tests' });
}

export function setupLoggedInClient() {
  jest.setTimeout(60 * 1000);
  const client = setupClient();
  client.loginWithApiKey({
    project: process.env.COGNITE_PROJECT as string,
    apiKey: process.env.COGNITE_CREDENTIALS as string,
  });
  return client;
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

export function randomInt() {
  return Math.floor(Math.random() * 10000000000);
}
