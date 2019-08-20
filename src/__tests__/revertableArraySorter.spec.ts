// Copyright 2019 Cognite AS

import { RevertableArraySorter } from '../revertableArraySorter';

describe('revetable array sorter', () => {
  test('small array', () => {
    const revertableSorter = new RevertableArraySorter(
      [1, 2, 3],
      (array: number[]) => array.slice().reverse()
    );
    expect(revertableSorter.getSorted()).toEqual([3, 2, 1]);
    expect(revertableSorter.unsort(['a', 'b', 'c'])).toEqual(['c', 'b', 'a']);
    expect(() =>
      revertableSorter.unsort(['a', 'b'])
    ).toThrowErrorMatchingSnapshot();
  });
});
