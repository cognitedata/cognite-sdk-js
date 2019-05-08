// Copyright 2019 Cognite AS

import {
  convertToTimestampToDateTime,
  isSameProject,
  makePromiseCancelable,
  projectUrl,
  promiseCache,
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
    const promise = new Promise(resolve => {
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

  describe('makePromiseCancelable', () => {
    const createPromise = () =>
      new Promise(resolve => {
        sleepPromise(100).then(() => resolve(123));
      });
    test('handle not cancel', async () => {
      const promise = createPromise();
      let resolved = false;
      const cancelablePromise = makePromiseCancelable(promise);
      cancelablePromise.then(() => {
        resolved = true;
      });
      const result = await cancelablePromise;
      expect(result).toBe(123);
      expect(resolved).toBeTruthy();
    });

    test('handle cancel', async () => {
      const promise = createPromise();
      let resolved = false;
      const cancelablePromise = makePromiseCancelable(promise);
      cancelablePromise.then(() => {
        resolved = true;
      });
      cancelablePromise.cancel();
      await sleepPromise(200);
      expect(resolved).toBeFalsy();
    });

    const createThrowingPromise = () =>
      new Promise((_, reject) => {
        sleepPromise(100).then(() => reject(new Error('Hallo')));
      });
    test('handle exceptions', async () => {
      const promise = createThrowingPromise();
      const cancelablePromise = makePromiseCancelable(promise);
      await expect(
        cancelablePromise
      ).rejects.toThrowErrorMatchingInlineSnapshot(`"Hallo"`);
    });

    test('ignore exception when cancelled', async () => {
      const promise = createThrowingPromise();
      const cancelablePromise = makePromiseCancelable(promise);
      cancelablePromise.cancel();
      await sleepPromise(200);
    });
  });
});
