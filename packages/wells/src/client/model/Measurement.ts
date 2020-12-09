export interface Measurement {
  /**
   * @type {number}
   * @memberof Measurement
   */
  id: number;
  /**
   * @type {string}
   * @memberof Measurement
   */
  externalId: string;
  /**
   * @type {string}
   * @memberof Measurement
   */
  name: string;
}

export interface Measurements {
  /**
   * @type {Measurement[]}
   * @memberof Measurements
   */
  items: Measurement[];
}
