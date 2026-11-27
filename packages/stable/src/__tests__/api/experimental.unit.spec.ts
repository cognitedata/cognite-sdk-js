// Copyright 2026 Cognite AS

import { describe, expect, test } from 'vitest';
import CogniteClient from '../../cogniteClient';
import { setupMockableClient } from '../testUtils';

const createClient = (
  experimental?: ConstructorParameters<typeof CogniteClient>[0]['experimental']
) =>
  new CogniteClient({
    appId: 'experimental unit test',
    project: 'unit-test',
    oidcTokenProvider: () => Promise.resolve('token'),
    experimental,
  });

describe('experimental opt-in', () => {
  test.each([
    [
      'client.hostedExtractors',
      'hostedExtractors',
      (c: CogniteClient) => c.hostedExtractors,
    ],
    ['client.workflows', 'workflows', (c: CogniteClient) => c.workflows],
    [
      'client.extractionPipelines',
      'extractionPipelines',
      (c: CogniteClient) => c.extractionPipelines,
    ],
    [
      'client.functions.calls',
      'functions',
      (c: CogniteClient) => c.functions.calls,
    ],
    [
      'client.functions.schedules',
      'functions',
      (c: CogniteClient) => c.functions.schedules,
    ],
    [
      'client.transformations.jobs',
      'transformations',
      (c: CogniteClient) => c.transformations.jobs,
    ],
    [
      'client.transformations.notifications',
      'transformations',
      (c: CogniteClient) => c.transformations.notifications,
    ],
    [
      'client.transformations.query',
      'transformations',
      (c: CogniteClient) => c.transformations.query,
    ],
    [
      'client.transformations.schedules',
      'transformations',
      (c: CogniteClient) => c.transformations.schedules,
    ],
    [
      'client.transformations.schema',
      'transformations',
      (c: CogniteClient) => c.transformations.schema,
    ],
  ])(
    '%s throws by default and works once its flag is set',
    (access, flag, get) => {
      expect(() => get(createClient())).toThrow(
        `${access} is experimental and not enabled. Opt in by passing \`experimental: { ${flag}: true }\``
      );
      expect(() => get(createClient({ [flag]: false }))).toThrow(
        /experimental/
      );
      expect(get(createClient({ [flag]: true }))).toBeDefined();
    }
  );

  test('flags are independent', () => {
    const client = createClient({ workflows: true });
    expect(client.workflows).toBeDefined();
    expect(() => client.hostedExtractors).toThrow(/hostedExtractors/);
    expect(() => client.functions.calls).toThrow(/functions/);
  });

  test('already released APIs are not gated', () => {
    const client = createClient();
    expect(client.transformations).toBeDefined();
    expect(client.transformations.list).toBeTypeOf('function');
    expect(client.functions.list).toBeTypeOf('function');
    expect(client.streams.templates.list).toBeTypeOf('function');
  });

  test('the mockable test client enables everything', () => {
    const client = setupMockableClient();
    expect(client.workflows).toBeDefined();
    expect(client.hostedExtractors).toBeDefined();
    expect(client.extractionPipelines).toBeDefined();
    expect(client.functions.calls).toBeDefined();
    expect(client.transformations.jobs).toBeDefined();
  });
});
