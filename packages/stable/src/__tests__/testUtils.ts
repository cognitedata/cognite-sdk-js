// Copyright 2020 Cognite AS
import { createReadStream, readFileSync, statSync } from 'node:fs';
import { PassThrough } from 'node:stream';
import { mockBaseUrl } from '@cognite/sdk-core/src/__tests__/testUtils';
import { randomInt } from '@cognite/sdk-core/src/__tests__/testUtils';
import CogniteClient from '../cogniteClient';
import { login } from './login';
function setupClient(baseUrl: string = process.env.COGNITE_BASE_URL as string) {
  return new CogniteClient({
    appId: 'JS SDK integration tests',
    project: 'unit-test',
    baseUrl,
    getToken: () => Promise.resolve('not logged in'),
  });
}

function setupLoggedInClient() {
  const client = new CogniteClient({
    appId: 'JS SDK integration tests',
    baseUrl: process.env.COGNITE_BASE_URL,
    project: process.env.COGNITE_PROJECT as string,
    getToken: () =>
      login().then((account) => {
        return account.access_token;
      }),
  });
  return client;
}

function setupMockableClient() {
  return new CogniteClient({
    appId: 'JS SDK integration tests',
    project: process.env.COGNITE_PROJECT as string,
    baseUrl: mockBaseUrl,
    getToken: () => Promise.resolve('test accessToken'),
  });
}

const deleteOldSpaces = async (client: CogniteClient) => {
  const fiveMinutesInMs = 5 * 60 * 1000;
  await deleteSpacesNotUpdatedSince(client, Date.now() - fiveMinutesInMs);
};

const deleteSpacesNotUpdatedSince = async (
  client: CogniteClient,
  timestamp: number
) => {
  try {
    // Can max delete 100 spaces at a time thus the limit is set to 100
    const spaces = (await client.spaces.list({ limit: 100 })).items;
    const oldSpaces = spaces.filter(
      (space) => space.lastUpdatedTime < timestamp
    );

    const spacesList = oldSpaces.map((space) => space.space);
    const spaceContentDeletionPromises = spacesList.map(async (space) => {
      await deleteAllViewsInSpace(client, space);
      await deleteAllDataModelsInSpace(client, space);
      await deleteAllContainersInSpace(client, space);
      await deleteAllInstancesInSpace(client, space);
    });
    await Promise.all(spaceContentDeletionPromises);

    if (spacesList.length) {
      await client.spaces.delete(spacesList);
    }
  } catch (e) {
    console.error(
      `An error occured when trying to delete spaces not updated since ${new Date(
        timestamp
      )}`,
      e
    );
  }
};

const deleteAllContainersInSpace = async (
  client: CogniteClient,
  space: string
) => {
  const containers = (await client.containers.list({ limit: 100, space }))
    .items;

  if (containers.length) {
    await client.containers.delete(
      containers.map((container) => ({
        externalId: container.externalId,
        space: container.space,
      }))
    );
  }
};

const deleteAllInstancesInSpace = async (
  client: CogniteClient,
  space: string
) => {
  const createFilter = (instanceType: 'node' | 'edge') => ({
    limit: 1000,
    instanceType: instanceType,
    filter: {
      in: {
        property: [instanceType, 'space'],
        values: [space],
      },
    },
  });

  const nodeInstances = (await client.instances.list(createFilter('node')))
    .items;
  const edgeInstances = (await client.instances.list(createFilter('edge')))
    .items;

  const deleteInstances = async (instances: NodeOrEdge[]) => {
    client.instances.delete(
      instances.map((instance) => ({
        instanceType: instance.instanceType,
        externalId: instance.externalId,
        space: instance.space,
      }))
    );
  };

  if (nodeInstances.length) {
    await deleteInstances(nodeInstances);
  }
  if (edgeInstances.length) {
    await deleteInstances(edgeInstances);
  }
};

