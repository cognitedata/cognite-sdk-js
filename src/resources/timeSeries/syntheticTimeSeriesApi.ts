// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '../../resources/baseResourceApi';
import { SyntheticQuery, SyntheticQueryResponse } from '../../types/types';

export class SyntheticTimeSeriesAPI extends BaseResourceAPI<
  SyntheticQueryResponse
> {
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
