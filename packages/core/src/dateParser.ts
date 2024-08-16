// Copyright 2020 Cognite AS

import cloneDeepWith from 'lodash/cloneDeepWith';

export default class DateParser {
  /**
   * @param path keys that lead to datePropNames
   * @param datePropNames keys that contain date strings or numbers representing milliseconds since epoch
   */
  constructor(
    private path: string[],
    private datePropNames: string[],
  ) {}

  private isDatePropName = (key: string | number | undefined) =>
    typeof key === 'string' && this.datePropNames.indexOf(key) !== -1;
  private isPath = (key: string | number | undefined) =>
    typeof key === 'string' && this.path.indexOf(key) !== -1;

  /**
   * Goes through data, converting all fields with paths matching
   *  (path.)*datePropNames
   * into a Date object by parsing value as milliseconds since epoch or ISO8601
   *
   * @param data
   */
  parseToDates<T>(data: T): T {
    return cloneDeepWith(data, (value, key, object) => {
      if (this.isDatePropName(key)) return new Date(value);
      if (key !== undefined && !this.isPath(key) && !Array.isArray(object)) {
        // There is a key, but it is not in lead.
        // The key is not the index of an array.
        // Return the value as is, without looking for dates
        return value;
      }
    });
  }

  /**
   * Turns every Date object in data into number of milliseconds since unix epoc
   * @param data
   */
  static parseFromDates<T>(data: T): T {
    return cloneDeepWith(data, (value) => {
      if (value instanceof Date) {
        return value.getTime();
      }
    });
  }
}
