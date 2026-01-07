// Copyright 2020 Cognite AS

import { describe, expect, test } from 'vitest';
import { makeAutoPaginationMethods } from '../autoPagination';
import type { ListResponse } from '../types';
import { sleepPromise } from '../utils';

async function fibListResponse() {
  const generateResponse = async (
    a: number,
    b: number
  ): Promise<ListResponse<number[]>> => {
    await sleepPromise(100);
    let first = a;
    let second = b;
    const items = [];
    const maxFibNumber = 50000;
    while (first < maxFibNumber && items.length < 2) {
      const sum = first + second;
      items.push(sum);
      first = second;
      second = sum;
    }

    const next =
      first < maxFibNumber ? () => generateResponse(first, second) : undefined;

    return {
      items,
      nextCursor: '',
      next,
    };
  };
  return generateResponse(0, 1);
}

describe('makeAutoPaginationMethods', () => {
  test('correct usage', async () => {
    const limit = 10;
    const firstFibArray = [];
    for await (const value of makeAutoPaginationMethods(fibListResponse())) {
      firstFibArray.push(value);
      if (firstFibArray.length >= limit) {
        break;
      }
    }
    expect(firstFibArray.length).toBe(limit);

    const secondFibArray = await makeAutoPaginationMethods(
      fibListResponse()
    ).autoPagingToArray({ limit });
    expect(secondFibArray).toMatchSnapshot();
    expect(secondFibArray).toEqual(firstFibArray);

    const maxArraySize = 10000;
    const thirdFibArray = await makeAutoPaginationMethods(
      fibListResponse()
    ).autoPagingToArray({ limit: maxArraySize });
    expect(thirdFibArray.length).toBeGreaterThan(firstFibArray.length);
    expect(thirdFibArray.length).toBeLessThan(maxArraySize); // fib generator will not produce 10K numbers (check that this works)
  });

  test('has default limit', async () => {
    const arr = await makeAutoPaginationMethods(
      fibListResponse()
    ).autoPagingToArray();
    expect(arr.length).toBe(25);
  });

  test('stops pagination when hasNext is false even with nextCursor present', async () => {
    // Simulates an API like records sync that always returns nextCursor but uses hasNext to indicate when to stop
    let callCount = 0;
    const generateResponse = async (): Promise<ListResponse<number[]>> => {
      callCount++;
      const isLastPage = callCount >= 3;
      return {
        items: [callCount * 10],
        nextCursor: `cursor_${callCount}`, // Always present
        hasNext: !isLastPage, // Only false on the last page
        next: isLastPage ? undefined : async () => generateResponse(), // next is undefined when hasNext is false
      };
    };

    const arr = await makeAutoPaginationMethods(
      generateResponse()
    ).autoPagingToArray({ limit: 100 });

    expect(arr).toEqual([10, 20, 30]);
    expect(callCount).toBe(3);
  });

  test('continues pagination when hasNext is true', async () => {
    let callCount = 0;
    const generateResponse = async (): Promise<ListResponse<number[]>> => {
      callCount++;
      const isLastPage = callCount >= 2;
      return {
        items: [callCount],
        nextCursor: isLastPage ? undefined : `cursor_${callCount}`,
        hasNext: !isLastPage,
        next: isLastPage ? undefined : async () => generateResponse(),
      };
    };

    const arr = await makeAutoPaginationMethods(
      generateResponse()
    ).autoPagingToArray({ limit: 100 });

    expect(arr).toEqual([1, 2]);
    expect(callCount).toBe(2);
  });
});
