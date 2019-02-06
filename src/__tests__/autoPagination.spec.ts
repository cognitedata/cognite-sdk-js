// Copyright 2019 Cognite AS

import * as sleep from 'sleep-promise';
import { makeAutoPaginationMethods } from '../autoPagination';
import { ListResponse } from '../types/types';

async function fibListResponse() {
  const generateResponse = async (
    a: number,
    b: number
  ): Promise<ListResponse<number>> => {
    await sleep(100);
    let first = a;
    let second = b;
    const items = [];
    const maxFibNumber = 10000;
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
      previousCursor: '',
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
    expect(secondFibArray).toMatchInlineSnapshot(`
Array [
  1,
  2,
  3,
  5,
  8,
  13,
  21,
  34,
  55,
  89,
]
`);
    expect(secondFibArray).toEqual(firstFibArray);

    const maxArraySize = 10000;
    const thirdFibArray = await makeAutoPaginationMethods(
      fibListResponse()
    ).autoPagingToArray({ limit: maxArraySize });
    expect(thirdFibArray.length).toBeGreaterThan(firstFibArray.length);
    expect(thirdFibArray.length).toBeLessThan(maxArraySize); // fib generator will not produce 10K numbers (check that this works)
  });

  test('throw on bad user input', async () => {
    await expect(
      // @ts-ignore
      makeAutoPaginationMethods(fibListResponse()).autoPagingToArray()
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"You must pass a \`limit\` option to autoPagingToArray, eg; \`autoPagingToArray({limit: 1000});\`."`
    );

    await expect(
      makeAutoPaginationMethods(fibListResponse()).autoPagingToArray({
        limit: Infinity,
      })
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"You cannot specify a limit of more than 10,000 items to fetch in \`autoPagingToArray\`; use \`autoPagingEach\` to iterate through longer lists."`
    );
  });
});
