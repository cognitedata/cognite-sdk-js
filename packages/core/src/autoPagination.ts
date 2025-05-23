// Copyright 2020 Cognite AS

import type {
  AutoPagingEach,
  AutoPagingEachHandler,
  AutoPagingToArrayOptions,
  CogniteAsyncIterator,
  ListResponse,
} from './types';

/**
 * The `makeAutoPaginationMethods` function generates methods for automatically
 * paginating through API responses. This is particularly useful when dealing with
 * APIs that return large sets of data across multiple pages, allowing you to
 * seamlessly iterate through all available data without manually handling pagination.
 *
 * This function typically creates methods that:
 * - Fetch the next page of results based on the current page's metadata.
 * - Aggregate results from multiple pages into a single iterable or array.
 *
 * @param apiClient - The API client instance used to make requests.
 * @param initialRequest - The initial request object containing the parameters for the first page.
 * @returns An iterable or async iterable that yields items from the paginated response.
 *
 * @hidden
 */
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
    }
    if (listResult.next) {
      // reset counter, request next page, and recurse.
      i = 0;
      listPromise = listResult.next();
      return listPromise.then(iterate);
    }
    return { value: undefined, done: true };
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
    // biome-ignore lint/suspicious/noExplicitAny: didn't find the right type in reasonable timeframe
    return(): any {
      // This is required for `break`.
      return {};
    },
    [Symbol.asyncIterator]: () => autoPaginationMethods,
  };
  return autoPaginationMethods;
}

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

function makeAutoPagingToArray<T>(autoPagingEach: AutoPagingEach<T>) {
  return async function autoPagingToArray(options?: AutoPagingToArrayOptions) {
    let limit = options?.limit || 25;
    if (limit === -1) {
      limit = Number.POSITIVE_INFINITY;
    }
    const items: T[] = [];
    await autoPagingEach(async (item) => {
      items.push(item);
      if (items.length >= limit) {
        return false;
      }
    });
    return items;
  };
}
