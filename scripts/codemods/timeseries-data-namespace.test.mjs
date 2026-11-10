import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { transform } from './timeseries-data-namespace.mjs';

const run = (src, opts) => transform(src, 'a.ts', opts);
const script = fileURLToPath(
  new URL('./timeseries-data-namespace.mjs', import.meta.url)
);

/** Runs `fn` with a fresh temp dir that is removed afterwards. */
const withTempDir = (fn) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ts-data-codemod-'));
  try {
    return fn(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
};

test('rewrites client.datapoints methods', () => {
  const src = `await client.datapoints.retrieve({ items: [] });
await this.client.datapoints.insert([]);
await cogniteClient?.datapoints.retrieveLatest([]);
await sdk.datapoints.delete({});`;
  const { output, changes } = run(src, { clientNames: ['sdk'] });
  assert.equal(changes, 4);
  assert.equal(
    output,
    `await client.timeseries.data.retrieve({ items: [] });
await this.client.timeseries.data.insert([]);
await cogniteClient?.timeseries.data.retrieveLatest([]);
await sdk.timeseries.data.delete({});`
  );
});

test('rewrites a bare client.datapoints reference', () => {
  assert.equal(
    run('const dp = client.datapoints;').output,
    'const dp = client.timeseries.data;'
  );
});

test('rewrites syntheticQuery', () => {
  assert.equal(
    run('await client.timeseries.syntheticQuery([{ expression: "1" }]);')
      .output,
    'await client.timeseries.synthetic.query([{ expression: "1" }]);'
  );
});

test('leaves response .datapoints and unknown receivers alone', () => {
  const src = `const pts = res[0].datapoints;
const x = series.datapoints.length;
foo.datapoints.retrieve();
client.datapoints.length;
other.timeseries.syntheticQuery([]);`;
  const { output, changes } = run(src);
  assert.equal(changes, 0);
  assert.equal(output, src);
});

test('is idempotent', () => {
  const once = run(
    'client.datapoints.retrieve({}); client.timeseries.syntheticQuery([]);'
  ).output;
  const twice = run(once);
  assert.equal(twice.changes, 0);
  assert.equal(twice.output, once);
});

test('warns on destructuring without rewriting', () => {
  const src =
    'const { datapoints } = client;\nconst { syntheticQuery } = client.timeseries;';
  const { output, warnings } = run(src);
  assert.equal(output, src);
  assert.equal(warnings.length, 2);
});

test('does not touch request bodies', () => {
  const src = 'client.datapoints.retrieve({ items: [{ externalId: "a" }] });';
  assert.equal(
    run(src).output,
    'client.timeseries.data.retrieve({ items: [{ externalId: "a" }] });'
  );
});

test("rewrites CogniteClient['datapoints'] and keeps the quote style", () => {
  const src = `type A = Pick<CogniteClient['datapoints'], 'retrieve' | 'insert'>;
type B = CogniteClient["datapoints"];`;
  const { output, changes } = run(src);
  assert.equal(changes, 2);
  assert.equal(
    output,
    `type A = Pick<CogniteClient['timeseries']['data'], 'retrieve' | 'insert'>;
type B = CogniteClient["timeseries"]["data"];`
  );
});

test("rewrites CogniteClient['timeseries']['syntheticQuery']", () => {
  assert.equal(
    run("type Q = CogniteClient['timeseries']['syntheticQuery'];").output,
    "type Q = CogniteClient['timeseries']['synthetic']['query'];"
  );
});

test('leaves unrelated indexed access types alone', () => {
  const src = `type A = Response['datapoints'];
type B = CogniteClient['timeseries']['create'];
type C = CogniteClient['assets'];
type D = Other['timeseries']['syntheticQuery'];`;
  const { output, changes, warnings } = run(src);
  assert.equal(changes, 0);
  assert.equal(output, src);
  assert.equal(warnings.length, 0);
});

test("warns on a client-type member 'datapoints', before and after the rewrite", () => {
  const src =
    "type Deps = { datapoints: Pick<CogniteClient['datapoints'], 'retrieve'>; project: string };";
  const first = run(src);
  assert.equal(
    first.output,
    "type Deps = { datapoints: Pick<CogniteClient['timeseries']['data'], 'retrieve'>; project: string };"
  );
  assert.equal(first.warnings.length, 1);
  assert.match(first.warnings[0], /^a\.ts:1: member 'datapoints'/);
  // Running again changes nothing, and the member that still needs a hand
  // migration is still reported.
  const second = run(first.output);
  assert.equal(second.changes, 0);
  assert.equal(second.warnings.length, 1);
});

test("does not warn on a 'datapoints' member that is not typed from the client", () => {
  const { warnings } = run(`type Series = { datapoints: ExternalDatapoint[] };
interface Res { datapoints: Pick<Response['datapoints'], 'length'> }`);
  assert.equal(warnings.length, 0);
});

test('does not follow symlinks and survives dangling links', () => {
  withTempDir((root) => {
    const body = 'client.datapoints.retrieve({});';
    const outside = path.join(root, 'outside');
    const src = path.join(root, 'src');
    fs.mkdirSync(outside);
    fs.mkdirSync(src);
    fs.writeFileSync(path.join(outside, 'x.ts'), body);
    fs.writeFileSync(path.join(src, 'a.ts'), body);
    fs.symlinkSync(outside, path.join(src, 'linked-dir'), 'dir');
    fs.symlinkSync(path.join(outside, 'x.ts'), path.join(src, 'linked.ts'));
    fs.symlinkSync(path.join(root, 'missing'), path.join(src, 'node_modules'));
    fs.symlinkSync(path.join(root, 'missing'), path.join(src, 'dangling.ts'));

    const out = execFileSync(process.execPath, [script, src], {
      encoding: 'utf8',
    });

    assert.match(out, /1 change\(s\) in 1 file\(s\)/);
    assert.match(out, /formatter/);
    assert.equal(
      fs.readFileSync(path.join(src, 'a.ts'), 'utf8'),
      'client.timeseries.data.retrieve({});'
    );
    // Files behind a symlink are neither visited nor written through.
    assert.equal(fs.readFileSync(path.join(outside, 'x.ts'), 'utf8'), body);
  });
});

test('fails before changing anything when a target does not exist', () => {
  withTempDir((root) => {
    const body = 'client.datapoints.retrieve({});';
    const file = path.join(root, 'a.ts');
    fs.writeFileSync(file, body);

    const res = spawnSync(
      process.execPath,
      [script, file, path.join(root, 'nope')],
      { encoding: 'utf8' }
    );

    assert.equal(res.status, 2);
    assert.match(res.stderr, /nope does not exist/);
    assert.equal(fs.readFileSync(file, 'utf8'), body);
  });
});

test('rewrites element access, call receivers and monthly aggregates', () => {
  const src = `await client['datapoints'].retrieve({});
await useSDK().datapoints.insert([]);
await getClient().timeseries.syntheticQuery([]);
await client.timeseries['syntheticQuery']([]);
await client.datapoints.retrieveDatapointMonthlyAggregates({});`;
  const { output, changes, warnings } = run(src);
  assert.equal(changes, 5);
  assert.equal(
    output,
    `await client['timeseries']['data'].retrieve({});
await useSDK().timeseries.data.insert([]);
await getClient().timeseries.synthetic.query([]);
await client.timeseries['synthetic']['query']([]);
await client.timeseries.data.retrieveDatapointMonthlyAggregates({});`
  );
  assert.equal(warnings.length, 0);
  assert.equal(run(output).changes, 0);
});

test('recognizes a call receiver only when the function is a client accessor', () => {
  const src = `getClientData().datapoints.retrieve({});
createMockCogniteClientDependencies().datapoints.retrieve({});`;
  const { changes, warnings } = run(src);
  assert.equal(changes, 0);
  assert.equal(warnings.length, 2);
  // Naming the function opts it in.
  assert.equal(
    run(src, { clientNames: ['createMockCogniteClientDependencies'] }).changes,
    1
  );
  for (const name of ['useSDK', 'getSdk', 'useCogniteClient', 'createClient']) {
    assert.equal(run(`${name}().datapoints.retrieve({});`).changes, 1, name);
  }
});

test('rewrites typeof of the old path, and only a typeof', () => {
  assert.equal(
    run(
      'type R = typeof client.datapoints.retrieve; type S = typeof client.timeseries.syntheticQuery;'
    ).output,
    'type R = typeof client.timeseries.data.retrieve; type S = typeof client.timeseries.synthetic.query;'
  );
  assert.equal(run('type T = client.datapoints.Foo;').changes, 0);
});

test('warns, without rewriting, on a receiver that is not recognized as a client', () => {
  const src = `sdk.datapoints.retrieve({});
const dp = client;
dp.datapoints.insert([]);
foo().timeseries.syntheticQuery([]);
const n = res.datapoints.length;
const raw = res.datapoints;`;
  const { output, changes, warnings } = run(src);
  assert.equal(changes, 0);
  assert.equal(output, src);
  assert.equal(warnings.length, 3);
  assert.match(
    warnings[0],
    /^a\.ts:1: \.datapoints\.retrieve .*'sdk' is not recognized/
  );
  assert.match(
    warnings[1],
    /^a\.ts:3: \.datapoints\.insert .*'dp' is not recognized/
  );
  assert.match(
    warnings[2],
    /^a\.ts:4: \.timeseries\.syntheticQuery .*'foo\(\)' is not recognized/
  );
  // Naming the receiver turns the warning into a rewrite.
  assert.equal(
    run('sdk.datapoints.retrieve({});', { clientNames: ['sdk'] }).output,
    'sdk.timeseries.data.retrieve({});'
  );
});

test('warns on Pick and Omit that name a key that moved', () => {
  const src = `type A = Pick<CogniteClient, 'datapoints' | 'project'>;
type B = Omit<
  CogniteClient,
  'datapoints'
>;
type C = Pick<CogniteClient['timeseries'], 'syntheticQuery' | 'retrieve'>;
type D = Pick<CogniteClient, 'assets' | 'project'>;
type E = Pick<Response, 'datapoints'>;`;
  const { output, changes, warnings } = run(src);
  assert.equal(changes, 0);
  assert.equal(output, src);
  assert.equal(warnings.length, 3);
  assert.match(warnings[0], /^a\.ts:1: 'datapoints' in Pick/);
  assert.match(warnings[1], /^a\.ts:2: 'datapoints' in Omit/);
  assert.match(warnings[2], /^a\.ts:6: 'syntheticQuery' in Pick/);
});

test('warns on destructuring a client parameter or a client returned from a call', () => {
  const { warnings } = run(`function f({ datapoints }: CogniteClient) {}
const { datapoints } = useSDK();`);
  assert.equal(warnings.length, 2);
});

// A stand-in for the installed SDK. The codemod recognizes the SDK by the
// package path of the declaration, so the stub lives in node_modules/@cognite/sdk.
const SDK_STUB = `export interface DatapointAggregate {
  timestamp: Date;
  average?: number;
}
// The SDK declares a \`datapoints\` member on its response types too.
export interface DatapointAggregates {
  id: number;
  datapoints: DatapointAggregate[];
}
export declare class DataPointsAPI {
  insert(items: unknown[]): Promise<object>;
  retrieve(query: unknown): Promise<unknown[]>;
  retrieveLatest(items: unknown[]): Promise<unknown[]>;
  retrieveDatapointMonthlyAggregates(query: unknown): Promise<unknown[]>;
  delete(items: unknown[]): Promise<object>;
}
export declare class TimeSeriesAPI {
  get data(): DataPointsAPI;
  syntheticQuery(items: unknown[]): Promise<unknown[]>;
}
export declare class CogniteClient {
  get datapoints(): DataPointsAPI;
  get timeseries(): TimeSeriesAPI;
  project: string;
}
`;

/** Creates a project in a temp dir and runs the CLI with `--project` on `src`. */
const runProject = ({ sdk, files, args = [] }) =>
  withTempDir((root) => {
    if (sdk) {
      const dir = path.join(root, 'node_modules', '@cognite', 'sdk');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'index.d.ts'), SDK_STUB);
      fs.writeFileSync(
        path.join(dir, 'package.json'),
        '{"name":"@cognite/sdk","version":"0.0.0","types":"index.d.ts"}'
      );
    }
    fs.writeFileSync(
      path.join(root, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'Bundler',
          strict: true,
          noEmit: true,
          skipLibCheck: true,
          types: [],
        },
        include: ['src'],
      })
    );
    for (const [name, content] of Object.entries(files)) {
      const file = path.join(root, name);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, content);
    }
    const res = spawnSync(
      process.execPath,
      [
        script,
        `--project=${path.join(root, 'tsconfig.json')}`,
        ...args,
        path.join(root, 'src'),
        ...(files['other/x.ts'] === undefined
          ? []
          : [path.join(root, 'other')]),
      ],
      { encoding: 'utf8' }
    );
    // Read inside the callback: the directory is removed when it returns.
    const out = Object.fromEntries(
      Object.keys(files).map((name) => [
        name,
        fs.readFileSync(path.join(root, name), 'utf8'),
      ])
    );
    return { res, out };
  });

