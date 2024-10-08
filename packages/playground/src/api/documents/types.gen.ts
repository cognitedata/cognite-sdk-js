// Do not modify this file!
// It was generated by the command "yarn codegen".
// Instead update the code generation logic or the OpenAPI document.

import type { CursorAndAsyncIterator } from '@cognite/sdk-core';
/**
* A feedback field to aggregate on.

You can find extensive description of the available fields in the
[List Feedback](#operation/documentsListFeedback) endpoint response.
* @example action
*/
export type AggregateField = 'action' | 'status';
/**
 * A value/count aggregation object
 */
export interface AggregateGroup {
  /** The count of records with the `value` for the `field` */
  count: number;
  /** A value of the `field` */
  value: string;
}
/**
 * Only include files that reference these specific asset externalIds.
 */
export type AssetExternalIdsFilter =
  | ContainsAllExternalIds
  | ContainsAnyExternalIds;
/**
 * Only include files that reference these specific asset IDs.
 */
export type AssetIdsFilter = ContainsAllIds | ContainsAnyId | ValueMissing;
/**
 * Only include documents with a related asset in a subtree rooted at any of these asset IDs, including the roots given. Returns an error if the total size of the given subtrees exceeds 10,000 assets. Usage of this field requires `["assetsAcl:READ"]` capability.
 */
export type AssetSubtreeIdsFilter = ContainsAnyId | ValueMissing;
export interface AuthErrorResponse {
  error: unknown;
}
export interface BadRequestErrorResponse {
  error: unknown;
}
/**
 * External Id provided by client. Should be unique within a given project/resource combination.
 */
export type CogniteExternalId = string;
/**
 * A server-generated ID for the object.
 * @format int64
 * @min 1
 * @max 9007199254740991
 */
export type CogniteInternalId = number;
export interface ContainsAllExternalIds {
  /** Values for this field must match all values in this array */
  containsAll?: CogniteExternalId[];
}
export interface ContainsAllIds {
  /** Values for this field must match all values in this array */
  containsAll?: CogniteInternalId[];
}
export interface ContainsAnyExternalIds {
  /** Values for this field must match with at least one of the values in this array */
  containsAny?: CogniteExternalId[];
}
export interface ContainsAnyId {
  /** Values for this field must match with at least one of the values in this array */
  containsAny?: CogniteInternalId[];
}
export interface CursorQueryParameter {
  cursor?: string;
}
/**
 * A document
 */
export interface Document {
  /**
   * The ids of any assets referred to in the document
   * @example [42,101]
   */
  assetIds?: CogniteInternalId[];
  /**
   * The author of the document
   * @example William Shakespeare
   */
  author?: string;
  /**
   * When the document was created, measured in milliseconds since 00:00:00 Thursday, 1 January 1970
   * @example -11676052800000
   */
  createdTime?: EpochTimestamp;
  /**
   * Extension of the file (always in lowercase)
   * @example pdf
   */
  extension?: string;
  /**
   * External Id provided by client. Should be unique within a given project/resource combination.
   * @example haml001
   */
  externalId?: CogniteExternalId;
  /**
   * Geolocation derived for this document. Represented using a GeoJSON Geometry.
   *
   * The derived geolocation also includes geolocation information from a matched
   * asset (see assetIds property). For matched assets without geolocation information
   * the parent chain is followed until it finds an asset with geolocation information.
   */
  geoLocation?: DocumentGeoLocation;
  /**
   * Internal ID of the CDF file/document
   * @example 1
   */
  id: DocumentId;
  /**
   * A list of labels derived by this pipeline's document classifier.
   * @example [{"externalId":"play"},{"externalId":"tragedy"}]
   */
  labels?: LabelList;
  /**
   * The detected language used in the document
   * @example en
   */
  language?: string;
  /**
   * When the document was indexed, measured in milliseconds since 00:00:00 Thursday, 1 January 1970
   * @example -11676052800000
   */
  lastIndexedTime?: EpochTimestamp;
  /**
   * Detected mime type for the document
   * @example text/plain
   */
  mimeType?: string;
  /**
   * Number of pages for multi-page documents
   * @format int32
   * @example 2
   */
  pageCount?: number;
  /** The source file that this document is derived from. */
  sourceFile: DocumentSourceFile;
  /** @example CDF */
  sourceSystem?: string;
  /**
   * The title of the document
   * @example Hamlet
   */
  title?: string;
  /**
   * The textual content of the document. Currently truncated to 155 characters
   * @example ACT I
   * SCENE I. Elsinore. A platform before the castle.
   *   FRANCISCO at his post. Enter to him BERNARDO
   * BERNARDO
   *   Who's there?
   *
   */
  truncatedContent?: string;
  /**
   * Detected mime type for the document
   * @example text/plain
   */
  type?: string;
}
export interface DocumentContent {
  /**
   * The textual content of the document, truncated to the first 1MB of text
   * @example ACT I
   * SCENE I. Elsinore. A platform before the castle.
   *   FRANCISCO at his post. Enter to him BERNARDO
   * BERNARDO
   *   Who's there?
   *
   */
  content?: string;
  /** External Id provided by client. Should be unique within a given project/resource combination. */
  externalId?: CogniteExternalId;
  /** Internal ID of the CDF file/document */
  id: DocumentId;
}
export type DocumentContentItem =
  | {
      id?: DocumentId;
    }
  | {
      externalId?: CogniteExternalId;
    };
