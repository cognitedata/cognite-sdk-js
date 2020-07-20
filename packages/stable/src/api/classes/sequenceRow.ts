// Copyright 2020 Cognite AS

import { SequenceColumnBasicInfo, SequenceItem } from '../../types';

/**
 * A list of sequence row values with row number and columns information
 */
export class SequenceRow extends Array<SequenceItem> {
  constructor(
    public rowNumber: number,
    values: SequenceItem[],
    public columns: SequenceColumnBasicInfo[]
  ) {
    super(...values);
  }
}
