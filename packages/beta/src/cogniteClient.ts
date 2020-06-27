// Copyright 2020 Cognite AS
import {
  ClientOptions,
  CogniteClient as CogniteClientStable,
} from '@haved/cogsdk';
import { version } from '../package.json';

export default class CogniteClientBeta extends CogniteClientStable {
  /**
   * Create a new SDK client (beta)
   *
   * @param options Client options
   *
   * To use the beta sdk, alias `"@haved/cogsdk": "@haved/cogsdk-beta@^<version>"` in `package.json`
   * The beta SDK exports the client with the same name as stable, meaning you don't need to change any code.
   * ```js
   * import { CogniteClient } from '@haved/cogsdk';
   *
   * const client = new CogniteClient({ appId: 'YOUR APPLICATION NAME' });
   *
   * // can also specify a base URL
   * const client = new CogniteClient({ ..., baseUrl: 'https://greenfield.cognitedata.com' });
   * ```
   */
  constructor(options: ClientOptions) {
    super(options);
  }

  protected get version() {
    return `${version} (@cognite/sdk-beta)`;
  }
}

export * from '@haved/cogsdk';