export type DocumentContentRequest = DocumentContentRequestItems &
  IgnoreUnknownIdsField;
export interface DocumentContentRequestItems {
  items: DocumentContentItem[];
}
export interface DocumentContentResponse {
  items: DocumentContent[];
}
/**
 * A feedback object
 */
export interface DocumentFeedback {
  /** What to do with the label on the file */
  action: FeedbackAction;
  /**
   * When this feedback object was created by the end-user.
   *
   * A UTC-based [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) timestamp string.
   * @example 2021-02-04T16:24:23.284407
   */
  createdAt: string;
  /** Internal ID of the CDF file/document */
  documentId: DocumentId;
  /** Server-generated identifier for the feedback object */
  feedbackId: FeedbackId;
  /** Label to add to, or remove from a file */
  label: FeedbackLabel;
  /**
   * **Optional** information about the reporter. This could be a name
   * or an email. Please note that this field is free text – it is not
   * checked for integrity at any time.
   */
  reporterInfo?: ReporterInfo;
  /**
   * When this feedback object moved from `CREATED` to another state.
   * This field is only present if the status is not `CREATED`.
   *
   * A UTC-based [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) timestamp string.
   * @example 2021-02-05T14:28:27
   */
  reviewedAt?: string | null;
  /**
   * Status of the feedback, complying with the lifecycle described below.
   *
   * ## Feedback lifecycle
   * - It is initially `CREATED`.
   * - If the administrator accepts the feedback, it moves to `ACCEPTED`.
   *   Once in this state, it cannot move to another state.
   * - If the administrator rejects the feedback, it moves to `REJECTED`.
   * - If the feedback object has become _invalid_, it moves to `STALE`.
   * ## Definition of feedback _invalidity_
   * - If the action was `ATTACH`, and the label to attach does not exist anymore.
   * - If the action was `ATTACH`, and the label is already attached to the file.
   * - If the action was `DETACH`, and the label is not attached to the file anymore.
   */
  status: FeedbackStatus;
}
/**
 * An id of the accepted / rejected feedback
 */
export interface DocumentFeedbackAcceptRejectItem {
  /** Server-generated identifier for the feedback object */
  id: FeedbackId;
}
/**
 * A query object for the accept/reject endpoints
 */
export interface DocumentFeedbackAcceptRejectRequest {
  items: DocumentFeedbackAcceptRejectItem[];
}
/**
 * A query object for the aggregation endpoint
 */
export interface DocumentFeedbackAggregateRequest {
  /**
   * A feedback field to aggregate on.
   *
   * You can find extensive description of the available fields in the
   * [List Feedback](#operation/documentsListFeedback) endpoint response.
   */
  field: AggregateField;
}
export interface DocumentFeedbackAggregateResponse {
  /**
   * A feedback field to aggregate on.
   *
   * You can find extensive description of the available fields in the
   * [List Feedback](#operation/documentsListFeedback) endpoint response.
   */
  field: AggregateField;
  groups: AggregateGroup[];
  /** The sum of all groups */
  total: number;
}
/**
 * A new feedback object, not yet written to the API
 */
