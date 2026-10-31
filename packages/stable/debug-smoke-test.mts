// Manual smoke test for the DMS `debug` notices support added in PR #1486,
// run against a real project. Not part of the test suite.
//
// Runs read-only (list/query/sync) against the `DuneSdkStaging` data model
// (space `dune-sdk-model`) that already exists in the target project, using
// its populated `Equipment` view. Realistic filter and sort shapes matter:
// empty-filter queries on empty result sets only reproduce the generic
// notices, while the shapes below trigger `unfilteredContainerScan`,
// `filterIncompatibleWithCursorableIndexScan`, `suggestedCursorableSort`,
// `syncMissingSpaceFilter` and `noTimeoutWithResults`.
//
// Usage (from packages/stable, after `yarn build` in packages/core and here):
//   COGNITE_TOKEN=... node debug-smoke-test.mts
// Optional: CDF_PROJECT (default dune-sdk-staging), CDF_CLUSTER (default
// bluefield), or SECRETS_ENV_PATH pointing at a KEY=VALUE file that defines
// them. Node 22+ runs the file directly; older Node needs `--loader ts-node/esm`.
//
// Output contains counts, cursor shapes and the notices themselves. It never
// prints instance records or the token.
//
// Observed on dune-sdk-staging (bluefield), 2026-09-17 and 2026-10-09, with
// the SDK types from #1486 validated against every notice:
//   1  list, debug {}                 unfilteredContainerScan (filtering, D),
//                                     filterIncompatibleWithCursorableIndexScan (indexing, D, reasons [crossContainer])
//   2  query hasData-only             same two notices
//   3  query OR of two equals         filterIncompatibleWithCursorableIndexScan, reasons [orFilter], orHasNonEqualityBranches false
//   4  query two range predicates     filterIncompatibleWithCursorableIndexScan, reasons [multipleRangePredicates]
//   5  query externalId equals,       items { equipment: [] }, nextCursor {}  (present, empty);
//      emitResults false, profile     suggestedCursorableSort (sorting, C) with suggestedSort and suggestedIndex
//   5b query hasData, emitResults     items { equipment: [] }, nextCursor {} although the filter matches data
//   5c query with debug.timeout and   noTimeoutWithResults (invalidDebugOptions, no grade)
//      results enabled
//   6a sync, no space filter          syncMissingSpaceFilter (sync, C) + unfilteredContainerScan. Flaky: returned
//                                     408 "Graph query timed out" on one of two runs with an identical request
//   6b sync, node.space equals        no notices
//   7  list, emitResults false        items [] and nextCursor ABSENT (unlike query, where it is {})
//   8  query/list without debug       no `debug` key on the response
// Not reproduced with these shapes: reasons `nonCursorableProperty` (seen on 2026-09-17 only).

import { readFileSync } from 'node:fs';
import {
  CogniteClient,
  type DebugNotice,
  type ViewReference,
} from '@cognite/sdk';

function loadSecretsFile(path: string): void {
  for (const line of readFileSync(path, 'utf-8').split('\n')) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].trim();
    }
  }
}

if (process.env.SECRETS_ENV_PATH) {
  loadSecretsFile(process.env.SECRETS_ENV_PATH);
}
const token = process.env.COGNITE_TOKEN;
if (!token) {
  console.error(
    'COGNITE_TOKEN is not set. Export a short-lived OIDC access token for the target project, or point SECRETS_ENV_PATH at a KEY=VALUE file that defines it.'
  );
  process.exit(2);
}
const project = process.env.CDF_PROJECT ?? 'dune-sdk-staging';
const cluster = process.env.CDF_CLUSTER ?? 'bluefield';

const client = new CogniteClient({
  appId: 'debug-notices-smoke-test',
  project,
  baseUrl: `https://${cluster}.cognitedata.com`,
  oidcTokenProvider: async () => token,
});

const equipmentView = {
  space: 'dune-sdk-model',
  externalId: 'Equipment',
  version: 'v1',
  type: 'view',
} as const satisfies ViewReference;
// A property reference through the view, e.g. ['dune-sdk-model', 'Equipment/v1', 'manufacturer'].
const prop = (name: string) => [
  equipmentView.space,
  `${equipmentView.externalId}/${equipmentView.version}`,
  name,
];

