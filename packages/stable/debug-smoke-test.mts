// Manual smoke test used to verify the DMS `debug` notices support added in
// PR #1486 against a real project, since the checked-in OpenAPI snapshot
// turned out to be stale/incomplete for this feature (see that PR for
// details on what this surfaced). Not part of the test suite.
//
// Runs against the `DuneSdkStaging` data model (space `dune-sdk-model`) that
// already exists in the target project, using its `Equipment` view — real
// populated data, not empty/synthetic filters. That distinction mattered: the
// first pass of this script used empty-filter queries and only reproduced
// notices already known from the checked-in OpenAPI snapshot. Switching to
// realistic filter/sort shapes against real data surfaced two more notice
// codes (`unfilteredContainerScan`, `filterIncompatibleWithCursorableIndexScan`)
// that have no schema in the snapshot at all.
//
// Usage:
//   yarn build   # from repo root, so @cognite/sdk resolves to fresh dist output
//   SECRETS_ENV_PATH=/path/to/secrets.env node --loader ts-node/esm debug-smoke-test.mts
// from packages/stable. secrets.env must define CDF_CLUSTER, CDF_PROJECT, and
// COGNITE_TOKEN (a valid, short-lived OIDC access token for that project).

import { readFileSync } from 'node:fs';
import { CogniteClient, type ViewReference } from '@cognite/sdk';

function loadSecrets(path: string): Record<string, string> {
  const env: Record<string, string> = {};
  for (const line of readFileSync(path, 'utf-8').split('\n')) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match) {
      env[match[1]] = match[2].trim();
    }
  }
  return env;
}

const secretsEnvPath =
  process.env.SECRETS_ENV_PATH ??
  '/Users/elias.bjorne@cognitedata.com/claude-workspace/secrets.env';
const secrets = loadSecrets(secretsEnvPath);
const { CDF_CLUSTER, CDF_PROJECT, COGNITE_TOKEN } = secrets;

const client = new CogniteClient({
  appId: 'debug-notices-smoke-test',
  project: CDF_PROJECT,
  baseUrl: `https://${CDF_CLUSTER}.cognitedata.com`,
  oidcTokenProvider: async () => COGNITE_TOKEN,
});

const equipmentView: ViewReference = {
  space: 'dune-sdk-model',
  externalId: 'Equipment',
  version: 'v1',
  type: 'view',
};
// A property reference through the view, e.g. ['dune-sdk-model', 'Equipment/v1', 'manufacturer'].
const prop = (name: string) => [
  equipmentView.space,
  `${equipmentView.externalId}/${equipmentView.version}`,
  name,
];

function printNotices(label: string, notices: unknown) {
  console.log(`${label} notices:`, JSON.stringify(notices, null, 2));
}

async function section(title: string, run: () => Promise<void>) {
  console.log(`\n${title}`);
  try {
    await run();
  } catch (err) {
    console.log(
      `  -> call failed (${err instanceof Error ? err.message : err}). Recording this as a result, not aborting the rest of the script.`
    );
  }
}