export interface DocumentFeedbackCreateItem {
  /** What to do with the label on the file */
  action: FeedbackAction;
  /** Internal ID of the CDF file/document */
  documentId: DocumentId;
  /** Label to add to, or remove from a file */
  label: FeedbackLabel;
  /**
   * **Optional** information about the reporter. This could be a name
   * or an email. Please note that this field is free text – it is not
   * checked for integrity at any time.
   */
  reporterInfo?: ReporterInfo;
}
/**
 * A list of feedback objects, not yet written to the API
 */
export interface DocumentFeedbackCreateRequest {
  items: DocumentFeedbackCreateItem[];
}
export interface DocumentFeedbackCreateResponse {
  items: {
    documentId: DocumentId;
    label: FeedbackLabel;
    action: FeedbackAction;
    feedbackId: FeedbackId;
    reporterInfo?: ReporterInfo;
    createdAt: string;
    status: FeedbackStatus;
  }[];
}
export interface DocumentFeedbackListResponse {
  /** List of feedback objects */
  items: DocumentFeedback[];
}
/**
 * GeoJson representation of a geometry.
 */
export interface DocumentGeoLocation {
  /** Coordinates of the shape. */
  coordinates?: ShapeCoordinates;
  geometries?: GeometryCollection[];
  /** Type of the shape. Currently we support "polygon", "linestring" and "point". */
  type?: ShapeType;
}
/**
 * Filter on files which have the specified spatial relation with the specified geometry shape.
 */
export type DocumentGeoLocationFilter =
  | ValueMissing
  | {
      shape: DocumentGeoLocation;
      relation?: Relation;
    };
/**
 * Internal ID of the CDF file/document
 * @example 1066
 */
export type DocumentId = CogniteInternalId;
export interface DocumentsAggregates {
  aggregates?: (DocumentsCountAggregate | DocumentsDateHistogramAggregate)[];
}
export interface DocumentsClassifier {
  /** Whether the classifier is currently used for predicting labels */
  active: boolean;
  /**
   * Timestamp when the classifier is created
   * @format int64
   */
  createdAt: number;
  /** Reason why the classifier cannot be created */
  errorMessage?: string;
  /** Classifier id */
  id: CogniteInternalId;
  metrics?: DocumentsClassifierMetrics;
  /** Name of the classifier */
  name: string;
  /** Project id */
  projectId: CogniteInternalId;
  /** Status of the creating classifier job. Can be one of `QUEUING`, `TRAINING`, `FINISHED`, `FAILED` */
  status: string;
  /**
   * The number of documents used for training the classifier
   * @format int64
   */
  trainingSetSize?: number;
}
export interface DocumentsClassifierCreate {
  name: string;
}
/**
 * A list of classifiers.
 */
export interface DocumentsClassifierCreateItems {
  items: DocumentsClassifierCreate[];
}
export interface DocumentsClassifierCreateResponse {
  /** Whether the classifier is currently used for predicting labels */
  active: boolean;
  /**
   * Timestamp when the classifier is created
   * @format int64
   */
  createdAt: number;
  /** Classifier id */
  id: CogniteInternalId;
  /** Name of the classifier */
  name: string;
  /** Project id */
  projectId: CogniteInternalId;
  /** Status of the creating classifier job. Can be one of `QUEUING`, `TRAINING`, `FINISHED`, `FAILED` */
  status: string;
}
/**
 * A list of classifiers.
 */
export interface DocumentsClassifierCreateResponseItems {
  items: DocumentsClassifierCreateResponse[];
}
export interface DocumentsClassifierDelete {
  /** A server-generated ID for the object. */
  id: CogniteInternalId;
}
/**
 * A list of classifier ids.
 */
export interface DocumentsClassifierDeleteItems {
  items: DocumentsClassifierDelete[];
}
export type DocumentsClassifierDeleteRequest = DocumentsClassifierDeleteItems &
  IgnoreUnknownIdsField;
/**
 * A list of classifiers.
 */
