// Copyright 2020 Cognite AS
import {
  accessApi,
  apiUrl,
  BaseCogniteClient,
  RetryValidator,
} from '@cognite/sdk-core';
import { version } from '../package.json';
import { AssetMappings3DAPI } from './api/3d/assetMappings3DApi';
import { Files3DAPI } from './api/3d/files3DApi';
import { Models3DAPI } from './api/3d/models3DApi';
import { Revisions3DAPI } from './api/3d/revisions3DApi';
import { Viewer3DAPI } from './api/3d/viewer3DApi';
import { ApiKeysAPI } from './api/apiKeys/apiKeysApi';
import { AssetsAPI } from './api/assets/assetsApi';
import { DataPointsAPI } from './api/dataPoints/dataPointsApi';
import { DataSetsAPI } from './api/datasets/datasetsApi';
import { DocumentsAPI } from './api/documents/documentsApi';
import { EntityMatchingApi } from './api/entityMatching/entityMatchingApi';
import { EventsAPI } from './api/events/eventsApi';
import { FilesAPI } from './api/files/filesApi';
import { GroupsAPI } from './api/groups/groupsApi';
import { LabelsAPI } from './api/labels/labelsApi';
import { ProjectsAPI } from './api/projects/projectsApi';
import { RawAPI } from './api/raw/rawApi';
import { RelationshipsApi } from './api/relationships/relationshipsApi';
import { SecurityCategoriesAPI } from './api/securityCategories/securityCategoriesApi';
import { SequencesAPI } from './api/sequences/sequencesApi';
import { ServiceAccountsAPI } from './api/serviceAccounts/serviceAccountsApi';
import { GeospatialAPI } from './api/geospatial/geospatialAPI';
import { AnnotationsAPI } from './api/annotations/annotationsApi';
import { VisionAPI } from './api/vision/visionApi';
import { ProfilesAPI } from './api/userProfiles/profilesApi';
import {
  TemplateGraphQlApi,
  TemplateGroupsApi,
  TemplateGroupVersionsApi,
  TemplateInstancesApi,
  ViewsApi,
} from './api/templates';
import { TimeSeriesAPI } from './api/timeSeries/timeSeriesApi';
import { retryValidator } from './retryValidator';
import { UnitsAPI } from './api/units/unitsApi';
import { InstancesAPI } from './api/instances/instancesApi';
import { ContainersAPI } from './api/containers/containersApi';
import { ViewsAPI } from './api/views/viewsApi';
import { SpacesAPI } from './api/spaces/spacesApi';
import { DataModelsAPI } from './api/models/datamodelsApi';

export default class CogniteClient extends BaseCogniteClient {
  public get assets() {
    return accessApi(this.assetsApi);
  }
  public get timeseries() {
    return accessApi(this.timeSeriesApi);
  }
  public get datapoints() {
    return accessApi(this.dataPointsApi);
  }
  public get sequences() {
    return accessApi(this.sequencesApi);
  }
  public get events() {
    return accessApi(this.eventsApi);
  }
  public get files() {
    return accessApi(this.filesApi);
  }
  public get labels() {
    return accessApi(this.labelsApi);
  }
  public get raw() {
    return accessApi(this.rawApi);
  }
  public get projects() {
    return accessApi(this.projectsApi);
  }
  public get groups() {
    return accessApi(this.groupsApi);
  }
  public get securityCategories() {
    return accessApi(this.securityCategoriesApi);
  }
  public get serviceAccounts() {
    return accessApi(this.serviceAccountsApi);
  }
  public get models3D() {
    return accessApi(this.models3DApi);
  }
  public get revisions3D() {
    return accessApi(this.revisions3DApi);
  }
  public get files3D() {
    return accessApi(this.files3DApi);
  }
  public get datasets() {
    return accessApi(this.datasetsApi);
  }
  public get assetMappings3D() {
    return accessApi(this.assetMappings3DApi);
  }
  public get viewer3D() {
    return accessApi(this.viewer3DApi);
  }
  public get apiKeys() {
    return accessApi(this.apiKeysApi);
  }
  public get relationships() {
    return accessApi(this.relationshipsApi);
  }
  public get entityMatching() {
    return accessApi(this.entityMatchingApi);
  }
  public get geospatial() {
    return accessApi(this.geospatialApi);
  }
  public get documents() {
    return accessApi(this.documentsApi);
  }
  public get annotations() {
    return accessApi(this.annotationsApi);
  }
  public get vision() {
    return accessApi(this.visionApi);
  }
  public get profiles() {
    return accessApi(this.profilesApi);
  }
  public get templates() {
    return {
      groups: accessApi(this.apiFactory(TemplateGroupsApi, 'templategroups')),
      group: (externalId: string) => {
        const urlsafeExternalId = CogniteClient.urlEncodeExternalId(externalId);
        const baseVersionsUrl = `templategroups/${urlsafeExternalId}/versions`;
        return {
          versions: accessApi(
            this.apiFactory(TemplateGroupVersionsApi, baseVersionsUrl)
          ),
          version: (version: number) => {
            const baseGroupUrl = `${baseVersionsUrl}/${version}`;
            const graphQlApi = this.apiFactory(
              TemplateGraphQlApi,
              `${baseGroupUrl}/graphql`
            );
            return {
              instances: accessApi(
                this.apiFactory(
                  TemplateInstancesApi,
                  `${baseGroupUrl}/instances`
                )
              ),
              runQuery: async <
                TVariables extends Record<string, unknown>
              >(graphQlParams: {
                query: string;
                variables?: TVariables;
                operationName?: string;
              }) => graphQlApi.runQuery(graphQlParams),
              views: accessApi(
                this.apiFactory(ViewsApi, `${baseGroupUrl}/views`)
              ),
            };
          },
        };
      },
    };
  }
  public get units() {
    return accessApi(this.unitsApi);
  }
  public get instances() {
    return accessApi(this.instancesApi);
  }
  public get containers() {
    return accessApi(this.containersApi);
  }
  public get views() {
    return accessApi(this.viewsApi);
  }
  public get spaces() {
    return accessApi(this.spacesApi);
  }
  public get dataModels() {
    return accessApi(this.dataModelsApi);
  }
  private assetsApi?: AssetsAPI;
  private timeSeriesApi?: TimeSeriesAPI;
  protected dataPointsApi?: DataPointsAPI;
  private sequencesApi?: SequencesAPI;
  private eventsApi?: EventsAPI;
  private filesApi?: FilesAPI;
  private labelsApi?: LabelsAPI;
  private rawApi?: RawAPI;
  private projectsApi?: ProjectsAPI;
  private groupsApi?: GroupsAPI;
  private securityCategoriesApi?: SecurityCategoriesAPI;
  private serviceAccountsApi?: ServiceAccountsAPI;
  private models3DApi?: Models3DAPI;
  private relationshipsApi?: RelationshipsApi;
  private entityMatchingApi?: EntityMatchingApi;
  private revisions3DApi?: Revisions3DAPI;
  private files3DApi?: Files3DAPI;
  private datasetsApi?: DataSetsAPI;
  private assetMappings3DApi?: AssetMappings3DAPI;
  private viewer3DApi?: Viewer3DAPI;
  private apiKeysApi?: ApiKeysAPI;
  private geospatialApi?: GeospatialAPI;
  private documentsApi?: DocumentsAPI;
  private annotationsApi?: AnnotationsAPI;
  private visionApi?: VisionAPI;
  private profilesApi?: ProfilesAPI;
  private unitsApi?: UnitsAPI;
  private instancesApi?: InstancesAPI;
  private containersApi?: ContainersAPI;
  private viewsApi?: ViewsAPI;
  private spacesApi?: SpacesAPI;
  private dataModelsApi?: DataModelsAPI;

