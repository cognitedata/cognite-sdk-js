import { CDFHttpClient, HttpError} from '@cognite/sdk-core';
import { Survey } from '../model/Survey';

export class WellboresAPI {
  private client?: CDFHttpClient;
  private project?: String;

  public set setHttpClient(httpClient: CDFHttpClient) {
    this.client = httpClient;
  }

  public set setProject(project: String) {
    this.project = project;
  }

  /* eslint-disable */
  public getTrajectory = async (wellboreId: number): Promise<Survey | undefined> => {

      if (this.project == undefined){
        throw new HttpError(400, "The client project has not been set.", {})
      }

      const path: string = `/${this.project}/wellbores/${wellboreId}/trajectory`
      
      return await this.client?.get<Survey>(path)
      .then(response => response.data)
      .catch(err => {
        throw new HttpError(err.status, err.errorMessage, {})
      });
    };
}
