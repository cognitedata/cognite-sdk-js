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
   * @type {number}
   * @memberof Wellbore
   */
  parent_id: string;
  /**
   * Custom, application specific metadata. String key -> String value.
   * @type {{ [key: string]: string; }}
   * @memberof Well
   */
  metadata?: { [key: string]: string };
}