test('--project recognizes the SDK by its declaration, not by the name of the receiver', () => {
  const { res, out } = runProject({
    sdk: true,
    files: {
      'src/app.ts': `import { CogniteClient, DatapointAggregates } from '@cognite/sdk';

declare const sdk: CogniteClient;
declare const cdf: CogniteClient;
declare function useThing(): CogniteClient;
type Sdk = CogniteClient;
declare const res: { datapoints: { retrieve(q: unknown): void } };
declare const loose: any;
declare const response: DatapointAggregates;

sdk.datapoints.retrieve({});
useThing().datapoints.insert([]);
cdf['datapoints'].retrieveLatest([]);
const alias = sdk;
alias.datapoints.delete([]);
sdk.timeseries.syntheticQuery([]);
type Latest = Sdk['datapoints']['retrieveLatest'];
res.datapoints.retrieve({});
loose.datapoints.retrieve({});
type Keys = 'datapoints' | 'project';
type Narrow = Pick<Sdk, Keys>;
function f({ datapoints }: Sdk) {
  return datapoints;
}
const points = response.datapoints;
const first = response.datapoints[0];
type Points = DatapointAggregates['datapoints'];
const { datapoints: fromResponse } = response;
type Picked = Pick<DatapointAggregates, 'datapoints'>;
`,
    },
  });

  assert.equal(res.status, 0, res.stderr);
  assert.equal(
    out['src/app.ts'],
    `import { CogniteClient, DatapointAggregates } from '@cognite/sdk';

declare const sdk: CogniteClient;
declare const cdf: CogniteClient;
declare function useThing(): CogniteClient;
type Sdk = CogniteClient;
declare const res: { datapoints: { retrieve(q: unknown): void } };
declare const loose: any;
declare const response: DatapointAggregates;

sdk.timeseries.data.retrieve({});
useThing().timeseries.data.insert([]);
cdf['timeseries']['data'].retrieveLatest([]);
const alias = sdk;
alias.timeseries.data.delete([]);
sdk.timeseries.synthetic.query([]);
type Latest = Sdk['timeseries']['data']['retrieveLatest'];
res.datapoints.retrieve({});
loose.datapoints.retrieve({});
type Keys = 'datapoints' | 'project';
type Narrow = Pick<Sdk, Keys>;
function f({ datapoints }: Sdk) {
  return datapoints;
}
const points = response.datapoints;
const first = response.datapoints[0];
type Points = DatapointAggregates['datapoints'];
const { datapoints: fromResponse } = response;
type Picked = Pick<DatapointAggregates, 'datapoints'>;
`
  );
  // `res` is resolved to something that is not the SDK, so it is neither
  // rewritten nor reported. `loose` is `any`, so the checker cannot tell.
  const warnings = res.stderr
    .split('\n')
    .filter((l) => l.startsWith('warning:'));
  assert.equal(warnings.length, 3, res.stderr);
  assert.ok(warnings.some((w) => w.includes("'loose' is not recognized")));
  assert.ok(warnings.some((w) => w.includes("'datapoints' in Pick")));
  assert.ok(warnings.some((w) => w.includes("destructured 'datapoints'")));
  assert.ok(!warnings.some((w) => w.includes("'res'")));
});

