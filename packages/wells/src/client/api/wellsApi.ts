import { CDFHttpClient, HttpError } from '@cognite/sdk-core';
import { Well, WellItems } from '../model/Well';
import { WellFilter } from '../model/WellFilter';
import { Cluster } from '../model/Cluster'

export class WellsAPI {
  private client?: CDFHttpClient;
  private project?: String;
  private cluster?: Cluster;

  public set setHttpClient(httpClient: CDFHttpClient) {
    this.client = httpClient;
  }

  public set setProject(project: String) {
    this.project = project;
  }

  public set setCluster(cluster: Cluster) {
    this.cluster = cluster;
  }

  private getPath(baseUrl: string, cursor?: String): string {
    if (this.project == undefined){
      throw new HttpError(400, "The client project has not been set.", {})
    }
    if (this.cluster == undefined){
      throw new HttpError(400, "No cluster has been set.", {})
    }
    
    baseUrl = `/${this.project}${baseUrl}?env=${this.cluster}`

    if (cursor) {
      baseUrl += `&cursor=${cursor}`

    }
    return baseUrl
  }

  public getLabelPrefix = async (prefix: String): Promise<String[] | undefined> => {
    const path: string = this.getPath(`/wells/${prefix}`)
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
    const path: string = this.getPath('/wells', cursor)
    return await this.client?.get<WellItems>(path)
      .then(response => response.data)
      .catch(err => {
        throw new HttpError(err.status, err.errorMessage, {})
    });
  };

  public filter = async (filter: WellFilter, cursor?: String): Promise<WellItems | undefined> => {
    const path = this.getPath('/wells/list', cursor)
    return await this.client?.post<WellItems>(path, {'data': filter})
      .then(response => response.data)
      .catch(err => {
        throw new HttpError(err.status, err.errorMessage, {})
    });
  };

  public getId = async (id: number): Promise<Well | undefined> => {
    const path: string = this.getPath(`/wells/${id}`)
    return await this.client?.get<Well>(path)
      .then(response => response.data)
      .catch(err => {
        throw new HttpError(err.status, err.errorMessage, {})
    });
  };
};
