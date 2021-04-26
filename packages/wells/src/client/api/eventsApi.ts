import { HttpError} from '@cognite/sdk-core';
import { ConfigureAPI } from "../baseWellsClient";
import { NPT } from "../model/NPT";
import { NPTFilter } from "../model/NPTFilter";

export class EventsAPI extends ConfigureAPI {

  /* eslint-disable */
  public listEvents = async (filter: NPTFilter): Promise<NPT[] | undefined> => {

    const path: string = this.getPath(`/events/list`)

    return await this.client?.asyncPost<NPT[]>(path, {'data': filter})
      .then(response => response.data)
      .catch(err => {
      throw new HttpError(err.status, err.errorMessage, {})
    });
  };

  /* eslint-disable */
  public nptCodes = async (): Promise<string[] | undefined> => {

    if (this.project == undefined){
      throw new HttpError(400, "The client project has not been set.", {})
    }

    const path: string = `/${this.project}/events/nptcodes`
    
    return await this.client?.asyncPost<string[]>(path, {})
    .then(response => response.data)
      .catch(err => {
      throw new HttpError(err.status, err.errorMessage, {})
    });
  };

  /* eslint-disable */
  public nptDetailCodes = async (): Promise<string[] | undefined> => {

    if (this.project == undefined){
      throw new HttpError(400, "The client project has not been set.", {})
    }

    const path: string = `/${this.project}/events/nptdetailcodes`
    
    return await this.client?.asyncPost<string[]>(path, {})
    .then(response => response.data)
      .catch(err => {
      throw new HttpError(err.status, err.errorMessage, {})
    });
};
}