test('--project falls back to names when the SDK types are missing or a file is not in the project', () => {
  const { res, out } = runProject({
    sdk: false,
    files: {
      'src/app.ts': 'client.datapoints.retrieve({});\n',
      'other/x.ts': 'client.datapoints.retrieve({});\n',
    },
  });

  assert.equal(res.status, 0, res.stderr);
  assert.match(res.stderr, /no @cognite\/sdk types found/);
  assert.match(res.stdout, /1 file\(s\) are not part of any --project/);
  assert.equal(out['src/app.ts'], 'client.timeseries.data.retrieve({});\n');
  assert.equal(out['other/x.ts'], 'client.timeseries.data.retrieve({});\n');
});

test('--project fails on a tsconfig that does not exist', () => {
  withTempDir((root) => {
    const res = spawnSync(
      process.execPath,
      [script, `--project=${path.join(root, 'tsconfig.json')}`, root],
      { encoding: 'utf8' }
    );
    assert.equal(res.status, 2);
    assert.match(res.stderr, /tsconfig\.json does not exist/);
  });
});

test('handles tsx and preserves formatting', () => {
  const { output } = transform(
    'const A = () => <div>{String(client\n  .datapoints\n  .retrieve({}))}</div>;',
    'a.tsx'
  );
  assert.ok(output.includes('.timeseries.data\n  .retrieve'));
});
