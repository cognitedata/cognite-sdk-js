export type DocumentsSearchRequest = DocumentsFilterOption &
  DocumentsSearch &
  DocumentsAggregates &
  DocumentsSort &
  DocumentsSearchLimit;

export type DocumentsFilterRequest = DocumentsFilterOption &
  DocumentsLimit &
  Cursor;

export type DocumentContentRequest = DocumentContentRequestItems &
  IgnoreUnknownIdsField;

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

/**
 * External Id provided by client. Should be unique within a given project/resource combination.
 */
export type CogniteExternalId = string;

/**
 * A list of feedback objects, not yet written to the API
 */
export interface DocumentFeedbackCreateRequest {
  items: DocumentFeedbackCreateItem[];
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

/**
 * A query object for the accept/reject endpoints
 */
export interface DocumentFeedbackAcceptRejectRequest {
  items: DocumentFeedbackAcceptRejectItem[];
}

/**
 * A list of classifiers.
 */
export interface DocumentsClassifierCreateItems {
  items: DocumentsClassifierCreate[];
}

export type DocumentsClassifierListByIdsRequest =
  DocumentsClassifierListByIdsItems & IgnoreUnknownIdsField;

export type DocumentsClassifierDeleteRequest = DocumentsClassifierDeleteItems &
  IgnoreUnknownIdsField;

/**
 * Filter with exact match
 */
export interface DocumentsFilterOption {
  /** Filter with exact match */
  filter?: DocumentsFilter;
}

export interface DocumentsSearch {
  search?: { query?: string; highlight?: boolean };
}

export interface DocumentsAggregates {
  aggregates?: (DocumentsCountAggregate | DocumentsDateHistogramAggregate)[];
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

export interface DocumentsSearchLimit {
  /**
   * Maximum number of items.
   * @format int32
   * @min 0
   * @max 1000
   */
  limit?: number;
}

/**
 * Highlighted snippets from content, name and externalId fields which show where the query matches are.
 */
export interface Highlight {
  /** Matches in name. */
  name?: string[];

  /** Matches in content. */
  content?: string[];
}

/**
 * A document
 */
export interface Document {
  /**
   * Internal ID of the CDF file/document
   * @example 1
   */
  id: DocumentId;

  /**
   * External Id provided by client. Should be unique within a given project/resource combination.
   * @example haml001
   */
  externalId?: CogniteExternalId;

  /**
   * The title of the document
   * @example Hamlet
   */
  title?: string;

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

  /**
   * Detected mime type for the document
   * @example text/plain
   */
  type?: string;

  /**
   * The detected language used in the document
   * @example en
   */
  language?: string;

  /**
   * The textual content of the document, truncated to about 1MB
   * @example ACT I
   * SCENE I. Elsinore. A platform before the castle.
   *   FRANCISCO at his post. Enter to him BERNARDO
   * BERNARDO
   *   Who's there?
   *
   */
  truncatedContent?: string;

  /**
   * The ids of any assets referred to in the document
   * @example [42,101]
   */
  assetIds?: CogniteInternalId[];

  /**
   * A list of labels derived by this pipeline's document classifier.
   * @example [{"externalId":"play"},{"externalId":"tragedy"}]
   */
  labels?: LabelList;

  /** @example CDF */
  sourceSystem?: string;

  /** The source file that this document is derived from. */
  sourceFile: DocumentSourceFile;

  /** GeoJson representation of a geometry. */
  geoLocation?: DocumentGeoLocation;
}

export interface LabelDefinitionExternalId {
  /** External Id provided by client. Should be unique within a given project/resource combination. */
  externalId: CogniteExternalId;
}

export interface DocumentsLimit {
  /**
   * Maximum number of items.
   * @format int32
   * @min 1
   * @max 1000
   */
  limit?: number;
}

export interface Cursor {
  /** Cursor for paging through results. */
  cursor?: string;
}

export interface DocumentContentRequestItems {
  items: DocumentContentItem[];
}

export interface IgnoreUnknownIdsField {
  /** Ignore IDs that are not found */
  ignoreUnknownIds?: boolean;
}

export interface DocumentContent {
  /** Internal ID of the CDF file/document */
  id: DocumentId;

