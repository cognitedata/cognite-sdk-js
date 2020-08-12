// Copyright 2020 Cognite AS
import {
  ClientOptions,
  CogniteClient as CogniteClientStable,
  HttpRequestOptions,
} from '@cognite/sdk';
import { version } from '../package.json';

/** @hidden */
class CogniteClientCleaned extends CogniteClientStable {
  // Remove old type of e.g. timeseries
  //timeseries: any
}

export default class CogniteClient extends CogniteClientCleaned {
  /**
   * Create a new SDK client (derived)
   * @param options Client options
   */
  constructor(options: ClientOptions) {
    super(options);
  }

  protected get version() {
    return `${version}-derived`;
  }

  private externalApi?: {
    openDoor(name: string): Promise<boolean>;
  };

  protected initAPIs() {
    super.initAPIs();
    this.externalApi = {
      openDoor: async (name: string) => {
        const options: HttpRequestOptions = { params: { name } };
        const response = await this.httpClient.post('example.com/openDoor', options);
        return response.status === 200 
      }
    };
  }
}
