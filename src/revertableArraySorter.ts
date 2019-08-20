// Copyright 2019 Cognite AS

export class RevertableArraySorter<IntputType> {
  private originalIndexMap = new Map<IntputType, number>();
  private sortedArray: IntputType[];

  constructor(
    private originalArray: IntputType[],
    private sortFunction: (array: IntputType[]) => IntputType[]
  ) {
    originalArray.forEach((item, index) => {
      this.originalIndexMap.set(item, index);
    });
    this.sortedArray = this.sortFunction(originalArray);
  }

  public getSorted() {
    return this.sortedArray;
  }

  public unsort<OutputType>(arrayToUnsort: OutputType[]) {
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
  }
}
