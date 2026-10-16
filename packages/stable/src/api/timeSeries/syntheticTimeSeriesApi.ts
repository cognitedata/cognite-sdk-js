// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type { DatapointInfo } from '../../types/common';
import type { SyntheticQuery, SyntheticQueryResponse } from './types';

/**
 * @deprecated Data point operation that stays available; it may move to another namespace in a future major release. See https://github.com/cognitedata/cognite-sdk-js/blob/master/guides/DEPRECATIONS.md.
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
   * @deprecated Data point operation that stays available; it may move to another namespace in a future major release.
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
