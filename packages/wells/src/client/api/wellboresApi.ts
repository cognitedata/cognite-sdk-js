import { CDFHttpClient, HttpError} from '@cognite/sdk-core';
import { Measurements } from '../model/Measurement';
import { MeasurementType } from '../model/MeasurementType';
import { Survey } from '../model/Survey';
import { Wellbore } from '../model/Wellbore';

export class WellboresAPI {
  private client?: CDFHttpClient;
  private project?: String;
  private cluster?: String;

  public set setHttpClient(httpClient: CDFHttpClient) {
    this.client = httpClient;
  }

  public set setProject(project: String) {
    this.project = project;
  }

  public set setCluster(cluster: String) {
    this.cluster = cluster;
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
      .then(response => response.data)
      .catch(err => {
        throw new HttpError(err.status, err.errorMessage, {})
    });
  };

  /* eslint-disable */
  public getTrajectory = async (wellboreId: number): Promise<Survey | undefined> => {

      const path: string = this.getPath(`/wellbores/${wellboreId}/trajectory`)

      return await this.client?.get<Survey>(path)
      .then(response => response.data)
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
