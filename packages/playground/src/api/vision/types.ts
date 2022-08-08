import { CogniteExternalId, CogniteInternalId, ContextJobId } from "@cognite/sdk-stable";

export interface StatusSchema {
  /** The status of the job. */
  status: JobStatus;

  /** The number of milliseconds since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds. */
  createdTime: EpochTimestamp;
  startTime: EpochTimestamp;

  /** The number of milliseconds since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds. */
  statusTime: EpochTimestamp;
}

export interface ExtractItem {
  /** The file ID of a file in CDF. */
  fileId: CogniteInternalId;

  /** The file external ID of a file in CDF. */
  fileExternalId?: CogniteExternalId;

  /** Detected features in images. New fields may appear in case new feature extractors are add. */
  predictions: ExtractPredictions;
}

/**
 * List of the items and the corresponding error message(s) per failed batch.
 */
export interface FailedItem {
  errorMessage: string;
  items: FileRef[];
};

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
  threshold?: number;
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
  threshold?: number;

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
  threshold?: number;
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
  threshold?: number;
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
  threshold?: number;
}

export interface FileRef {
  /** The ID of a file in CDF. */
  fileId: CogniteInternalId;

  /** The external ID of a file in CDF. */
  fileExternalId?: CogniteExternalId;
}

/**
 * Detected features in images. New fields may appear in case new feature extractors are add.
 */
export interface ExtractPredictions {
  /** Text predictions. */
  textPredictions?: TextRegion[];

  /** Asset tag predictions. */
  assetTagPredictions?: AssetLink[];

  /** Industrial object predictions. */
  industrialObjectPredictions?: ObjectDetection[];

  /** People predictions. */
  peoplePredictions?: ObjectDetection[];

  /** Personal protective equipment predictions. */
  personalProtectiveEquipmentPredictions?: ObjectDetection[];
}

/**
* Models an image object detection represented by a label, a geometry, and
optionally a confidence value.
*/
export interface ObjectDetection {
  /** A plain rectangle */
  boundingBox?: BoundingBox;

  /**
   * A _closed_ polygon represented by _n_ vertices. In other words, we assume
   * that the first and last vertex are connected.
   */
  polygon?: Polygon;

  /** A polygonal chain consisting of _n_ vertices */
  polyline?: PolyLine;

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
export interface BoundingBox {
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
export interface Polygon {
  /**
   * The confidence score for the primitive. It should be between 0 and 1.
   * @min 0
   * @max 1
   */
  confidence?: number;
  vertices: Point[];
}

/**
 * A polygonal chain consisting of _n_ vertices
 */
export interface PolyLine {
  /**
   * The confidence score for the primitive. It should be between 0 and 1.
   * @min 0
   * @max 1
   */
  confidence?: number;
  vertices: Point[];
}

/**
 * Point in a 2D-Cartesian coordinate system with origin at the top-left corner of the page
 */
export interface Point {
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
 * Models a link to a CDF Asset referenced in an image
 */
export interface AssetLink {
  /**
   * The confidence score for the primitive. It should be between 0 and 1.
   * @min 0
   * @max 1
   */
  confidence?: number;

  /** The asset this annotation is pointing to */
  assetRef: AssetRef;

  /** The extracted text */
  text: string;

  /** The location of the text mentioning the asset */
  textRegion: BoundingBox;
}

/**
 * A reference to an asset. Either the internal ID or the external ID must be provided (exactly one).
 */
export type AssetRef = { id?: number; externalId?: string };

/**
 * Models an extracted text region in an image
 */
export interface TextRegion {
  /**
   * The confidence score for the primitive. It should be between 0 and 1.
   * @min 0
   * @max 1
   */
  confidence?: number;

  /** The extracted text */
  text: string;

  /** The location of the extracted text */
  textRegion: BoundingBox;
}

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

/**
 * The type of detections to perform. New feature extractors may appear.
 * @example ["TextDetection","AssetTagDetection","PeopleDetection"]
 */
export type Feature = 
  | 'TextDetection'
  | 'AssetTagDetection'
  | 'PeopleDetection'
  | 'IndustrialObjectDetection'
  | 'PersonalProtectiveEquipmentDetection';

export type ExtractBaseResponseSchema = {
  jobId: ContextJobId;
  features: Feature[];
  parameters?: FeatureParameters;
};

export type ExtractPostResponse = ExtractBaseResponseSchema & {
  items?: FileRef[];
};

export type ExtractGetResponse = ExtractBaseResponseSchema & {
  items?: ExtractItem[];
  failedItems?: FailedItem[];
};
