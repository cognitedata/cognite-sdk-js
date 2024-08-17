// Copyright 2020 Cognite AS

import path, { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it, test } from 'vitest';
import { retryInSeconds } from '../../../../stable/src/__tests__/testUtils';
import type { FilesMultipartUploadSessionAPI } from '../../api/files/filesMultipartUploadSessionApi';
import type CogniteClient from '../../cogniteClient';
import type {
  ExternalFileInfo,
  LabelDefinition,
  MultiPartFileChunkResponse,
} from '../../types';
import {
  divideFileIntoChunks,
  divideFileIntoStreams,
  getFileStats,
  setupMockableClientForIntegrationTests,
  toArrayBuffer,
} from '../testUtils';
// file to upload for integration tests
const testfile = join(__dirname, '../VAL.nwd');

describe.skip('Files: Multi part Upload Integration Tests', () => {
  let client: CogniteClient;
  let label: LabelDefinition;

  beforeAll(async () => {
    client = setupMockableClientForIntegrationTests();
  });

  afterAll(async () => {
    const { items } = await client.files.list({
      filter: {
        labels: {
          containsAll: [{ externalId: label.externalId }],
        },
      },
    });
    await client.files.delete(items.map((item) => ({ id: item.id })));
    await client.labels.delete([{ externalId: label.externalId }]);
    console.log(`cleaned ${items.length} files successfully.`);
  });

  const getFileCreateArgs = (
    additionalFields: Partial<ExternalFileInfo> = {},
  ) => {
    const sourceCreatedTime = new Date();
    const fileName = path.parse(additionalFields.name ?? 'filename_0').base;
    const localFileMeta: ExternalFileInfo = {
      name: fileName,
      mimeType: 'application/octet-stream',
      directory: '/test/testing',
      metadata: {
        key: 'value',
      },
      sourceCreatedTime,
    };

    return { sourceCreatedTime, localFileMeta };
  };

  test('can create uploadurls', async () => {
    const response = await client.files.multipartUploadSession(
      {
        ...getFileCreateArgs({ name: testfile }).localFileMeta,
      },
      5,
      false,
    );
    expect(response.getNotCompletedParts().length).toEqual(5);
  });
  it.each<number>([3, 5])(
    'can upload and get the state',
    async (numberOfParts) => {
      const fileChunks = divideFileIntoChunks(testfile, numberOfParts);
      const response = await client.files.multipartUploadSession(
        {
          ...getFileCreateArgs({ name: testfile }).localFileMeta,
        },
        numberOfParts,
        false,
      );
      for (let i = 0; i < numberOfParts; i++) {
        try {
          await response.uploadPart(i, fileChunks[i]);
          console.log(`Uploaded part ${i + 1} successfully.`);
        } catch (error) {
          console.error(`Error uploading part ${i + 1}:`, error);
        }
      }
      await assertFileUploadedWithRetry(client, response);
      console.log(
        `Uploaded file  ${response.multiPartFileUploadResponse.id} successfully.`,
      );
    },
  );

  test('trying already uploaded parts do not throw: is an idempotent call ', async () => {
    //const smallFile = join(__dirname, '../test3dFile.fbx');
    const numberOfParts = 5;
    const fileChunks = divideFileIntoChunks(testfile, numberOfParts);
    const response = await client.files.multipartUploadSession(
      {
        ...getFileCreateArgs({ name: testfile }).localFileMeta,
      },
      numberOfParts,
      false,
    );

    await expect(response.uploadPart(0, fileChunks[0])).resolves.not.toThrow();
    await expect(response.uploadPart(0, fileChunks[0])).resolves.not.toThrow();
  });
  const retryCases = [
    { numberOfParts: 1, partsToFail: 0 },
    { numberOfParts: 5, partsToFail: 3 },
    { numberOfParts: 10, partsToFail: 5 },
  ];
  it.each(retryCases)(
    'can retry failed parts',
    async ({ numberOfParts, partsToFail }) => {
      const fileChunks = divideFileIntoChunks(testfile, numberOfParts);
      const response = await client.files.multipartUploadSession(
        {
          ...getFileCreateArgs({ name: testfile }).localFileMeta,
        },
        numberOfParts,
        false,
      );
      const allParts = Array.from({ length: numberOfParts }, (_, i) => i);
      expect(response.getNotCompletedParts()).toEqual(allParts);

      for (let i = 0; i < numberOfParts; i++) {
        console.log(`Uploading part ${i + 1}`);
        if (i === partsToFail) {
          // Fail  manually
          try {
            await response.uploadPart(i, null);
          } catch (error) {
            console.log(`part ${i + 1} upload failed ${error}`);
          }
        } else {
          await response.uploadPart(i, toArrayBuffer(fileChunks[i]));
        }
      }

      expect(response.getNotCompletedParts()).toEqual([partsToFail]);

      await response.uploadPart(partsToFail, fileChunks[partsToFail]);
      expect(response.getNotCompletedParts()).toEqual([]);
      console.log(
        `Uploaded file  ${response.multiPartFileUploadResponse.id} successfully.`,
      );
      await assertFileUploadedWithRetry(client, response);
    },
  );
  test('can concurrently upload parts', async () => {
    const numberOfParts = 10;
    const fileChunks = divideFileIntoChunks(testfile, numberOfParts);
    const response = await client.files.multipartUploadSession(
      {
        ...getFileCreateArgs({ name: testfile }).localFileMeta,
      },
      numberOfParts,
      false,
    );
    const allParts = Array.from({ length: numberOfParts }, (_, i) => i);
    expect(response.getNotCompletedParts()).toEqual(allParts);

    await Promise.all(
      fileChunks.map(
        async (fileChunk, i) => await response.uploadPart(i, fileChunk),
      ),
    );

    expect(response.getNotCompletedParts()).toEqual([]);
    console.log(
      `Uploaded file  ${response.multiPartFileUploadResponse.id} successfully.`,
    );
    await assertFileUploadedWithRetry(client, response);
  });

  test('can concurrently upload parts while slicing with streams', async () => {
    const { fileSizeInBytes, chunkSize, numberOfParts } =
      getFileStats(testfile);

    const response = await client.files.multipartUploadSession(
      {
        ...getFileCreateArgs({ name: testfile }).localFileMeta,
      },
      numberOfParts,
      false,
    );
    for await (const e of await divideFileIntoStreams(
      testfile,
      fileSizeInBytes,
      chunkSize,
    )) {
      console.log(`Uploading part ${e.chunkNumber}`);
      // const { done, value } = await e.stream.read();
      const chunks: Buffer[] = [];
      const output = await new Promise<Buffer>((resolve, reject) => {
        e.stream.on('data', (chunk) => {
          chunks.push(Buffer.from(chunk));
        });
        e.stream.on('error', (err) => reject(err));
        e.stream.on('end', () => {
          resolve(Buffer.concat(chunks));
        });
      });
      await response.uploadPart(e.chunkNumber, output);
    }
    expect(response.getNotCompletedParts()).toEqual([]);
    console.log(
      `Uploaded file  ${response.multiPartFileUploadResponse.id} successfully.`,
    );
    await assertFileUploadedWithRetry(client, response);
  });

  test('can get chunk upload callback', async () => {
    const numberOfParts = 10;
    const fileChunks = divideFileIntoChunks(testfile, numberOfParts);
    const response = await client.files.multipartUploadSession(
      {
        ...getFileCreateArgs({ name: testfile }).localFileMeta,
      },
      numberOfParts,
      false,
    );
    const allParts = Array.from({ length: numberOfParts }, (_, i) => i);
    expect(response.getNotCompletedParts()).toEqual(allParts);
    const uploadPartWithCallback = async (
      api: FilesMultipartUploadSessionAPI,
      fileChunk: Buffer,
      i: number,
      callback = (result: MultiPartFileChunkResponse): void => {
        console.log(result);
      },
    ) => {
      const data = new Uint8Array(fileChunk).buffer;
      const result = await api.uploadPart(i, data);
      if (result) {
        return callback(result);
      }
    };
    let totalSize = 0;
    let numberOfCallsToCallback = 0;
    const expectedTotalSize = fileChunks.reduce(
      (acc, fileChunk) => acc + fileChunk.length,
      0,
    );
    await Promise.all(
      fileChunks.map(
        async (fileChunk, i) =>
          await uploadPartWithCallback(
            response,
            fileChunk,
            i,
            async (result: MultiPartFileChunkResponse) => {
              if (result && result.status === 200) {
                numberOfCallsToCallback++;
                totalSize += fileChunk.length;
                console.log(
                  `Uploaded part ${result.partNumber} with ${fileChunk.length} length uploaded. completed ${totalSize}/${expectedTotalSize} bytes `,
                );
              }
            },
          ),
      ),
    );

    expect(response.getNotCompletedParts()).toEqual([]);
    console.log(
      `Uploaded file  ${response.multiPartFileUploadResponse.id} successfully.`,
    );
    await assertFileUploadedWithRetry(client, response);
    expect(numberOfParts).toEqual(numberOfCallsToCallback);
  });
});
async function assertFileUploadedWithRetry(
  client: CogniteClient,
  response: FilesMultipartUploadSessionAPI,
) {
  const request = async () => {
    const [retrievedFile] = await client.files.retrieve([
      { id: response.multiPartFileUploadResponse.id },
    ]);
    if (!retrievedFile.uploaded) {
      const error = new Error('Still uploading');
      // @ts-ignore
      error.status = 500;
      throw error;
    }
    return retrievedFile;
  };
  const file = await retryInSeconds(request, 5, 500, 5 * 10);
  expect(file.uploaded).toBeTruthy();
}
