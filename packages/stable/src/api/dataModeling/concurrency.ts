// Copyright 2026 Cognite AS

import {
  type ConcurrencyPolicy,
  type ConcurrencyRule,
  type ConcurrencySettings,
  HttpMethod,
} from '@cognite/sdk-core';

export type DataModelingConcurrencyCategory =
  | 'read'
  | 'search'
  | 'write'
  | 'delete'
  | 'readSchema'
  | 'writeSchema';

export type DataModelingConcurrencyOptions =
  ConcurrencySettings<DataModelingConcurrencyCategory>;

export const DEFAULT_DATA_MODELING_CONCURRENCY: Readonly<
  Record<DataModelingConcurrencyCategory, number>
> = Object.freeze({
  read: 1,
  search: 2,
  write: 1,
  delete: 1,
  readSchema: 2,
  writeSchema: 1,
});

// Note: First match wins so do not reorder rules without checking for overlapping matches,
// e.g. schema deletes must precede general deletes so /models/views/delete uses writeSchema.
const rules: readonly ConcurrencyRule<DataModelingConcurrencyCategory>[] = [
  {
    method: HttpMethod.Post,
    pattern:
      /^\/userapis\/spaces\/[^/]+\/datamodels\/[^/]+\/versions\/[^/]+\/graphql$/,
    category: 'read',
  },
  {
    method: HttpMethod.Post,
    pattern: /^\/dml\/graphql$/,
    category: 'writeSchema',
  },
  {
    pattern: /^\/models\/statistics(?:\/|$)/,
    category: 'readSchema',
  },
  {
    method: HttpMethod.Post,
    pattern: /^\/models\/instances\/(search|aggregate)$/,
    category: 'search',
  },
  {
    method: HttpMethod.Post,
    pattern:
      /^\/models\/(spaces|containers|views|datamodels)\/(?:.*\/)?delete$/,
    category: 'writeSchema',
  },
  {
    method: HttpMethod.Post,
    pattern: /^\/models\/(?:.*\/)?delete$/,
    category: 'delete',
  },
  {
    method: HttpMethod.Post,
    pattern: /^\/models\/(spaces|containers|views|datamodels)$/,
    category: 'writeSchema',
  },
  {
    method: HttpMethod.Post,
    pattern: /^\/models\/containers\/(indexes|constraints|properties)\/retry$/,
    category: 'writeSchema',
  },
  {
    method: HttpMethod.Post,
    pattern: /^\/models\/instances$/,
    category: 'write',
  },
];

/**
 * Strips trailing slashes and any proxy prefix plus `/api/<version>/projects/<project>`,
 * so the rules only see the path from `/models`, `/userapis` or `/dml` onwards:
 *
 * - `/api/v1/projects/my-project/models/instances/query` -> `/models/instances/query`
 * - `/cdf/api/v1/projects/my-project/models/views/` -> `/models/views`
 * - `/gateway/cdf/api/20230101/projects/p/dml/graphql` -> `/dml/graphql`
 * - `/models/instances` -> `/models/instances` (already normalized)
 * - `/api/v1/projects/p/assets/list` -> unchanged, no DM segment follows the project
 */
function normalizePath(pathname: string): string {
  return pathname
    .replace(/\/+$/, '')
    .replace(
      /^.*?\/api\/[^/]+\/projects\/[^/]+(?=\/(?:models|userapis|dml)(?:\/|$))/,
      ''
    );
}

function fallback(path: string): DataModelingConcurrencyCategory | undefined {
  if (!/^\/models(?:\/|$)/.test(path)) return undefined;
  return /^\/models\/(spaces|containers|views|datamodels)(?:\/|$)/.test(path)
    ? 'readSchema'
    : 'read';
}

export const dataModelingConcurrencyPolicy: ConcurrencyPolicy<DataModelingConcurrencyCategory> =
  {
    name: 'dataModeling',
    defaults: DEFAULT_DATA_MODELING_CONCURRENCY,
    rules,
    normalizePath,
    // Unknown DM operations remain bounded; unrelated APIs are not limited.
    fallback,
  };
