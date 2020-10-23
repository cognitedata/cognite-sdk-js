// Copyright 2020 Cognite AS
import { CogniteClient as CogniteClientStable } from '@cognite/sdk';
import { version } from '../../package.json';
import { Wells } from './api/wells';
import { accessApi } from '@cognite/sdk-core';

export default class CogniteClient extends CogniteClientStable {
  private wellsSDK?: Wells;

  protected initAPIs() {
    super.initAPIs();

    // Turns into $BASE_URL/api/$API_VERSION/projects/$PROJECT/assets
    this.wellsSDK = this.apiFactory(Wells, 'assets');
  }

  get wells(): Wells {
    return accessApi(this.wellsSDK);
  }

  get instance(): CogniteClient {
    return this;
  }

  protected get version() {
    return `wells/${version}`;
  }
}