  /** External Id provided by client. Should be unique within a given project/resource combination. */
  externalId?: CogniteExternalId;

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
}

export interface DocumentsPipeline {
  /** External Id provided by client. Should be unique within a given project/resource combination. */
  externalId?: CogniteExternalId;
  sensitivityMatcher?: DocumentsPipelineSensitivityMatcher;
  classifier?: DocumentsPipelineClassifier;
}

export interface DocumentsPipelineUpdate {
  /** External Id provided by client. Should be unique within a given project/resource combination. */
  externalId: CogniteExternalId;
  update: {
    sensitivityMatcher?: DocumentsPipelineSensitivityMatcherUpdate;
    classifier?: DocumentsPipelineClassifierUpdate;
  };
}

/**
 * A new feedback object, not yet written to the API
 */
export interface DocumentFeedbackCreateItem {
  /** Internal ID of the CDF file/document */
  documentId: DocumentId;

  /** Label to add to, or remove from a file */
  label: FeedbackLabel;

  /** What to do with the label on the file */
  action: FeedbackAction;

  /**
   * **Optional** information about the reporter. This could be a name
   * or an email. Please note that this field is free text – it is not
   * checked for integrity at any time.
   */
  reporterInfo?: ReporterInfo;
}

/**
 * Internal ID of the CDF file/document
 * @example 1066
 */
export type DocumentId = CogniteInternalId;

/**
 * Label to add to, or remove from a file
 */
export type FeedbackLabel = LabelDefinitionExternalId;

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
* **Optional** information about the reporter. This could be a name
or an email. Please note that this field is free text – it is not
checked for integrity at any time.
* @example Jane Doe
*/
export type ReporterInfo = string | null;

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

/**
 * A feedback object
 */
export interface DocumentFeedback {
  /** Internal ID of the CDF file/document */
  documentId: DocumentId;

  /** Label to add to, or remove from a file */
  label: FeedbackLabel;

  /** What to do with the label on the file */
  action: FeedbackAction;

  /** Server-generated identifier for the feedback object */
  feedbackId: FeedbackId;

  /**
   * **Optional** information about the reporter. This could be a name
   * or an email. Please note that this field is free text – it is not
   * checked for integrity at any time.
   */
  reporterInfo?: ReporterInfo;

  /**
   * When this feedback object was created by the end-user.
   *
   * A UTC-based [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) timestamp string.
   * @example 2021-02-04T16:24:23.284407
   */
  createdAt: string;

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
  /** A value of the `field` */
  value: string;

  /** The count of records with the `value` for the `field` */
  count: number;
}

/**
 * An id of the accepted / rejected feedback
 */
export interface DocumentFeedbackAcceptRejectItem {
  /** Server-generated identifier for the feedback object */
  id: FeedbackId;
}

export interface DocumentsClassifierCreate {
  name: string;
}

/**
 * A list of classifiers.
 */
export interface DocumentsClassifierItems {
  items: DocumentsClassifier[];
}

/**
 * A list of classifier ids.
 */
export interface DocumentsClassifierListByIdsItems {
  items: DocumentsClassifierListByIds[];
}

/**
 * A list of classifier ids.
 */
export interface DocumentsClassifierDeleteItems {
  items: DocumentsClassifierDelete[];
}

/**
 * Filter with exact match
 */
export interface DocumentsFilter {
  /** Id of the file */
  id?: IntPredicate;

  /** External Id provided by client */
  externalIdPrefix?: StringPredicate;

  /** Derived title of the file */
  title?: StringPredicate;

  /** Derived author of the file */
  author?: StringPredicate;

