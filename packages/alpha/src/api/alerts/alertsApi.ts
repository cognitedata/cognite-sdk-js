import { BaseResourceAPI, CDFHttpClient, MetadataMap } from '@cognite/sdk-core';
import { IdEither } from '@cognite/sdk';
import { Alert, AlertCreate, AlertFilter } from '../../types';

export class AlertsAPI extends BaseResourceAPI<Alert> {

  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);
  }

  public create = async (items: AlertCreate[]) => {
    return this.createEndpoint(items);
  };

  public list = async (filter?: AlertFilter) => {
    return this.listEndpoint<AlertFilter>(this.callListEndpointWithPost, filter);
  };

  public close = async (items: IdEither[]) => {
    const res = await this.post<{}>(this.url('close'), {
      data: {
        items
      }
    })
    return this.addToMapAndReturn(res.data, res)
  };
}
