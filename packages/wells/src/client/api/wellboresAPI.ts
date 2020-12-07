import { CDFHttpClient} from '@cognite/sdk-core';
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
      const path: string = `/${this.project}/wellbores/${wellboreId}/trajectory`
      let trajectory: Survey | undefined;
      await this.client?.get<Survey>(path)
      .then(response => {
        if (response.status == 200){
          trajectory = response.data;
        } else {
          trajectory = undefined;
        }})

        return trajectory;
    };
}
