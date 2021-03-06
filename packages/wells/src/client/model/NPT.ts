import { DoubleWithUnit } from './DoubleWithUnit';

/**
 * Collection of Well objects and a cursor for fetching the next collection
 */
export interface NPTItems {
  /**
   * @type {NPT[]}
   * @memberof NPT
   */
  items: NPT[];
  /**
   * @type {string}
   * @memberof NPT
   */
  nextCursor?: string;
}

export interface NPT {
  /**
   * @type {string}
   * @memberof NPT
   */
  parentExternalId: string;
  /**
   * @type {string}
   * @memberof NPT
   */
  parentType: string;
  /**
   * @type {string}
   * @memberof NPT
   */
  sourceEventExternalId: string;
  /**
   * @type {string}
   * @memberof NPT
   */
  source: string;
  /**
   * @type {number}
   * @memberof NPT
   */
  startTime: number;
  /**
   * @type {number}
   * @memberof NPT
   */
  endTime: number;
  /**
   * @type {strnumbering}
   * @memberof NPT
   */
  duration: number;
  /**
   * @type {string}
   * @memberof NPT
   */
  nptCode?: string;
  /**
   * @type {string}
   * @memberof NPT
   */
  nptCodeDetail?: string;
  /**
   * @type {string}
   * @memberof NPT
   */
  nptLevel?: string;
  /**
   * @type {string}
   * @memberof NPT
   */
  description?: string;
  /**
   * @type {DoubleWithUnit}
   * @memberof NPT
   */
  measuredDepth?: DoubleWithUnit;
  /**
   * @type {string}
   * @memberof NPT
   */
  rootCause?: string;
  /**
   * @type {string}
   * @memberof NPT
   */
  location?: string;
  /**
   * @type {string}
   * @memberof NPT
   */
  subtype?: string;
}
