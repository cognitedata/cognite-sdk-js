import { accessApi, HttpError } from '@cognite/sdk-core';
import { Well, WellItems } from '../model/Well';
import { Wellbore } from '../model/Wellbore';
import { WellboresAPI } from '../api/wellboresApi';
import {
  WellFilter,
  WellFilterAPI,
  PolygonFilterAPI,
} from '../model/WellFilter';
import { stringify as convertGeoJsonToWKT } from 'wkt';
import { ConfigureAPI } from '../baseWellsClient';
import { Asset } from '@cognite/sdk';

export class WellsAPI extends ConfigureAPI {
  private _wellboresSDK?: WellboresAPI;

  public set wellboresSDK(sdk: WellboresAPI) {
    this._wellboresSDK = sdk;
  }

  private get wellbores(): WellboresAPI {
    return accessApi(this._wellboresSDK);
  }

  private convertToWkt(filter: WellFilter): WellFilterAPI {
    filter.polygon!.wktGeometry = convertGeoJsonToWKT(
      filter.polygon!.geoJsonGeometry!
    );
    return this.convertToApiWellFilter(filter);
  }

  private convertToApiWellFilter(filter: WellFilter): WellFilterAPI {
    let polygon: PolygonFilterAPI | undefined = undefined;
    if (filter.polygon) {
      polygon = {
        geometry: filter.polygon.wktGeometry!,
        crs: filter.polygon.crs,
        geometryType: 'wkt',
      };
    }
    return {
      wellTypes: filter.wellTypes,
      stringMatching: filter.stringMatching,
      quadrants: filter.quadrants,
      blocks: filter.blocks,
      fields: filter.fields,
      operators: filter.operators,
      sources: filter.sources,
      hasTrajectory: filter.hasTrajectory,
      hasMeasurements: filter.hasMeasurements,
      polygon: polygon,
      licenses: filter.licenses,
      waterDepth: filter.waterDepth,
      spudDate: filter.spudDate,
    };
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
      wellType: well.wellType,
      license: well.license,
      waterDepth: well.waterDepth,
      wellhead: well.wellhead,
      datum: well.datum,
      sources: well.sources,
      wellbores: async (): Promise<Wellbore[]> => {
        return await this.wellbores.getFromWell(well.id);
      },
      sourceAssets: async (source?: string): Promise<Asset[]> =>
        await this.getSources(well.id, source),
    };
  };

  private getSources = async (
    wellId: number,
    source?: string
  ): Promise<Asset[]> => {
    let basePath = `/wells/${wellId}/sources`;
    if (source !== undefined) {
      basePath += '/' + source;
    }

    const path: string = this.getPath(basePath);
    return await this.client
      .asyncGet<Asset[]>(path)
      .then(response => response.data)
      .catch(err => {
        throw new HttpError(err.status, err.errorMessage, {});
      });
  };

  private addLazyToAllWellItems = (wellItems: WellItems): WellItems => {
    return <WellItems>{
      items: wellItems.items.map(well => this.addLazyMethodsForWell(well)),
      nextCursor: wellItems.nextCursor,
    };
  };

  public getLabelPrefix = async (prefix: String): Promise<String[]> => {
    const path: string = this.getPath(`/wells/${prefix}`);

    return await this.client
      .asyncGet<String[]>(path)
      .then(response => response.data)
      .catch(err => {
        throw new HttpError(err.status, err.data.error.message, {});
      });
  };

  public blocks = async (): Promise<String[]> => this.getLabelPrefix('blocks');
  public fields = async (): Promise<String[]> => this.getLabelPrefix('fields');
  public operators = async (): Promise<String[]> =>
    this.getLabelPrefix('operators');
  public quadrants = async (): Promise<String[]> =>
    this.getLabelPrefix('quadrants');
  public sources = async (): Promise<String[]> =>
    this.getLabelPrefix('sources');
  public measurements = async (): Promise<String[]> =>
    this.getLabelPrefix('measurements');

  public list = async (cursor?: string, limit?: number): Promise<WellItems> => {
    const path: string = this.getPath('/wells', cursor, limit);
    return await this.client
      .asyncGet<WellItems>(path)
      .then(response => this.addLazyToAllWellItems(response.data))
      .catch(err => {
        throw new HttpError(err.status, err.data.error.message, {});
      });
  };

  private sendFilterRequest = async (
    filter: WellFilterAPI,
    cursor?: string,
    limit?: number
  ): Promise<WellItems> => {
    const path = this.getPath('/wells/list', cursor, limit);
    return await this.client
      .asyncPost<WellItems>(path, { data: filter })
      .then(response => this.addLazyToAllWellItems(response.data))
      .catch(err => {
        throw new HttpError(err.status, err.data.error.message, {});
      });
  };

  private wrapFilter = (userFilter: WellFilter): WellFilterAPI => {
    let filter: WellFilterAPI;
    if (userFilter.polygon && userFilter.polygon.geoJsonGeometry) {
      filter = this.convertToWkt(userFilter);
    } else if (userFilter.polygon && userFilter.polygon.wktGeometry) {
      filter = this.convertToApiWellFilter(userFilter);
    } else {
      userFilter.polygon = undefined;
      filter = this.convertToApiWellFilter(userFilter);
    }
    return filter;
  };

  public filterSlow = async (userFilter: WellFilter): Promise<Well[]> => {
    let wells: Well[] = [];
    let cursor = undefined;
    const filter: WellFilterAPI = this.wrapFilter(userFilter);
    do {
      const wellsChunk: WellItems = await this.sendFilterRequest(
        filter,
        cursor
      );
      if (wellsChunk == undefined) {
        break;
      }

      wells = wells.concat(wellsChunk.items);

      // update cursor and go again
      cursor = wellsChunk.nextCursor;
    } while (cursor != undefined);
    return wells;
  };

  public filter = async (
    userFilter: WellFilter,
    cursor?: string,
    limit?: number
  ): Promise<WellItems> => {
    const filter: WellFilterAPI = this.wrapFilter(userFilter);
    return await this.sendFilterRequest(filter, cursor, limit);
  };

  public getById = async (id: number): Promise<Well> => {
    const path: string = this.getPath(`/wells/${id}`);
    return await this.client
      .asyncGet<Well>(path)
      .then(response => this.addLazyMethodsForWell(response.data))
      .catch(err => {
        throw new HttpError(err.status, err.data.error.message, {});
      });
  };
}
