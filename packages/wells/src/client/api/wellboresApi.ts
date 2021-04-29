import { accessApi, HttpError} from '@cognite/sdk-core';
import { Measurement, Measurements } from '../model/Measurement';
import { MeasurementType } from '../model/MeasurementType';
import { Survey, SurveyData } from '../model/Survey';
import { Wellbore } from '../model/Wellbore';
import { SurveysAPI } from './surveysApi';
import { WellIds } from '../model/WellIds';
import { Sequence, SequenceData, SequenceDataRequest } from '../model/Sequence';
import { ConfigureAPI } from '../baseWellsClient';
import { Asset } from '@cognite/sdk';

export class WellboresAPI extends ConfigureAPI {
  private _surveysSDK?: SurveysAPI;

  public set surveysSdk(sdk: SurveysAPI) {
    this._surveysSDK = sdk;
  }

  private get surveys(): SurveysAPI {
    return accessApi(this._surveysSDK);
  }

  private addLazyMethodsForWellbore = (wellbore: Wellbore): Wellbore => {
    return <Wellbore>{
      id: wellbore.id,
      name: wellbore.name,
      externalId: wellbore.externalId,
      wellId: wellbore.wellId,
      trajectory: async (): Promise<Survey | undefined> => { return await this.surveys.getTrajectory(wellbore.id).then(response => response).catch(err => err) },
      casings: async (): Promise<Sequence[] | undefined>  => {return await this.getCasings(wellbore.id).then(response => response).catch(err => err)},
      sourceAssets: async (source?:string): Promise<Asset[] | undefined>  => await this.getSources(wellbore.id, source)
    };
  }

  private getSources = async (wellboreId: number, source?: string): Promise<Asset[] | undefined> => {
    let basePath = `/wellbores/${wellboreId}/sources`
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


  private addLazyMethodsForMeasurement = (measurement: Measurement): Measurement => {
    return <Measurement>{
      id: measurement.id,
      externalId: measurement.externalId,
      name: measurement.name,
      data: async (): Promise<SurveyData | undefined>  => {return await this.surveys.getData({id: measurement.id}).then(response => response).catch(err => err)}
    };
  }

  
  private addLazyMethodsForCasing = (casing: Sequence): Sequence => {
    return <Sequence>{
      id: casing.id,
      columns: casing.columns,
      createdTime: casing.createdTime,
      lastUpdatedTime: casing.lastUpdatedTime,
      name: casing.name,
      description: casing.description,
      assetId: casing.assetId,
      externalId: casing.externalId,
      metadata: casing.metadata,
      dataSetId: casing.dataSetId,
      data: async (
        start?: number,
        end?: number,
        columns?: string[],
        cursor?: string,
        limit?: number
      ): Promise<SequenceData | undefined> => {
        return await this.getCasingsData(casing.id, start, end, columns, cursor, limit).then(response => response).catch(err => err)
      }
    };
  }

  /* eslint-disable */
  public getById = async (id: number): Promise<Wellbore | undefined> => {
    const path: string = this.getPath(`/wellbores/${id}`)
    return await this.client?.asyncGet<Wellbore>(path)
      .then(response => this.addLazyMethodsForWellbore(response.data))
      .catch(err => {
      throw new HttpError(err.status, err.errorMessage, {})
    });
  };

  public getFromWell = async (wellId: number): Promise<Wellbore[] | undefined> => {
    const path: string = this.getPath(`/wells/${wellId}/wellbores`)
    try {
      const wellboreData = await this.client?.asyncGet<Wellbore[]>(path)
      if (wellboreData) {
        return wellboreData.data.map((wellbore: Wellbore) => this.addLazyMethodsForWellbore(wellbore))
      } else {
        return undefined
      }
    } catch(err) {
      throw new HttpError(err.status, err.errorMessage, {})
    }
  }

  public getFromWells = async (wellIds: number[]): Promise<Wellbore[] | undefined> => {
    const path: string = this.getPath(`/wellbores/bywellids`)
    const wellIdsToSearch: WellIds = { items: wellIds }
    try {
      const wellboreData = await this.client?.asyncPost<Wellbore[]>(path, {'data': wellIdsToSearch})
      if (wellboreData) {
        return wellboreData.data.map((wellbore: Wellbore) => this.addLazyMethodsForWellbore(wellbore))
      } else {
        return undefined
      }
    } catch(err) {
      throw new HttpError(err.status, err.errorMessage, {})
    }
  }

  /* eslint-disable */
  public getTrajectory = async (wellboreId: number): Promise<Survey | undefined> => {

    const path: string = this.getPath(`/wellbores/${wellboreId}/trajectory`)
    
      return await this.client?.asyncGet<Survey>(path)
      .then(response => response.data)
      .catch(err => {
        throw new HttpError(err.status, err.errorMessage, {})
    });
  };

  public getMeasurement = async (wellboreId: number, measurementType: MeasurementType): Promise<Measurement[] | undefined> => {

    const path: string = this.getPath(`/wellbores/${wellboreId}/measurements/${measurementType}`)

    let measurements = await this.client?.asyncGet<Measurements>(path)
    .then(response => response.data)
    .catch(err => {
      throw new HttpError(err.status, err.errorMessage, {})
    })

    return measurements?.items.map((measurement: Measurement) => this.addLazyMethodsForMeasurement(measurement)) 
  }

  public getCasings = async (wellOrWellboreId: number): Promise<Sequence[] | undefined> => {
    const path: string = this.getPath(`/wells/${wellOrWellboreId}/casings`)

    try {
      const casings = await this.client?.asyncGet<Sequence[]>(path)
      if (casings) {
        return casings.data.map((casing: Sequence) => this.addLazyMethodsForCasing(casing))
      } else {
        return undefined
      }
    } catch(err) {
      throw new HttpError(err.status, err.errorMessage, {})
    } 
  }

  public getCasingsData = async (
    casingId: number,
    start?: number,
    end?: number,
    columns?: string[],
    cursor?: string,
    limit?: number
  ): Promise<SequenceData | undefined> => {
    const path: string = this.getPath(`/wells/casings/data`)

    const request: SequenceDataRequest = {
      id: casingId,
      start: start,
      end: end,
      columns: columns,
      cursor: cursor,
      limit: limit
    }

    return await this.client?.asyncPost<SequenceData>(path, {'data': request})
    .then(response => response.data)
    .catch(err => {
      throw new HttpError(err.status, err.errorMessage, {})
    })
  }
}
