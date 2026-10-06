// Copyright 2026 Cognite AS

import matches from 'lodash/matches';
import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import { mockBaseUrl } from '../../../../core/src/__tests__/testUtils';
import type CogniteClientAlpha from '../../cogniteClient';
import { setupMockableClient } from '../testUtils';

describe('Transformations external data unit test', () => {
  let client: CogniteClientAlpha;

  const oneLakeCreateBody = {
    externalId: 'my-fabric-source',
    name: 'Fabric - production lakehouse',
    format: 'one_lake' as const,
    dataSetId: 1,
    settings: {
      credentials: {
        clientId: 'client-id',
        tenantId: 'tenant-id',
        clientSecret: 'client-secret',
      },
      locationDescription: {
        workspaceId: 'workspace-id',
        containerId: 'container-id',
      },
    },
  };

  const oneLakeSource = {
    externalId: 'my-fabric-source',
    name: 'Fabric - production lakehouse',
    format: 'one_lake' as const,
    dataSetId: 1,
    settings: {
      credentials: {
        clientId: 'client-id',
        tenantId: 'tenant-id',
      },
      locationDescription: {
        workspaceId: 'workspace-id',
        containerId: 'container-id',
      },
    },
    createdTime: 1730204346000,
    lastUpdatedTime: 1730204346000,
  };

  const snowflakeCreateBody = {
    externalId: 'snowflake-sales-prod',
    name: 'Snowflake Sales (prod)',
    format: 'snowflake' as const,
    dataSetId: 3627849102345678,
    settings: {
      credentials: {
        accountIdentifier: 'myorg-myaccount',
        userName: 'COGNITE_TRANSFORMATIONS_SVC',
        roleName: 'COGNITE_TRANSFORMATIONS_ROLE',
      },
      locationDescription: {
        warehouseName: 'COGNITE_WH',
      },
    },
    expiryTime: 1692374400000,
  };

  const snowflakeSource = {
    externalId: 'snowflake-sales-prod',
    name: 'Snowflake Sales (prod)',
    format: 'snowflake' as const,
    dataSetId: 3627849102345678,
    settings: {
      credentials: {
        accountIdentifier: 'myorg-myaccount',
        userName: 'COGNITE_TRANSFORMATIONS_SVC',
        roleName: 'COGNITE_TRANSFORMATIONS_ROLE',
        publicKey:
          '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8B',
      },
      locationDescription: {
        warehouseName: 'COGNITE_WH',
      },
    },
    expiryTime: 1692374400000,
    createdTime: 1692374400000,
    lastUpdatedTime: 1692374400000,
  };

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('create one lake', async () => {
    nock(mockBaseUrl)
      .post(
        /\/transformations\/externaldata\/?$/,
        matches({ items: [oneLakeCreateBody] })
      )
      .once()
      .reply(200, { items: [oneLakeSource] });

    const items = await client.transformationsExternalData.create([
      oneLakeCreateBody,
    ]);

    expect(items).toHaveLength(1);
    expect(items[0].format).toEqual('one_lake');
    if (items[0].format !== 'one_lake') {
      throw new Error('expected one_lake source');
    }
    expect(items[0].settings.credentials).not.toHaveProperty('clientSecret');
  });

  test('create snowflake', async () => {
    nock(mockBaseUrl)
      .post(
        /\/transformations\/externaldata\/?$/,
        matches({ items: [snowflakeCreateBody] })
      )
      .once()
      .reply(201, { items: [snowflakeSource] });

    const items = await client.transformationsExternalData.create([
      snowflakeCreateBody,
    ]);

    expect(items).toHaveLength(1);
    expect(items[0].format).toEqual('snowflake');
    if (items[0].format !== 'snowflake') {
      throw new Error('expected snowflake source');
    }
    expect(items[0].settings.credentials.publicKey).toContain(
      'BEGIN PUBLIC KEY'
    );
    expect(items[0].expiryTime).toBe(1692374400000);
    expect(items[0].settings.locationDescription.warehouseName).toBe(
      'COGNITE_WH'
    );
  });

  test('list', async () => {
    nock(mockBaseUrl)
      .get(/\/transformations\/externaldata\/?$/)
      .query({ limit: '50', format: 'snowflake' })
      .once()
      .reply(200, {
        items: [snowflakeSource],
        nextCursor: 'cursor_for_next_page',
      });

    const response = await client.transformationsExternalData.list({
      limit: 50,
      format: 'snowflake',
    });

    expect(response.items).toHaveLength(1);
    expect(response.items[0].externalId).toBe('snowflake-sales-prod');
    expect(response.items[0].format).toBe('snowflake');
    expect(response.nextCursor).toBe('cursor_for_next_page');
  });

  test('delete', async () => {
    nock(mockBaseUrl)
      .post(/\/transformations\/externaldata\/delete$/, {
        items: [{ externalId: 'snowflake-sales-prod' }],
      })
      .once()
      .reply(200, {});

    await client.transformationsExternalData.delete([
      { externalId: 'snowflake-sales-prod' },
    ]);
  });

  test('usability', async () => {
    nock(mockBaseUrl)
      .post(
        /\/transformations\/externaldata\/usability$/,
        matches({ externalId: 'my-fabric-source' })
      )
      .once()
      .reply(200, {
        externalId: { externalId: 'my-fabric-source' },
        usableVersion: '9f2b1c34-5d6e-4f70-8a91-b2c3d4e5f607',
      });

    const status = await client.transformationsExternalData.usability({
      externalId: 'my-fabric-source',
    });

    expect(status.externalId.externalId).toBe('my-fabric-source');
    expect(status.usableVersion).toBe('9f2b1c34-5d6e-4f70-8a91-b2c3d4e5f607');
  });

  test('byExternalId', async () => {
    nock(mockBaseUrl)
      .get(/\/transformations\/externaldata\/byExternalId$/)
      .query({ externalId: 'snowflake-sales-prod' })
      .once()
      .reply(200, snowflakeSource);

    const source = await client.transformationsExternalData.byExternalId(
      'snowflake-sales-prod'
    );

    expect(source.externalId).toBe('snowflake-sales-prod');
    expect(source.format).toBe('snowflake');
    if (source.format !== 'snowflake') {
      throw new Error('expected snowflake source');
    }
    expect(source.settings.credentials.accountIdentifier).toBe(
      'myorg-myaccount'
    );
  });

  test('rotateKeys', async () => {
    nock(mockBaseUrl)
      .post(/\/transformations\/externaldata\/rotatekeys$/, {
        items: [
          {
            externalId: 'snowflake-sales-prod',
            expiryTime: 1692374400000,
          },
        ],
      })
      .once()
      .reply(200, {
        items: [
          {
            externalId: 'snowflake-sales-prod',
            publicKey:
              '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8B',
            expiryTime: 1692374400000,
          },
        ],
      });

    const keys = await client.transformationsExternalData.rotateKeys([
      {
        externalId: 'snowflake-sales-prod',
        expiryTime: 1692374400000,
      },
    ]);

    expect(keys).toHaveLength(1);
    expect(keys[0].externalId).toBe('snowflake-sales-prod');
    expect(keys[0].publicKey).toContain('BEGIN PUBLIC KEY');
    expect(keys[0].expiryTime).toBe(1692374400000);
  });
});
