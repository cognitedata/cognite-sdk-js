import { accessApi, HttpError } from '@cognite/sdk-core';
import { Well, WellItems } from '../model/Well';
import { Wellbore } from '../model/Wellbore';
import { WellboresAPI } from '../api/wellboresApi'
import { WellFilter, WellFilterAPI, PolygonFilterAPI } from '../model/WellFilter';
import { stringify as convertGeoJsonToWKT } from 'wkt';
import { Cluster } from '../model/Cluster'
import HttpClientWithIntercept from '../httpClientWithIntercept';

export class WellsAPI {
  private client?: HttpClientWithIntercept;
  private project?: String;
  private cluster?: Cluster;
  private _wellboresSDK?: WellboresAPI;


  public set wellboresSDK(sdk: WellboresAPI) {
    this._wellboresSDK = sdk;
  }

  private get wellbores(): WellboresAPI {
    return accessApi(this._wellboresSDK);
  }

  public set setHttpClient(httpClient: HttpClientWithIntercept) {
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
      stringMatching: filter.stringMatching,
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

  private addLazyMethodsForWell = (well: Well): Well => {
    return <Well>{
      id: well.id,
      name: well.name,
      externalId: well.externalId,
      description: well.description,
      country: well.country,
      quadrant: well.quadrant,
      block: well.block,
      field: well.field,
      operator: well.operator,
      waterDepth: well.waterDepth,
      wellHead: well.wellHead,
      datum: well.datum,
      sources: well.sources,
      wellbores: async (): Promise<Wellbore[] | undefined>  => {return await this.wellbores.getFromWell(well.id).then(response => response).catch(err => err)}
    };
  }

  private addLazyToAllWellItems = (wellItems: WellItems): WellItems => {
    return <WellItems> {
      items: wellItems.items.map(well => this.addLazyMethodsForWell(well)),
      cursor: wellItems.cursor
    }
  }


  public getLabelPrefix = async (prefix: String): Promise<String[] | undefined> => {
    const path: string = this.getPath(`/wells/${prefix}`)
    // eslint-disable-next-line
    return await this.client?.asyncGet<String[]>(path)
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
  public measurements = async (): Promise<String[] | undefined> => this.getLabelPrefix('measurements');

  public list = async (cursor?: String): Promise<WellItems | undefined> => {
    const path: string = this.getPath('/wells', cursor)
    return await this.client?.asyncGet<WellItems>(path)
      .then(response => this.addLazyToAllWellItems(response.data))
      .catch(err => {
        throw new HttpError(err.status, err.errorMessage, {})
    });
  };

  public filter = async (userFilter: WellFilter, cursor?: String): Promise<WellItems | undefined> => {
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
    return await this.client?.asyncPost<WellItems>(path, {'data': filter})
      .then(response => this.addLazyToAllWellItems(response.data))
      .catch(err => {
        throw new HttpError(err.status, err.errorMessage, {})
    });
  };

  public getById = async (id: number): Promise<Well | undefined> => {
    const path: string = this.getPath(`/wells/${id}`)
    return await this.client?.asyncGet<Well>(path)
      .then(response => this.addLazyMethodsForWell(response.data))
      .catch(err => {
        throw new HttpError(err.status, err.errorMessage, {})
    });
  };
};
