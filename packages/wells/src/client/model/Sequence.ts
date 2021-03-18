import { ValueType } from './ValueType';

export interface SequenceColumns {
  /**
   * @type {ValueType}
   * @memberof SequenceColumns
   *
   */
  valueType?: ValueType;
  /**
   *
   * @type {number}
   * @memberof SequenceColumns
   *
   */
  createdTime: number;
  /**
   *
   * @type {number}
   * @memberof SequenceColumns
   *
   */
  lastUpdatedTime: number;
  /**
   * @type {string}
   * @memberof SequenceColumns
   *
   */
  name?: string;
  /**
   * @type {string}
   * @memberof SequenceColumns
   *
   */
  externalId?: string;
  /**
   * @type {string}
   * @memberof SequenceColumns
   *
   */
  description?: string;
  /**
   * Custom, application specific metadata. String key -> String value.
   * @type {{ [key: string]: string; }}
   * @memberof SequenceColumns
   *
   */
  metadata?: { [key: string]: string };
}

export interface Sequence {
  /**
   *
   * @type {number}
   * @memberof Sequence
   *
   */
  id: number;
  /**
   * @type {SequenceColumns[]}
   * @memberof Sequence
   */
  columns?: SequenceColumns[];
  /**
   * @type {ValueType}
   * @memberof Sequence
   *
   */
  createdTime: number;
  /**
   *
   * @type {number}
   * @memberof Sequence
   *
   */
  lastUpdatedTime: number;
  /**
   * @type {string}
   * @memberof Sequence
   *
   */
  name?: string;
  /**
   * @type {string}
   * @memberof Sequence
   *
   */
  description?: string;
  /**
   *
   * @type {number}
   * @memberof Sequence
   *
   */
  assetId: number;
  /**
   *
   * @type {string}
   * @memberof Sequence
   *
   */
  externalId?: string;
  /**
   * Custom, application specific metadata. String key -> String value.
   * @type {{ [key: string]: string; }}
   * @memberof Sequence
   *
   */
  metadata?: { [key: string]: string };
  /**
   *
   * @type {number}
   * @memberof Sequence
   *
   */
  dataSetId: number;
}

export interface SequenceDataRequest {
  /**
   * @type {number}
   * @memberof SequenceDataRequest
   *
   */
  id: number;
  /**
   * @type {number}
   * @memberof SequenceDataRequest
   *
   */
  start?: number;
  /**
   * @type {number}
   * @memberof SequenceDataRequest
   *
   */
  end?: number;
  /**
   * @type {number}
   * @memberof SequenceDataRequest
   *
   */
  limit?: number;
  /**
   * @type {number}
   * @memberof SequenceDataRequest
   *
   */
  cursor?: string;
  /**
   * @type {string[]}
   * @memberof SequenceDataRequest
   *
   */
  columns?: string[];
}

export interface SequenceRow {
  /**
   * @type {number}
   * @memberof SequenceRow
   */
  rowNumber: number;
  /**
   * @type {any[]}
   * @memberof SequenceRow
   */
  values: any[];
}

export interface SequenceData {
  /**
   * @type {number}
   * @memberof SequenceData
   */
  id: number;
  /**
   * @type {string[]}
   * @memberof SequenceData
   */
  columns: string[];
  /**
   * @type {SequenceRow[]}
   * @memberof SequenceData
   */
  rows: SequenceRow[];
  /**
   * @type {string}
   * @memberof SequenceData
   */
  externalId?: string;
  /**
   * @type {number}
   * @memberof SequenceData
   */
  nextCursor?: string;
}
