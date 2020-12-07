import { GeoJson } from './GeoJson';
import { WellHeadLocation_deprecated } from './WellHeadLocation-deprecated';

// Customizable function that takes in CogniteClient and args, and return a promise of a well
export type SearchWells = (args: any) => Promise<Well_deprecated[]>;
export type SearchWell = (args: any) => Promise<Well_deprecated>;

/**
 * A well is an assets and sets the basis of the well data model hierarchy
 * @export
 * @interface Well_deprecated
 */
export interface Well_deprecated {
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
   * @type {WellHeadLocation_deprecated}
   * @memberOf Well
   */
  wellHeadLocation: WellHeadLocation_deprecated;
  /**
   * @type {WellDatum_deprecated}
   * @memberof Well
   */
  datum?: WellDatum_deprecated;
  /**
   * @type {string}
   * @memberof Well
   */
  country?: string;
  /**
   * @type {string}
   * @memberof Well
   */
  platform?: string;
  /**
   * @type {string[]}
   * @memberof Well
   */
  dataSource?: string[];
  /**
   * @type {string[]}
   * @memberof Well
   */
  operator: string[];
  /**
   * @type {string[]}
   * @memberof Well
   */
  field: string[];
  /**
   * @type {string[]}
   * @memberof Well
   */
  block: string[];
  /**
   * Custom, application specific metadata. String key -> String value.
   * @type {{ [key: string]: string; }}
   * @memberof Well
   */
  metadata?: { [key: string]: string };
}

export interface WellDatum_deprecated {
  /**
   * @type {string}
   * @memberof WellDatum
   */
  name?: string;
  /**
   * @type {number}
   * @memberof WellDatum
   */
  elevation?: number;
  /**
   * @type {string}
   * @memberof WellDatum
   */
  unit?: string;
}

export interface WellFilter_deprecated {
  /**
   * @type {string[]}
   * @memberof WellFilter
   */
  name?: string[];
  /**
   * @type {string[]}
   * @memberof WellFilter
   */
  operator?: string[];
  /**
   * @type {string[]}
   * @memberof WellFilter
   */
  field?: string[];
  /**
   * @type {string[]}
   * @memberof WellFilter
   */
  block?: string[];
  /**
   * @type {string[]}
   * @memberof WellFilter
   */
  dataSource?: string[];
}

export interface WellGeometry {
  /**
   * @type {string | GeoJson}
   * @memberof WellGeometry
   */
  geometry: string | GeoJson;
  /**
   * @type {string}
   * @memberof WellGeometry
   * @default "epsg:4326"
   */
  crs?: string;
  /**
   * @type {string}
   * @memberof WellGeometry
   * @default "EPSG:4326"
   */
  outputCrs?: string;
}
