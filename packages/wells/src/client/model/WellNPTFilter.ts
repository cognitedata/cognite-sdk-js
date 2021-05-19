import { ContainsAllOrAny } from './ContainsAllOrAny';
import { LengthRange } from './LengthRange';

export interface WellNPTFilter {
  /**
   * @type {LengthRange}
   * @memberof WellNPTFilter
   */
  measuredDepth?: LengthRange;
  /**
   * @type {DoubleRange}
   * @memberof WellNPTFilter
   */
  duration?: DoubleRange;
  /**
   * @type {ContainsAllOrAny}
   * @memberof WellNPTFilter
   */
  nptCodes?: ContainsAllOrAny;
  /**
   * @type {ContainsAllOrAny}
   * @memberof WellNPTFilter
   */
  nptCodeDetails?: ContainsAllOrAny;
}