  /** Derived creation date of the file */
  createdTime?: EpochTimestampRange;

  /** Derived MIME type of the file */
  mimeType?: StringPredicate;

  /** Number of pages for multi-page documents. */
  pageCount?: { max?: number; min?: number };

  /** Derived document type of the file */
  type?: StringPredicate;

  /** Derived langugage of the file */
  language?: StringPredicate;

  /** Only include files that reference these specific asset IDs. */
  assetIds?: AssetIdsFilter;

  /** Only include files that reference these specific asset externalIds. */
  assetExternalIds?: AssetExternalIdsFilter;

  /** Only include documents with a related asset in a subtree rooted at any of these asset IDs, including the roots given. Returns an error if the total size of the given subtrees exceeds 10,000 assets. Usage of this field requires `["assetsAcl:READ"]` capability. */
  assetSubtreeIds?: AssetSubtreeIdsFilter;

  /** The system the source file lives in */
  sourceSystem?: StringPredicate;

  /** Return only the resource matching the specified label constraints. */
  labels?: LabelFilter;

  /** Geometric shape and geoJson relation. The filtering here is done on the `geoLocation` of the file. */
  geoLocation?: DocumentGeoLocationFilter;
  sourceFile?: DocumentsSourceFileFilter;
}

export interface DocumentsCountAggregate {
  /** User defined name for this aggregate */
  name: string;

  /**
   * count
   * @example count
   */
  aggregate: string;

  /** List of fields to group the count by. It is currently only possible to group by 1 field or 0 fields. If grouping by 0 fields, the aggregate value is the total count of all documents. */
  groupBy?: string[];
}

export interface DocumentsDateHistogramAggregate {
  /** User defined name for this aggregate */
  name: string;

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
}

/**
 * The number of milliseconds since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
 * @format int64
 * @min 0
 * @example 1638795554528
 */
export type EpochTimestamp = number;

/**
 * A server-generated ID for the object.
 * @format int64
 * @min 1
 * @max 9007199254740991
 */
export type CogniteInternalId = number;

/**
 * A list of the labels associated with this resource item.
 */
export type LabelList = Label[];

/**
 * The source file that this document is derived from.
 */
export interface DocumentSourceFile {
  /**
   * Name of the file
   * @example hamlet.txt
   */
  name: string;

  /**
   * Extension of the file (case-insensitive)
   * @example pdf
   */
  extension?: string;

  /**
   * The directory the file can be found in
   * @example plays/shakespeare
   */
  directory?: string;

  /**
   * The source of the file
   * @example SubsurfaceConnectors
   */
  source?: string;

  /**
   * The mime type of the file
   * @example application/octet-stream
   */
  mimeType?: string;

  /**
   * The size of the source file in bytes
   * @format int64
   * @example 1000
   */
  size?: number;

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

  /**
   * The last time the file was updated
   * @format int64
   */
  uploadedTime?: number;

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
   * A list of labels associated with this document's source file in CDF.
   * @example [{"externalId":"play"},{"externalId":"tragedy"}]
   */
  labels?: LabelList;

  /** GeoJson representation of a geometry. */
  geoLocation?: DocumentGeoLocation;

  /** The id if the dataset this file belongs to, if any */
  datasetId?: CogniteInternalId;

  /**
   * The security category IDs required to access this file
   * @example []
   */
  securityCategories?: number[];
  metadata?: Record<string, string>;
}

/**
 * GeoJson representation of a geometry.
 */
export interface DocumentGeoLocation {
  /** Type of the shape. Currently we support "polygon", "linestring" and "point". */
  type?: ShapeType;

  /** Coordinates of the shape. */
  coordinates?: ShapeCoordinates;
  geometries?: GeometryCollection[];
}

export type DocumentContentItem =
  | { id?: DocumentId }
  | { externalId?: CogniteExternalId };

export interface DocumentsPipelineSensitivityMatcher {
  /**
   * Dictionary object. Name of match lists as keys, lists of matching words as values.
   * @example {"DIRECTORIES":["secret"],"TYPES":["contracts","emails"],"TERMS":["secret","confidential","sensitive"]}
   */
  matchLists?: Record<string, string[]>;
  fieldMappings?: DocumentsPipelineFieldMappings;

