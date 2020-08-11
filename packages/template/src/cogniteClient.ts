// Copyright 2020 Cognite AS
import {
  ClientOptions,
  CogniteClient as CogniteClientStable,
} from '@cognite/sdk';
import { version } from '../package.json';

//import { accessApi } from '@cognite/sdk-core';
//import { TimeSeriesAPI } from './api/timeseries/timeSeriesApi';

/** @hidden */
class CogniteClientCleaned extends CogniteClientStable {
  // Remove old type of timeseries
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
    return `${version}`;
  }

  //protected timeSeriesApiBeta?: TimeSeriesAPI;
  protected initAPIs() {
    super.initAPIs();
    //this.timeSeriesApiBeta = this.apiFactory(TimeSeriesAPI, 'timeseries');
  }

  //get timeseries(): TimeSeriesAPI {
  //  return accessApi(this.timeSeriesApiBeta);
  //}
}
