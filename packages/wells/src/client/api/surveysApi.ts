import { CDFHttpClient, HttpError} from '@cognite/sdk-core';
import { SurveyData, SurveyDataRequest } from '../model/Survey';

export class SurveysAPI {
  private client?: CDFHttpClient;
  private project?: String;

  public set setHttpClient(httpClient: CDFHttpClient) {
    this.client = httpClient;
  }

  public set setProject(project: String) {
    this.project = project;
  }

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
