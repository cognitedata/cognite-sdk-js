import { GeoJson } from './GeoJson';
import { WellHeadLocation } from './WellHeadLocation';

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
   * @type {WellHeadLocation}
   * @memberOf Well
   */
  wellHeadLocation: WellHeadLocation;
  /**
   * @type {string}
   * @memberof Well
   */
  datum?: string;
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

export interface WellFilter {
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
