// Copyright 2026 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type {
  TransformationNotification,
  TransformationNotificationCreate,
} from '../../types';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('Transformation notifications unit test', () => {
  let client: CogniteClient;

  const notificationCreates: TransformationNotificationCreate[] = [
    { transformationId: 1, destination: 'me@example.com' },
    {
      transformationExternalId: 'my-transformation',
      destination: 'team@example.com',
    },
  ];

  const notifications: TransformationNotification[] = [
    {
      id: 10,
      createdTime: 1730000000000,
      lastUpdatedTime: 1730000001000,
      transformationId: 1,
      destination: 'me@example.com',
    },
    {
      id: 11,
      createdTime: 1730000000000,
      lastUpdatedTime: 1730000001000,
      transformationId: 1,
      destination: 'team@example.com',
    },
  ];

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('create', async () => {
    nock(mockBaseUrl)
      .post(/\/transformations\/notifications$/, {
        items: notificationCreates,
      })
      .once()
      .reply(200, { items: notifications });

    const created =
      await client.transformations.notifications.create(notificationCreates);
    expect(created).toEqual(notifications);
  });

  test('list', async () => {
    nock(mockBaseUrl)
      .get(/\/transformations\/notifications\/?$/)
      .query({
        limit: '10',
        transformationExternalId: 'my-transformation',
        destination: 'me@example.com',
      })
      .once()
      .reply(200, { items: [notifications[0]], nextCursor: 'next' });

    const response = await client.transformations.notifications.list({
      limit: 10,
      transformationExternalId: 'my-transformation',
      destination: 'me@example.com',
    });
    expect({
      items: response.items,
      nextCursor: response.nextCursor,
    }).toEqual({ items: [notifications[0]], nextCursor: 'next' });
  });

  test('list without query', async () => {
    nock(mockBaseUrl)
      .get(/\/transformations\/notifications\/?$/)
      .once()
      .reply(200, { items: notifications });

    const response = await client.transformations.notifications.list();
    expect(response.items).toEqual(notifications);
  });

  test('delete', async () => {
    nock(mockBaseUrl)
      .post(/\/transformations\/notifications\/delete$/, {
        items: [{ id: 10 }, { id: 11 }],
      })
      .once()
      .reply(200, {});

    const response = await client.transformations.notifications.delete([
      { id: 10 },
      { id: 11 },
    ]);
    expect(response).toEqual({});
  });
});
