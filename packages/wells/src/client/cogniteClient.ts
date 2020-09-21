// Copyright 2020 Cognite AS
import {
  ClientOptions,
  CogniteClient as CogniteClientStable,
} from '@cognite/sdk';
import { version } from '../../package.json';
import { Wells } from './api/wells';
import { accessApi } from '@cognite/sdk-core';

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
  }

  get wells(): Wells {
    return accessApi(this.wellsSDK);
  }

  protected get version() {
    return `wells/${version}`;
  }
}
