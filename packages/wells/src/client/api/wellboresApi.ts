import { accessApi, HttpError} from '@cognite/sdk-core';
import { Measurement, Measurements } from '../model/Measurement';
import { MeasurementType } from '../model/MeasurementType';
import { Survey, SurveyData } from '../model/Survey';
import { Wellbore } from '../model/Wellbore';
import { SurveysAPI } from './surveysApi';
import HttpClientWithIntercept from '../httpClientWithIntercept';
import { WellIds } from '../model/WellIds';
import { Asset } from 'wells/src/types';
import { Sequence, SequenceData, SequenceDataRequest } from '../model/Sequence';

export class WellboresAPI {
  private client?: HttpClientWithIntercept;
  private project?: String;
  private cluster?: String;

  private _surveysSDK?: SurveysAPI;

  public set surveysSdk(sdk: SurveysAPI) {
    this._surveysSDK = sdk;
  }

  private get surveys(): SurveysAPI {
    return accessApi(this._surveysSDK);
  }

  public set setHttpClient(httpClient: HttpClientWithIntercept) {
    this.client = httpClient;
  }

  public set setProject(project: String) {
    this.project = project;
  }

  public set setCluster(cluster: String) {
    this.cluster = cluster;
  }

  private addLazyMethodsForWellbore = (wellbore: Wellbore): Wellbore => {
    return <Wellbore>{
      id: wellbore.id,
      name: wellbore.name,
      externalId: wellbore.externalId,
      wellId: wellbore.wellId,
      trajectory: async (): Promise<Survey | undefined>  => {return await this.surveys.getTrajectory(wellbore.id).then(response => response).catch(err => err)},
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

  private getPath(baseUrl: string): string {
    if (this.project == undefined){
      throw new HttpError(400, "The client project has not been set.", {})
    }
    if (this.cluster == undefined) {
      throw new HttpError(400, "No cluster has been set.", {})
    }
    baseUrl = `/${this.project}${baseUrl}?env=${this.cluster}`
    return baseUrl
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

    return await this.client?.asyncGet<Sequence[]>(path)
    .then(response => response.data)
    .catch(err => {
      throw new HttpError(err.status, err.errorMessage, {})
    })
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
