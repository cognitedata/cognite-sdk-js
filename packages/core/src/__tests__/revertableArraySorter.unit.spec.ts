// Copyright 2020 Cognite AS

import { RevertableArraySorter } from '../revertableArraySorter';

describe('revertable array sorter', () => {
  test('small array', () => {
    const revertableSorter = new RevertableArraySorter((array: number[]) =>
      array.slice().reverse()
    );
    expect(() =>
      revertableSorter.unsort(['a'])
    ).toThrowErrorMatchingInlineSnapshot(
      `"Impossible to unsort. Call sort(...) first."`
    );
    expect(revertableSorter.sort([1, 2, 3])).toEqual([3, 2, 1]);
    expect(revertableSorter.unsort(['a', 'b', 'c'])).toEqual(['c', 'b', 'a']);
    expect(() =>
      revertableSorter.unsort(['a', 'b'])
    ).toThrowErrorMatchingInlineSnapshot(
      `"Impossible to unsort. Input array has a different length from original."`
    );
  });
});