async function main() {
  console.log(`Project: ${CDF_PROJECT} @ ${CDF_CLUSTER}`);

  await section(
    '=== 1. list: real Equipment items with actual property data ===',
    async () => {
      const listResponse = await client.instances.list({
        instanceType: 'node',
        sources: [{ source: equipmentView }],
        limit: 3,
        debug: {},
      });
      console.log('items:', JSON.stringify(listResponse.items, null, 2));
      printNotices('list', listResponse.debug?.notices);
    }
  );

  await section(
    '=== 2. query: hasData-only filter (no property filter) ===',
    async () => {
      // Expected to trigger unfilteredContainerScan (full container scan) and
      // filterIncompatibleWithCursorableIndexScan with reasons: ["crossContainer"].
      const hasDataOnly = await client.instances.query({
        with: {
          equipment: {
            nodes: { filter: { hasData: [equipmentView] } },
            limit: 5,
          },
        },
        select: {
          equipment: {
            sources: [
              { source: equipmentView, properties: ['name', 'manufacturer'] },
            ],
          },
        },
        debug: {},
      });
      console.log(
        'sample item:',
        JSON.stringify(hasDataOnly.items.equipment?.[0], null, 2)
      );
      printNotices('hasData-only query', hasDataOnly.debug?.notices);
    }
  );

  await section(
    '=== 3. query: OR filter across two manufacturers ===',
    async () => {
      // Expected to trigger filterIncompatibleWithCursorableIndexScan with
      // reasons: ["orFilter"] and orHasNonEqualityBranches: false.
      const orFilter = await client.instances.query({
        with: {
          equipment: {
            nodes: {
              filter: {
                or: [
                  {
                    equals: {
                      property: prop('manufacturer'),
                      value: 'Alfa Laval',
                    },
                  },
                  {
                    equals: {
                      property: prop('manufacturer'),
                      value: 'Yokogawa',
                    },
                  },
                ],
              },
            },
            limit: 3,
          },
        },
        select: {
          equipment: {
            sources: [
              { source: equipmentView, properties: ['name', 'manufacturer'] },
            ],
          },
        },
        debug: {},
      });
      console.log('items:', JSON.stringify(orFilter.items.equipment, null, 2));
      printNotices('OR-filter query', orFilter.debug?.notices);
    }
  );

  await section(
    '=== 4. query: two range predicates on different properties ===',
    async () => {
      // Expected to trigger filterIncompatibleWithCursorableIndexScan with
      // reasons: ["multipleRangePredicates"].
      const multiRange = await client.instances.query({
        with: {
          equipment: {
            nodes: {
              filter: {
                and: [
                  { range: { property: prop('purchaseCost'), gte: 0 } },
                  { range: { property: prop('ratedPowerKw'), gte: 0 } },
                ],
              },
            },
            limit: 3,
          },
        },
        select: {
          equipment: {
            sources: [{ source: equipmentView, properties: ['name'] }],
          },
        },
        debug: {},
      });
      printNotices('multi-range query', multiRange.debug?.notices);
    }
  );

  await section(
    '=== 5. query: selective externalId equality filter, profile mode ===',
    async () => {
      // emitResults: false — items/nextCursor should stay present but empty.
      const profileResponse = await client.instances.query({
        with: {
          equipment: {
            nodes: {
              filter: {
                equals: {
                  property: ['node', 'externalId'],
                  value: 'eq:000000000',
                },
              },
            },
            limit: 1,
          },
        },
        select: {
          equipment: {
            sources: [{ source: equipmentView, properties: ['name'] }],
          },
        },
        debug: { emitResults: false, profile: true },
      });
      console.log(
        'items (expect present but empty):',
        JSON.stringify(profileResponse.items, null, 2)
      );
      printNotices('profile-mode query', profileResponse.debug?.notices);
    }
  );

  await section(
    '=== 6a. sync: WITHOUT a space filter (may legitimately time out on a large project) ===',
    async () => {
      const syncNoSpaceFilter = await client.instances.sync({
        with: {
          equipment: {
            nodes: { filter: { hasData: [equipmentView] } },
            limit: 1,
          },
        },
        select: { equipment: {} },
        debug: {},
      });
      printNotices('sync (no space filter)', syncNoSpaceFilter.debug?.notices);
    }
  );

  await section('=== 6b. sync: WITH a space filter ===', async () => {
    const syncWithSpaceFilter = await client.instances.sync({
      with: {
        equipment: {
          nodes: {
            filter: {
              equals: { property: ['node', 'space'], value: 'dune-sdk-shared' },
            },
          },
          limit: 1,
        },
      },
      select: { equipment: {} },
      debug: {},
    });
    printNotices(
      'sync (with space filter)',
      syncWithSpaceFilter.debug?.notices
    );
  });

  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Smoke test failed:', err);
  process.exit(1);
});
