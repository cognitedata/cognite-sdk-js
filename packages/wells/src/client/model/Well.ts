import { WellHeadLocation } from './WellHeadLocation';

/**
 * A well is an assets and sets the basis of the well data model hierarchy
 * @export
 * @interface Well
 */
export interface WellDto {
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
   * @memberof WellDto
   */
  datum?: string;
  /**
   * @type {string}
   * @memberof WellDto
   */
  country?: string;
  /**
   * @type {string}
   * @memberof WellDto
   */
  platform?: string;
  /**
   * Custom, application specific metadata. String key -> String value.
   * @type {{ [key: string]: string; }}
   * @memberof WellDto
   */
  metadata?: { [key: string]: string };
}
