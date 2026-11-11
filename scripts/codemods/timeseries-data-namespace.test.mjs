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

test('does not touch request bodies', () => {
  const src = 'client.datapoints.retrieve({ items: [{ externalId: "a" }] });';
  assert.equal(
    run(src).output,
    'client.timeseries.data.retrieve({ items: [{ externalId: "a" }] });'
  );
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

test('handles tsx and preserves formatting', () => {
  const { output } = transform(
    'const A = () => <div>{String(client\n  .datapoints\n  .retrieve({}))}</div>;',
    'a.tsx'
  );
  assert.ok(output.includes('.timeseries.data\n  .retrieve'));
});
