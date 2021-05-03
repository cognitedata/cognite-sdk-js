import { HttpError } from '@cognite/sdk-core';
import { ConfigureAPI } from '../baseWellsClient';
import { NPTItems } from '../model/NPT';
import { NPTFilter } from '../model/NPTFilter';

export class EventsAPI extends ConfigureAPI {
  public listEvents = async (
    filter: NPTFilter,
    cursor?: string
  ): Promise<NPTItems> => {
    const path: string = this.getPath(`/events/list`, cursor);

    return await this.client
      .asyncPost<NPTItems>(path, { data: filter })
      .then(response => response.data)
      .catch(err => {
        throw new HttpError(err.status, err.errorMessage, {});
      });
  };

  public nptCodes = async (): Promise<string[]> => {
    if (this.project == undefined) {
      throw new HttpError(400, 'The client project has not been set.', {});
    }

    const path: string = `/${this.project}/events/nptcodes`;

    return await this.client
      .asyncPost<string[]>(path, {})
      .then(response => response.data)
      .catch(err => {
        throw new HttpError(err.status, err.errorMessage, {});
      });
  };

  public nptDetailCodes = async (): Promise<string[]> => {
    if (this.project == undefined) {
      throw new HttpError(400, 'The client project has not been set.', {});
    }

    const path: string = `/${this.project}/events/nptdetailcodes`;

    return await this.client
      .asyncPost<string[]>(path, {})
      .then(response => response.data)
      .catch(err => {
        throw new HttpError(err.status, err.errorMessage, {});
      });
  };
}
