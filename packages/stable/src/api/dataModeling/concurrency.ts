// Copyright 2026 Cognite AS

import {
  type ConcurrencyOptions,
  type ConcurrencyPolicy,
  type ConcurrencyRule,
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
  ConcurrencyOptions<DataModelingConcurrencyCategory>;

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
    // Unknown DM operations remain bounded; unrelated APIs are not limited.
    fallback,
  };
