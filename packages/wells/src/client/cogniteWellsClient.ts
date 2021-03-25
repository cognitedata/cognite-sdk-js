import { accessApi } from '@cognite/sdk-core';
import { WellsAPI } from './api/wellsApi';
import { WellboresAPI } from './api/wellboresApi';
import { SurveysAPI } from './api/surveysApi';
import { version } from '../../package.json';
import BaseWellsClient from './baseWellsClient';
import { ClientOptions } from './clientAuthUtils';
import { Cluster } from './model/Cluster';

export default class CogniteWellsClient extends BaseWellsClient {
  public get wells() {
    return accessApi(this.wellsApi);
  }

  public get wellbores() {
    return accessApi(this.wellboresApi);
  }

  public get surveys() {
    return accessApi(this.surveysApi);
  }

  private wellsApi?: WellsAPI;
  private wellboresApi?: WellboresAPI;
  private surveysApi?: SurveysAPI;
  private cluster: Cluster;

  constructor(options: ClientOptions) {
    super(options);
    this.cluster = options.cluster;
  }

  protected initAPIs() {
    // surveys
    this.surveysApi = this.apiFactory(SurveysAPI, 'surveys');
    this.surveysApi.setHttpClient = this.httpClient;
    this.surveysApi.setProject = this.project;
    this.surveysApi.setCluster = this.cluster;

    // wellbores
    this.wellboresApi = this.apiFactory(WellboresAPI, 'wellbores');
    this.wellboresApi.setHttpClient = this.httpClient;
    this.wellboresApi.setProject = this.project;
    this.wellboresApi.setCluster = this.cluster;
    this.wellboresApi.surveysSdk = this.surveysApi;

    // wells
    this.wellsApi = this.apiFactory(WellsAPI, 'wells');
    this.wellsApi.setHttpClient = this.httpClient;
    this.wellsApi.setProject = this.project;
    this.wellsApi.setCluster = this.cluster;
    this.wellsApi.wellboresSDK = this.wellboresApi;
  }

  protected get version() {
    return `wells/${version}`;
  }
}
