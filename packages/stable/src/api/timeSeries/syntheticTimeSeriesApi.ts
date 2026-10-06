// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type { DatapointInfo } from '../../types/common';
import type { SyntheticQuery, SyntheticQueryResponse } from './types';

/**
 * @deprecated Asset-centric API, to be retired end of 2027. Will move to `client.legacy` in the next major release. See https://docs.cognite.com/cdf/deprecated#deprecated-and-retired-features for more details.
 */
export class SyntheticTimeSeriesAPI extends BaseResourceAPI<SyntheticQueryResponse> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps<DatapointInfo>(
      ['items', 'datapoints'],
      ['timestamp']
    );
  }

  /**
   * @deprecated Asset-centric API, to be retired end of 2027. Will move to `client.legacy` in the next major release.
   */
  public query = (
    items: SyntheticQuery[]
  ): Promise<SyntheticQueryResponse[]> => {
    return this.querySyntheticEndpoint(items);
  };

  private async querySyntheticEndpoint(items: SyntheticQuery[]) {
    const path = this.url('query');
    return this.callEndpointWithMergeAndTransform(items, (data) =>
      this.postInParallelWithAutomaticChunking({
        path,
        items: data,
        chunkSize: 10,
      })
    );
  }
}
