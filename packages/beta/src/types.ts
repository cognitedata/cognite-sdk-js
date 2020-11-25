// Copyright 2020 Cognite AS

import {
  CogniteExternalId,
  CogniteInternalId,
  CreatedAndLastUpdatedTimeFilter,
  DateRange,
  FilterQuery,
  IdEither,
  Label,
  Timestamp,
  Range,
  LabelFilter,
  SinglePatchString,
  CreatedAndLastUpdatedTime,
} from '@cognite/sdk';

// This file is here mostly to allow apis to import { ... } from '../../types';
// Overriding types should probably be done in their respective API endpoint files, where possible

export type RelationshipResourceType =
  | 'asset'
  | 'timeSeries'
  | 'file'
  | 'event'
  | 'sequence';

export interface ExternalRelationship {
  /**
   * External id of the relationship, must be unique within the project
   */
  externalId: CogniteExternalId;
  /**
   * External id of the CDF resource that constitutes the relationship source
   */
  sourceExternalId: CogniteExternalId;
  /**
   * Enum: "asset" "timeSeries" "file" "event" "sequence".
   * The CDF resource type of the relationship source. Must be one of the specified values.
   */
  sourceType: RelationshipResourceType;
  /**
   * External id of the CDF resource that constitutes the relationship target.
   */
  targetExternalId: CogniteExternalId;
  /**
   * Enum: "asset" "timeSeries" "file" "event" "sequence".
   * The CDF resource type of the relationship target. Must be one of the specified values.
   */
  targetType: RelationshipResourceType;
  /**
   * Time when the relationship became active.
   * If there is no startTime, relationship is active from the beginning of time until endTime.
   */
  startTime?: Timestamp;
  /**
   * Time when the relationship became inactive. If there is no endTime,
   * relationship is active from startTime until the present or any point in the future.
   * If endTime and startTime are set, then endTime must be strictly greater than startTime
   */
  endTime?: Timestamp;
  /**
   * Confidence value of the existence of this relationship.
   * Generated relationships should provide a realistic score on the likelihood of the existence of the relationship.
   * Relationships without a confidence value can be interpreted at the discretion of each project.
   */
  confidence?: number;
  /**
   * The id of the dataset this relationship belongs to
   */
  dataSetId?: CogniteInternalId;
  /**
   * A list of the labels associated with this resource item
   */
  labels?: Label[];
}

export interface Relationship
  extends ExternalRelationship,
    CreatedAndLastUpdatedTime {}

export interface RelationshipsFilterRequest extends FilterQuery {
  /**
   * Filter on relationships with exact match.
   * Multiple filter elements in one property, e.g. sourceExternalIds: [ "a", "b" ],
   * will return all relationships where the sourceExternalId field is either a or b.
   * Filters in multiple properties will return the relationships that match all criteria.
   * If the filter is not specified it default to an empty filter.
   */
  filter?: RelationshipsFilter;
}

export interface RelationshipsFilter extends CreatedAndLastUpdatedTimeFilter {
  /**
   * Include relationships that have any of these values in their sourceExternalId field
   */
  sourceExternalIds?: CogniteExternalId[];
  /**
   * Items Enum: "asset" "timeSeries" "file" "event" "sequence".
   * Include relationships that have any of these values in their sourceType field
   */
  sourceTypes?: RelationshipResourceType[];
  /**
   * Include relationships that have any of these values in their targetExternalId field
   */
  targetExternalIds?: CogniteExternalId[];
  /**
   * Items Enum: "asset" "timeSeries" "file" "event" "sequence".
   * Include relationships that have any of these values in their targetType field
   */
  targetTypes?: RelationshipResourceType[];
  /**
   * Only include relationships that reference these specific dataSet IDs
   */
  dataSetIds?: IdEither[];
  startTime?: DateRange;
  endTime?: DateRange;
  /**
   * Confidence range to filter for
   */
  confidence?: Range<number>;
  /**
   * Limits results to those active at any point within the given time range, i.e.
   * if there is any overlap in the intervals [activeAtTime.min, activeAtTime.max] and [startTime, endTime],
   * where both intervals are inclusive. If a relationship does not have a startTime,
   * it is regarded as active from the beginning of time by this filter.
   * If it does not have an endTime is will be regarded as active until the end of time.
   * Similarly, if a min is not supplied to the filter, the min will be implicitly set to the beginning of time,
   * and if a max is not supplied, the max will be implicitly set to the end of time.
   */
  activeAtTime?: DateRange;
  /**
   * Return only the resource matching the specified label constraints
   */
  labels?: LabelFilter;
}

