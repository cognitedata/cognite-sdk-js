// Copyright 2020 Cognite AS

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { HttpResponseType } from '@cognite/sdk-core';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type {
  Asset,
  FileGeoLocation,
  FileInfo,
  LabelDefinition,
  NodeWrite,
} from '../../types';
import {
  getFileCreateArgs,
  randomInt,
  runTestWithRetryWhenFailing,
  setupLoggedInClient,
} from '../testUtils';

const testfile = join(__dirname, '../test3dFile.fbx');

describe('Files integration test', () => {
  let client: CogniteClient;
  let asset: Asset;
  let label: LabelDefinition;

  const testSpace = {
    space: 'test_data_space',
    name: 'test_data_space',
    description: 'Instance space used for integration tests.',
  };

  const fileCdmInstance: NodeWrite = {
    externalId: `external_${randomInt()}`,
    space: testSpace.space,
    instanceType: 'node',
    sources: [
      {
        source: {
          externalId: 'CogniteFile',
          space: 'cdf_cdm',
          type: 'view',
          version: 'v1',
        },
        properties: {},
      },
    ],
  };

  const fileCdmInstanceId = {
    externalId: fileCdmInstance.externalId,
    space: fileCdmInstance.space,
  };

  beforeAll(async () => {
    client = setupLoggedInClient();
    [asset] = await client.assets.create([
      {
        name: `asset_${randomInt()}`,
      },
    ]);
    [label] = await client.labels.create([
      {
        externalId: `test-file-lable-${randomInt()}`,
        name: 'file-label',
        description: 'test label',
      },
    ]);
    await client.spaces.upsert([testSpace]);
    await client.instances.upsert({
      items: [fileCdmInstance],
    });
  });

  afterAll(async () => {
    await client.assets.delete([{ id: asset.id }]);
    await client.labels.delete([{ externalId: label.externalId }]);
    await client.instances.delete([
      {
        instanceType: 'node',
        externalId: fileCdmInstance.externalId,
        space: fileCdmInstance.space,
      },
    ]);
  });

  const geoLocation: FileGeoLocation = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [10, 20],
    },
    properties: {
      test: 'testProp',
    },
  };

  const { fileContent, localFileMeta, postfix, sourceCreatedTime } =
    getFileCreateArgs({ geoLocation });

  let file: FileInfo;

  test.skip('create', async () => {
    file = await client.files.upload(
      {
        ...localFileMeta,
        labels: [{ externalId: label.externalId }],
      },
      fileContent,
      false,
      true
    );
  });

  test.skip('geoLocation present in created file', () => {
    expect(file.geoLocation).toEqual(localFileMeta.geoLocation);
  });

  test.skip('validate directoryPrefix format against CDF', async () => {
    await client.files.list({
      filter: {
        directoryPrefix: '/test',
      },
    });
  });

  test.skip('retrieve', async () => {
    const [retrievedFile] = await client.files.retrieve([{ id: file.id }]);
    expect(retrievedFile.mimeType).toBe(localFileMeta.mimeType);
    expect(retrievedFile.uploaded).toBeTruthy();
    expect(retrievedFile.sourceCreatedTime).toEqual(sourceCreatedTime);
    expect(retrievedFile.directory).toEqual('/test/testing');
  });

  test('retrieve by instance id', async () => {
    const [retrievedFile] = await client.files.retrieve([
      { instanceId: fileCdmInstanceId },
    ]);
    expect(retrievedFile.instanceId).toEqual(fileCdmInstanceId);
  });

  test('update by instance id', async () => {
    const testMetadata = { testKey: 'testVal' };
    const [retrievedFile] = await client.files.update([
      {
        instanceId: fileCdmInstanceId,
        update: { metadata: { set: testMetadata } },
      },
    ]);
    expect(retrievedFile.instanceId).toEqual(fileCdmInstanceId);
    expect(retrievedFile.metadata).toEqual(testMetadata);
  });

  test('download by instance id', async () => {
    try {
      await client.files.getDownloadUrls([{ instanceId: fileCdmInstanceId }]);
      throw new Error('This test should not succeed');
    } catch (err: unknown) {
      if (err instanceof Error) {
        // We are happy as long as the API can identify the file and tell us it is not uploaded
        expect(err.message).toMatch(/Files not uploaded/);
      } else {
        throw new Error('Unexpected error');
      }
    }
  });

  test.skip('retrieve with non-existent id', async () => {
    const res = await client.files.retrieve([{ id: 1 }], {
      ignoreUnknownIds: true,
    });
    expect(res.length).toBe(0);
  });

  test.skip('count aggregate', async () => {
    const aggregates = await client.files.aggregate({
      filter: {
        name: file.name,
      },
    });
    expect(aggregates.length).toBe(1);
    expect(aggregates[0].count).toBeDefined();
  });

  test.skip('count aggregate by label', async () => {
    const aggregates = await client.files.aggregate({
      filter: {
        labels: {
          containsAny: [{ externalId: label.externalId }],
        },
      },
    });

    expect(aggregates.length).toBe(1);
    expect(aggregates[0].count).toBeDefined();
  });

  test.skip('count aggregate by geoLocation', async () => {
    const aggregates = await client.files.aggregate({
      filter: {
        geoLocation: {
          relation: 'intersects',
          shape: {
            type: 'Point',
            coordinates: [10, 20],
          },
        },
      },
    });

    expect(aggregates.length).toBeGreaterThan(0);
    expect(aggregates[0].count).toBeDefined();
  });

  test.skip('download', async () => {
    const [{ downloadUrl }] = await client.files.getDownloadUrls([
      { id: file.id },
    ]);
    expect(downloadUrl).toBeDefined();
    const response = await client.get(downloadUrl, {
      responseType: HttpResponseType.Text,
    });
    expect(response.data).toBe(fileContent);
  });

  test.skip('update', async () => {
    const newAssetIds = [asset.id];
    const newSecurityCategories = [123];
    const newSource = 'def';
    const newSourceModifiedTime = new Date();
    const location: FileGeoLocation = {
      ...geoLocation,
      geometry: {
        type: 'LineString',
        coordinates: [
          [10, 20],
          [10, 40],
        ],
      },
    };
    const updatedFiles = await client.files.update([
      {
        id: file.id,
        update: {
          assetIds: { set: newAssetIds },
          securityCategories: { set: newSecurityCategories },
          source: { set: newSource },
          sourceModifiedTime: { set: newSourceModifiedTime },
          geoLocation: { set: location },
        },
      },
    ]);
    expect(updatedFiles[0].assetIds).toEqual(newAssetIds);
    expect(updatedFiles[0].securityCategories).toEqual(newSecurityCategories);
    expect(updatedFiles[0].source).toBe(newSource);
    expect(updatedFiles[0].sourceModifiedTime).toEqual(newSourceModifiedTime);
    expect(updatedFiles[0].geoLocation).toEqual(location);
  });

  test.skip('list rootAssetIds filter', async () => {
    runTestWithRetryWhenFailing(async () => {
      const { items } = await client.files.list({
        filter: {
          rootAssetIds: [{ id: asset.id }],
        },
        limit: 1,
      });
      expect(items[0].id).toEqual(file.id);
    });
  });

  test.skip('list assetSubtreeIds filter', async () => {
    const { items } = await client.files.list({
      filter: {
        assetSubtreeIds: [{ id: asset.id }],
      },
      limit: 1,
    });
    expect(items).toBeInstanceOf(Array); // cannot check exact response because of [CDF-1614] bug
  });

  test.skip('upload with overwrite', async () => {
    await client.files.upload(localFileMeta, fileContent, true, true);
  });

  test.skip('list geoLocation filter', async () => {
    runTestWithRetryWhenFailing(async () => {
      const items = await client.files
        .list({
          filter: {
            geoLocation: {
              relation: 'intersects',
              shape: {
                type: 'LineString',
                coordinates: [
                  [0, 30],
                  [20, 30],
                ],
              },
            },
          },
          limit: 1,
        })
        .autoPagingToArray();

      expect(items.length).toBe(1);
      expect(items[0].id).toBe(file.id);
    });
  });

  test.skip('list', async () => {
    const response = await client.files.list().autoPagingToArray({ limit: 10 });
    expect(response.length).toBeGreaterThan(0);
    expect(response[0].id).toBeDefined();
  });

  test.skip('search', async () => {
    const result = await client.files.search({
      search: {
        name: 'filename_',
      },
    });
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  describe.skip('binary file', () => {
    const binaryFileMeta = {
      name: `filename_1_${postfix}`,
      mimeType: 'application/octet-stream',
    };
    const fileContentBinary = readFileSync(testfile);
    let binaryFile: FileInfo;

    test.skip('create', async () => {
      binaryFile = await client.files.upload(
        binaryFileMeta,
        fileContentBinary,
        false,
        true
      );
    });

    test.skip('download', async () => {
      const [{ downloadUrl }] = await client.files.getDownloadUrls([
        { id: binaryFile.id },
      ]);
      expect(downloadUrl).toBeDefined();
      const response = await client.get<ArrayBuffer>(downloadUrl, {
        responseType: HttpResponseType.ArrayBuffer,
      });
      expect(response.data).toEqual(fileContentBinary.buffer);
    });
  });

  test.skip('list by label', async () => {
    const { items } = await client.files.list({
      filter: {
        labels: {
          containsAll: [{ externalId: label.externalId }],
        },
      },
    });

    expect(items.length).toBe(1);
    expect(items[0].id).toBe(file.id);
  });

  test.skip('update file by removing label', async () => {
    const [updatedFile] = await client.files.update([
      {
        id: file.id,
        update: {
          labels: {
            remove: [{ externalId: label.externalId }],
          },
        },
      },
    ]);

    expect(updatedFile.labels).toBe(undefined);
  });

  test.skip('update file by removing geoLocation', async () => {
    const [updatedFile] = await client.files.update([
      {
        id: file.id,
        update: {
          geoLocation: { setNull: true },
        },
      },
    ]);

    expect(updatedFile.geoLocation).toBe(undefined);
  });

  test.skip('delete', async () => {
    const response = await client.files.delete([{ id: file.id }]);
    expect(response).toEqual({});
  });
});