  /** Whether or not a file is marked sensitive if it contains text that looks like a password. */
  filterPasswords?: boolean;

  /**
   * The security category id to attach to sensitive documents.
   * @format int64
   * @example 345341343656745
   */
  sensitiveSecurityCategory?: number;

  /** Only documents from these sources will be evaluated if they are sensitive. If the field is empty, all documents will be evaluated. */
  restrictToSources?: string[];
}

export interface DocumentsPipelineClassifier {
  /** A descriptive name of the classifier. */
  name?: string;

  /** A list of the labels associated with this resource item. */
  trainingLabels?: LabelList;

  /** A server-generated ID for the object. */
  activeClassifierId?: CogniteInternalId;

  /**
   * Timestamp when the classifier was last trained
   * @format int64
   */
  lastTrainedAt?: number;
}

export type DocumentsPipelineSensitivityMatcherUpdate =
  | { set: DocumentsPipelineSensitivityMatcher }
  | {
      modify: {
        fieldMappings?: SensitivityMatcherFieldMappingsUpdate;
        matchLists?:
          | { set: Record<string, string[]> }
          | { add?: Record<string, string[]>; remove?: string[] };
        filterPasswords?: { set: boolean };
        sensitiveSecurityCategory?: { set: number } | { setNull: boolean };
        restrictToSources?:
          | { set: string[] }
          | { add?: string[]; remove?: string[] };
      };
    };

export type DocumentsPipelineClassifierUpdate =
  | { set: DocumentsPipelineClassifier }
  | {
      modify: {
        name?: { set: string };
        trainingLabels?: any;
        activeClassifierId?: { set: CogniteInternalId } | { setNull: boolean };
      };
    };

export interface DocumentsClassifier {
  /** Project id */
  projectId: CogniteInternalId;

  /** Name of the classifier */
  name: string;

  /**
   * Timestamp when the classifier is created
   * @format int64
   */
  createdAt: number;

  /** Status of the creating classifier job. Can be one of `QUEUING`, `TRAINING`, `FINISHED`, `FAILED` */
  status: string;

  /** Whether the classifier is currently used for predicting labels */
  active: boolean;

  /** Classifier id */
  id: CogniteInternalId;
  metrics?: DocumentsClassifierMetrics;

  /**
   * The number of documents used for training the classifier
   * @format int64
   */
  trainingSetSize?: number;
}

export interface DocumentsClassifierListByIds {
  /** A server-generated ID for the object. */
  id?: CogniteInternalId;
}

export interface DocumentsClassifierDelete {
  /** A server-generated ID for the object. */
  id: CogniteInternalId;
}

export type IntPredicate = IntIn | IntEquals | ValueMissing;

export type StringPredicate = StringIn | StringEquals | ValueMissing;

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
 * Only include files that reference these specific asset IDs.
 */
export type AssetIdsFilter = ContainsAllIds | ContainsAnyId | ValueMissing;

/**
 * Only include files that reference these specific asset externalIds.
 */
export type AssetExternalIdsFilter =
  | ContainsAllExternalIds
  | ContainsAnyExternalIds;

/**
 * Only include documents with a related asset in a subtree rooted at any of these asset IDs, including the roots given. Returns an error if the total size of the given subtrees exceeds 10,000 assets. Usage of this field requires `["assetsAcl:READ"]` capability.
 */
export type AssetSubtreeIdsFilter = ContainsAnyId | ValueMissing;

/**
 * Return only the resource matching the specified label constraints.
 */
export type LabelFilter = LabelContainsAnyFilter | LabelContainsAllFilter;

/**
 * Filter on files which have the specified spatial relation with the specified geometry shape.
 */
export type DocumentGeoLocationFilter =
  | ValueMissing
  | { shape: DocumentGeoLocation; relation?: Relation };

export interface DocumentsSourceFileFilter {
  /** Name of the file */
  name?: StringPredicate;