// Every code the SDK types know about. The `Record<DebugNotice['code'], true>`
// annotation makes this a compile error as soon as the union and this list
// disagree, in either direction.
const KNOWN_CODES: Record<DebugNotice['code'], true> = {
  containersWithoutIndexesInvolved: true,
  excessiveTimeout: true,
  filterIncompatibleWithCursorableIndexScan: true,
  filterMatchesBrokenCursorableIndex: true,
  filterMatchesCursorableSort: true,
  intractableCursorWithNestedFilter: true,
  intractableDirectRelationsCursor: true,
  noTimeoutWithResults: true,
  selectiveExternalIDFilter: true,
  significantHasDataFiltering: true,
  significantPostFiltering: true,
  sortNotBackedByIndex: true,
  suggestedCursorableSort: true,
  syncMissingSpaceFilter: true,
  unfilteredContainerScan: true,
  unindexedThrough: true,
};

let problems = 0;

function printNotices(notices: DebugNotice[] | undefined): void {
  if (!notices || notices.length === 0) {
    console.log('  notices: none');
    return;
  }
  for (const notice of notices) {
    const extra: string[] = [];
    if ('grade' in notice) extra.push(`grade=${notice.grade}`);
    if ('reasons' in notice)
      extra.push(`reasons=${JSON.stringify(notice.reasons)}`);
    if ('orHasNonEqualityBranches' in notice)
      extra.push(`orHasNonEqualityBranches=${notice.orHasNonEqualityBranches}`);
    if ('suggestedSort' in notice)
      extra.push(
        `suggestedSort=${JSON.stringify(notice.suggestedSort)} suggestedIndex=${notice.suggestedIndex.space}/${notice.suggestedIndex.containerExternalId}/${notice.suggestedIndex.identifier}`
      );
    console.log(
      `  notice ${notice.code} (${notice.category}, ${notice.level}) ${extra.join(' ')}`
    );
    console.log(`    hint: ${notice.hint}`);
    if (!(notice.code in KNOWN_CODES)) {
      problems++;
      console.log(
        `    PROBLEM: code is not in the DebugNotice union; keys=${Object.keys(notice).join(',')}`
      );
    }
  }
}

/** Describes `items` / `nextCursor` without printing any record. */
function shape(value: unknown): string {
  if (value === undefined) return 'absent';
  if (Array.isArray(value)) return `array(${value.length})`;
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    return `{ ${entries.map(([k, v]) => `${k}: ${shape(v)}`).join(', ')} }`;
  }
  return typeof value;
}

async function section(title: string, run: () => Promise<void>) {
  console.log(`\n=== ${title} ===`);
  try {
    await run();
  } catch (err) {
    console.log(
      `  -> call failed (${err instanceof Error ? err.message : err}). Recorded, continuing.`
    );
  }
}

