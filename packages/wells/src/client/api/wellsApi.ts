import { CDFHttpClient } from '@cognite/sdk-core';
import { Well } from '../model/Well';
import { WellFilter } from '../model/WellFilter';

export class WellsAPI {
  private client?: CDFHttpClient;
  private project?: String;

  public set setHttpClient(httpClient: CDFHttpClient) {
    this.client = httpClient;
  }

  /* eslint-disable */
  public list = async (): Promise<Well[] | undefined> => {
    const path: string = `/${this.project}/wells`
    let wells: Well[] | undefined;
    await this.client?.get<Well[]>(path)
      .then(response => {
        if (response.status == 200){
          wells = response.data;
        } else {
          wells = undefined;
        }})

    return wells;
    };

  public filter = async (filter: WellFilter): Promise<Well[] | undefined> => {
    const path: string = `/${this.project}/wells/list`
    let wells: Well[] | undefined;
    await this.client?.post<Well[]>(path, {'data': filter})
      .then(response => {
        if (response.status == 200){
          wells = response.data;
        } else {
          wells = undefined;
        }})

    return wells;
  };

  public getId = async (id: number): Promise<Well | undefined> => {
    const path: string = `/${this.project}/wells/${id}`
    let well: Well | undefined;
    await this.client?.get<Well>(path)
      .then(response => {
        if (response.status == 200){
          well = response.data;
        } else {
          well = undefined;
        }})

    return well;
  };
};
