// Copyright 2020 Cognite AS
import {
  ClientOptions,
  CogniteClient as CogniteClientStable,
} from '@cognite/sdk';
import { version } from '../../package.json';
import { Wells } from './api/wells';
import { accessApi } from '@cognite/sdk-core';
//import { CogniteGeospatialClient } from '../geospatial';

export default class CogniteClient extends CogniteClientStable {
  /**
   * Create a new SDK client (derived)
   * @param options Client options
   */
  constructor(options: ClientOptions) {
    super(options);
  }

  private wellsSDK?: Wells;

  protected initAPIs() {
    super.initAPIs();

    // Turns into $BASE_URL/api/$API_VERSION/projects/$PROJECT/wells
    this.wellsSDK = this.apiFactory(Wells, 'assets');
    console.log('wellsSDK: ', this.wellsSDK);
  }

  get wells(): Wells {
    return accessApi(this.wellsSDK);
  }

  protected get version() {
    return `wells/${version}`;
  }
}
