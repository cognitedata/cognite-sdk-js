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

export const enum ValueType {
  string = 'STRING',
  double = 'DOUBLE',
  long = 'LONG',
}

export interface SurveyDataRequest {
  /**
   * @type {number}
   * @memberof SurveyDataRequest
   */
  id: number;
  /**
   * @type {number}
   * @memberof SurveyDataRequest
   */
  start?: number;
  /**
   * @type {number}
   * @memberof SurveyDataRequest
   */
  end?: number;
  /**
   * @type {number}
   * @memberof SurveyDataRequest
   */
  limit?: number;
  /**
   * @type {number}
   * @memberof SurveyDataRequest
   */
  cursor?: string;
  /**
   * @type {string[]}
   * @memberof SurveyDataRequest
   */
  columns?: string[];
}

export interface SurveyColumnInfo {
  /**
   * @type {string}
   * @memberof SurveyDataRequest
   */
  externalId?: string;
  /**
   * @type {string}
   * @memberof SurveyDataRequest
   */
  name?: string;
  /**
   * @type {ValueType}
   * @memberof SurveyDataRequest
   */
  valueType?: ValueType;
}

export interface SurveyRow {
  /**
   * @type {number}
   * @memberof SurveyDataRequest
   */
  rowNumber: number;
  /**
   * @type {any[]}
   * @memberof SurveyDataRequest
   */
  values: any[];
}

export interface SurveyData {
  /**
   * @type {number}
   * @memberof SurveyData
   */
  id: number;
  /**
   * @type {string[]}
   * @memberof SurveyData
   */
  columns: string[];
  /**
   * @type {SurveyRow[]}
   * @memberof SurveyData
   */
  rows: SurveyRow[];
  /**
   * @type {string}
   * @memberof SurveyData
   */
  externalId?: string;
  /**
   * @type {number}
   * @memberof SurveyData
   */
  nextCursor?: string;
}