export interface DocumentsClassifierItems {
  items: DocumentsClassifier[];
}
export interface DocumentsClassifierListByIds {
  /** A server-generated ID for the object. */
  id?: CogniteInternalId;
}
/**
 * A list of classifier ids.
 */
export interface DocumentsClassifierListByIdsItems {
  items: DocumentsClassifierListByIds[];
}
export type DocumentsClassifierListByIdsRequest =
  DocumentsClassifierListByIdsItems & IgnoreUnknownIdsField;
export interface DocumentsClassifierMetrics {
  confusionMatrix?: number[][];
  /** @format float */
  f1Score?: number;
  labels?: string[];
  /** @format float */
  precision?: number;
  /** @format float */
  recall?: number;
}
export type DocumentsClassifiersCreateResponse =
  DocumentsClassifierCreateResponseItems & DocumentsNextCursor;
export type DocumentsClassifiersResponse = DocumentsClassifierItems &
  DocumentsNextCursor;
export interface DocumentsCountAggregate {
  /**
   * count
   * @example count
   */
  aggregate: string;
  /** List of fields to group the count by. It is currently only possible to group by 1 field or 0 fields. If grouping by 0 fields, the aggregate value is the total count of all documents. */
  groupBy?: string[];
  /** User defined name for this aggregate */
  name: string;
}
export interface DocumentsCursor {
  /** Cursor for paging through results. */
  cursor?: string;
}
export interface DocumentsDateHistogramAggregate {
  /**
   * dateHistogram
   * @example dateHistogram
   */
  aggregate: string;
  /**
   * Which field to create the date histogram on.
   * @example true
   */
  field: string;
  /** Date interval to use to create histogram, 'day', 'week', 'month', or 'year'. */
  interval: string;
  /** User defined name for this aggregate */
  name: string;
}
export interface DocumentsDeletePipelinesRequest {
  items?: {
    externalId?: CogniteExternalId;
  }[];
}
/**
 * Filter with exact match
 */
export interface DocumentsFilter {
  /** Only include files that reference these specific asset externalIds. */
  assetExternalIds?: AssetExternalIdsFilter;
  /** Only include files that reference these specific asset IDs. */
  assetIds?: AssetIdsFilter;
  /** Only include documents with a related asset in a subtree rooted at any of these asset IDs, including the roots given. Returns an error if the total size of the given subtrees exceeds 10,000 assets. Usage of this field requires `["assetsAcl:READ"]` capability. */
  assetSubtreeIds?: AssetSubtreeIdsFilter;
  /** Derived author of the file */
  author?: StringPredicate;
  /** Derived creation date of the file */
  createdTime?: EpochTimestampRange;
  /**
   * Extension of the file (case-insensitive)
   * @example pdf
   */
  extension?: StringPredicate;
  /** External Id provided by client */
  externalIdPrefix?: StringPredicate;
  /** Geometric shape and geoJson relation. The filtering here is done on the `geoLocation` of the file. */
  geoLocation?: DocumentGeoLocationFilter;
  /** Id of the file */
  id?: IntPredicate;
  /** Return only the resource matching the specified label constraints. */
  labels?: DocumentsLabelFilter;
  /** Derived langugage of the file */
  language?: StringPredicate;
  /** Derived MIME type of the file */
  mimeType?: StringPredicate;
  /** Number of pages for multi-page documents. */
  pageCount?: {
    max?: number;
    min?: number;
  };
  sourceFile?: DocumentsSourceFileFilter;
  /** The system the source file lives in */
  sourceSystem?: StringPredicate;
  /** Derived title of the file */
  title?: StringPredicate;
  /** Derived document type of the file */
  type?: StringPredicate;
}
/**
 * Filter with exact match
 */
export interface DocumentsFilterOption {
  /** Filter with exact match */
  filter?: DocumentsFilter;
}
export type DocumentsFilterRequest = DocumentsFilterOption &
  DocumentsLimit &
  DocumentsCursor;
export interface DocumentsFilterResponse
  extends CursorAndAsyncIterator<Document> {}
/**
 * Return only the resource matching the specified label constraints.
 */
export type DocumentsLabelFilter =
  | LabelContainsAllFilter
  | LabelContainsAnyFilter
  | ValueMissing;
