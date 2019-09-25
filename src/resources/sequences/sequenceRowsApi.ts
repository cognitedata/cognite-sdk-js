// Copyright 2019 Cognite AS

import {
  SequenceRowsDelete,
  SequenceRowsInsert,
  SequenceRowsResponse,
  SequenceRowsRetrieve,
} from '../../types/types';
import { BaseResourceAPI } from '../baseResourceApi';

export class SequenceRowsAPI extends BaseResourceAPI<any> {
  public async insert(items: SequenceRowsInsert[]): Promise<{}> {
    await this.postInParallelWithAutomaticChunking({
      path: this.url(),
      items,
      chunkSize: 10000,
    });
    return {};
  }

  public retrieve(query: SequenceRowsRetrieve) {
    const path = this.listPostUrl;
    return super.listEndpoint(
      async params =>
        this.httpClient
          .post<SequenceRowsResponse>(path, {
            data: params,
          })
          .then(response => {
            const { rows, nextCursor } = response.data;
            return {
              ...response,
              data: {
                items: rows,
                nextCursor,
              },
            };
          }),
      query
    );
  }

  public delete(items: SequenceRowsDelete[]) {
    return this.deleteEndpoint(items);
  }
}
