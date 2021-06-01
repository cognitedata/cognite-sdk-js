import { HttpError } from '@cognite/sdk-core';
import { ConfigureAPI } from '../baseWellsClient';
import { NPTItems } from '../model/NPT';
import { NPTFilter } from '../model/NPTFilter';

export class EventsAPI extends ConfigureAPI {
  public listNPT = async (
    filter: NPTFilter,
    cursor?: string,
    limit?: number
  ): Promise<NPTItems> => {
    const path: string = this.getPath(`/events/list`, cursor, limit);

    return await this.client
      .asyncPost<NPTItems>(path, { data: filter })
      .then(response => response.data)
      .catch(err => {
        throw new HttpError(err.status, err.data.error.message, {});
      });
  };

  public nptCodes = async (): Promise<string[]> => {
    if (this.project == undefined) {
      throw new HttpError(400, 'The client project has not been set.', {});
    }

    const path: string = `/${this.project}/events/nptcodes`;

    return await this.client
      .asyncGet<string[]>(path)
      .then(response => response.data)
      .catch(err => {
        throw new HttpError(err.status, err.data.error.message, {});
      });
  };

  public nptDetailCodes = async (): Promise<string[]> => {
    if (this.project == undefined) {
      throw new HttpError(400, 'The client project has not been set.', {});
    }

    const path: string = `/${this.project}/events/nptdetailcodes`;

    return await this.client
      .asyncGet<string[]>(path)
      .then(response => response.data)
      .catch(err => {
        throw new HttpError(err.status, err.data.error.message, {});
      });
  };
}
