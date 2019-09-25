// Copyright 2019 Cognite AS

import { BaseResourceAPI } from '../baseResourceApi';
import {
  SequenceRowsInsert, SequenceRetrieveRows, SequenceRowsResponse, CursorResponse, SequenceRow,
} from '../../types/types';
import { HttpResponse } from '../../utils/http/basicHttpClient';

export class SequenceRowsAPI extends BaseResourceAPI<any> {
  public async insert(
    items: SequenceRowsInsert[]
  ): Promise<{}> {
    await this.postInParallelWithAutomaticChunking({ 
      path: this.url(),
      items,
      chunkSize: 10000
    });
    return {};
  }

  public retrieve(
    query: SequenceRetrieveRows
  )  {
    const path = this.listPostUrl;
    return super.listEndpoint(
      async params =>
        this.httpClient.post<SequenceRowsResponse>(path, {
          data: params,
        }).then(response => {
          console.log(response)
          const { rows, nextCursor } = response.data;
          const transformedResponse: HttpResponse<CursorResponse<SequenceRow[]>> = { 
            ...response,
            data: {
              items: rows,
              nextCursor
            }
          };
          return transformedResponse;
        }),
      query
    );
  }

  // public async retrieve(
  //   databaseName: string,
  //   tableName: string,
  //   rowKey: string
  // ): Promise<RawDBRow> {
  //   const path = `${this.encodeUrl(
  //     databaseName,
  //     tableName
  //   )}/rows/${encodeURIComponent(rowKey)}`;
  //   const response = await this.httpClient.get<RawDBRow>(path);
  //   return this.addToMapAndReturn(response.data, response);
  // }

  // public async delete(
  //   databaseName: string,
  //   tableName: string,
  //   items: RawDBRowKey[]
  // ) {
  //   const path = `${this.encodeUrl(databaseName, tableName)}/rows/delete`;
  //   await this.postInParallelWithAutomaticChunking(path, items);
  //   return {};
  // }

  // private encodeUrl(databaseName: string, tableName: string) {
  //   return this.url(
  //     `${encodeURIComponent(databaseName)}/tables/${encodeURIComponent(
  //       tableName
  //     )}`
  //   );
  // }
}