const deleteAllViewsInSpace = async (client: CogniteClient, space: string) => {
  const views = await client.views
    .list({ limit: 1000, space, allVersions: true })
    .autoPagingToArray();

  if (views.length) {
    await client.views.delete(
      views.map((view) => ({
        externalId: view.externalId,
        space: view.space,
        version: view.version,
      }))
    );
  }
};

const deleteAllDataModelsInSpace = async (
  client: CogniteClient,
  space: string
) => {
  const dataModels = (
    await client.dataModels.list({ limit: 100, space, allVersions: true })
  ).items;

  if (dataModels.length) {
    await client.dataModels.delete(
      dataModels.map((dataModel) => ({
        externalId: dataModel.externalId,
        space: dataModel.space,
        version: dataModel.version,
      }))
    );
  }
};

const getFileCreateArgs = (
  additionalFields: Partial<ExternalFileInfo> = {}
) => {
  const postfix = randomInt();
  const fileContent = `content_${new Date()}`;
  const sourceCreatedTime = new Date();
  const localFileMeta: ExternalFileInfo = {
    name: `filename_0_${postfix}`,
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
export function setupMockableClientForIntegrationTests() {
  const client = setupClient(process.env.COGNITE_BASE_URL);
  return client;
}
export function setupLoggedInClientForUnitTest() {
  return new CogniteClient({
    appId: 'JS SDK integration tests (beta)',
    baseUrl: process.env.COGNITE_BASE_URL,
    project: process.env.COGNITE_PROJECT as string,
    getToken: () =>
      login().then((account) => {
        return account.access_token;
      }),
  });
}

function divideFileIntoChunks(file: string, numChunks: number) {
  // Read the binary file
  const fileContentBinary = readFileSync(file);

  // Calculate the number of chunks
  const chunkSize = Math.ceil(fileContentBinary.length / numChunks);

  // Array to store the chunks
  const chunks: Buffer[] = [];

  // Divide the file content into chunks
  for (let i = 0; i < numChunks; i++) {
    const start = i * chunkSize;
    const end = start + chunkSize;
    chunks.push(fileContentBinary.slice(start, end));
  }

  return chunks;
}
function toArrayBuffer(buffer: Buffer) {
  const arrayBuffer = new ArrayBuffer(buffer.length);
  const view = new Uint8Array(arrayBuffer);
  for (let i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return arrayBuffer;
}
function getFileStats(filePath: string) {
  const fileStats = statSync(filePath);
  const fileSizeInBytes = fileStats.size;
  const minChunkSize = 5 * 1024 * 1024; // 5 MB in bytes
  const maxChunks = 250;
  const chunkSize = Math.max(
    minChunkSize,
    Math.ceil(fileSizeInBytes / maxChunks)
  );
  const numberOfParts = Math.ceil(fileSizeInBytes / chunkSize);
  return { fileSizeInBytes, chunkSize, numberOfParts };
}
async function* divideFileIntoStreams(
  filePath: string,
  fileSizeInBytes: number,
  chunkSize: number
) {
  let bytesRead = 0;
  let chunkNumber = 0;

  while (bytesRead < fileSizeInBytes) {
    const remainingSize = fileSizeInBytes - bytesRead;
    const currentChunkSize = Math.min(chunkSize, remainingSize);

    const currentReadable = createReadStream(filePath, {
      start: bytesRead,
      end: bytesRead + currentChunkSize - 1,
    });

    bytesRead += currentChunkSize;

    const passthroughStream = new PassThrough();
    currentReadable.pipe(passthroughStream);

    yield { chunkNumber, stream: passthroughStream };

    chunkNumber++;
  }
}
export {
  divideFileIntoChunks,
  getFileStats,
  divideFileIntoStreams,
  toArrayBuffer,
};

export {
  apiKey,
  mockBaseUrl,
  project,
  randomInt,
  runTestWithRetryWhenFailing,
  string2arrayBuffer,
  getSortedPropInArray,
  retryInSeconds,
  simpleCompare,
} from '@cognite/sdk-core/src/__tests__/testUtils';

export {
  setupClient,
  setupLoggedInClient,
  setupMockableClient,
  deleteOldSpaces,
  getFileCreateArgs,
};
