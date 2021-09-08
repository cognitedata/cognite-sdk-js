// Copyright 2020 Cognite AS

/** @hidden */
export class Queue<T> {
  private data: T[];
  constructor() {
    this.data = [];
  }

  public add = (item: T): void => {
    this.data.unshift(item);
  };

  public remove = (): void => {
    this.data.pop();
  };

  public first = (): T => {
    return this.data[0];
  };

  public last = (): T => {
    return this.data[this.data.length - 1];
  };

  public size = (): number => {
    return this.data.length;
  };
}
