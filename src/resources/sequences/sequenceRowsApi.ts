// Copyright 2019 Cognite AS

import { CursorAndAsyncIterator } from '../../standardMethods';
import {
  CursorResponse,
  SequenceRowsDelete,
  SequenceRowsInsert,
  SequenceRowsResponseData,
  SequenceRowsRetrieve,
} from '../../types/types';
import { HttpResponse } from '../../utils/http/basicHttpClient';
import { BaseResourceAPI } from '../baseResourceApi';
import { SequenceRow } from '../classes/sequenceRow';

export class SequenceRowsAPI extends BaseResourceAPI<
  SequenceRowsResponseData,
  SequenceRow
> {
  public async insert(items: SequenceRowsInsert[]): Promise<{}> {
    await this.postInParallelWithAutomaticChunking({
      path: this.url(),
      items,
      chunkSize: 10000,
    });
    return {};
  }

  public retrieve(
    query: SequenceRowsRetrieve
  ): CursorAndAsyncIterator<SequenceRow> {
    return super.listEndpoint(
      data =>
        this.httpClient
          .post<SequenceRowsResponseData>(this.listPostUrl, { data })
          .then(this.transformRetrieveResponse),
      query
    );
  }

  public delete(items: SequenceRowsDelete[]): Promise<{}> {
    return this.deleteEndpoint(items);
  }

  private transformRetrieveResponse(
    response: HttpResponse<SequenceRowsResponseData>
  ): HttpResponse<CursorResponse<SequenceRow[]>> {
    const { rows, nextCursor, columns } = response.data;
    const items = rows.map(
      ({ rowNumber, values }) => new SequenceRow(rowNumber, values, columns)
    );
    return {
      ...response,
      data: {
        items,
        nextCursor,
      },
    };
  }
}
