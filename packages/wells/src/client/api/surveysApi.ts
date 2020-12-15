import { CDFHttpClient, HttpError} from '@cognite/sdk-core';
import { Survey, SurveyData, SurveyDataRequest } from '../model/Survey';

export class SurveysAPI {
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

  private addLazyMethods = (survey: Survey): Survey => {
    return <Survey>{
      id: survey.id,
      name: survey.name,
      metadata: survey.metadata,
      data: async (): Promise<SurveyData | undefined>  => {return await this.getData({id: survey.id}).then(response => response).catch(err => err)}
    };
  }

  /* eslint-disable */
  public getTrajectory = async (wellboreId: number): Promise<Survey | undefined> => {

    const path: string = this.getPath(`/wellbores/${wellboreId}/trajectory`)

    return await this.client?.get<Survey>(path)
    .then(response => this.addLazyMethods(response.data))
    .catch(err => {
      throw new HttpError(err.status, err.errorMessage, {})
    });
  };

  /* eslint-disable */
  public getData = async (request: SurveyDataRequest): Promise<SurveyData | undefined> => {

      if (this.project == undefined){
        throw new HttpError(400, "The client project has not been set.", {})
      }

      const path: string = `/${this.project}/surveys/data`
      
      return await this.client?.post<SurveyData>(path, {'data': request})
      .then(response => response.data)
      .catch(err => {
        throw new HttpError(err.status, err.errorMessage, {})
      });
  };
}
