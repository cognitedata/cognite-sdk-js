import { CDFHttpClient } from '@cognite/sdk-core';
import { Well } from '../model/Well';

export class WellsAPI {
  private client?: CDFHttpClient;

  public set setHttpClient(httpClient: CDFHttpClient) {
    this.client = httpClient;
  }

  /* eslint-disable */
  public list = async (): Promise<Well[] | undefined> => {
    const response = await this.client?.post<Well[]>("/wells")
    return response?.data
  };

}
