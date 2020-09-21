// Copyright 2020 Cognite AS
import {
  ClientOptions,
  CogniteClient as CogniteClientStable,
} from '@cognite/sdk';
import { version } from '../../package.json';
import { Wells } from './api/wells';
import { accessApi } from '@cognite/sdk-core';
//import {CogniteGeospatialClient} from '@cognite/geospatial-sdk-js';

export default class CogniteClient extends CogniteClientStable {

  /**
   * Create a new SDK client (derived)
   * @param options Client options
   */
  constructor(options: ClientOptions) {
    super(options);
  }

  private wellsSDK?: Wells;
  //private getWellsFromPolygon() => Promise<boolean>;

  protected initAPIs() {
    super.initAPIs();

    // Turns into $BASE_URL/api/$API_VERSION/projects/$PROJECT/assets
    this.wellsSDK = this.apiFactory(Wells, 'assets');

    console.log("api key: ", this.apiKeys)
    console.log("project: ", this.project)
    console.log("base url: ", this.getBaseUrl())

    /*
    const geoClient = CogniteGeospatialClient({
      project: this.project,
      api_key: this.apiFactory(),
      api_url: this.getBaseUrl()
      }
    )
    console.log(geoClient)

     */
  }

  get wells(): Wells {
    return accessApi(this.wellsSDK);
  }

  protected get version() {
    return `wells/${version}`;
  }
}
