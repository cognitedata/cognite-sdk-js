// Copyright 2020 Cognite AS

import {
  ClientOptions,
  CogniteClient as CogniteClientStable,
} from '@cognite/sdk';
import { version } from '../package.json';
import { UnitsAPI } from './api/units/unitsApi';
import { accessApi } from '@cognite/sdk-core';

class CogniteClientCleaned extends CogniteClientStable {
  // Remove type restrictions
}

export default class CogniteClient extends CogniteClientCleaned {
  /**
   * Create a new SDK client (beta)
   *
   * For smooth transition between stable sdk and beta, you may create an alias
   * `"@cognite/sdk": "@cognite/sdk-beta@^<version>"` in `package.json`
   * The beta SDK exports the client with the same name as stable, meaning you don't need to change any imports.
   * ```js
   * import { CogniteClient } from '@cognite/sdk';
   *
   * const client = new CogniteClient({ appId: 'YOUR APPLICATION NAME' });
   *
   * // can also specify a base URL
   * const client = new CogniteClient({ ..., baseUrl: 'https://greenfield.cognitedata.com' });
   * ```
   *
   * @param options Client options
   */
  constructor(options: ClientOptions) {
    super(options);
  }

  private unitsApi?: UnitsAPI;

  protected get version() {
    return `${version}-beta`;
  }

  public get units() {
    return accessApi(this.unitsApi);
  }

  protected initAPIs() {
    super.initAPIs();

    this.httpClient.setDefaultHeader('cdf-version', 'beta');

    this.unitsApi = this.apiFactory(UnitsAPI, 'units');
  }
}
