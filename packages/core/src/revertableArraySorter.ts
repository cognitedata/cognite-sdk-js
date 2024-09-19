// Copyright 2020 Cognite AS

export class RevertableArraySorter<InputType> {
  #originalIndexMap: Map<InputType, number> = new Map();
  #sortedArray?: InputType[];
  #originalArray?: InputType[];

  constructor(private sortFunction: (array: InputType[]) => InputType[]) {}

  public sort = (array: InputType[]) => {
    this.#originalIndexMap = new Map();
    this.#originalArray = array;
    array.forEach((item, index) => {
      this.#originalIndexMap.set(item, index);
    });
    this.#sortedArray = this.sortFunction(array);
    return this.#sortedArray;
  };

  public unsort = <OutputType>(arrayToUnsort: OutputType[]) => {
    if (!this.#originalArray || !this.#sortedArray) {
      throw Error('Impossible to unsort. Call sort(...) first.');
    }
    if (arrayToUnsort.length !== this.#originalArray.length) {
      throw Error(
        'Impossible to unsort. Input array has a different length from original.'
      );
    }

    const originallySortedArray: OutputType[] = [];
    this.#sortedArray.forEach((item, index) => {
      const originalIndex = this.#originalIndexMap.get(item) as number; // we know it exists
      originallySortedArray[originalIndex] = arrayToUnsort[index];
    });
    return originallySortedArray;
  };
}
