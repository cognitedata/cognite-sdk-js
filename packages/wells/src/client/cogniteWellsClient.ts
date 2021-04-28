import { accessApi } from '@cognite/sdk-core';
import { WellsAPI } from './api/wellsApi';
import { WellboresAPI } from './api/wellboresApi';
import { SurveysAPI } from './api/surveysApi';
import { EventsAPI } from './api/eventsApi';
import { version } from '../../package.json';
import BaseWellsClient from './baseWellsClient';
import { ClientOptions } from './clientAuthUtils';
import { Cluster } from './model/Cluster';
import { CasingsAPI } from './api/casingsApi';

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

  public get events() {
    return accessApi(this.eventsApi);
  }

  public get casings() {
    return accessApi(this.casingsApi);
  }

  private wellsApi?: WellsAPI;
  private wellboresApi?: WellboresAPI;
  private surveysApi?: SurveysAPI;
  private eventsApi?: EventsAPI;
  private casingsApi?: CasingsAPI;
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

    // events
    this.eventsApi = this.apiFactory(EventsAPI, 'events');
    this.eventsApi.setHttpClient = this.httpClient;
    this.eventsApi.setProject = this.project;
    this.eventsApi.setCluster = this.cluster;

    // casings
    this.casingsApi = this.apiFactory(CasingsAPI, 'casings');
    this.casingsApi.setHttpClient = this.httpClient;
    this.casingsApi.setProject = this.project;
    this.casingsApi.setCluster = this.cluster;

    // wellbores
    this.wellboresApi = this.apiFactory(WellboresAPI, 'wellbores');
    this.wellboresApi.setHttpClient = this.httpClient;
    this.wellboresApi.setProject = this.project;
    this.wellboresApi.setCluster = this.cluster;
    this.wellboresApi.surveysSdk = this.surveysApi;
    this.wellboresApi.casings = this.casingsApi;

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
