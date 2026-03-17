// Copyright 2020 Cognite AS
import { describe, expect, test } from 'vitest';

import {
  type CogniteAPIVersion,
  apiUrl,
  convertToTimestampToDateTime,
  isJson,
  isSameProject,
  projectUrl,
  promiseAllAtOnce,
  promiseCache,
  promiseEachInSequence,
  sleepPromise,
} from '../utils';

describe('utils', () => {
  test('projectUrl', () => {
    expect(projectUrl('my-tenant')).toMatchInlineSnapshot(
      `"/api/v1/projects/my-tenant"`
    );

    expect(projectUrl('my-special-tenønt')).toMatchInlineSnapshot(
      `"/api/v1/projects/my-special-ten%C3%B8nt"`
    );
  });

  test('api version constraints', () => {
    const v1: CogniteAPIVersion = 'v1';

    expect(apiUrl(v1)).toEqual(`/api/${v1}`);
  });

  test('convertToTimestampToDateTime', () => {
    expect(
      convertToTimestampToDateTime(1524812400000).toUTCString()
    ).toMatchInlineSnapshot(`"Fri, 27 Apr 2018 07:00:00 GMT"`);
    expect(
      convertToTimestampToDateTime(1524373706000).toUTCString()
    ).toMatchInlineSnapshot(`"Sun, 22 Apr 2018 05:08:26 GMT"`);
  });

  test('isSameProject', () => {
    expect(isSameProject('a', 'b')).toBeFalsy();
    expect(isSameProject('a', 'a')).toBeTruthy();
    expect(isSameProject('aBC', 'abc')).toBeTruthy();
    expect(isSameProject('a-b-c', 'a-bc')).toBeFalsy();
  });

  test('promiseCache', async () => {
    const promise = new Promise((resolve) => {
      sleepPromise(100).then(() => resolve(123));
    });
    const cachedPromise = promiseCache(() => promise);

    const result1 = cachedPromise();
    const result2 = cachedPromise();
    expect(result1).toBe(result2);
    await sleepPromise(200);
    const result3 = cachedPromise();
    expect(result3).not.toBe(result1);
    await expect(result1).resolves.toBe(123);
    await expect(result2).resolves.toBe(123);
    await expect(result3).resolves.toBe(123);
  });

  describe('multi promise resolution', () => {
    test('promiseAllAtOnce: fail', async () => {
      const data = ['x', 'a', 'b', 'c'];
      await expect(
        promiseAllAtOnce(data, (input) =>
          input === 'x'
            ? Promise.reject(`${input}x`)
            : Promise.resolve(`${input}r`)
        )
      ).rejects.toEqual({
        failed: ['x'],
        succeded: ['a', 'b', 'c'],
        errors: ['xx'],
        responses: ['ar', 'br', 'cr'],
      });
    });

    test('promiseAllAtOnce: one element', async () => {
      const fail = () =>
        new Promise(() => {
          throw new Error('y');
        });
      await expect(promiseAllAtOnce(['x'], fail)).rejects.toEqual({
        failed: ['x'],
        succeded: [],
        errors: [new Error('y')],
        responses: [],
      });
    });

    test('promiseAllAtOnce: success', async () => {
      const data = ['a', 'b', 'c'];
      await expect(
        promiseAllAtOnce(data, (input) => Promise.resolve(input))
      ).resolves.toEqual(['a', 'b', 'c']);
    });

    test('promiseAllAtOnce: keep ordering', async () => {
      const data = [100, 50, 10];
      const promiser = async (sleepInMs: number) => {
        await sleepPromise(sleepInMs);
        return sleepInMs;
      };
      await expect(promiseAllAtOnce(data, promiser)).resolves.toEqual(data);
    });

    test('promiseAllAtOnce: respects concurrency limit', async () => {
      let activeConcurrency = 0;
      let maxObservedConcurrency = 0;
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const promiser = async (input: number) => {
        activeConcurrency++;
        maxObservedConcurrency = Math.max(
          maxObservedConcurrency,
          activeConcurrency
        );
        await sleepPromise(10);
        activeConcurrency--;
        return input;
      };
      const result = await promiseAllAtOnce(data, promiser, 3);
      expect(result).toEqual(data);
      expect(maxObservedConcurrency).toBeLessThanOrEqual(3);
      expect(maxObservedConcurrency).toBeGreaterThan(1);
    });

    test('promiseAllAtOnce: concurrency higher than input count', async () => {
      const data = [1, 2];
      const result = await promiseAllAtOnce(
        data,
        (input) => Promise.resolve(input * 2),
        100
      );
      expect(result).toEqual([2, 4]);
    });

    test('promiseEachInSequence', async () => {
      expect(
        await promiseEachInSequence([], (input) => Promise.resolve(input))
      ).toEqual([]);

      expect(
        await promiseEachInSequence([1], (input) => Promise.resolve(input))
      ).toEqual([1]);

      expect(
        await promiseEachInSequence([1, 2, 3], (input) =>
          Promise.resolve(input)
        )
      ).toEqual([1, 2, 3]);

      await expect(
        promiseEachInSequence([1, 2], () => Promise.reject('reject'))
      ).rejects.toEqual({
        failed: [1, 2],
        succeded: [],
        errors: ['reject'],
        responses: [],
      });

      await expect(
        promiseEachInSequence([1, 0, 2, 3], (input) =>
          input ? Promise.resolve(input) : Promise.reject('x')
        )
      ).rejects.toEqual({
        failed: [0, 2, 3],
        succeded: [1],
        errors: ['x'],
        responses: [1],
      });

      await expect(
        promiseEachInSequence([1, 2, 0, 3, 0], (input) =>
          input ? Promise.resolve(`${input}r`) : Promise.reject('x')
        )
      ).rejects.toEqual({
        failed: [0, 3, 0],
        succeded: [1, 2],
        errors: ['x'],
        responses: ['1r', '2r'],
      });
    });

    test('promiseEachInSequence with continueOnError', async () => {
      // all succeed - same behavior
      expect(
        await promiseEachInSequence(
          [1, 2, 3],
          (input) => Promise.resolve(input),
          true
        )
      ).toEqual([1, 2, 3]);

      // continues past failures and collects all errors
      await expect(
        promiseEachInSequence(
          [1, 0, 2, 3, 0],
          (input) => (input ? Promise.resolve(`${input}r`) : Promise.reject('x')),
          true
        )
      ).rejects.toEqual({
        failed: [0, 0],
        succeded: [1, 2, 3],
        errors: ['x', 'x'],
        responses: ['1r', '2r', '3r'],
      });

      // all fail
      await expect(
        promiseEachInSequence(
          [0, 0, 0],
          (input) => (input ? Promise.resolve(input) : Promise.reject('err')),
          true
        )
      ).rejects.toEqual({
        failed: [0, 0, 0],
        succeded: [],
        errors: ['err', 'err', 'err'],
        responses: [],
      });
    });
  });

  test('should isJson returns false in case of ArrayBuffer', () => {
    expect(isJson(new ArrayBuffer(16))).toBeFalsy();
  });
});
