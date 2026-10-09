// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
  type HttpResponse,
} from '@cognite/sdk-core';
import type {
  CursorResponse,
  SequenceRow,
  SequenceRowsDelete,
  SequenceRowsInsert,
  SequenceRowsResponseData,
  SequenceRowsRetrieve,
} from '../../types';

/**
 * @deprecated Asset-centric API, to be retired end of 2027. Will move to `client.legacy.sequences` in the next major release. See https://github.com/cognitedata/cognite-sdk-js/blob/master/guides/DEPRECATIONS.md for details.
 */
export class SequenceRowsAPI extends BaseResourceAPI<SequenceRow> {
  /**
   * @deprecated Asset-centric API, to be retired end of 2027. Will move to `client.legacy.sequences` in the next major release.
   */
  public async insert(items: SequenceRowsInsert[]): Promise<object> {
    await this.postInParallelWithAutomaticChunking({
      path: this.url(),
      items,
      chunkSize: 10000,
    });
    return {};
  }

  /**
   * @deprecated Asset-centric API, to be retired end of 2027. Will move to `client.legacy.sequences` in the next major release.
   */
  public retrieve(
    query: SequenceRowsRetrieve
  ): CursorAndAsyncIterator<SequenceRow> {
    return super.listEndpoint(
      (data) =>
        this.post<SequenceRowsResponseData>(this.listPostUrl, { data }).then(
          this.transformRetrieveResponse
        ),
      query
    );
  }

  /**
   * @deprecated Asset-centric API, to be retired end of 2027. Will move to `client.legacy.sequences` in the next major release.
   */
  public delete(items: SequenceRowsDelete[]): Promise<object> {
    return this.deleteEndpoint(items);
  }

  private transformRetrieveResponse(
    response: HttpResponse<SequenceRowsResponseData>
  ): HttpResponse<CursorResponse<SequenceRow[]>> {
    const { rows, nextCursor, columns } = response.data;

    const items = rows.map(({ rowNumber, values }) => {
      return {
        columns,
        rowNumber,
        values,
      };
    });

    return {
      ...response,
      data: {
        items,
        nextCursor,
      },
    };
  }
}
