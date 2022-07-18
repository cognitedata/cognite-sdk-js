// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  CursorAndAsyncIterator,
  HttpResponse,
} from '@cognite/sdk-core';
import {
  CursorResponse,
  SequenceRowsDelete,
  SequenceRowsInsert,
  SequenceRowsResponseData,
  SequenceRowsRetrieve,
  SequenceRow,
} from '../../types';

export class SequenceRowsAPI extends BaseResourceAPI<SequenceRow> {
  /**
   * [Insert rows](https://docs.cognite.com/api/v1/#operation/postSequenceData)
   *
   * ```js
   *
   * const rows = [
   *  { rowNumber: 0, values: [1, 2.2, 'three'] },
   *  { rowNumber: 1, values: [4, 5, 'six'] }
   * ];
   * await client.sequenceRowsAPI.insert([{ id: 123, rows, columns: ['one', 'two', 'three'] }]);
   * ```
   */
  public async insert(items: SequenceRowsInsert[]): Promise<{}> {
    await this.postInParallelWithAutomaticChunking({
      path: this.url(),
      items,
      chunkSize: 10000,
    });
    return {};
  }

  /**
   * [Retrieve rows](https://docs.cognite.com/api/v1/#operation/getSequenceData)
   *
   * ```js
   * const rows = await client.sequenceRowsAPI.retrieve({ externalId: 'sequence1' }).autoPagingToArray({ limit: 100 });
   * ```
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
   * [Delete rows](https://docs.cognite.com/api/v1/#operation/deleteSequenceData)
   *
   * ```js
   * await client.sequenceRowsAPI.delete([{ id: 32423849, rows: [1,2,3] }]);
   * ```
   */
  public delete(items: SequenceRowsDelete[]): Promise<{}> {
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
