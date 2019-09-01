// Copyright 2019 Cognite AS

import {
  convertToTimestampToDateTime,
  isSameProject,
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
});