  /**
   * Extension of the file (always in lowercase)
   * @example pdf
   */
  extension?: StringPredicate;

  /** The name of the directory holding the file */
  directoryPrefix?: StringPredicate;

  /** The source of the file */
  source?: StringPredicate;

  /** MIME type of the file, e.g. `text/plain`, `application/pdf` */
  mimeType?: StringPredicate;

  /** Range between two integers. */
  size?: { max?: number; min?: number };

  /** Only include files that reference these specific asset IDs. */
  assetIds?: AssetIdsFilter;

  /** Only include files that reference these specific asset externalIds. */
  assetExternalIds?: AssetExternalIdsFilter;

  /** Only include documents with a related asset in a subtree rooted at any of these asset IDs, including the roots given. Returns an error if the total size of the given subtrees exceeds 10,000 assets. Usage of this field requires `["assetsAcl:READ"]` capability. */
  assetSubtreeIds?: AssetSubtreeIdsFilter;

  /** Range between two timestamps. */
  uploadedTime?: EpochTimestampRange;

  /** Range between two timestamps. */
  createdTime?: EpochTimestampRange;

  /** Range between two timestamps. */
  sourceCreatedTime?: EpochTimestampRange;

  /** Range between two timestamps. */
  sourceModifiedTime?: EpochTimestampRange;

  /** Range between two timestamps. */
  lastUpdatedTime?: EpochTimestampRange;

  /** Return only the resource matching the specified label constraints. */
  labels?: LabelFilter;

  /** Geometric shape and geoJson relation. The filtering here is done on the `geoLocation` of the file. */
  geoLocation?: DocumentGeoLocationFilter;

  /** Data set id of the file */
  datasetId?: IntPredicate;

  /** Custom, application specific metadata. String key -> String value. Limits: Maximum length of key is 32 bytes, value 512 bytes, up to 16 key-value pairs. */
  metadata?: Record<string, string>;
}

/**
 * A label assigned to a resource.
 */
export interface Label {
  /** An external ID to a predefined label definition. */
  externalId: CogniteExternalId;
}

/**
 * Type of the shape. Currently we support "polygon", "linestring" and "point".
 */
export type ShapeType = string;

/**
 * Coordinates of the shape.
 */
export type ShapeCoordinates = any[];

export interface GeometryCollection {
  /** Type of the shape. Currently we support "polygon", "linestring" and "point". */
  type?: ShapeType;

  /** Coordinates of the shape. */
  coordinates?: ShapeCoordinates;
}

/**
 * @example {"title":["TERMS"],"author":["TERMS"],"type":["TERMS","TYPES"],"sourceFile":{"name":["TERMS"],"content":["TERMS","TYPES"],"directory":["DIRECTORIES"]}}
 */
export interface DocumentsPipelineFieldMappings {
  title?: DocumentsPipelineArrayOf1To10Strings;
  author?: DocumentsPipelineArrayOf1To10Strings;
  mimeType?: DocumentsPipelineArrayOf1To10Strings;
  type?: DocumentsPipelineArrayOf1To10Strings;
  labelsExternalIds?: DocumentsPipelineArrayOf1To10ExternalIds;
  sourceFile?: DocumentsPipelineSourceFile;
}

export type SensitivityMatcherFieldMappingsUpdate =
  | { set: DocumentsPipelineFieldMappings }
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

export type LabelListUpdate =
  | { set: LabelList }
  | { add?: LabelList; remove?: LabelList };

export interface DocumentsClassifierMetrics {
  /** @format float */
  precision?: number;

  /** @format float */
  recall?: number;