export interface DocumentsLimit {
  /**
   * Maximum number of items.
   * @format int32
   * @min 1
   * @max 1000
   */
  limit?: number;
}
export interface DocumentsNextCursor {
  /** The cursor to get the next page of results (if available). */
  nextCursor?: string;
}
/**
 * The source file that this document is derived from.
 */
export interface DocumentSourceFile {
  /**
   * The ids of the assets related to this file
   * @example []
   */
  assetIds?: CogniteInternalId[];
  /**
   * The time the file was created
   * @format int64
   */
  createdTime?: number;
  /** The id if the dataset this file belongs to, if any */
  datasetId?: CogniteInternalId;
  /**
   * The directory the file can be found in
   * @example plays/shakespeare
   */
  directory?: string;
  /** GeoJson representation of a geometry. */
  geoLocation?: DocumentGeoLocation;
  /**
   * A list of labels associated with this document's source file in CDF.
   * @example [{"externalId":"play"},{"externalId":"tragedy"}]
   */
  labels?: LabelList;
  /**
   * The time the file was indexed
   * @format int64
   */
  lastIndexedTime?: number;
  /**
   * The last time the file was updated
   * @format int64
   */
  lastUpdatedTime?: number;
  metadata?: Record<string, string>;
  /**
   * The mime type of the file
   * @example application/octet-stream
   */
  mimeType?: string;
  /**
   * Name of the file
   * @example hamlet.txt
   */
  name: string;
  /**
   * The security category IDs required to access this file
   * @example []
   */
  securityCategories?: number[];
  /**
   * The size of the source file in bytes
   * @format int64
   * @example 1000
   */
  size?: number;
  /**
   * The source of the file
   * @example SubsurfaceConnectors
   */
  source?: string;
  /**
   * The last time the file was updated
   * @format int64
   */
  sourceCreatedTime?: number;
  /**
   * The last time the file was updated
   * @format int64
   */
  sourceModifiedTime?: number;
  /**
   * The last time the file was updated
   * @format int64
   */
  uploadedTime?: number;
}
export interface DocumentsPipeline {
  classifier?: DocumentsPipelineClassifier;
  /** External Id provided by client. Should be unique within a given project/resource combination. */
  externalId?: CogniteExternalId;
  sensitivityMatcher?: DocumentsPipelineSensitivityMatcher;
}
export type DocumentsPipelineArrayOf1To10ExternalIds = CogniteExternalId[];
export type DocumentsPipelineArrayOf1To10ExternalIdsUpdate =
  | {
      set: DocumentsPipelineArrayOf1To10ExternalIds;
    }
  | {
      add?: DocumentsPipelineArrayOf1To10ExternalIds;
      remove?: DocumentsPipelineArrayOf1To10ExternalIds;
    };
export type DocumentsPipelineArrayOf1To10Strings = string[];
export type DocumentsPipelineArrayOf1To10StringsUpdate =
  | {
      set: DocumentsPipelineArrayOf1To10Strings;
    }
  | {
      add?: DocumentsPipelineArrayOf1To10Strings;
      remove?: DocumentsPipelineArrayOf1To10Strings;
    };
export interface DocumentsPipelineClassifier {
  /** A server-generated ID for the object. */
  activeClassifierId?: CogniteInternalId;
  /**
   * Timestamp when the classifier was last trained
   * @format int64
   */
  lastTrainedAt?: number;
  /** A descriptive name of the classifier. */
  name?: string;
  /** A list of the labels associated with this resource item. */
  trainingLabels?: LabelList;
}
export type DocumentsPipelineClassifierUpdate =
  | {
      set: DocumentsPipelineClassifier;
    }
  | {
      modify: {
        name?: {
          set: string;
        };
        trainingLabels?: unknown;
        activeClassifierId?:
          | {
              set: CogniteInternalId;
            }
          | {
              setNull: boolean;
            };
      };
    };
/**
 * @example {"title":["TERMS"],"author":["TERMS"],"type":["TERMS","TYPES"],"sourceFile":{"name":["TERMS"],"content":["TERMS","TYPES"],"directory":["DIRECTORIES"]}}
 */
