// Copyright 2020 Cognite AS
import {
  ClientOptions,
  CogniteClient as StableCogniteClient,
} from '@cognite/sdk';
import { version } from '../package.json';

export default class CogniteClient extends StableCogniteClient {
  /**
   * Create a new SDK client (beta)
   *
   * @param options Client options
   *
   * ```js
   * import { CogniteClient } from '@cognite/sdk';
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
    return version;
  }
}

export * from '@cognite/sdk';
