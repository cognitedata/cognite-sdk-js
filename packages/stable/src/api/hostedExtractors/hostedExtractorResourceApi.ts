// Copyright 2026 Cognite AS

import {
  BaseResourceAPI,
  type ExternalId,
  type ItemsWrapper,
  promiseAllWithData,
} from '@cognite/sdk-core';
import type { IgnoreUnknownIds } from '../../types';
import type { HostedExtractorDeleteParams } from './commonTypes';

const WRITE_CHUNK_SIZE = 10;
const READ_CHUNK_SIZE = 100;

/**
 * Shared behaviour of the hosted extractor sub-APIs: they identify items by
 * external ID, use `byIds` (not `byids`), and accept at most 10 items per
 * create or update request and 100 per retrieve or delete request.
 */
export abstract class HostedExtractorResourceAPI<
  ResponseType,
> extends BaseResourceAPI<ResponseType> {
  protected get byIdsUrl() {
    return this.url('byIds');
  }

  protected createInChunks<RequestType>(items: RequestType[]) {
    return this.callEndpointWithMergeAndTransform(items, (data) =>
      promiseAllWithData(
        BaseResourceAPI.chunk(data, WRITE_CHUNK_SIZE),
        (chunk) =>
          this.post<ItemsWrapper<ResponseType[]>>(this.url(), {
            data: { items: chunk },
          }),
        true
      )
    );
  }

  protected updateInChunks<ChangeType>(changes: ChangeType[]) {
    return this.callEndpointWithMergeAndTransform(changes, (data) =>
      this.postInParallelWithAutomaticChunking({
        path: this.updateUrl,
        items: data,
        chunkSize: WRITE_CHUNK_SIZE,
      })
    );
  }

  protected retrieveInChunks(ids: ExternalId[], params: IgnoreUnknownIds = {}) {
    return this.callEndpointWithMergeAndTransform(ids, (data) =>
      this.postInParallelWithAutomaticChunking({
        path: this.byIdsUrl,
        items: data,
        params,
        chunkSize: READ_CHUNK_SIZE,
      })
    );
  }

  protected async deleteInChunks(
    ids: ExternalId[],
    params: HostedExtractorDeleteParams = {}
  ) {
    const responses = await this.postInParallelWithAutomaticChunking({
      path: this.deleteUrl,
      items: ids,
      params,
      chunkSize: READ_CHUNK_SIZE,
    });
    return this.addToMapAndReturn({}, responses[0]);
  }
}
