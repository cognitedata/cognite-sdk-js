import { LengthUnitEnum } from "./LengthUnitEnum";

export interface LengthRange {
  /**
   * @type {number}
   * @memberof LengthRange
   */
  min?: number;
  /**
   * @type {number}
   * @memberof LengthRange
   */
  max?: number;
  /**
   * @type {string}
   * @memberof LengthRange
   */
  unit: LengthUnitEnum;
}
