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

export function classifyDataModelingRequest(
  method: HttpMethod,
  pathname: string
): DataModelingConcurrencyCategory | undefined {
  const path = pathname
    .replace(/\/+$/, '')
    .replace(
      /^.*?\/api\/[^/]+\/projects\/[^/]+(?=\/(?:models|userapis|dml)(?:\/|$))/,
      ''
    );
  if (method === HttpMethod.Post) {
    if (
      /^\/userapis\/spaces\/[^/]+\/datamodels\/[^/]+\/versions\/[^/]+\/graphql$/.test(
        path
      )
    ) {
      return 'read';
    }
    if (path === '/dml/graphql') return 'writeSchema';
  }
  if (!/^\/models(?:\/|$)/.test(path)) return undefined;
  if (/^\/models\/statistics(?:\/|$)/.test(path)) return 'readSchema';
  const isSchemaRequest =
    /^\/models\/(spaces|containers|views|datamodels)(?:\/|$)/.test(path);

  if (method === HttpMethod.Post) {
    if (/^\/models\/instances\/(search|aggregate)$/.test(path)) {
      return 'search';
    }
    if (path.endsWith('/delete')) {
      return isSchemaRequest ? 'writeSchema' : 'delete';
    }
    if (
      /^\/models\/(instances|spaces|containers|views|datamodels)$/.test(path) ||
      /^\/models\/containers\/(indexes|constraints|properties)\/retry$/.test(
        path
      )
    ) {
      return isSchemaRequest ? 'writeSchema' : 'write';
    }
  }
  return isSchemaRequest ? 'readSchema' : 'read';
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
