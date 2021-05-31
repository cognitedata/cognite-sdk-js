import { Asset } from '@cognite/sdk';
import { Survey } from '../model/Survey';
import { Sequence } from './Sequence';
import { Well } from './Well';
import { Wellhead } from './wellhead';

// Customizable function that takes in CogniteClient and args, and return a promise of a wellbore
export type SearchWellbores = (args?: any) => Promise<Wellbore[]>;
export type SearchWellbore = (args?: any) => Promise<Wellbore>;

/**
 * Information about a source asset that a wellbore is based on.
 */
export interface WellboreSourceAsset {
  /**
   * Asset id in CDF
   */
  id: number;

  /**
   * Asset external id in CDF
   */
  externalId: string;

  /**
   * Source system for this source asset.
   */
  source: string;
}

/**
 * A wellbore is an asset.
 * Each wellbore is part of a well hierarchy
 * with either a well or another wellbore as it’s parent.
 * @export
 * @interface Wellbore
 */
export interface Wellbore {
  /**
   * Wellbore name
   * @type {string}
   * @memberof Wellbore
   */
  name: string;
  /**
   * Wellbore id
   * @type {number}
   * @memberof Wellbore
   */
  id: number;
  /**
   * External Id for the wellbore
   * @type {string}
   * @memberof Wellbore
   */
  externalId?: string;
  /**
   * CDF id of the well that contains this wellbore
   * @type {number}
   * @memberof Wellbore
   */
  wellId?: number;

  /**
   * List of all the source assets for this wellbore
   */
  sourceWellbores: WellboreSourceAsset[];
  /**
   * @type {Promise<Survey>}
   * @memberof Wellbore
   */
  trajectory(): Promise<Survey>;
  /**
   * @type {Promise<Sequence[]>}
   * @memberof Wellbore
   */
  casings(): Promise<Sequence[]>;
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
   * @type {Promise<Wellhead>}
   * @memberof Wellbore
   */
  getWellhead(): Promise<Wellhead | undefined>;
  /**
   * If the source parameter is set, it will only return source assets from that source system.
   * The source parameter can for example be EDM, Diskos, Openworks, etc.
   * @type {Promise<Asset[]>}
   * @memberof Wellbore
   */
  sourceAssets(source?: string): Promise<Asset[]>;
}
