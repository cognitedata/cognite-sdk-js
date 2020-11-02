export interface Survey {
  /**
   * @type {number}
   * @memberof Survey
   */
  id: number;
  /**
   * @type {string}
   * @memberof Survey
   */
  name: string;
  /**
   * @type {string}
   * @memberof Survey
   */
  description: string;
  /**
   * @type {number}
   * @memberof Survey
   */
  assetId: number;
  /**
   * @type {string}
   * @memberof Survey
   */
  externalId: string;
  /**
   * Custom, application specific metadata. String key -> String value.
   * @type {{ [key: string]: string; }}
   * @memberof Well
   */
  metadata?: { [key: string]: string };
}