export type ContextJobStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export const ContextJobStatus = {
  QUEUED: 'QUEUED' as ContextJobStatus,
  RUNNING: 'RUNNING' as ContextJobStatus,
  COMPLETED: 'COMPLETED' as ContextJobStatus,
  FAILED: 'FAILED' as ContextJobStatus,
};

/**
 * Contextualization job ID.
 */
export type ContextJobId = number;

export interface EntityMatchingResponseBase {
  /**
   * User defined name of the model.
   */
  name: string;
  /**
   * User defined description of the model
   */
  description: string;
  /**
   * The status of the job.
   */
  status: ContextJobStatus;
  createdTime: Date;
  startTime: Date;
  statusTime: Date;
}

export interface ExternalEntityToMatch {
  id?: CogniteInternalId;
  externalId?: CogniteExternalId;
  [key: string]: string | number | undefined;
}

export type EntityMatchingFeatureType =
  | 'simple'
  | 'bigram'
  | 'frequencyweightedbigram'
  | 'bigramextratokenizers'
  | 'bigramcombo';

export const EntityMatchingFeatureType = {
  SIMPLE: 'simple' as EntityMatchingFeatureType,
  BIGRAM: 'bigram' as EntityMatchingFeatureType,
  FREQUENCY_WEIGHTED_BIGRAM: 'frequencyweightedbigram' as EntityMatchingFeatureType,
  BIGRAM_EXTRA_TOKENIZERS: 'bigramextratokenizers' as EntityMatchingFeatureType,
  BIGRAM_COMBO: 'bigramcombo' as EntityMatchingFeatureType,
};

export type EntityMatchingClassifier =
  | 'randomforest'
  | 'decisiontree'
  | 'logisticregression'
  | 'augmentedlogisticregression'
  | 'augmentedrandomforest';

export const EntityMatchingClassifier = {
  RANDOM_FOREST: 'randomforest' as EntityMatchingClassifier,
  DECISION_TREE: 'decisiontree' as EntityMatchingClassifier,
  LOGISTIC_REGRESSION: 'logisticregression' as EntityMatchingClassifier,
  AUGMENTED_LOGISTIC_REGRESSION: 'augmentedlogisticregression' as EntityMatchingClassifier,
  AUGMENTED_RANDOM_FOREST: 'augmentedrandomforest' as EntityMatchingClassifier,
};

export interface EntityMatchingField {
  from: string;
  to: string;
}

export type ExternalEntityTrueMatch = ExternalEntityTrueMatchSource &
  ExternalEntityTrueMatchTarget;

type ExternalEntityTrueMatchSource =
  | {
      /**
       * The id for the source object of the match.
       */
      sourceId: CogniteInternalId;
    }
  | {
      /**
       * The external id for the source object of the match.
       */
      sourceExternalId: CogniteExternalId;
    };

type ExternalEntityTrueMatchTarget =
  | {
      /**
       * The id for the target object of the match.
       */
      targetId: CogniteInternalId;
    }
  | {
      /**
       * The external id for the target object of the match.
       */
      targetExternalId: CogniteExternalId;
    };

