import { SurveyData } from './Survey';

export interface Measurement {
  /**
   * @type {number}
   * @memberof Measurement
   */
  id: number;
  /**
   * @type {string}
   * @memberof Measurement
   */
  externalId: string;
  /**
   * @type {string}
   * @memberof Measurement
   */
  name: string;
  /**
   * @type {SurveyData}
   * @memberof Survey
   */
  data(limit?: number): Promise<SurveyData>;
}

export interface Measurements {
  /**
   * @type {Measurement[]}
   * @memberof Measurements
   */
  items: Measurement[];
}
