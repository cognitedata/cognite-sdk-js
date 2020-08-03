// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import {
  SyntheticQuery,
  SyntheticQueryResponse,
  DatapointInfo,
} from '../../types';

export class SyntheticTimeSeriesAPI extends BaseResourceAPI<
  SyntheticQueryResponse
> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps<DatapointInfo>(
      ['items', 'datapoints'],
      ['timestamp']
    );
  }

  public query = (
    items: SyntheticQuery[]
  ): Promise<SyntheticQueryResponse[]> => {
    return this.querySyntheticEndpoint(items);
  };

  private async querySyntheticEndpoint(items: SyntheticQuery[]) {
    const path = this.url('query');
    return this.callEndpointWithMergeAndTransform(items, data =>
      this.postInParallelWithAutomaticChunking({
        path,
        items: data,
        chunkSize: 10,
      })
    );
  }
}
