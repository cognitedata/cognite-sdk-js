// Copyright 2019 Cognite AS

/** @hidden */
export class Queue<T> {
  private data: T[];
  constructor() {
    this.data = [];
  }

  public add = (item: T) => {
    this.data.unshift(item);
  };

  public remove = () => {
    this.data.pop();
  };

  public first = () => {
    return this.data[0];
  };

  public last = () => {
    return this.data[this.data.length - 1];
  };

  public size = () => {
    return this.data.length;
  };
}
