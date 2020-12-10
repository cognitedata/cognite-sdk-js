import { WellHead } from './WellHead';

// Customizable function that takes in CogniteClient and args, and return a promise of a well
export type SearchWells = (args: any) => Promise<Well[]>;
export type SearchWell = (args: any) => Promise<Well>;

/**
 * A well is an assets and sets the basis of the well data model hierarchy
 * @export
 * @interface Well
 */
export interface Well {
  /**
   * @type {number}
   * @memberof Well
   */
  id: number;
  /**
   * @type {string}
   * @memberof Well
   */
  name: string;
  /**
   * @type {string}
   * @memberof Well
   */
  externalId?: string;
  /**
   * @type {string}
   * @memberof Well
   */
  country?: string;
  /**
   * @type {string}
   * @memberof Well
   */
  quadrant?: string;
  /**
   * @type {string}
   * @memberof Well
   */
  block?: string;
  /**
   * @type {string}
   * @memberof Well
   */
  field?: string;
  /**
   * @type {string}
   * @memberof Well
   */
  operator?: string;
  /**
   * @type {number}
   * @memberof Well
   */
  waterDepth?: number;
  /**
   * @type {WellHead}
   * @memberOf Well
   */
  wellHead?: WellHead;
  /**
   * @type {WellDatum}
   * @memberof Well
   */
  datum?: WellDatum;
  /**
   * @type {string[]}
   * @memberof Well
   */
  sources?: string[];
}

export interface WellDatum {
  /**
   * @type {string}
   * @memberof WellDatum
   */
  name?: string;
  /**
   * @type {number}
   * @memberof WellDatum
   */
  elevation: number;
  /**
   * @type {string}
   * @memberof WellDatum
   */
  unit: string;
  /**
   * @type {string}
   * @memberof WellDatum
   */
  reference?: string;
}
