import { BaseCogniteClient } from '@cognite/sdk-core';
import { accessApi } from '@cognite/sdk-core';
import { WellsAPI } from './api/wellsApi';
import { version } from '../../package.json';
import { WELL_SERVICE_BASE_URL } from './api/utils';
import { WellboresAPI } from './api/wellboresAPI';

export default class CogniteWellsClient extends BaseCogniteClient {
  public get wells() {
    return accessApi(this.wellsApi);
  }

  public get wellbores() {
    return accessApi(this.wellboresApi);
  }

  private wellsApi?: WellsAPI;
  private wellboresApi?: WellboresAPI;

  protected initAPIs() {
    // wells
    this.setBaseUrl(WELL_SERVICE_BASE_URL);
    this.wellsApi = this.apiFactory(WellsAPI, 'wells');
    this.wellsApi.setHttpClient = this.httpClient;
    this.wellsApi.setProject = this.project;

    // wellbores
    this.setBaseUrl(WELL_SERVICE_BASE_URL);
    this.wellboresApi = this.apiFactory(WellboresAPI, 'wellbores');
    this.wellboresApi.setHttpClient = this.httpClient;
    this.wellboresApi.setProject = this.project;
  }

  protected get version() {
    return `wells/${version}`;
  }
}
