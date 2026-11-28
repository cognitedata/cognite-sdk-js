// Copyright 2026 Cognite AS

import { describe, expect, expectTypeOf, test } from 'vitest';
import type { FunctionCallsAPI } from '../../api/functions/calls/functionCallsApi';
import type { WorkflowsAPI } from '../../api/workflows/workflowsApi';
import type { ClientOptions } from '../../clientOptions';
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

// Type-level checks. They use `typeof` queries, so nothing reads a gated getter
// at runtime; `tsc` (the build typechecks tests) is what verifies them.
describe('experimental opt-in types', () => {
  const base = {
    appId: 'experimental type test',
    project: 'unit-test',
    oidcTokenProvider: () => Promise.resolve('token'),
  };

  test('gated APIs have no usable type unless their flag is literally true', () => {
    const off = new CogniteClient(base);
    expectTypeOf<typeof off.workflows>().toBeUnknown();
    expectTypeOf<typeof off.hostedExtractors>().toBeUnknown();
    expectTypeOf<typeof off.extractionPipelines>().toBeUnknown();
    expectTypeOf<typeof off.functions.calls>().toBeUnknown();
    expectTypeOf<typeof off.transformations.jobs>().toBeUnknown();
    // Ungated APIs are untouched, including the ungated half of a partly gated API.
    expectTypeOf<typeof off.functions.list>().toBeFunction();
    expectTypeOf<typeof off.transformations.list>().toBeFunction();

    const on = new CogniteClient({
      ...base,
      experimental: { workflows: true },
    });
    expectTypeOf<typeof on.workflows>().toEqualTypeOf<WorkflowsAPI>();
    // Only the flags that were set are enabled.
    expectTypeOf<typeof on.hostedExtractors>().toBeUnknown();

    const withFunctions = new CogniteClient({
      ...base,
      experimental: { functions: true },
    });
    expectTypeOf(
      withFunctions.functions.calls
    ).toEqualTypeOf<FunctionCallsAPI>();
    expectTypeOf<typeof withFunctions.transformations.jobs>().toBeUnknown();

    expect([off, on, withFunctions]).toHaveLength(3);
  });

  test('a flag that is false or not a literal does not enable the API', () => {
    const disabled = new CogniteClient({
      ...base,
      experimental: { workflows: false },
    });
    expectTypeOf<typeof disabled.workflows>().toBeUnknown();

    // Options typed as `ClientOptions` lose the literal, so this fails closed.
    const widened: ClientOptions = {
      ...base,
      experimental: { workflows: true },
    };
    const fromWidened = new CogniteClient(widened);
    expectTypeOf<typeof fromWidened.workflows>().toBeUnknown();

    // Overriding the flags on an already widened options object works.
    const overridden = new CogniteClient({
      ...widened,
      experimental: { workflows: true },
    });
    expectTypeOf<typeof overridden.workflows>().toEqualTypeOf<WorkflowsAPI>();
    expect(overridden).toBeDefined();
  });

  test('clients are assignable only towards fewer enabled APIs', () => {
    const off = new CogniteClient(base);
    const on = new CogniteClient({
      ...base,
      experimental: { workflows: true },
    });

    // A function that does not use experimental APIs takes any client.
    const acceptsAny = (_client: CogniteClient) => undefined;
    acceptsAny(off);
    acceptsAny(on);

    // A function that needs `workflows` rejects a client without it.
    const needsWorkflows = (_client: CogniteClient<{ workflows: true }>) =>
      undefined;
    needsWorkflows(on);
    // @ts-expect-error `off` was created without `experimental: { workflows: true }`
    needsWorkflows(off);
    expect(acceptsAny).toBeDefined();
  });
});