export interface EntityMatchingCreateRequest {
  /**
   * List of custom source object to match from, for example, time series. String key -> value. Only string values are considered in the matching. Optional id and/or externalId fields.
   */
  sources: ExternalEntityToMatch[];
  /**
   * List of custom target object to match to, for example, assets. String key -> value. Only string values are considered in the matching. Optional id and/or externalId fields.
   */
  targets: ExternalEntityToMatch[];
  /**
   * List of objects of pairs of fromId or fromExternalId and toId or toExternalId, that corresponds to entities in matchFrom and matchTo respectively, that indicates a confirmed match used to train the model. If omitted, an unsupervised model is used.
   */
  trueMatches?: ExternalEntityTrueMatch[];
  externalId?: CogniteExternalId;
  /**
   * User defined name of the model.
   */
  name?: string;
  /**
   * User defined description of the model.
   */
  description?: string;
  /**
   * List of pairs of fields from the target and source items used to calculate features. All source and target items should have all the source and target fields specified here.
   */
  matchFields?: EntityMatchingField[];
  /**
   * Defines the combination of features used. The options are:
   * Simple: Calculates a single cosine-distance similarity score for each of the fields defined in keysFromTo. This is the fastest option.
   * Bigram: Adds similarity score based on the sequence of the terms.
   * Frequency-Weighted-Bigram: Calculates a similarity score based on the sequence of the terms, giving higher weights to less commonly occurring tokens.
   * Bigram-Extra-Tokenizers: Similar to bigram, but able to learn that leading zeros and spaces should be ignored in matching.
   * Bigram-Combo: Calculates all of the above options, relying on the model to determine the appropriate features to use. This is the slowest option.
   */
  featureType?: EntityMatchingFeatureType;
  /**
   * The classifier used in the model. Only relevant if there are trueMatches/labeled data and a supervised  model is fitted.
   */
  classifier?: EntityMatchingClassifier;
  /**
   * If True, replaces missing fields in `sources` or `targets` entities, for fields set in set in `matchFields`, with empty strings. Else, returns an error if there are missing data.
   */
  ignoreMissingFields?: boolean;
}

export interface EntityMatchingCreateResponse
  extends EntityMatchingResponseBase {
  id: CogniteInternalId;
  externalId: CogniteExternalId;
  /**
   * Defines the combination of features used in the entity matcher model.
   */
  featureType?: EntityMatchingFeatureType;
  /**
   * Name of the classifier used in the model, "Unsupervised" if unsupervised model.
   */
  classifier?: EntityMatchingClassifier;
  /**
   * If True, missing fields in sources or targets entities set in matchFields, are replaced with empty strings.
   */
  ignoreMissingFields?: boolean;
  /**
   * List of pairs of fields from the target and source items used to calculate features. All source and target items should have all the source and target fields specified here.
   */
  matchFields?: EntityMatchingField[];
  /**
   * The ID of original model, only relevant when the model is a retrained model.
   */
  originalId?: CogniteInternalId;
}

export interface EntityMatchingModel extends EntityMatchingResponseBase {
  id: CogniteInternalId;
  externalId: CogniteExternalId;
  /**
   * Defines the combination of features used in the entity matcher model.
   */
  featureType?: EntityMatchingFeatureType;
  /**
   * Name of the classifier used in the model, "Unsupervised" if unsupervised model.
   */
  classifier?: EntityMatchingClassifier;
  /**
   * Array of objects (MatchFields) List of pairs of fields from the target and source items used to calculate features. All source and target items should have all the source and target fields specified here.
   */
  matchFields?: EntityMatchingField[];
  /**
   * The ID of original model, only relevant when the model is a retrained model.
   */
  originalId?: number;
}

export type EntityMatchingChange = IdEither & EntityMatchingPatch;

export interface EntityMatchingPatch {
  update: {
    /**
     * Set a new value for the model name.
     */
    name?: SinglePatchString;
    /**
     * Set a new value for the model description.
     */
    description: SinglePatchString;
  };
}

export type EntityMatchingPredictRequest = IdEither &
  EntityMatchingPredictRequestBase;

