import { accessApi, CDFHttpClient, HttpError} from '@cognite/sdk-core';
import { Measurements } from '../model/Measurement';
import { MeasurementType } from '../model/MeasurementType';
import { Survey } from '../model/Survey';
import { Wellbore } from '../model/Wellbore';
import { SurveysAPI } from './surveysApi';

export class WellboresAPI {
  private client?: CDFHttpClient;
  private project?: String;
  private cluster?: String;

  private _surveysSDK?: SurveysAPI;

  public set surveysSdk(sdk: SurveysAPI) {
    this._surveysSDK = sdk;
  }

  private get surveys(): SurveysAPI {
    return accessApi(this._surveysSDK);
  }

  public set setHttpClient(httpClient: CDFHttpClient) {
    this.client = httpClient;
  }

  public set setProject(project: String) {
    this.project = project;
  }

  public set setCluster(cluster: String) {
    this.cluster = cluster;
  }

  private addLazyMethods = (wellbore: Wellbore): Wellbore => {
    return <Wellbore>{
      id: wellbore.id,
      name: wellbore.name,
      metadata: wellbore.metadata,
      trajectory: async (): Promise<Survey | undefined>  => {return await this.surveys.getTrajectory(wellbore.id).then(response => response).catch(err => err)}
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
    return await this.client?.get<Wellbore>(path)
      .then(response => this.addLazyMethods(response.data))
      .catch(err => {
        throw new HttpError(err.status, err.errorMessage, {})
    });
  };

  public getMeasurement = async (wellboreId: number, measurementType: MeasurementType): Promise<Measurements | undefined> => {

    const path: string = this.getPath(`/wellbores/${wellboreId}/measurements/${measurementType}`)

    return await this.client?.get<Measurements>(path)
    .then(response => response.data)
    .catch(err => {
      throw new HttpError(err.status, err.errorMessage, {})
    })
    
  }
}
