import { BaseCogniteClient } from '@cognite/sdk-core';
import { accessApi } from '@cognite/sdk-core';
import { WellsAPI } from './api/wellsApi';
import { version } from '../../package.json';
import { WELL_SERVICE_BASE_URL } from './api/utils';

export default class CogniteWellsClient extends BaseCogniteClient {
  public get wells() {
    return accessApi(this.wellsApi);
  }

  private wellsApi?: WellsAPI;

  protected initAPIs() {
    this.setBaseUrl(WELL_SERVICE_BASE_URL);
    this.wellsApi = this.apiFactory(WellsAPI, 'wells');
    this.wellsApi.setHttpClient = this.httpClient;
  }

  protected get version() {
    return `wells/${version}`;
  }
}
