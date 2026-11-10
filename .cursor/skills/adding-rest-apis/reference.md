# Templates

These templates are trimmed from
[PR #1548](https://github.com/cognitedata/cognite-sdk-js/pull/1548). They use
a placeholder resource `Widget` at `/widgets`; replace `Widget`, `widgets`,
the tag and the `operationId`s with the real ones from the spec.

## Contents

- types.ts
- API class
- Client wiring
- Unit test
- PR body

## types.ts

`packages/stable/src/api/widgets/types.ts`:

```ts
// Copyright 2026 Cognite AS

import type {
  CogniteExternalId,
  CogniteInternalId,
  FilterQuery,
  IdEither,
} from '@cognite/sdk-core';
import type {
  ArrayPatchString,
  IgnoreUnknownIds,
  NullableSinglePatchLong,
  SetField,
  SinglePatchRequiredString,
} from '../../types';
import type { EpochTimestamp } from '../../types.gen';

export type WidgetStatus = 'Active' | 'Disabled';

export interface Widget {
  id: CogniteInternalId;
  externalId: CogniteExternalId;
  name: string;
  status: WidgetStatus;
  createdTime: EpochTimestamp;
  lastUpdatedTime: EpochTimestamp;
  dataSetId?: CogniteInternalId;
  tags?: string[];
}

export interface WidgetCreate {
  externalId: CogniteExternalId;
  name: string;
  status?: WidgetStatus;
  dataSetId?: CogniteInternalId;
  /**
   * Between 1 and 5 tags, each 1 to 35 characters long.
   */
  tags?: string[];
}

export interface WidgetPatch {
  name?: SinglePatchRequiredString;
  externalId?: SetField<CogniteExternalId>;
  status?: SetField<WidgetStatus>;
  dataSetId?: NullableSinglePatchLong;
  tags?: ArrayPatchString;
}

export type WidgetChange = IdEither & { update: WidgetPatch };

export interface WidgetListQuery extends FilterQuery {
  /**
   * Whether to include disabled widgets.
   * @default false
   */
  includeDisabled?: boolean;
}

export interface WidgetFilter {
  status?: WidgetStatus;
  dataSetIds?: IdEither[];
}

export interface WidgetFilterQuery extends FilterQuery {
  filter: WidgetFilter;
}

export interface WidgetRetrieveParams extends IgnoreUnknownIds {
  /**
   * Whether to include usage statistics.
   * @default true
   */
  withStats?: boolean;
}

export type WidgetRunRequest = IdEither & { dryRun?: boolean };
```

## API class

`packages/stable/src/api/widgets/widgetsApi.ts`:

```ts
// Copyright 2026 Cognite AS

import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
  type CursorResponse,
  type IdEither,
} from '@cognite/sdk-core';
import type { IgnoreUnknownIds } from '../../types';
import type {
  Widget,
  WidgetChange,
  WidgetCreate,
  WidgetFilterQuery,
  WidgetListQuery,
  WidgetRetrieveParams,
  WidgetRunRequest,
} from './types';

export class WidgetsAPI extends BaseResourceAPI<Widget> {
  /**
   * [Create widgets](https://api-docs.cognite.com/20230101/tag/Widgets/operation/createWidgets)
   *
   * ```js
   * const widgets = await client.widgets.create([
   *   { externalId: 'my-widget', name: 'My widget' },
   * ]);
   * ```
   */
  public create = (items: WidgetCreate[]): Promise<Widget[]> => {
    return this.createEndpoint(items);
  };

  /**
   * [List widgets](https://api-docs.cognite.com/20230101/tag/Widgets/operation/listWidgets)
   *
   * ```js
   * const widgets = await client.widgets.list().autoPagingToArray({ limit: 100 });
   * ```
   */
  public list = (query?: WidgetListQuery): CursorAndAsyncIterator<Widget> => {
    return this.listEndpoint(this.callListEndpointWithGet, query);
  };

  /**
   * [Filter widgets](https://api-docs.cognite.com/20230101/tag/Widgets/operation/filterWidgets)
   *
   * ```js
   * const widgets = await client.widgets
   *   .filter({ filter: { status: 'Active' } })
   *   .autoPagingToArray({ limit: 100 });
   * ```
   */
  public filter = (
    query: WidgetFilterQuery
  ): CursorAndAsyncIterator<Widget> => {
    const path = this.url('filter');
    return this.listEndpoint(
      (data) => this.post<CursorResponse<Widget[]>>(path, { data }),
      query
    );
  };

  /**
   * [Retrieve widgets](https://api-docs.cognite.com/20230101/tag/Widgets/operation/byIdsWidgets)
   *
   * ```js
   * const widgets = await client.widgets.retrieve([{ id: 123 }, { externalId: 'my-widget' }]);
   * ```
   */
  public retrieve = (
    ids: IdEither[],
    params: WidgetRetrieveParams = {}
  ): Promise<Widget[]> => {
    return this.retrieveEndpoint(ids, {
      ...params,
      withStats: params.withStats ?? true,
    });
  };

  /**
   * [Update widgets](https://api-docs.cognite.com/20230101/tag/Widgets/operation/updateWidgets)
   *
   * ```js
   * const widgets = await client.widgets.update([
   *   { externalId: 'my-widget', update: { name: { set: 'New name' } } },
   * ]);
   * ```
   */
  public update = (changes: WidgetChange[]): Promise<Widget[]> => {
    return this.updateEndpoint(changes);
  };

  /**
   * [Delete widgets](https://api-docs.cognite.com/20230101/tag/Widgets/operation/deleteWidgets)
   *
   * ```js
   * await client.widgets.delete([{ id: 123 }, { externalId: 'my-widget' }]);
   * ```
   */
  public delete = (ids: IdEither[], params: IgnoreUnknownIds = {}) => {
    return this.deleteEndpoint(ids, params);
  };

  /**
   * [Run a widget](https://api-docs.cognite.com/20230101/tag/Widgets/operation/runWidget)
   *
   * ```js
   * const result = await client.widgets.run({ externalId: 'my-widget' });
   * ```
   */
  public run = async (request: WidgetRunRequest): Promise<Widget> => {
    const response = await this.post<Widget>(this.url('run'), {
      data: request,
    });
    return this.addToMapAndReturn(response.data, response);
  };
}
```

## Client wiring

In `packages/stable/src/cogniteClient.ts`, add these four pieces next to the
existing entries of each kind:

```ts
import { WidgetsAPI } from './api/widgets/widgetsApi';

  public get widgets() {
    return accessApi(this.widgetsApi);
  }

  private widgetsApi?: WidgetsAPI;

  // inside initAPIs():
    this.widgetsApi = this.apiFactory(WidgetsAPI, 'widgets');
```

`packages/stable/src/index.ts`, in alphabetical order:

```ts
export { WidgetsAPI } from './api/widgets/widgetsApi';
```

`packages/stable/src/types.ts`, next to the other module re-exports:

```ts
export * from './api/widgets/types';
```

Beta and alpha do the same in their own `cogniteClient.ts`, `index.ts` and
`types.ts`. Their `initAPIs()` calls `super.initAPIs()` and sets the
`cdf-version` header before creating the APIs.

## Unit test

`packages/stable/src/__tests__/api/widgets.unit.spec.ts`:

```ts
// Copyright 2026 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type { Widget, WidgetCreate } from '../../types';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('Widgets unit test', () => {
  let client: CogniteClient;

  const widgetCreate = {
    externalId: 'my-widget',
    name: 'My widget',
  } satisfies WidgetCreate;

  const widget: Widget = {
    id: 1,
    externalId: 'my-widget',
    name: 'My widget',
    status: 'Active',
    createdTime: 1730000000000,
    lastUpdatedTime: 1730000001000,
  };

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('create', async () => {
    nock(mockBaseUrl)
      .post(/\/widgets$/, { items: [widgetCreate] })
      .once()
      .reply(200, { items: [widget] });

    const created = await client.widgets.create([widgetCreate]);
    expect(created).toEqual([widget]);
  });

  test('list', async () => {
    nock(mockBaseUrl)
      .get(/\/widgets\/?$/)
      .query({ limit: '10', includeDisabled: 'true' })
      .once()
      .reply(200, { items: [widget], nextCursor: 'next' });

    const response = await client.widgets.list({
      limit: 10,
      includeDisabled: true,
    });
    expect({
      items: response.items,
      nextCursor: response.nextCursor,
    }).toEqual({ items: [widget], nextCursor: 'next' });
  });

  test('retrieve sends withStats when the flag is undefined', async () => {
    nock(mockBaseUrl)
      .post(/\/widgets\/byids$/, { items: [{ id: 1 }], withStats: true })
      .once()
      .reply(200, { items: [widget] });

    const retrieved = await client.widgets.retrieve([{ id: 1 }], {
      withStats: undefined,
    });
    expect(retrieved).toEqual([widget]);
  });

  test('delete', async () => {
    nock(mockBaseUrl)
      .post(/\/widgets\/delete$/, {
        items: [{ id: 1 }],
        ignoreUnknownIds: true,
      })
      .once()
      .reply(200, {});

    const response = await client.widgets.delete([{ id: 1 }], {
      ignoreUnknownIds: true,
    });
    expect(response).toEqual({});
  });
});
```

Query values in `.query({...})` are strings, because nock compares the
parsed URL query.

## PR body

```markdown
## Summary

Adds the [Widgets API](https://api-docs.cognite.com/20230101/tag/Widgets) to the stable SDK as `client.widgets`. <One sentence on which package and why: stable endpoints go in `@cognite/sdk`, and beta and alpha inherit them.>

| Method | Endpoint |
|---|---|
| `create(items)` | `POST /widgets` |
| `list(query?)` | `GET /widgets` (cursor pagination) |
| `retrieve(ids, params?)` | `POST /widgets/byids` |
| `update(changes)` | `POST /widgets/update` |
| `delete(ids, params?)` | `POST /widgets/delete` |

Notes:
- Types are in `packages/stable/src/api/widgets/types.ts` and re-exported from the stable `types.ts`. They are written by hand from the `20230101` OpenAPI document. All names start with `Widget` so they don't clash with existing types.
- Timestamps are epoch milliseconds, not `Date`.
- <Each SDK default, single-item endpoint, or dropped deprecated field, and why.>
- <Related endpoints or tags left out of this PR.>

## Testing

- New unit tests in `packages/stable/src/__tests__/api/widgets.unit.spec.ts` (nock) check the request path and body for every method.
- All stable unit tests, `tsc`, `biome ci` and `test-snippets` pass locally.
- <Integration tests, or "Not tested against a live CDF project.">

Closes <Jira issue URL, if any>
```