  protected get version() {
    return version;
  }

  protected getRetryValidator(): RetryValidator {
    return retryValidator;
  }

  protected initAPIs() {
    const models3DPath = '3d/models';

    // Lock version to the following date
    this.httpClient.setDefaultHeader('cdf-version', 'V20210406');

    this.assetsApi = this.apiFactory(AssetsAPI, 'assets');
    this.timeSeriesApi = this.apiFactory(TimeSeriesAPI, 'timeseries');
    this.dataPointsApi = this.apiFactory(DataPointsAPI, 'timeseries/data');
    this.sequencesApi = this.apiFactory(SequencesAPI, 'sequences');
    this.eventsApi = this.apiFactory(EventsAPI, 'events');
    this.filesApi = this.apiFactory(FilesAPI, 'files');
    this.labelsApi = this.apiFactory(LabelsAPI, 'labels');
    this.datasetsApi = this.apiFactory(DataSetsAPI, 'datasets');
    this.rawApi = this.apiFactory(RawAPI, 'raw/dbs');
    this.groupsApi = this.apiFactory(GroupsAPI, 'groups');
    this.securityCategoriesApi = this.apiFactory(
      SecurityCategoriesAPI,
      'securitycategories'
    );
    this.serviceAccountsApi = this.apiFactory(
      ServiceAccountsAPI,
      'serviceaccounts'
    );
    this.apiKeysApi = this.apiFactory(ApiKeysAPI, 'apikeys');
    this.models3DApi = this.apiFactory(Models3DAPI, models3DPath);
    this.relationshipsApi = this.apiFactory(RelationshipsApi, 'relationships');
    this.entityMatchingApi = this.apiFactory(
      EntityMatchingApi,
      'context/entitymatching'
    );
    this.revisions3DApi = this.apiFactory(Revisions3DAPI, models3DPath);
    this.files3DApi = this.apiFactory(Files3DAPI, '3d/files');
    this.assetMappings3DApi = this.apiFactory(AssetMappings3DAPI, models3DPath);
    this.viewer3DApi = this.apiFactory(Viewer3DAPI, '3d');
    this.projectsApi = new ProjectsAPI(
      apiUrl(),
      this.httpClient,
      this.metadataMap
    );
    this.geospatialApi = this.apiFactory(GeospatialAPI, 'geospatial');
    this.documentsApi = this.apiFactory(DocumentsAPI, 'documents');
    this.annotationsApi = this.apiFactory(AnnotationsAPI, 'annotations');
    this.visionApi = this.apiFactory(VisionAPI, 'context/vision');
    this.profilesApi = this.apiFactory(ProfilesAPI, 'profiles');
    this.unitsApi = this.apiFactory(UnitsAPI, 'units');
    this.instancesApi = this.apiFactory(InstancesAPI, 'models/instances');
    this.containersApi = this.apiFactory(ContainersAPI, 'models/containers');
    this.viewsApi = this.apiFactory(ViewsAPI, 'models/views');
    this.spacesApi = this.apiFactory(SpacesAPI, 'models/spaces');
    this.dataModelsApi = this.apiFactory(DataModelsAPI, 'models/datamodels');
  }

  static urlEncodeExternalId(externalId: string): string {
    return encodeURIComponent(externalId);
  }
}
