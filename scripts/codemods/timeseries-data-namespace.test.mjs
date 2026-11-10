import assert from 'node:assert/strict';
import { test } from 'node:test';
import { transform } from './timeseries-data-namespace.mjs';

const run = (src, opts) => transform(src, 'a.ts', opts);

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

test('handles tsx and preserves formatting', () => {
  const { output } = transform(
    'const A = () => <div>{String(client\n  .datapoints\n  .retrieve({}))}</div>;',
    'a.tsx'
  );
  assert.ok(output.includes('.timeseries.data\n  .retrieve'));
});
