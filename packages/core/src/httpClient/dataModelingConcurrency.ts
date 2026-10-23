// Copyright 2026 Cognite AS

import { Semaphore } from '../semaphore';
import { HttpMethod, type HttpRequest } from './basicHttpClient';

export type DataModelingConcurrencyCategory =
  | 'read'
  | 'search'
  | 'write'
  | 'delete'
  | 'readSchema'
  | 'writeSchema';

export type DataModelingConcurrencyOptions = Partial<
  Record<DataModelingConcurrencyCategory, number>
>;

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

interface DataModelingConcurrencyRule {
  readonly method?: HttpMethod;
  readonly pattern: RegExp;
  readonly category: DataModelingConcurrencyCategory;
}

// Note: First match wins so do not reorder rules without checking for overlapping matches,
// e.g. schema deletes must precede general deletes so /models/views/delete uses writeSchema.
const DATA_MODELING_RULES: readonly DataModelingConcurrencyRule[] = [
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

function normalizeDataModelingPath(pathname: string): string {
  return pathname
    .replace(/\/+$/, '')
    .replace(
      /^.*?\/api\/[^/]+\/projects\/[^/]+(?=\/(?:models|userapis|dml)(?:\/|$))/,
      ''
    );
}

function getDataModelingReadFallback(
  path: string
): DataModelingConcurrencyCategory | undefined {
  if (!/^\/models(?:\/|$)/.test(path)) return undefined;
  return /^\/models\/(spaces|containers|views|datamodels)(?:\/|$)/.test(path)
    ? 'readSchema'
    : 'read';
}

export function classifyDataModelingRequest(
  method: HttpMethod,
  pathname: string
): DataModelingConcurrencyCategory | undefined {
  const path = normalizeDataModelingPath(pathname);
  for (const rule of DATA_MODELING_RULES) {
    if (
      (rule.method === undefined || rule.method === method) &&
      rule.pattern.test(path)
    ) {
      return rule.category;
    }
  }
  // Unknown DM operations remain bounded; unrelated APIs are not limited.
  return getDataModelingReadFallback(path);
}

export class DataModelingConcurrencyLimiter {
  private readonly semaphores: Record<
    DataModelingConcurrencyCategory,
    Semaphore
  >;

  constructor(options: DataModelingConcurrencyOptions = {}) {
    const createSemaphore = (category: DataModelingConcurrencyCategory) => {
      const max =
        options[category] === undefined
          ? DEFAULT_DATA_MODELING_CONCURRENCY[category]
          : options[category];
      if (
        max !== Number.POSITIVE_INFINITY &&
        (!Number.isInteger(max) || max <= 0)
      ) {
        throw new Error(
          `dataModelingConcurrency.${category} must be a positive integer or Infinity`
        );
      }
      return new Semaphore(max);
    };
    this.semaphores = {
      read: createSemaphore('read'),
      search: createSemaphore('search'),
      write: createSemaphore('write'),
      delete: createSemaphore('delete'),
      readSchema: createSemaphore('readSchema'),
      writeSchema: createSemaphore('writeSchema'),
    };
  }

  public run<T>(
    request: Pick<HttpRequest, 'method' | 'path'>,
    fn: () => Promise<T>
  ): Promise<T> {
    const category = classifyDataModelingRequest(request.method, request.path);
    return category ? this.semaphores[category].run(fn) : fn();
  }
}
