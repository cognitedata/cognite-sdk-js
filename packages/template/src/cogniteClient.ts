// Copyright 2020 Cognite AS
import {
  ClientOptions,
  CogniteClient as CogniteClientStable,
} from '@cognite/sdk';
import { version } from '../package.json';

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
}