  /** @format float */
  f1Score?: number;
  confusionMatrix?: number[][];
  labels?: string[];
}

export interface IntIn {
  /** Int value must be a value in this array */
  in: number[];
}

export interface IntEquals {
  /** Int value must match this value */
  equals: number;
}

export interface ValueMissing {
  /** Value for the field is missing */
  missing: boolean;
}

export interface StringIn {
  /** String value must be a value in this array */
  in: string[];
}

export interface StringEquals {
  /** String value must match this value */
  equals: string;
}

export interface ContainsAllIds {
  /** Values for this field must match all values in this array */
  containsAll?: CogniteInternalId[];
}

export interface ContainsAnyId {
  /** Values for this field must match with at least one of the values in this array */
  containsAny?: CogniteInternalId[];
}

export interface ContainsAllExternalIds {
  /** Values for this field must match all values in this array */
  containsAll?: CogniteExternalId[];
}

export interface ContainsAnyExternalIds {
  /** Values for this field must match with at least one of the values in this array */
  containsAny?: CogniteExternalId[];
}

export interface LabelContainsAnyFilter {
  /** The resource item contains at least one of the listed labels. */
  containsAny: Label[];
}

export interface LabelContainsAllFilter {
  /** The resource item contains at least all the listed labels. */
  containsAll: Label[];
}

/**
 * Spatial relation which will be used at search time. Currently we support `intersects`, `disjoint`, and `within`. For guidance regarding relations, see [this Wikipedia article](https://en.wikipedia.org/wiki/Spatial_relation#Topological_relations).
 */
export type Relation = string;

export type DocumentsPipelineArrayOf1To10Strings = string[];

export type DocumentsPipelineArrayOf1To10ExternalIds = CogniteExternalId[];

export interface DocumentsPipelineSourceFile {
  name?: DocumentsPipelineArrayOf1To10Strings;
  directory?: DocumentsPipelineArrayOf1To10Strings;
  content?: DocumentsPipelineArrayOf1To10Strings;
  metadata?: Record<string, DocumentsPipelineArrayOf1To10Strings>;
}

export type DocumentsPipelineArrayOf1To10StringsUpdate =
  | { set: DocumentsPipelineArrayOf1To10Strings }
  | {
      add?: DocumentsPipelineArrayOf1To10Strings;
      remove?: DocumentsPipelineArrayOf1To10Strings;
    };

export type DocumentsPipelineArrayOf1To10ExternalIdsUpdate =
  | { set: DocumentsPipelineArrayOf1To10ExternalIds }
  | {
      add?: DocumentsPipelineArrayOf1To10ExternalIds;
      remove?: DocumentsPipelineArrayOf1To10ExternalIds;
    };

export type DocumentsPipelineSourceFileUpdate =
  | { set: DocumentsPipelineSourceFile }
  | {
      modify: {
        name?: DocumentsPipelineArrayOf1To10StringsUpdate;
        directory?: DocumentsPipelineArrayOf1To10StringsUpdate;
        content?: DocumentsPipelineArrayOf1To10StringsUpdate;
        metadata?:
          | { set: Record<string, string[]> }
          | { add?: Record<string, string[]>; remove?: string[] };
      };
    };

export interface DocumentsSearchResponse {
  items: { highlight?: Highlight; item: Document }[];
  aggregates?: {
    name: string;
    groups: {
      group?: (object | LabelDefinitionExternalId)[];
      value?: number;
    }[];
    total: number;
  }[];
}

export interface DocumentsFilterResponse {
  items: Document[];

  /** The cursor to get the next page of results (if available). */
  nextCursor?: string;
}

export interface DocumentContentResponse {
  items: DocumentContent[];
}

export type DocumentsPipelinesResponse = DocumentsPipelineItems;

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
 * A temporary link to download a preview of the document.
 */
export interface DocumentsTemporaryPreviewLinkResponse {
  temporaryLink?: string;
}

export type DocumentsClassifiersResponse = DocumentsClassifierItems;

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