import { LengthRange } from './LengthRange';

export interface NPTFilter {
  /**
   * @type {LengthRange}
   * @memberof NPTFilter
   */
  measuredDepth?: LengthRange;
  /**
   * @type {DoubleRange}
   * @memberof NPTFilter
   */
  duration?: DoubleRange;
  /**
   * @type {string[]}
   * @memberof NPTFilter
   */
  nptCodes?: string[];
  /**
   * @type {string[]}
   * @memberof NPTFilter
   */
  nptCodeDetails?: string[];
  /**
   * @type {number[]}
   * @memberof NPTFilter
   */
  wellboreIds?: number[];
}
