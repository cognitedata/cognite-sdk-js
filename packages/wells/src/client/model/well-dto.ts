import {WellHeadLocationDto} from "./wellHeadLocation-dto";

/**
 * A well is an assets and sets the basis of the well data model hierarchy.
 * @export
 * @interface WellDto
 */
export interface WellDto {
  /**
   * @type {string}
   * @memberof WellDto
   */
  name: string;
  /**
   * @type {WellHeadLocationDto}
   * @memberOf WellDto
   */
  wellHeadLocation: WellHeadLocationDto;
  /**
   * Custom, application specific metadata. String key -> String value.
   * @type {{ [key: string]: string; }}
   * @memberof WellDto
   */
  metadata?: { [key: string]: string; };
}
