// Copyright 2026 Cognite AS

import type { Datapoints, DoubleDatapoint } from '@cognite/sdk';
import { describe, expect, test } from 'vitest';
import {
  randomInt,
  runTestWithRetryWhenFailing,
} from '../../../../core/src/__tests__/testUtils';
import type CogniteClient from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

describe.skipIf(!process.env.COGNITE_PROJECT || !process.env.COGNITE_BASE_URL)(
  'datapoints insertWithUnitConversion (beta)',
  () => {
    test(
      'converts °F to stored °C before insert',
      async () => {
        const client: CogniteClient = setupLoggedInClient();
        const externalId = `beta_unit_write_${randomInt()}`;
        const [created] = await client.timeseries.create([
          {
            name: 'beta insertWithUnitConversion',
            externalId,
            unitExternalId: 'temperature:deg_c',
          },
        ]);

        const tsId = created.id;
        const timestamp = Date.now();

        try {
          await client.datapoints.insertWithUnitConversion([
            {
              id: tsId,
              sourceUnit: 'temperature:deg_f',
              datapoints: [{ timestamp, value: 212 }],
            },
          ]);

          await runTestWithRetryWhenFailing(async () => {
            const res = (await client.datapoints.retrieve({
              items: [
                {
                  id: tsId,
                  start: new Date(timestamp - 60_000),
                  end: new Date(timestamp + 60_000),
                },
              ],
            })) as Datapoints[];

            expect(res.length).toBe(1);
            expect(res[0].datapoints.length).toBeGreaterThan(0);
            expect((res[0].datapoints[0] as DoubleDatapoint).value).toBeCloseTo(
              100,
              5
            );
          });
        } finally {
          await client.timeseries.delete([{ id: tsId }]);
        }
      },
      3 * 60 * 1000
    );
  }
);
