import { accessApi, HttpError } from '@cognite/sdk-core';
import { Well, WellItems } from '../model/Well';
import { Wellbore } from '../model/Wellbore';
import { WellboresAPI } from '../api/wellboresApi'
import { WellFilter, WellFilterAPI, PolygonFilterAPI } from '../model/WellFilter';
import { stringify as convertGeoJsonToWKT } from 'wkt';
import { Asset } from 'wells/src/types';
import { ConfigureAPI } from '../baseWellsClient';

export class WellsAPI extends ConfigureAPI {
  private _wellboresSDK?: WellboresAPI;


  public set wellboresSDK(sdk: WellboresAPI) {
    this._wellboresSDK = sdk;
  }

  private get wellbores(): WellboresAPI {
    return accessApi(this._wellboresSDK);
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
      spudDate: well.spudDate != undefined ? new Date(well.spudDate) : null,
      waterDepth: well.waterDepth,
      wellhead: well.wellhead,
      datum: well.datum,
      sources: well.sources,
      wellbores: async (): Promise<Wellbore[] | undefined>  => {return await this.wellbores.getFromWell(well.id).then(response => response).catch(err => err)},
      sourceAssets: async (source?:string): Promise<Asset[] | undefined>  => await this.getSources(well.id, source)
    };
  }

  private getSources = async (wellId: number, source?: string): Promise<Asset[] | undefined> => {
    let basePath = `/wells/${wellId}/sources`
    if (source !== undefined) {
      basePath += "/" + source
    }

    const path: string = this.getPath(basePath);
    // eslint-disable-next-line
    return await this.client?.asyncGet<Asset[]>(path)
      .then(response => response.data)
      .catch(err => {
        throw new HttpError(err.status, err.errorMessage, {})
      })
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

  public list = async (cursor?: string): Promise<WellItems | undefined> => {
    const path: string = this.getPath('/wells', cursor)
    return await this.client?.asyncGet<WellItems>(path)
      .then(response => this.addLazyToAllWellItems(response.data))
      .catch(err => {
        throw new HttpError(err.status, err.errorMessage, {})
    });
  };

  private sendFilterRequest = async (filter: WellFilterAPI, cursor?: string): Promise<WellItems | undefined> => {
      const path = this.getPath('/wells/list', cursor)
      return await this.client?.asyncPost<WellItems>(path, {'data': filter})
        .then(response => 
          this.addLazyToAllWellItems(response.data)
        )
        .catch(err => {
          throw new HttpError(err.status, err.errorMessage, {})
        });
  }

  private wrapFilter = (userFilter: WellFilter): WellFilterAPI => {
    let filter: WellFilterAPI;
    if (userFilter.polygon && userFilter.polygon.geoJsonGeometry) {
      filter = this.convertToWkt(userFilter)
    } else if (userFilter.polygon && userFilter.polygon.wktGeometry) {
      filter = this.convertToApiWellFilter(userFilter)
    } else {
      userFilter.polygon = undefined;
      filter = this.convertToApiWellFilter(userFilter);
    }
    return filter
  }

  public filterSlow = async (userFilter: WellFilter): Promise<Well[] | undefined> => {
    let wells: Well[] = []
    let cursor = undefined
    const filter: WellFilterAPI = this.wrapFilter(userFilter);
      do {
        const wellsChunk: WellItems | undefined = await this.sendFilterRequest(filter, cursor);
        if (wellsChunk == undefined) {
          break
        }

        if (wellsChunk.items.length > 0) {
          wells = wells.concat(wellsChunk.items)
        }

        if (wellsChunk.cursor != undefined) {
          break
        }
        
        // update cursor and go again
        cursor = wellsChunk.cursor

      } while (cursor != undefined);
    return wells;
  }

  public filter = async (userFilter: WellFilter, cursor?: string): Promise<WellItems | undefined> => {
    const filter: WellFilterAPI = this.wrapFilter(userFilter);
    return await this.sendFilterRequest(filter, cursor)
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