export interface DocumentsPipelineFieldMappings {
  author?: DocumentsPipelineArrayOf1To10Strings;
  labelsExternalIds?: DocumentsPipelineArrayOf1To10ExternalIds;
  mimeType?: DocumentsPipelineArrayOf1To10Strings;
  sourceFile?: DocumentsPipelineSourceFile;
  title?: DocumentsPipelineArrayOf1To10Strings;
  type?: DocumentsPipelineArrayOf1To10Strings;
}
/**
 * A list of pipeline configuration objects.
 */
export interface DocumentsPipelineItems {
  items?: DocumentsPipeline[];
}
/**
 * A list of update pipeline configuration objects.
 */
export interface DocumentsPipelineItemsUpdate {
  items: DocumentsPipelineUpdate[];
}
export interface DocumentsPipelineSensitivityMatcher {
  fieldMappings?: DocumentsPipelineFieldMappings;
  /** Whether or not a file is marked sensitive if it contains text that looks like a password. */
  filterPasswords?: boolean;
  /**
   * Dictionary object. Name of match lists as keys, lists of matching words as values.
   * @example {"DIRECTORIES":["secret"],"TYPES":["contracts","emails"],"TERMS":["secret","confidential","sensitive"]}
   */
  matchLists?: Record<string, string[]>;
  /** Only documents from these sources will be evaluated if they are sensitive. If the field is empty, all documents will be evaluated. */
  restrictToSources?: string[];
  /**
   * The security category id to attach to sensitive documents.
   * @format int64
   * @example 345341343656745
   */
  sensitiveSecurityCategory?: number;
}
export type DocumentsPipelineSensitivityMatcherUpdate =
  | {
      set: DocumentsPipelineSensitivityMatcher;
    }
  | {
      modify: {
        fieldMappings?: SensitivityMatcherFieldMappingsUpdate;
        matchLists?:
          | {
              set: Record<string, string[]>;
            }
          | {
              add?: Record<string, string[]>;
              remove?: string[];
            };
        filterPasswords?: {
          set: boolean;
        };
        sensitiveSecurityCategory?:
          | {
              set: number;
            }
          | {
              setNull: boolean;
            };
        restrictToSources?:
          | {
              set: string[];
            }
          | {
              add?: string[];
              remove?: string[];
            };
      };
    };
export interface DocumentsPipelineSourceFile {
  content?: DocumentsPipelineArrayOf1To10Strings;
  directory?: DocumentsPipelineArrayOf1To10Strings;
  metadata?: Record<string, DocumentsPipelineArrayOf1To10Strings>;
  name?: DocumentsPipelineArrayOf1To10Strings;
}
export type DocumentsPipelineSourceFileUpdate =
  | {
      set: DocumentsPipelineSourceFile;
    }
  | {
      modify: {
        name?: DocumentsPipelineArrayOf1To10StringsUpdate;
        directory?: DocumentsPipelineArrayOf1To10StringsUpdate;
        content?: DocumentsPipelineArrayOf1To10StringsUpdate;
        metadata?:
          | {
              set: Record<string, string[]>;
            }
          | {
              add?: Record<string, string[]>;
              remove?: string[];
            };
      };
    };
export type DocumentsPipelinesResponse = DocumentsPipelineItems;
export interface DocumentsPipelineUpdate {
  /** External Id provided by client. Should be unique within a given project/resource combination. */
  externalId: CogniteExternalId;
  update: {
    sensitivityMatcher?: DocumentsPipelineSensitivityMatcherUpdate;
    classifier?: DocumentsPipelineClassifierUpdate;
  };
}
export interface DocumentsSearch {
  search?: {
    query?: string;
    highlight?: boolean;
  };
}
export interface DocumentsSearchLimit {
  /**
   * Maximum number of items.
   * @format int32
   * @min 0
   * @max 1000
   */
  limit?: number;
}
export type DocumentsSearchRequest = DocumentsFilterOption &
  DocumentsSearch &
  DocumentsAggregates &
  DocumentsSort &
  DocumentsSearchLimit;
