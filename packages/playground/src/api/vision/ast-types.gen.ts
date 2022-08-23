// Do not modify this file!
// It was generated by the command "yarn codegen".
// Instead update the code generation logic or the OpenAPI document.

export interface StatusSchema {
  /** The status of the job. */
  status: JobStatus;

  /** The number of milliseconds since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds. */
  createdTime: EpochTimestamp;
  startTime: EpochTimestamp;

  /** The number of milliseconds since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds. */
  statusTime: EpochTimestamp;
}

/**
 * Contextualization job ID.
 * @format int64
 * @example 123
 */
export type JobId = number;

export interface VisionExtractItem {
  /** The ID of a file in CDF. */
  fileId: ContextFileId;

  /** The external ID of a file in CDF. */
  fileExternalId?: ContextFileExternalId;

  /** Detected features in images. New fields may appear in case new feature extractors are add. */
  predictions: VisionExtractPredictions;
}

/**
 * List of the items and the corresponding error message(s) per failed batch.
 */
export interface FailedBatch {
  /** The error message(s) of the failed batch. */
  errorMessage?: string;

  /** List of the items in the failed batch. */
  items?: AllOfFileId[];
}

/**
 * Feature-specific parameters. New feature extractor parameters may appear.
 */
export interface FeatureParameters {
  /** Parameters for text detection */
  textDetectionParameters?: TextDetectionParameters;

  /** Parameters for asset tag detection. */
  assetTagDetectionParameters?: AssetTagDetectionParameters;

  /** Parameters for people detection. */
  peopleDetectionParameters?: PeopleDetectionParameters;

  /** Parameters for industrial object detection. */
  industrialObjectDetectionParameters?: IndustrialObjectDetectionParameters;

  /** Parameters for industrial personal protective equipment detection. */
  personalProtectiveEquipmentDetectionParameters?: PersonalProtectiveEquipmentDetectionParameters;
}

/**
 * Parameters for text detection
 */
export interface TextDetectionParameters {
  /**
   * The confidence threshold returns predictions as positive if their confidence score is the selected value or higher.
   * A higher confidence threshold increases precision but lowers recall, and vice versa.
   *
   */
  threshold?: ThresholdParameter;
}

/**
 * Parameters for asset tag detection.
 */
export interface AssetTagDetectionParameters {
  /**
   * The confidence threshold returns predictions as positive if their confidence score is the selected value or higher.
   * A higher confidence threshold increases precision but lowers recall, and vice versa.
   *
   */
  threshold?: ThresholdParameter;

  /**
   * Allow partial (fuzzy) matching of detected external IDs in the file.
   * Will only match when it is possible to do so unambiguously.
   *
   * @example true
   */
  partialMatch?: boolean;

  /**
   * Search for external ID or name of assets that are in a subtree rooted at one of
   * the assetSubtreeIds (including the roots given).
   *
   * @example [1,2]
   */
  assetSubtreeIds?: number[];
}

/**
 * Parameters for people detection.
 */
export interface PeopleDetectionParameters {
  /**
   * The confidence threshold returns predictions as positive if their confidence score is the selected value or higher.
   * A higher confidence threshold increases precision but lowers recall, and vice versa.
   *
   */
  threshold?: ThresholdParameter;
}

/**
 * Parameters for industrial object detection.
 */
export interface IndustrialObjectDetectionParameters {
  /**
   * The confidence threshold returns predictions as positive if their confidence score is the selected value or higher.
   * A higher confidence threshold increases precision but lowers recall, and vice versa.
   *
   */
  threshold?: ThresholdParameter;
}

/**
 * Parameters for industrial personal protective equipment detection.
 */
export interface PersonalProtectiveEquipmentDetectionParameters {
  /**
   * The confidence threshold returns predictions as positive if their confidence score is the selected value or higher.
   * A higher confidence threshold increases precision but lowers recall, and vice versa.
   *
   */
  threshold?: ThresholdParameter;
}

/**
* The confidence threshold returns predictions as positive if their confidence score is the selected value or higher. 
A higher confidence threshold increases precision but lowers recall, and vice versa.
* @min 0
* @max 1
* @example 0.8
*/
export type ThresholdParameter = number;

export interface AllOfFileId {
  /** The ID of a file in CDF. */
  fileId: ContextFileId;

  /** The external ID of a file in CDF. */
  fileExternalId?: ContextFileExternalId;
}

/**
 * The ID of a file in CDF.
 * @format int64
 * @example 1234
 */
export type ContextFileId = number;

/**
 * The external ID of a file in CDF.
 * @example 1234
 */
export type ContextFileExternalId = string;

/**
 * Detected features in images. New fields may appear in case new feature extractors are add.
 */
export interface VisionExtractPredictions {
  textPredictions?: AnnotationsTextRegion[];
  assetTagPredictions?: AnnotationsCogniteAnnotationTypesImagesAssetLink[];
  industrialObjectPredictions?: AnnotationsObjectDetection[];
  peoplePredictions?: AnnotationsObjectDetection[];
  personalProtectiveEquipmentPredictions?: AnnotationsObjectDetection[];
}

/**
 * Models an extracted text region in an image
 */
export interface AnnotationsTextRegion {
  /**
   * The confidence score for the primitive. It should be between 0 and 1.
   * @min 0
   * @max 1
   */
  confidence?: number;

  /** The extracted text */
  text: string;

