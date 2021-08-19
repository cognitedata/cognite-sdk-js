import { BaseResourceAPI, CDFHttpClient, MetadataMap } from '@cognite/sdk-core';
import { IdEither, ItemsResponse } from '@cognite/sdk';
import { Function, FunctionCreate, FunctionFilter } from '../../types';
import { FunctionCallsApi } from './functionCallsApi';
import { FunctionSchedules } from './functionSchedulesApi';

export class FunctionsAPI extends BaseResourceAPI<Function> {
  private readonly functionCallsApi: FunctionCallsApi;
  private readonly functionSchedulesApi: FunctionSchedules;

  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);

    const [baseUrl, httpClient, map] = args;
    this.functionCallsApi = new FunctionCallsApi(baseUrl, httpClient, map);
    this.functionSchedulesApi = new FunctionSchedules(
      baseUrl + '/schedules',
      httpClient,
      map
    );
  }

  public get calls() {
    return this.functionCallsApi;
  }

  public get schedules() {
    return this.functionSchedulesApi;
  }

  public create = (items: FunctionCreate[]) => this.createEndpoint(items);

  public list = async (filter?: FunctionFilter, limit?: number) => {
    const response = await this.post<ItemsResponse<Function>>(
      this.listPostUrl,
      {
        data: { filter, limit },
      }
    );
    return response.data;
  };

  public retrieve = (ids: IdEither[]) => this.retrieveEndpoint(ids);

  public delete = async (ids: IdEither[]) => {
    return this.deleteEndpoint(ids);
  };
}
