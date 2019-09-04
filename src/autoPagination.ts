// Copyright 2019 Cognite AS

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
  firstPagePromise: Promise<ListResponse<T[]>>
) {
  let listPromise = firstPagePromise;
  let i = 0;

  function iterate(
    listResult: ListResponse<T[]>
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
      const item = iterResult.value;
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
  limit?: number;
}
export type AutoPagingToArray<T> = (
  options?: AutoPagingToArrayOptions
) => Promise<T[]>;

function makeAutoPagingToArray<T>(autoPagingEach: AutoPagingEach<T>) {
  return async function autoPagingToArray(options?: AutoPagingToArrayOptions) {
    let limit = (options && options.limit) || 25;
    if (limit === -1) {
      limit = Infinity;
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

export type CursorAndAsyncIterator<T, Wrapper = T[]> = Promise<
  ListResponse<Wrapper>
> &
  CogniteAsyncIterator<T>;
