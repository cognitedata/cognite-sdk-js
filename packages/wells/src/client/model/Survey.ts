import { SequenceRow } from 'stable/dist/src/api/sequences/sequenceRow';

export type SearchSurveys = (args?: any) => Promise<Survey[]>;

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
   * Custom, application specific metadata. String key -> String value.
   * @type {{ [key: string]: string; }}
   * @memberof Survey
   */
  metadata?: { [key: string]: string };
  /**
   * @type {Promise<SequenceRow[]>}
   * @memberof Survey
   */
  rows(limit?: number): Promise<SequenceRow[]>;
}
