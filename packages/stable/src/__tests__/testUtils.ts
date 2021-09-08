// Copyright 2020 Cognite AS

import { Constants } from '@cognite/sdk-core';
import { TestUtils } from '@cognite/sdk-core';
import CogniteClient from '../cogniteClient';
import { ExternalFileInfo } from '../types';

export const {
  apiKey,
  mockBaseUrl,
  project,
  randomInt,
  runTestWithRetryWhenFailing,
  string2arrayBuffer,
  getSortedPropInArray,
  retryInSeconds,
  simpleCompare,
} = TestUtils;

export function setupClient(baseUrl: string = Constants.BASE_URL): CogniteClient {
  return new CogniteClient({ appId: 'JS SDK integration tests', baseUrl });
}

export function setupLoggedInClient(): CogniteClient {
  jest.setTimeout(60 * 1000);
  const client = setupClient();
  client.loginWithApiKey({
    project: process.env.COGNITE_PROJECT as string,
    apiKey: process.env.COGNITE_CREDENTIALS as string,
  });
  return client;
}

export function setupMockableClient(): CogniteClient {
  const client = setupClient(mockBaseUrl);
  client.loginWithApiKey({
    project,
    apiKey,
  });
  return client;
}

export const getFileCreateArgs = (
  additionalFields: Partial<ExternalFileInfo> = {}
): { postfix: number; sourceCreatedTime: Date; localFileMeta: ExternalFileInfo; fileContent: string } => {
  const postfix = randomInt();
  const fileContent = 'content_' + new Date();
  const sourceCreatedTime = new Date();
  const localFileMeta: ExternalFileInfo = {
    name: 'filename_0_' + postfix,
    mimeType: 'text/plain;charset=UTF-8',
    directory: '/test/testing',
    metadata: {
      key: 'value',
    },
    sourceCreatedTime,
    ...additionalFields,
  };

  return { postfix, fileContent, sourceCreatedTime, localFileMeta };
};
