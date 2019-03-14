// Copyright 2019 Cognite AS

import { isNumber } from 'lodash';
import { ListResponse } from './types/types';

// polyfill
if (Symbol.asyncIterator === undefined) {
  (Symbol as any).asyncIterator = Symbol.for('asyncIterator');
}

export interface CogniteAsyncIterator<T> extends AsyncIterableIterator<T> {
  autoPagingEach: AutoPagingEach<T>;
  autoPagingToArray: AutoPagingToArray<T>;
}

/** @hidden */
export function makeAutoPaginationMethods<T>(
  firstPagePromise: Promise<ListResponse<T>>
) {
  let listPromise = firstPagePromise;
  let i = 0;

  function iterate(
    listResult: ListResponse<T>
  ): IteratorResult<T> | Promise<IteratorResult<T>> {
    if (i < listResult.items.length) {
      return {
        value: listResult.items[i++],
        done: false,
      };
    } else if (listResult.next) {
      // reset counter, request next page, and recurse.
      i = 0;
      listPromise = listResult.next();
      return listPromise.then(iterate);
    }
    return { value: undefined!, done: true }; // https://github.com/Microsoft/TypeScript/issues/11375#issuecomment-413037242
  }

  async function asyncIteratorNext(): Promise<IteratorResult<T>> {
    const listResult = await listPromise;
    return iterate(listResult);
  }

  const autoPagingEach = makeAutoPagingEach(asyncIteratorNext);
  const autoPagingToArray = makeAutoPagingToArray(autoPagingEach);
  const autoPaginationMethods: CogniteAsyncIterator<T> = {
    autoPagingEach,
    autoPagingToArray,

    // Async iterator functions:
    next: asyncIteratorNext,
    return(): any {
      // This is required for `break`.
      return {};
    },
    [Symbol.asyncIterator]: () => autoPaginationMethods,
  };
  return autoPaginationMethods;
}

export type AutoPagingEachHandler<T> = (
  item: T
) => (void | boolean) | Promise<void | boolean>;

export type AutoPagingEach<T> = (
  handler: AutoPagingEachHandler<T>
) => Promise<void>;

function makeAutoPagingEach<T>(
  asyncIteratorNext: () => Promise<IteratorResult<T>>
): AutoPagingEach<T> {
  return async function autoPagingEach(handler: AutoPagingEachHandler<T>) {
    async function iterate() {
      const iterResult = await asyncIteratorNext();
      if (iterResult.done) {
        return;
      }
      const item = iterResult.value as T;
      const shouldContinue = await handler(item);
      if (shouldContinue === false) {
        return;
      }
      await iterate();
    }
    await iterate();
  };
}

export interface AutoPagingToArrayOptions {
  limit: number;
}
export type AutoPagingToArray<T> = (
  options: AutoPagingToArrayOptions
) => Promise<T[]>;

function makeAutoPagingToArray<T>(autoPagingEach: AutoPagingEach<T>) {
  return async function autoPagingToArray(options: AutoPagingToArrayOptions) {
    const limit = options && options.limit;
    if (!isNumber(limit)) {
      throw Error(
        'You must pass a `limit` option to autoPagingToArray, eg; `autoPagingToArray({limit: 1000});`.'
      );
    }
    if (limit > 10000) {
      throw Error(
        'You cannot specify a limit of more than 10,000 items to fetch in `autoPagingToArray`; use `autoPagingEach` or for-await to iterate through longer lists.'
      );
    }
    const items: T[] = [];
    await autoPagingEach(async item => {
      items.push(item);
      if (items.length >= limit) {
        return false;
      }
    });
    return items;
  };
}
