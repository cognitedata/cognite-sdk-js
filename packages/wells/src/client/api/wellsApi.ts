import { BasicHttpClient, HttpError } from '@cognite/sdk-core';
import { Well, WellItems } from '../model/Well';
import { WellFilter, WellFilterAPI, PolygonFilterAPI } from '../model/WellFilter';
import { stringify as convertGeoJsonToWKT } from 'wkt';
import { Cluster } from '../model/Cluster'

export class WellsAPI {
  private client?: BasicHttpClient;
  private project?: String;
  private cluster?: Cluster;

  public set setHttpClient(httpClient: BasicHttpClient) {
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

  private convertToWkt(filter: WellFilter): WellFilterAPI {
    filter.polygon!.wktGeometry = convertGeoJsonToWKT(filter.polygon!.geoJsonGeometry!)
    return this.convertToApiWellFilter(filter)
  }

  private convertToApiWellFilter(filter: WellFilter): WellFilterAPI {
    let polygon: PolygonFilterAPI | undefined = undefined;
    if (filter.polygon) {
      polygon = {
        geometry: filter.polygon.wktGeometry!, crs: filter.polygon.crs, geometryType: "wkt"
      }
    }
    return {
      wellType: filter.wellType,
      quadrants: filter.quadrants,
      blocks: filter.blocks,
      fields: filter.fields,
      operators: filter.operators,
      sources: filter.sources,
      hasTrajectory: filter.hasTrajectory,
      hasMeasurements: filter.hasMeasurements,
      polygon: polygon,
    }
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

  public filter = async (userFilter: WellFilter, cursor?: String):     Promise<WellItems | undefined> => {
    let filter: WellFilterAPI;
    if (userFilter.polygon && userFilter.polygon.geoJsonGeometry) {
      filter = this.convertToWkt(userFilter)
    } else if (userFilter.polygon && userFilter.polygon.wktGeometry) {
      filter = this.convertToApiWellFilter(userFilter)
    } else {
      userFilter.polygon = undefined;
      filter = this.convertToApiWellFilter(userFilter);
    }
    const path = this.getPath('/wells/list', cursor)
    return await this.client?.post<WellItems>(path, {'data': filter})
      .then(response => response.data)
      .catch(err => {
        throw new HttpError(err.status, err.errorMessage, {})
    });
  };

  public getById = async (id: number): Promise<Well | undefined> => {
    const path: string = this.getPath(`/wells/${id}`)
    return await this.client?.get<Well>(path)
      .then(response => response.data)
      .catch(err => {
        throw new HttpError(err.status, err.errorMessage, {})
    });
  };
};