interface EntityMatchingPredictRequestBase {
  /**
   * List of source entities to predict matches for, for example, time series. If omitted, will use data source fit.
   */
  sources?: ExternalEntityToMatch[];
  /**
   * LList of potential target entities to match to one or more of the source entities, for example, assets. If omitted, will use data from fit.
   */
  targets?: ExternalEntityToMatch[];
  /**
   * The maximum number of results to return for each matchFrom.
   */
  numMatches?: number;
  /**
   * Only return matches with score above this threshold.
   */
  scoreThreshold?: number;
}

export interface EntityMatchingPredictResponse
  extends EntityMatchingResponseBase {
  /**
   * Contextualization job ID.
   */
  jobId: number;
}

export type EntityMatchingRefitRequest = IdEither &
  EntityMatchingRefitRequestBase;

interface EntityMatchingRefitRequestBase {
  /**
   * External ID for the new refitted model provided by client. Should be unique within the project.
   */
  newExternalId?: CogniteExternalId;
  /**
   * List of additional confirmed matches used to train the model. The new model uses a combination of this and trueMatches from the orginal model. If there are identical match-from ids, the pair from the original model is dropped.
   */
  trueMatches: ExternalEntityTrueMatch[];
  /**
   * List of source entities, for example, time series. If omitted, will use data from fit.
   */
  sources?: ExternalEntityToMatch[];
  /**
   * List of target entities, for example, assets. If omitted, will use data from fit.
   */
  targets?: ExternalEntityToMatch[];
}

export interface EntityMatchingRefitResponse
  extends EntityMatchingResponseBase {
  id: CogniteInternalId;
  externalId: CogniteExternalId;
  /**
   * Defines the combination of features used in the entity matcher model.
   */
  featureType: EntityMatchingFeatureType;
  /**
   * Name of the classifier used in the model, "Unsupervised" if unsupervised model.
   */
  classifier: EntityMatchingClassifier;
  /**
   * If True, missing fields in sources or targets entities set in matchFields, are replaced with empty strings.
   */
  ignoreMissingFields?: boolean;
  /**
   * List of pairs of fields from the target and source items used to calculate features. All source and target items should have all the source and target fields specified here.
   */
  matchFields?: EntityMatchingField[];
  /**
   * The ID of original model, only relevant when the model is a retrained model.
   */
  originalId: CogniteInternalId;
}

export interface EntityMatchingPredictions {
  jobId: ContextJobId;
  /**
   * The status of the job.
   */
  status: ContextJobStatus;
  /**
   * List of matched entities with confidence score.
   */
  items: EntityMatchingPrediction[];
}

export interface EntityMatchingPrediction {
  /**
   * The matchFrom item given to predict.
   */
  matchFrom: ExternalEntityToMatch;
  /**
   * Matched items, sorted from highest score to lowest. May be empty.
   */
  matches: EntityMatchingPredictedItem[];
}

export interface EntityMatchingPredictedItem {
  /**
   * The matchTo item given to predict.
   */
  matchTo: ExternalEntityToMatch;
  /**
   * The model's confidence in the match.
   */
  score: number;
}

export interface EntityMatchingFilter {
  /**
   * User defined name of the model.
   */
  name?: string;
  /**
   * User defined description of the model.
   */
  description?: string;
  /**
   * The feature type used to fit the model.
   */
  featureType?: EntityMatchingFeatureType;
  /**
   * Name of the classifier supervised model, "Unsupervised" if unsupervised model
   */
  classifier?: string;
  /**
   * List of pairs of fields from the matchTo and matchFrom items used to create features.
   */
  matchFields?: EntityMatchingField[];
  /**
   * The ID of original model, only relevant when the model is a retrained model.
   */
  originalModelId?: CogniteInternalId;
}

export interface EntityMatchingFilterRequest extends FilterQuery {
  filter?: EntityMatchingFilter;
}
