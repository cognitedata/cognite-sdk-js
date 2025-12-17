// Copyright 2023 Cognite AS

import { mockBaseUrl } from '../../../core/src/__tests__/testUtils';
import CogniteClientAlpha from '../cogniteClient';
import { login } from './login';

export function setupLoggedInClient() {
  return new CogniteClientAlpha({
    appId: 'JS SDK integration tests (alpha)',
    baseUrl: process.env.COGNITE_BASE_URL,
    project: process.env.COGNITE_PROJECT as string,
    oidcTokenProvider: () =>
      login().then((account) => {
        return account.access_token;
      }),
  });
}

export function setupMockableClient() {
  return new CogniteClientAlpha({
    appId: 'JS SDK unit tests (alpha)',
    project: process.env.COGNITE_PROJECT || 'unit-test',
    baseUrl: mockBaseUrl,
    oidcTokenProvider: () => Promise.resolve('test accessToken'),
  });
}

export function randomInt() {
  return Math.floor(Math.random() * 10000000000);
}

export async function getOrCreateFile(
  client: CogniteClientAlpha,
  dataSetId: number,
  fileExternalId = 'simulators-integration-test-file'
): Promise<number> {
  const files = await client.files.retrieve([{ externalId: fileExternalId }], {
    ignoreUnknownIds: true,
  });

  if (files.length === 0) {
    const fileInfo = await client.files.upload(
      {
        externalId: fileExternalId,
        name: `${fileExternalId}.yaml`,
        dataSetId: dataSetId,
      },
      'This is the content of the test file'
    );
    return fileInfo.id;
  }

  return files[0].id;
}

export async function getOrCreateDataSet(
  client: CogniteClientAlpha,
  datasetExternalId = 'simulators-integration-test-data-set'
): Promise<number> {
  const datasets = await client.datasets.retrieve(
    [{ externalId: datasetExternalId }],
    { ignoreUnknownIds: true }
  );
  if (datasets.length === 0) {
    const [dataset] = await client.datasets.create([
      {
        externalId: datasetExternalId,
        name: 'Test data set',
      },
    ]);
    return dataset.id;
  }
  return datasets[0].id;
}
