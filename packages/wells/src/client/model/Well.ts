import { WellHeadLocation } from './WellHeadLocation';

/**
 * A well is an assets and sets the basis of the well data model hierarchy
 * @export
 * @interface Well
 */
export interface Well {
  /**
   * @type {string}
   * @memberof WellDto
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
   * Custom, application specific metadata. String key -> String value.
   * @type {{ [key: string]: string; }}
   * @memberof Well
   */
  metadata?: { [key: string]: string };
}
