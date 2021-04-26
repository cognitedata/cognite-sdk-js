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
   * @type {string}
   * @memberof NPTFilter
   */
  nptCode?: string;
  /**
   * @type {string}
   * @memberof NPTFilter
   */
  nptCodeDetail?: string;
}
