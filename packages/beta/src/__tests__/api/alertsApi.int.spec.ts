// Copyright 2020 Cognite AS

import { CogniteError } from '@cognite/sdk-core';
import CogniteClient from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';
import { AlertCreate } from '@cognite/sdk-beta/dist';

describe('alerts api', () => {
  const client: CogniteClient = setupLoggedInClient();
  const ts = Date.now();
  const channelExternalId = `test_channel_${ts}`;
  const alertExternalId = `test_alert_${ts}`;
  const email = `ivan.polomanyi+${ts}@cognite.com`;

  test('create channels', async () => {
    const response = await client.alerts.createChannels([
      {
        externalId: channelExternalId,
        name: channelExternalId,
        description: 'test',
      },
    ]);
    expect(response.length).toBe(1);
    expect(response[0].externalId).toBe(channelExternalId);
  });

  test('create channels with deduplication params', async () => {
    const channelExternalIdWithDeduplication = channelExternalId + '_dedup';
    const response = await client.alerts.createChannels([
      {
        externalId: channelExternalIdWithDeduplication,
        name: channelExternalIdWithDeduplication,
        description: 'test with deduplication params',
        alertRules: {
          deduplication: {
            activationInterval: '10m',
            mergeInterval: '1m',
          },
        },
      },
    ]);
    expect(response.length).toBe(1);
    expect(response[0].externalId).toBe(channelExternalIdWithDeduplication);
    expect(response[0].alertRules?.deduplication).toEqual({
      activationInterval: '10m',
      mergeInterval: '1m',
    });
  });

  test('update channel name', async () => {
    const updatedName = channelExternalId + '_updated';
    const response = await client.alerts.updateChannels([
      {
        externalId: channelExternalId,
        update: {
          name: {
            set: updatedName,
          },
        },
      },
    ]);

    expect(response.length).toBe(1);
    expect(response[0].name).toBe(updatedName);
  });

  test('list channels', async () => {
    const response = await client.alerts.listChannels({
      filter: { externalIds: [channelExternalId] },
    });
    expect(response.items.length).toEqual(1);
    expect(response.items[0].externalId).toBe(channelExternalId);
  });

  test('create alerts', async () => {
    const response = await client.alerts.create([
      {
        source: 'smth',
        channelExternalId,
        externalId: alertExternalId,
        level: 'DEBUG',
      },
    ]);
    expect(response.length).toBe(1);
  });

  test('close alerts', async () => {
    const response = await client.alerts.close([
      {
        externalId: alertExternalId,
      },
    ]);
    expect(response).toEqual({});
  });

  test('list alerts', async () => {
    const response = await client.alerts.list({
      filter: {
        channelExternalIds: [channelExternalId],
      },
    });
    expect(response.items.length).toEqual(1);
  });

  test('create subscribers', async () => {
    try {
      await client.alerts.createSubscribers([
        {
          email,
          externalId: email,
        },
      ]);
    } catch (error) {
      expect((error as CogniteError).status).toBe(400);
    }
  });

  test('list subscribers', async () => {
    try {
      await client.alerts.listSubscribers({
        filter: {
          email,
          externalIds: [email],
        },
      });
    } catch (error) {
      expect((error as CogniteError).status).toBe(400);
    }
  });

  test('create subscriptions', async () => {
    try {
      await client.alerts.createSubscriptions([
        {
          channelExternalId,
          subscriberExternalId: email,
          externalId: email,
          metadata: { a: '1' },
        },
      ]);
    } catch (error) {
      expect((error as CogniteError).status).toBe(400);
    }
  });

  test('list subscriptions', async () => {
    try {
      await client.alerts.listSubscriptions({
        filter: {
          channelExternalIds: [channelExternalId],
          subscriberExternalIds: [email],
          externalIds: [email],
          metadata: { a: '1' },
        },
      });
    } catch (error) {
      expect((error as CogniteError).status).toBe(400);
    }
  });

  test('delete subscriptions', async () => {
    const response = await client.alerts.deleteSubscription([
      {
        externalId: email,
      },
    ]);
    expect(response).toEqual({});
  });

  test('delete subscriber', async () => {
    const response = await client.alerts.deleteSubscribers([
      {
        externalId: email,
      },
    ]);
    expect(response).toEqual({});
    const emptyRes = await client.alerts.listSubscribers({
      filter: {
        email,
      },
    });
    expect(emptyRes.items.length).toBe(0);
  });

  test('delete channel', async () => {
    const response = await client.alerts.deleteChannels([
      {
        externalId: channelExternalId,
      },
    ]);
    expect(response).toEqual({});
  });

  test('sort alerts', async () => {
    const response = await client.alerts.list({
      sort: {
        property: 'createdTime',
        order: 'desc',
      },
    });
    expect(response.items.length).toBeGreaterThan(0);
  });

  test('test limit', async () => {
    // create channel for the next test
    const channelsToCreate = [
      {
        externalId: channelExternalId,
        name: 'Test Channel',
      },
    ];
    await client.alerts.createChannels(channelsToCreate);

    // create 10 alerts
    const alerts = Array.from({ length: 10 }).map((_, i) => ({
      source: 'smth',
      channelExternalId,
      externalId: `test_limit_extId_${i}`,
    }));
    await client.alerts.create(alerts);

    const response = await client.alerts.list({
      limit: 10,
    });
    expect(response.items.length).toBe(10);

    // delete the channel
    await client.alerts.deleteChannels([{ externalId: channelExternalId }]);
  });

  test('cursor pagination', async () => {
    // create channel for the next test
    const channelsToCreate = [
      {
        externalId: channelExternalId,
        name: 'Test Channel',
      },
    ];
    await client.alerts.createChannels(channelsToCreate);

    const response = await client.alerts.list({
      limit: 1,
      sort: {
        property: 'createdTime',
        order: 'desc',
      },
      cursor: '',
    });
    expect(response.items.length).toBe(1);

    // function to create alerts in batches
    const createAlerts = async (alerts: AlertCreate[]) => {
      await client.alerts.create(alerts);
    };

    // create alerts in batches of 100
    const totalAlerts = 1000; // Total number of alerts to create
    const batchSize = 100; // Size of each batch

    // Generate and create alerts in batches
    for (let i = 0; i < totalAlerts; i += batchSize) {
      const alertsToCreate = Array.from({ length: batchSize }, (_, j) => ({
        source: 'smth',
        channelExternalId,
        externalId: `external_id_test_cursor_${i + j}`,
      }));
      await createAlerts(alertsToCreate);
    }
    // create one extra alert
    await client.alerts.create([
      {
        source: 'smth',
        channelExternalId,
        externalId: `external_id_test_cursor_0_1000`,
      },
    ]);

    const alerts = client.alerts
      .list({
        sort: {
          property: 'createdTime',
          order: 'desc',
        },
      })
      .autoPagingToArray({ limit: 1001 });

    expect((await alerts).length).toBeGreaterThan(1000);

    // clean up created alerts
    const alertsToDelete = Array.from({ length: 1001 }, (_, i) => ({
      externalId: `external_id_test_cursor_${i}`,
    }));
    await client.alerts.deleteChannels(alertsToDelete);
  });
});
