// Copyright 2020 Cognite AS

import { describe, expect, test } from 'vitest';
import { makeAutoPaginationMethods } from '../autoPagination';
import type { ListResponse } from '../types';
import { sleepPromise } from '../utils';

async function fibListResponse() {
  const generateResponse = async (
    a: number,
    b: number,
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
      fibListResponse(),
    ).autoPagingToArray({ limit });
    expect(secondFibArray).toMatchSnapshot();
    expect(secondFibArray).toEqual(firstFibArray);

    const maxArraySize = 10000;
    const thirdFibArray = await makeAutoPaginationMethods(
      fibListResponse(),
    ).autoPagingToArray({ limit: maxArraySize });
    expect(thirdFibArray.length).toBeGreaterThan(firstFibArray.length);
    expect(thirdFibArray.length).toBeLessThan(maxArraySize); // fib generator will not produce 10K numbers (check that this works)
  });

  test('has default limit', async () => {
    const arr = await makeAutoPaginationMethods(
      fibListResponse(),
    ).autoPagingToArray();
    expect(arr.length).toBe(25);
  });
});