export interface DocumentsSearchResponse {
  aggregates?: {
    name: string;
    groups: {
      group?: (object | LabelDefinitionExternalId)[];
      value?: number;
    }[];
    total: number;
  }[];
  items: {
    highlight?: Highlight;
    item: Document;
  }[];
}
export interface DocumentsSort {
  /**
   * List of fields to sort by, currently only supports 1 field.
   * Syntax: `["<fieldname>:asc|desc"]`. Default sort order is `asc` with short syntax `["<fieldname>"]`.
   *
   * @example ["externalId:desc"]
   */
  sort?: string[];
}
export interface DocumentsSourceFileFilter {
  /** Only include files that reference these specific asset externalIds. */
  assetExternalIds?: AssetExternalIdsFilter;
  /** Only include files that reference these specific asset IDs. */
  assetIds?: AssetIdsFilter;
  /** Only include documents with a related asset in a subtree rooted at any of these asset IDs, including the roots given. Returns an error if the total size of the given subtrees exceeds 10,000 assets. Usage of this field requires `["assetsAcl:READ"]` capability. */
  assetSubtreeIds?: AssetSubtreeIdsFilter;
  /** Range between two timestamps. */
  createdTime?: EpochTimestampRange;
  /** Data set id of the file */
  datasetId?: IntPredicate;
  /** The name of the directory holding the file */
  directoryPrefix?: StringPredicate;
  /** Geometric shape and geoJson relation. The filtering here is done on the `geoLocation` of the file. */
  geoLocation?: DocumentGeoLocationFilter;
  /** Return only the resource matching the specified label constraints. */
  labels?: DocumentsLabelFilter;
  /** Range between two timestamps. */
  lastUpdatedTime?: EpochTimestampRange;
  /** Custom, application specific metadata. String key -> String value. Limits: Maximum length of key is 32 bytes, value 512 bytes, up to 16 key-value pairs. */
  metadata?: Record<string, string>;
  /** MIME type of the file, e.g. `text/plain`, `application/pdf` */
  mimeType?: StringPredicate;
  /** Name of the file */
  name?: StringPredicate;
  /** Range between two integers. */
  size?: {
    max?: number;
    min?: number;
  };
  /** The source of the file */
  source?: StringPredicate;
  /** Range between two timestamps. */
  sourceCreatedTime?: EpochTimestampRange;
  /** Range between two timestamps. */
  sourceModifiedTime?: EpochTimestampRange;
  /** Range between two timestamps. */
  uploadedTime?: EpochTimestampRange;
}
/**
 * A temporary link to download a preview of the document.
 */
export interface DocumentsTemporaryPreviewLinkResponse {
  temporaryLink?: string;
}
/**
 * The number of milliseconds since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
 * @format int64
 * @min 0
 * @example 1638795554528
 */
export type EpochTimestamp = number;
/**
 * Range between two timestamps.
 */
export interface EpochTimestampRange {
  /** The number of milliseconds since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds. */
  max?: EpochTimestamp;
  /** The number of milliseconds since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds. */
  min?: EpochTimestamp;
}
/**
 * What to do with the label on the file
 */
export type FeedbackAction = 'ATTACH' | 'DETACH';
/**
 * Server-generated identifier for the feedback object
 * @example 42
 */
export type FeedbackId = CogniteInternalId;
/**
 * Label to add to, or remove from a file
 */
