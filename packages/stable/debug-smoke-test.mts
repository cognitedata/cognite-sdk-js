// Manual smoke test used to verify the DMS `debug` notices support added in
// PR #1486 against a real project, since the checked-in OpenAPI snapshot
// turned out to be stale/incomplete for this feature (see that PR for
// details on what this surfaced). Not part of the test suite.
//
// Usage:
//   yarn build   # from repo root, so @cognite/sdk resolves to fresh dist output
//   SECRETS_ENV_PATH=/path/to/secrets.env node --loader ts-node/esm debug-smoke-test.mts
// from packages/stable. secrets.env must define CDF_CLUSTER, CDF_PROJECT, and
// COGNITE_TOKEN (a valid, short-lived OIDC access token for that project).

import { readFileSync } from 'node:fs';
import { CogniteClient } from '@cognite/sdk';

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

async function main() {
  console.log(`Project: ${CDF_PROJECT} @ ${CDF_CLUSTER}\n`);

  console.log('--- query with debug: {} ---');
  const queryResponse = await client.instances.query({
    with: { result_set_1: { nodes: {}, limit: 1 } },
    select: { result_set_1: {} },
    debug: {},
  });
  console.log('items keys:', Object.keys(queryResponse.items ?? {}));
  console.log('debug.notices:', queryResponse.debug?.notices);

  console.log('\n--- query with emitResults: false, profile: true ---');
  const profileResponse = await client.instances.query({
    with: { result_set_1: { nodes: {}, limit: 1 } },
    select: { result_set_1: {} },
    debug: { emitResults: false, profile: true },
  });
  console.log('full response:', JSON.stringify(profileResponse, null, 2));

  console.log('\n--- sync with debug: {} ---');
  const syncResponse = await client.instances.sync({
    with: { result_set_1: { nodes: {}, limit: 1 } },
    select: { result_set_1: {} },
    debug: {},
  });
  console.log('debug.notices:', syncResponse.debug?.notices);

  console.log('\n--- list with debug: {} ---');
  const listResponse = await client.instances.list({
    instanceType: 'node',
    limit: 1,
    debug: {},
  });
  console.log('items length:', listResponse.items.length);
  console.log(
    'debug value:',
    JSON.stringify((listResponse as Record<string, unknown>).debug, null, 2)
  );

  console.log('\nAll calls completed without error.');
}

main().catch((err) => {
  console.error('Smoke test failed:', err);
  process.exit(1);
});
