// Copyright 2019 Cognite AS

import { SequenceColumnBasicInfo, SequenceItem } from '../../types/types';

/**
 * A list of sequence row values with row number and columns information
 */
export class SequenceRow extends Array<SequenceItem> implements SequenceRow {
  constructor(
    public rowNumber: number,
    values: SequenceItem[],
    public columns: SequenceColumnBasicInfo[]
  ) {
    super(...values);
  }
}
