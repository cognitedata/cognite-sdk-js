// Copyright 2020 Cognite AS

/**
 * The `RevertableArraySorter` class provides functionality to sort an array
 * while maintaining the ability to revert to the original order. This is useful
 * in scenarios where you need to temporarily sort data for display or processing
 * but want to easily revert back to the original order without having to store
 * a separate copy of the array.
 *
 * The motivation for this class was to handle creation of Assets.
 * If you want to create many Assets, then it's important that parent Assets
 * are created before child assets or parent and child assets
 * are contained in the same API call. The SDK caller only need to provide a
 * long array of Assets and the SDK will sort them in the correct order.
 * However, the caller expects the response array to match the input array order.
 * So when we sort the input array, we need to remember it's original order.
 */
export class RevertableArraySorter<InputType> {
  private originalIndexMap: Map<InputType, number> = new Map();
  private sortedArray?: InputType[];
  private originalArray?: InputType[];

  constructor(private sortFunction: (array: InputType[]) => InputType[]) {}

  public sort = (array: InputType[]) => {
    this.originalIndexMap = new Map();
    this.originalArray = array;
    array.forEach((item, index) => {
      this.originalIndexMap.set(item, index);
    });
    this.sortedArray = this.sortFunction(array);
    return this.sortedArray;
  };

  public unsort = <OutputType>(arrayToUnsort: OutputType[]) => {
    if (!this.originalArray || !this.sortedArray) {
      throw Error('Impossible to unsort. Call sort(...) first.');
    }
    if (arrayToUnsort.length !== this.originalArray.length) {
      throw Error(
        'Impossible to unsort. Input array has a different length from original.'
      );
    }

    const originallySortedArray: OutputType[] = [];
    this.sortedArray.forEach((item, index) => {
      const originalIndex = this.originalIndexMap.get(item) as number; // we know it exists
      originallySortedArray[originalIndex] = arrayToUnsort[index];
    });
    return originallySortedArray;
  };
}
