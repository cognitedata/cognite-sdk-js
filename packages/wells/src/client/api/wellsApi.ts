import { CDFHttpClient, HttpError } from '@cognite/sdk-core';
import { Well } from '../model/Well';
import { WellFilter } from '../model/WellFilter';

export class WellsAPI {
  private client?: CDFHttpClient;
  private project?: String;

  public set setHttpClient(httpClient: CDFHttpClient) {
    this.client = httpClient;
  }

  public set setProject(project: String) {
    this.project = project;
  }

  /* eslint-disable */
  public list = async (): Promise<Well[] | undefined> => {
    const path: string = `/${this.project}/wells`
    return await this.client?.get<Well[]>(path)
      .then(response => response.data)
      .catch(err => {
        throw new HttpError(err.status, err.errorMessage, {})
    });
  };
  /* eslint-enable */

  public filter = async (filter: WellFilter): Promise<Well[] | undefined> => {
    const path: string = `/${this.project}/wells/list`
    return await this.client?.post<Well[]>(path, {'data': filter})
      .then(response => response.data)
      .catch(err => {
        throw new HttpError(err.status, err.errorMessage, {})
    });
  };

  public getId = async (id: number): Promise<Well | undefined> => {
    const path: string = `/${this.project}/wells/${id}`
    return await this.client?.get<Well>(path)
      .then(response => response.data)
      .catch(err => {
        throw new HttpError(err.status, err.errorMessage, {})
    });
  };
};
