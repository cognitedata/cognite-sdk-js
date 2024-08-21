import nock from 'nock';
import CogniteClient from '../../cogniteClient';
import { setupMockableClient } from '../testUtils';
import { mockBaseUrl } from '../testUtils';
import { sleepPromise } from '@cognite/sdk-core';
import { FilesMultipartUploadSessionAPI } from '../../api/files/filesMultipartUploadSessionApi';
import { MultiPartFileChunkResponse } from '../../types';

describe('Multi part upload unit test', () => {
  let client: CogniteClient;

  function initResponseForNumberOfParts(numberOfParts: number) {
    return {
      externalId: 'external_id_value',
      name: 'test_fbx.fbx',
      labels: [],
      id: 1478836012846319,
      uploaded: false,
      createdTime: 1712328794789,
      lastUpdatedTime: 1712328794789,
      uploadId:
        'QUJQbnptN1hhWTc2ZXUyWXdfQ29tV0NMTXlqaURiZ2NYd2NURnIxcGtrVHZwQ3oxSmNDRnVxdExTRUxvd3c6NQ==',
      uploadUrls: Array.from(
        { length: numberOfParts },
        (_, i) => `${mockBaseUrl}/uploadurl${i}`
      ),
    };
  }
  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  it.each<number>([1, 2, 5, 240])(
    'can init multi part upload can populate urls',
    async (numberOfParts) => {
      const initAPiNock = nock(mockBaseUrl)
        .post(new RegExp('/files/initmultipartupload'))
        .query({ overwrite: true, parts: numberOfParts })
        .once()
        .reply(201, initResponseForNumberOfParts(numberOfParts));

      const response = await client.files.multipartUploadSession(
        { name: 'test_fbx.fbx', externalId: 'external_id_value' },
        numberOfParts,
        true
      );
      expect(initAPiNock.isDone()).toBeTruthy();
      expect(response.getNotCompletedParts().length).toEqual(numberOfParts);
    }
  );
  it.each<number>([0, 260, 1000])(
    'can not init multi part upload with more than 250 urls',
    async (numberOfParts) => {
      const initAPiNock = nock(mockBaseUrl)
        .post(new RegExp('/files/initmultipartupload'))
        .query({ overwrite: true, parts: numberOfParts })
        .once()
        .reply(201, initResponseForNumberOfParts(1));

      await expect(
        client.files.multipartUploadSession(
          { name: 'test_fbx.fbx', externalId: 'external_id_value' },
          numberOfParts,
          true
        )
      ).rejects.toThrowError('parts must be greater than 0 and less than 250');
      expect(initAPiNock.isDone()).toBeFalsy();
    }
  );
  it.each<number>([1, 2, 5, 240])(
    'part uploads can be run sequential',
    async (numberOfParts) => {
      const requestBody = {
        id: 1478836012846319,
        uploadId:
          'QUJQbnptN1hhWTc2ZXUyWXdfQ29tV0NMTXlqaURiZ2NYd2NURnIxcGtrVHZwQ3oxSmNDRnVxdExTRUxvd3c6NQ==',
      };
      const fileChunks = Array.from({ length: numberOfParts }).map(
        (_, i) => `part${i}`
      );
      const initNock = nock(mockBaseUrl)
        .post(new RegExp('/files/initmultipartupload'))
        .query({ overwrite: true, parts: numberOfParts })
        .once()
        .reply(201, initResponseForNumberOfParts(numberOfParts));
      //mock upload urls
      const uploadNock = nock(mockBaseUrl)
        .put(new RegExp('/uploadurl'))
        .times(numberOfParts)
        .reply(200);
      const completeApiNock = nock(mockBaseUrl)
        .post(new RegExp('/completemultipartupload'), requestBody)
        .once()
        .reply(200);

      const multiPartApiSession = await client.files.multipartUploadSession(
        { name: 'test_fbx.fbx', externalId: 'external_id_value' },
        numberOfParts,
        true
      );
      expect(initNock.isDone()).toBeTruthy();
      for (let i = 0; i < numberOfParts; i++) {
        await multiPartApiSession.uploadPart(i, fileChunks[i]);
      }
      expect(uploadNock.isDone()).toBeTruthy();
      expect(completeApiNock.isDone()).toBeTruthy();
      expect(multiPartApiSession.getNotCompletedParts()).toEqual([]);
      expect(multiPartApiSession.getFinished()).toBeTruthy();
    }
  );

  it.each<number>([1, 2, 5, 100])(
    'part uploads can be run concurrently',
    async (numberOfParts) => {
      const requestBody = {
        id: 1478836012846319,
        uploadId:
          'QUJQbnptN1hhWTc2ZXUyWXdfQ29tV0NMTXlqaURiZ2NYd2NURnIxcGtrVHZwQ3oxSmNDRnVxdExTRUxvd3c6NQ==',
      };
      const fileChunks = Array.from({ length: numberOfParts }).map(
        (_, i) => `part${i}`
      );
      const initNock = nock(mockBaseUrl)
        .post(new RegExp('/files/initmultipartupload'))
        .query({ overwrite: true, parts: numberOfParts })
        .once()
        .reply(201, initResponseForNumberOfParts(numberOfParts));
      //mock upload urls
      const uploadNock = nock(mockBaseUrl)
        .put(new RegExp('/uploadurl'))
        .times(numberOfParts)
        .reply(200);
      const completeApiNock = nock(mockBaseUrl)
        .post(new RegExp('/completemultipartupload'), requestBody)
        .once()
        .reply(200);
      const responseFor5PartUploadPart =
        await client.files.multipartUploadSession(
          { name: 'test_fbx.fbx', externalId: 'external_id_value' },
          numberOfParts,
          true
        );
      expect(initNock.isDone()).toBeTruthy();
      await Promise.all(
        fileChunks.map((fileChunk, i) =>
          responseFor5PartUploadPart.uploadPart(i, fileChunk)
        )
      );
      expect(uploadNock.isDone()).toBeTruthy();

      expect(completeApiNock.isDone()).toBeTruthy();
      expect(responseFor5PartUploadPart.getNotCompletedParts()).toEqual([]);
      expect(responseFor5PartUploadPart.getFinished()).toBeTruthy();
    }
  );
  test('if a concurrent upload call fails, we can resume that part', async () => {
    const numberOfParts = 5;
    const requestBody = {
      id: 1478836012846319,
      uploadId:
        'QUJQbnptN1hhWTc2ZXUyWXdfQ29tV0NMTXlqaURiZ2NYd2NURnIxcGtrVHZwQ3oxSmNDRnVxdExTRUxvd3c6NQ==',
    };
    const fileChunks = Array.from({ length: numberOfParts }).map(
      (_, i) => `part${i}`
    );
    const initNock = nock(mockBaseUrl)
      .post(new RegExp('/files/initmultipartupload'))
      .query({ overwrite: true, parts: numberOfParts })
      .once()
      .reply(201, initResponseForNumberOfParts(numberOfParts));
    //mock upload urls
    const uploadNock = nock(mockBaseUrl)
      .put('/uploadurl0')
      .reply(200)
      .put('/uploadurl1')
      .reply(200)
      .put('/uploadurl3')
      .reply(200)
      .put('/uploadurl4')
      .reply(200)
      .put('/uploadurl2')
      .delay(100)
      .reply(408, 'timeout');
    const completeApiNock = nock(mockBaseUrl)
      .post(new RegExp('/completemultipartupload'), requestBody)
      .once()
      .reply(200);
    const responseFor5PartUploadPart =
      await client.files.multipartUploadSession(
        { name: 'test_fbx.fbx', externalId: 'external_id_value' },
        numberOfParts,
        true
      );
    expect(initNock.isDone()).toBeTruthy();
    try {
      await Promise.all(
        fileChunks.map((fileChunk, i) =>
          responseFor5PartUploadPart.uploadPart(i, fileChunk)
        )
      );
    } catch (error) {
      console.log(error);
    }

    expect(completeApiNock.isDone()).toBeFalsy();
    expect(responseFor5PartUploadPart.getNotCompletedParts()).toEqual([2]);
    //api is fixed now
    uploadNock.put('/uploadurl2').delay(100).once().reply(200);
    // you can call not completed part or all parts again
    // it wont upload completed parts again
    await Promise.all(
      fileChunks.map((fileChunk, i) =>
        responseFor5PartUploadPart.uploadPart(i, fileChunk)
      )
    );
    expect(uploadNock.isDone()).toBeTruthy();
    expect(responseFor5PartUploadPart.getNotCompletedParts()).toEqual([]);
  });
  test('if complete call fails, retrying uploadparts can complete the upload', async () => {
    const numberOfParts = 5;
    const requestBody = {
      id: 1478836012846319,
      uploadId:
        'QUJQbnptN1hhWTc2ZXUyWXdfQ29tV0NMTXlqaURiZ2NYd2NURnIxcGtrVHZwQ3oxSmNDRnVxdExTRUxvd3c6NQ==',
    };
    const fileChunks = Array.from({ length: numberOfParts }).map(
      (_, i) => `part${i}`
    );
    const initNock = nock(mockBaseUrl)
      .post(new RegExp('/files/initmultipartupload'))
      .query({ overwrite: true, parts: numberOfParts })
      .once()
      .reply(201, initResponseForNumberOfParts(numberOfParts));
    //mock upload urls
    const uploadNock = nock(mockBaseUrl)
      .put(new RegExp('/uploadurl'))
      .times(numberOfParts)
      .reply(200);
    const completeApiNockFailsOnce = nock(mockBaseUrl)
      .post(new RegExp('/completemultipartupload'), requestBody)
      .once()
      .delayConnection(500)
      .reply(408, 'timeout');
    const responseFor5PartUploadPart =
      await client.files.multipartUploadSession(
        { name: 'test_fbx.fbx', externalId: 'external_id_value' },
        numberOfParts,
        true
      );
    expect(initNock.isDone()).toBeTruthy();
    try {
      await Promise.all(
        fileChunks.map((fileChunk, i) =>
          responseFor5PartUploadPart.uploadPart(i, fileChunk)
        )
      );
    } catch (error) {
      console.log(error);
    }

    expect(uploadNock.isDone()).toBeTruthy();
    expect(responseFor5PartUploadPart.getNotCompletedParts()).toEqual([]);
    //api is fixed now
    nock.cleanAll();
    await sleepPromise(100);
    completeApiNockFailsOnce
      .post(new RegExp('/completemultipartupload'), requestBody)
      .once()
      .reply(200)
      .persist();

    await Promise.all(
      fileChunks.map((fileChunk, i) =>
        responseFor5PartUploadPart.uploadPart(i, fileChunk)
      )
    );
    expect(completeApiNockFailsOnce.isDone()).toBeTruthy();
  });
  test('can not re-upload completed uploads', async () => {
    const numberOfParts = 5;
    const requestBody = {
      id: 1478836012846319,
      uploadId:
        'QUJQbnptN1hhWTc2ZXUyWXdfQ29tV0NMTXlqaURiZ2NYd2NURnIxcGtrVHZwQ3oxSmNDRnVxdExTRUxvd3c6NQ==',
    };
    const fileChunks = Array.from({ length: numberOfParts }).map(
      (_, i) => `part${i}`
    );
    nock(mockBaseUrl)
      .post(new RegExp('/files/initmultipartupload'))
      .query({ overwrite: true, parts: numberOfParts })
      .once()
      .reply(201, initResponseForNumberOfParts(numberOfParts));

    nock(mockBaseUrl)
      .put(new RegExp('/uploadurl'))
      .times(numberOfParts)
      .reply(200);
    nock(mockBaseUrl)
      .post(new RegExp('/completemultipartupload'), requestBody)
      .once()
      .reply(200, 'success');
    const responseFor5PartUploadPart =
      await client.files.multipartUploadSession(
        { name: 'test_fbx.fbx', externalId: 'external_id_value' },
        numberOfParts,
        true
      );

    await Promise.all(
      fileChunks.map((fileChunk, i) =>
        responseFor5PartUploadPart.uploadPart(i, fileChunk)
      )
    );

    //2. run should throw exception
    await expect(
      Promise.all(
        fileChunks.map(
          async (fileChunk, i) =>
            await responseFor5PartUploadPart.uploadPart(i, fileChunk)
        )
      )
    ).rejects.toThrowError('Upload has already finished');
  });

  it.each<number>([100])(
    'part uploads can be run concurrently with progress',
    async (numberOfParts) => {
      const requestBody = {
        id: 1478836012846319,
        uploadId:
          'QUJQbnptN1hhWTc2ZXUyWXdfQ29tV0NMTXlqaURiZ2NYd2NURnIxcGtrVHZwQ3oxSmNDRnVxdExTRUxvd3c6NQ==',
      };
      const fileChunks = Array.from({ length: numberOfParts }).map(
        (_, i) => `part${i}`
      );
      nock(mockBaseUrl)
        .post(new RegExp('/files/initmultipartupload'))
        .query({ overwrite: true, parts: numberOfParts })
        .once()
        .reply(201, initResponseForNumberOfParts(numberOfParts));
      //mock upload urls
      const uploadNock = nock(mockBaseUrl)
        .put(new RegExp('/uploadurl'))
        .times(numberOfParts)
        .reply(200);
      const completeApiNock = nock(mockBaseUrl)
        .post(new RegExp('/completemultipartupload'), requestBody)
        .once()
        .reply(200);
      const responseFor5PartUploadPart =
        await client.files.multipartUploadSession(
          { name: 'test_fbx.fbx', externalId: 'external_id_value' },
          numberOfParts,
          true
        );
      const uploadPartWithCallback = async (
        api: FilesMultipartUploadSessionAPI,
        fileChunk: Buffer,
        i: number,
        callback = (result: MultiPartFileChunkResponse): void => {
          console.log(result);
        }
      ) => {
        const result = await api.uploadPart(i, fileChunk);
        if (result) {
          return callback(result);
        }
      };
      let totalSize: number = 0;
      let numberOfCallsToCallback = 0;
      const expectedTotalSize = fileChunks.reduce(
        (acc, fileChunk) => acc + fileChunk.length,
        0
      );
      await Promise.all(
        fileChunks.map(
          async (fileChunk, i) =>
            await uploadPartWithCallback(
              responseFor5PartUploadPart,
              Buffer.from(fileChunk),
              i,
              async (result: MultiPartFileChunkResponse) => {
                if (result && result.status === 200) {
                  numberOfCallsToCallback++;
                  totalSize += fileChunk.length;
                  console.log(
                    `Uploaded part ${result.partNumber} with ${fileChunk.length} length uploaded. completed ${totalSize}/${expectedTotalSize} bytes `
                  );
                }
              }
            )
        )
      );

      expect(uploadNock.isDone()).toBeTruthy();
      expect(totalSize).toEqual(expectedTotalSize);
      expect(numberOfParts).toEqual(numberOfCallsToCallback);
      expect(completeApiNock.isDone()).toBeTruthy();
      expect(responseFor5PartUploadPart.getNotCompletedParts()).toEqual([]);
      expect(responseFor5PartUploadPart.getFinished()).toBeTruthy();
    }
  );
});