async function main() {
  console.log(`Project: ${project} @ ${cluster} (read-only)`);

  await section('1. list: Equipment with debug {}', async () => {
    // Observed: unfilteredContainerScan + filterIncompatibleWithCursorableIndexScan [crossContainer].
    const response = await client.instances.list({
      instanceType: 'node',
      sources: [{ source: equipmentView }],
      limit: 3,
      debug: {},
    });
    console.log(
      `  items=${shape(response.items)} nextCursor=${shape(response.nextCursor)}`
    );
    printNotices(response.debug?.notices);
  });

  await section(
    '2. query: hasData-only filter (no property filter)',
    async () => {
      // Observed: unfilteredContainerScan + filterIncompatibleWithCursorableIndexScan [crossContainer].
      const response = await client.instances.query({
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
        `  items=${shape(response.items)} nextCursor=${shape(response.nextCursor)}`
      );
      printNotices(response.debug?.notices);
    }
  );

  await section('3. query: OR filter across two manufacturers', async () => {
    // Observed: filterIncompatibleWithCursorableIndexScan [orFilter], orHasNonEqualityBranches false.
    const response = await client.instances.query({
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
                  equals: { property: prop('manufacturer'), value: 'Yokogawa' },
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
    console.log(`  items=${shape(response.items)}`);
    printNotices(response.debug?.notices);
  });

  await section(
    '4. query: two range predicates on different properties',
    async () => {
      // Observed: filterIncompatibleWithCursorableIndexScan [multipleRangePredicates].
      const response = await client.instances.query({
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
      console.log(`  items=${shape(response.items)}`);
      printNotices(response.debug?.notices);
    }
  );

  await section(
    '5. query: externalId equality, emitResults false, profile true',
    async () => {
      // Observed: items { equipment: [] } and nextCursor {} (present, empty);
      // suggestedCursorableSort with suggestedSort and suggestedIndex.
      const response = await client.instances.query({
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
        `  items=${shape(response.items)} nextCursor=${shape(response.nextCursor)} (expected present but empty)`
      );
      printNotices(response.debug?.notices);
    }
  );

  await section(
    '5b. query: hasData that matches data, emitResults false',
    async () => {
      // Observed: items { equipment: [] } and nextCursor {} even though the filter matches.
      const response = await client.instances.query({
        with: {
          equipment: {
            nodes: { filter: { hasData: [equipmentView] } },
            limit: 2,
          },
        },
        select: {
          equipment: {
            sources: [{ source: equipmentView, properties: ['name'] }],
          },
        },
        debug: { emitResults: false },
      });
      console.log(
        `  items=${shape(response.items)} nextCursor=${shape(response.nextCursor)}`
      );
      printNotices(response.debug?.notices);
    }
  );

  await section(
    '5c. query: debug.timeout while results are enabled',
    async () => {
      // Observed: noTimeoutWithResults (invalidDebugOptions, no grade) in addition to the usual two.
      const response = await client.instances.query({
        with: {
          equipment: {
            nodes: { filter: { hasData: [equipmentView] } },
            limit: 2,
          },
        },
        select: {
          equipment: {
            sources: [{ source: equipmentView, properties: ['name'] }],
          },
        },
        debug: { timeout: 30000 },
      });
      console.log(`  items=${shape(response.items)}`);
      printNotices(response.debug?.notices);
    }
  );

  await section(
    '6a. sync: WITHOUT a space filter (flaky: timed out with 408 on one of two runs)',
    async () => {
      // Observed: syncMissingSpaceFilter (sync, C) + unfilteredContainerScan.
      const response = await client.instances.sync({
        with: {
          equipment: {
            nodes: { filter: { hasData: [equipmentView] } },
            limit: 1,
          },
        },
        select: { equipment: {} },
        debug: {},
      });
      console.log(`  items=${shape(response.items)}`);
      printNotices(response.debug?.notices);
    }
  );

  await section('6b. sync: WITH a space filter', async () => {
    // Observed: no notices.
    const response = await client.instances.sync({
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
    console.log(`  items=${shape(response.items)}`);
    printNotices(response.debug?.notices);
  });

  await section('7. list: emitResults false', async () => {
    // Observed: items [] and nextCursor absent (query keeps nextCursor as {}).
    const response = await client.instances.list({
      instanceType: 'node',
      sources: [{ source: equipmentView }],
      limit: 2,
      debug: { emitResults: false },
    });
    console.log(
      `  items=${shape(response.items)} nextCursor=${shape(response.nextCursor)}`
    );
    printNotices(response.debug?.notices);
  });

  await section('8. query and list without debug (regression)', async () => {
    const query = await client.instances.query({
      with: {
        equipment: {
          nodes: { filter: { hasData: [equipmentView] } },
          limit: 1,
        },
      },
      select: { equipment: {} },
    });
    const list = await client.instances.list({
      instanceType: 'node',
      sources: [{ source: equipmentView }],
      limit: 1,
    });
    console.log(
      `  query keys=${Object.keys(query).sort().join(',')} list keys=${Object.keys(list).sort().join(',')} (expected: no debug)`
    );
    if ('debug' in query || 'debug' in list) {
      problems++;
      console.log(
        '  PROBLEM: debug present on a response to a request without debug'
      );
    }
  });

  console.log(
    `\nDone. ${problems === 0 ? 'No type problems.' : `${problems} problem(s), see PROBLEM lines.`}`
  );
  process.exitCode = problems === 0 ? 0 : 1;
}

main().catch((err) => {
  console.error('Smoke test failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
