import { HttpError } from '@cognite/sdk-core';
import { ConfigureAPI } from '../baseWellsClient';
import { Survey, SurveyData, SurveyDataRequest } from '../model/Survey';

export class SurveysAPI extends ConfigureAPI {
  private addLazyMethods = (survey: Survey): Survey => {
    return <Survey>{
      id: survey.id,
      name: survey.name,
      metadata: survey.metadata,
      data: async (): Promise<SurveyData> => {
        return await this.getData({ id: survey.id });
      },
    };
  };

  public getTrajectory = async (wellboreId: number): Promise<Survey> => {
    const path: string = this.getPath(`/wellbores/${wellboreId}/trajectory`);

    return await this.client
      .asyncGet<Survey>(path)
      .then(response => this.addLazyMethods(response.data))
      .catch(err => {
        throw new HttpError(err.status, err.errorMessage, {});
      });
  };

  public getData = async (request: SurveyDataRequest): Promise<SurveyData> => {
    if (this.project == undefined) {
      throw new HttpError(400, 'The client project has not been set.', {});
    }

    const path: string = `/${this.project}/surveys/data`;

    return await this.client
      .asyncPost<SurveyData>(path, { data: request })
      .then(response => response.data)
      .catch(err => {
        throw new HttpError(err.status, err.errorMessage, {});
      });
  };
}
