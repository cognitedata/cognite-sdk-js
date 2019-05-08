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
