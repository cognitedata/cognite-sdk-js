// Copyright 2020 Cognite AS
import {
  ClientOptions,
  CogniteClient as CogniteClientStable,
} from '@cognite/sdk';
import { version } from '../package.json';
import { accessApi } from '@cognite/sdk-core';
import { BasicHttpClient } from 'core/src/httpClient/basicHttpClient';

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

  private openDoor?: (name: string) => Promise<boolean>;

  protected initAPIs() {
    super.initAPIs();

    const doorClient = new BasicHttpClient('https://example.com');

    this.openDoor = async (name: string) => {
      const response = await doorClient.post('doors/open', {
        params: { name },
      });
      return response.status === 200;
    };
  }

  get doorControl() {
    return {
      openDoor: accessApi(this.openDoor),
    };
  }
}