  /** The location of the extracted text */
  textRegion: AnnotationsBoundingBox;
}

/**
 * Models a link to a CDF Asset referenced in an image
 */
export interface AnnotationsCogniteAnnotationTypesImagesAssetLink {
  /**
   * The confidence score for the primitive. It should be between 0 and 1.
   * @min 0
   * @max 1
   */
  confidence?: number;

  /** The asset this annotation is pointing to */
  assetRef: AnnotationsAssetRef;

  /** The extracted text */
  text: string;

  /** The location of the text mentioning the asset */
  textRegion: AnnotationsBoundingBox;
}

/**
* Models an image object detection represented by a label, a geometry, and
optionally a confidence value.
*/
export interface AnnotationsObjectDetection {
  /** A plain rectangle */
  boundingBox?: AnnotationsBoundingBox;

  /**
   * A _closed_ polygon represented by _n_ vertices. In other words, we assume
   * that the first and last vertex are connected.
   */
  polygon?: AnnotationsPolygon;

  /** A polygonal chain consisting of _n_ vertices */
  polyline?: AnnotationsPolyLine;

  /** The label describing what type of object it is */
  label: string;

  /**
   * The confidence score for the primitive. It should be between 0 and 1.
   * @min 0
   * @max 1
   */
  confidence?: number;
}

/**
 * A plain rectangle
 */
export interface AnnotationsBoundingBox {
  /**
   * The confidence score for the primitive. It should be between 0 and 1.
   * @min 0
   * @max 1
   */
  confidence?: number;

  /**
   * Minimum abscissa of the bounding box (left edge). Must be strictly less than x_max.
   * @min 0
   * @max 1
   */
  xMin: number;

  /**
   * Maximum abscissa of the bounding box (right edge). Must be strictly more than x_min.
   * @min 0
   * @max 1
   */
  xMax: number;

  /**
   * Minimum ordinate of the bounding box (bottom edge). Must be strictly less than y_max.
   * @min 0
   * @max 1
   */
  yMin: number;

  /**
   * Maximum ordinate of the bounding box (top edge). Must be strictly more than y_min.
   * @min 0
   * @max 1
   */
  yMax: number;
}

/**
* A _closed_ polygon represented by _n_ vertices. In other words, we assume
that the first and last vertex are connected.
*/
export interface AnnotationsPolygon {
  /**
   * The confidence score for the primitive. It should be between 0 and 1.
   * @min 0
   * @max 1
   */
  confidence?: number;
  vertices: AnnotationsPoint[];
}

/**
 * A polygonal chain consisting of _n_ vertices
 */
export interface AnnotationsPolyLine {
  /**
   * The confidence score for the primitive. It should be between 0 and 1.
   * @min 0
   * @max 1
   */
  confidence?: number;
  vertices: AnnotationsPoint[];
}

/**
 * Point in a 2D-Cartesian coordinate system with origin at the top-left corner of the page
 */
export interface AnnotationsPoint {
  /**
   * The confidence score for the primitive. It should be between 0 and 1.
   * @min 0
   * @max 1
   */
  confidence?: number;

  /**
   * The abscissa of the point in a coordinate system with origin at the top-left corner of the page. Normalized in (0,1).
   * @min 0
   * @max 1
   */
  x: number;

  /**
   * The ordinate of the point in a coordinate system with origin at the top-left corner of the page. Normalized in (0,1).
   * @min 0
   * @max 1
   */
  y: number;
}

/**
 * A reference to an asset. Either the internal ID or the external ID must be provided (exactly one).
 */
export type AnnotationsAssetRef = { id?: number; externalId?: string };

/**
 * The status of the job.
 */
export type JobStatus = 'Queued' | 'Running' | 'Completed' | 'Failed';

/**
 * The number of milliseconds since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
 * @format int64
 * @min 0
 * @example 1638795554528
 */
export type EpochTimestamp = number;

export type VisionExtractFeature =
  | TextDetection
  | AssetTagDetection
  | PeopleDetection
  | IndustrialObjectDetection
  | PersonalProtectiveEquipmentDetection;

/**
 * Detect text in images.
 */
export type TextDetection = 'TextDetection';

/**
 * Detect external ID or name of assets (from your CDF projects) in images. Usage of this feature requires `["assetsAcl:READ"]` capability.
 */
export type AssetTagDetection = 'AssetTagDetection';

/**
 * Detect people in images.
 */
export type PeopleDetection = 'PeopleDetection';

/**
 * Detect industrial objects such as gauges and valves in images.
 */
export type IndustrialObjectDetection = 'IndustrialObjectDetection';

/**
 * Detect personal protective equipment, such as helmet, protective eyewear, and mask in images.
 */
export type PersonalProtectiveEquipmentDetection =
  'PersonalProtectiveEquipmentDetection';

/**
 * An object containing file (external) id.
 */
export type FileReference =
  | { fileId: ContextFileId }
  | { fileExternalId: ContextFileExternalId };

export type VisionExtractPostResponse = StatusSchema & {
  jobId: JobId;
  items: AllOfFileId[];
  features: VisionExtractFeature[];
  parameters?: FeatureParameters;
};

export type VisionExtractGetResponse = StatusSchema & {
  jobId: JobId;
  items: VisionExtractItem[];
  failedItems?: FailedBatch[];
  parameters?: FeatureParameters;
};