export type FeedbackLabel = LabelDefinitionExternalId;
/**
* Status of the feedback, complying with the lifecycle described below.

## Feedback lifecycle
- It is initially `CREATED`.
- If the administrator accepts the feedback, it moves to `ACCEPTED`.
  Once in this state, it cannot move to another state.
- If the administrator rejects the feedback, it moves to `REJECTED`.
  Once in this state, it cannot move to another state.
- If the feedback object has become _invalid_, it moves to `STALE`.
  Once in this state, it cannot move to another state.

## Definition of feedback _invalidity_
- If the action was `ATTACH`, and the label to attach does not exist anymore.
- If the action was `ATTACH`, and the label is already attached to the file.
- If the action was `DETACH`, and the label is not attached to the file anymore.
* @example ACCEPTED
*/
export type FeedbackStatus = 'CREATED' | 'ACCEPTED' | 'REJECTED' | 'STALE';
export interface FeedbackStatusQueryParameter {
  /**
   * Status of the feedback, complying with the lifecycle described below.
   *
   * ## Feedback lifecycle
   * - It is initially `CREATED`.
   * - If the administrator accepts the feedback, it moves to `ACCEPTED`.
   *   Once in this state, it cannot move to another state.
   * - If the administrator rejects the feedback, it moves to `REJECTED`.
   * - If the feedback object has become _invalid_, it moves to `STALE`.
   * ## Definition of feedback _invalidity_
   * - If the action was `ATTACH`, and the label to attach does not exist anymore.
   * - If the action was `ATTACH`, and the label is already attached to the file.
   * - If the action was `DETACH`, and the label is not attached to the file anymore.
   */
  status?: FeedbackStatus;
}
export interface GeometryCollection {
  /** Coordinates of the shape. */
  coordinates?: ShapeCoordinates;
  /** Type of the shape. Currently we support "polygon", "linestring" and "point". */
  type?: ShapeType;
}
/**
 * Highlighted snippets from content, name and externalId fields which show where the query matches are.
 */
export interface Highlight {
  /** Matches in content. */
  content?: string[];
  /** Matches in name. */
  name?: string[];
}
export interface IgnoreUnknownIdsField {
  /** Ignore IDs that are not found */
  ignoreUnknownIds?: boolean;
}
export interface IllegalAcceptHeaderErrorResponse {
  error: unknown;
}
export interface IntEquals {
  /** Int value must match this value */
  equals: number;
}
export interface IntIn {
  /** Int value must be a value in this array */
  in: number[];
}
export type IntPredicate = IntIn | IntEquals | ValueMissing;
/**
 * A label assigned to a resource.
 */
export interface Label {
  /** An external ID to a predefined label definition. */
  externalId: CogniteExternalId;
}
export interface LabelContainsAllFilter {
  /** The resource item contains at least all the listed labels. */
  containsAll: Label[];
}
export interface LabelContainsAnyFilter {
  /** The resource item contains at least one of the listed labels. */
  containsAny: Label[];
}
export interface LabelDefinitionExternalId {
  /** External Id provided by client. Should be unique within a given project/resource combination. */
  externalId: CogniteExternalId;
}
/**
 * A list of the labels associated with this resource item.
 */
export type LabelList = Label[];
export type LabelListUpdate =
  | {
      set: LabelList;
    }
  | {
      add?: LabelList;
      remove?: LabelList;
    };
/**
 * Spatial relation which will be used at search time. Currently we support `intersects`, `disjoint`, and `within`. For guidance regarding relations, see [this Wikipedia article](https://en.wikipedia.org/wiki/Spatial_relation#Topological_relations).
 */
export type Relation = string;
/**
* **Optional** information about the reporter. This could be a name
or an email. Please note that this field is free text – it is not
checked for integrity at any time.
* @example Jane Doe
*/
export type ReporterInfo = string | null;
export type SensitivityMatcherFieldMappingsUpdate =
  | {
      set: DocumentsPipelineFieldMappings;
    }
  | {
      modify: {
        title?: DocumentsPipelineArrayOf1To10StringsUpdate;
        author?: DocumentsPipelineArrayOf1To10StringsUpdate;
        mimeType?: DocumentsPipelineArrayOf1To10StringsUpdate;
        type?: DocumentsPipelineArrayOf1To10StringsUpdate;
        labelsExternalIds?: DocumentsPipelineArrayOf1To10ExternalIdsUpdate;
        sourceFile?: DocumentsPipelineSourceFileUpdate;
      };
    };
/**
 * Coordinates of the shape.
 */
export type ShapeCoordinates = unknown[];
/**
 * Type of the shape. Currently we support "polygon", "linestring" and "point".
 */
export type ShapeType = string;
export interface StringEquals {
  /** String value must match this value */
  equals: string;
}
export interface StringIn {
  /** String value must be a value in this array */
  in: string[];
}
export type StringPredicate = StringIn | StringEquals | ValueMissing;
export interface UnprocessableEntityErrorResponse {
  error: unknown;
}
export interface ValueMissing {
  /** Value for the field is missing */
  missing: boolean;
}
