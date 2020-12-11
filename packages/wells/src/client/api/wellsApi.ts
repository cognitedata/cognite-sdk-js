import { CDFHttpClient, HttpError } from '@cognite/sdk-core';
import { Well, WellItems } from '../model/Well';
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

  public getLabelPrefix = async (prefix: String): Promise<String[] | undefined> => {
    if (this.project == undefined){
      throw new HttpError(400, "The client project has not been set.", {})
    }
    const path: string = `/${this.project}/wells/${prefix}`
    // eslint-disable-next-line
    return await this.client?.get<String[]>(path)
      .then(response => response.data)
      .catch(err => {
        throw new HttpError(err.status, err.errorMessage, {})
    });
  };

  public blocks = async (): Promise<String[] | undefined> => this.getLabelPrefix('blocks');
  public fields = async (): Promise<String[] | undefined> => this.getLabelPrefix('fields');
  public operators = async (): Promise<String[] | undefined> => this.getLabelPrefix('operators');
  public quadrants = async (): Promise<String[] | undefined> => this.getLabelPrefix('quadrants');
  public sources = async (): Promise<String[] | undefined> => this.getLabelPrefix('sources');

  public list = async (cursor?: String): Promise<WellItems | undefined> => {
    if (this.project == undefined){
      throw new HttpError(400, "The client project has not been set.", {})
    }
    let path: string = `/${this.project}/wells`
    if (cursor) {
      path += `?cursor=${cursor}`
    }
    return await this.client?.get<WellItems>(path)
      .then(response => response.data)
      .catch(err => {
        throw new HttpError(err.status, err.errorMessage, {})
    });
  };

  public filter = async (filter: WellFilter, cursor?: String): Promise<WellItems | undefined> => {
    if (this.project == undefined){
      throw new HttpError(400, "The client project has not been set.", {})
    }
    let path: string = `/${this.project}/wells/list`
    if (cursor) {
      path += `?cursor=${cursor}`
    }
    return await this.client?.post<WellItems>(path, {'data': filter})
      .then(response => response.data)
      .catch(err => {
        throw new HttpError(err.status, err.errorMessage, {})
    });
  };

  public getId = async (id: number): Promise<Well | undefined> => {
    if (this.project == undefined){
      throw new HttpError(400, "The client project has not been set.", {})
    }
    const path: string = `/${this.project}/wells/${id}`
    return await this.client?.get<Well>(path)
      .then(response => response.data)
      .catch(err => {
        throw new HttpError(err.status, err.errorMessage, {})
    });
  };
};
