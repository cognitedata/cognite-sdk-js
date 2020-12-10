import { Survey } from '../model/Survey';
import { Well } from './Well';
import { WellHead } from './WellHead';

// Customizable function that takes in CogniteClient and args, and return a promise of a wellbore
export type SearchWellbores = (args?: any) => Promise<Wellbore[]>;
export type SearchWellbore = (args?: any) => Promise<Wellbore>;

/**
 * A wellbore is an asset.
 * Each wellbore is part of a well hierarchy
 * with either a well or another wellbore as it’s parent.
 * @export
 * @interface Wellbore
 */
export interface Wellbore {
  /**
   * @type {number}
   * @memberof Wellbore
   */
  id: number;
  /**
   * @type {string}
   * @memberof Wellbore
   */
  name: string;
  /**
   * Custom, application specific metadata. String key -> String value.
   * @type {{ [key: string]: string; }}
   * @memberof Wellbore
   */
  metadata?: { [key: string]: string };
  /**
   * @type {Promise<Survey[]>}
   * @memberof Wellbore
   */
  trajectories(): Promise<Survey[]>;
  /**
   * @type {Promise<Well>}
   * @memberof Wellbore
   */
  parentWell(): Promise<Well | undefined>;
  /**
   * @type {Promise<WellDatum_deprecated>}
   * @memberof Wellbore
   */
  //getDatum(): Promise<WellDatum_deprecated | undefined>;
  /**
   * @type {Promise<WellHead>}
   * @memberof Wellbore
   */
  getWellHeadLocation(): Promise<WellHead | undefined>;
}
