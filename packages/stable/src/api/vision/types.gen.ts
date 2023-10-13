// Do not modify this file!
// It was generated by the command "yarn codegen".
// Instead update the code generation logic or the OpenAPI document.

/**
 * A reference to an asset. Either the internal ID or the external ID must be provided (exactly one).
 */
export type AnnotationsAssetRef = {
    id?: number;
    externalId?: string;
};
/**
 * The boolean value of something
 */
export interface AnnotationsBoolean {
    /** The description of a primitive */
    description?: string;
    type: "boolean";
    /** The boolean value */
    value: boolean;
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
     * Maximum abscissa of the bounding box (right edge). Must be strictly more than x_min.
     * @min 0
     * @max 1
     */
    xMax: number;
    /**
     * Minimum abscissa of the bounding box (left edge). Must be strictly less than x_max.
     * @min 0
     * @max 1
     */
    xMin: number;
    /**
     * Maximum ordinate of the bounding box (top edge). Must be strictly more than y_min.
     * @min 0
     * @max 1
     */
    yMax: number;
    /**
     * Minimum ordinate of the bounding box (bottom edge). Must be strictly less than y_max.
     * @min 0
     * @max 1
     */
    yMin: number;
}
/**
 * Models a link to a CDF Asset referenced in an image
 */
export interface AnnotationsCogniteAnnotationTypesImagesAssetLink {
    /** The asset this annotation is pointing to */
    assetRef: AnnotationsAssetRef;
    /**
     * The confidence score for the primitive. It should be between 0 and 1.
     * @min 0
     * @max 1
     */
    confidence?: number;
    /** The region of the object representing the asset */
    objectRegion?: AnnotationsCogniteAnnotationTypesPrimitivesGeometry2DGeometry;
    /** The extracted text */
    text: string;
    /** The location of the text mentioning the asset */
    textRegion: AnnotationsBoundingBox;
}
/**
* A geometry represented by exactly *one of* ` bounding_box`, `polygon` and
`polyline` which, respectively, represents a BoundingBox, Polygon and
PolyLine.
*/
export interface AnnotationsCogniteAnnotationTypesPrimitivesGeometry2DGeometry {
    /** A plain rectangle */
    boundingBox?: AnnotationsBoundingBox;
    /**
     * A _closed_ polygon represented by _n_ vertices. In other words, we assume
     * that the first and last vertex are connected.
     */
    polygon?: AnnotationsPolygon;
    /** A polygonal chain consisting of _n_ vertices */
    polyline?: AnnotationsPolyLine;
}
/**
* A point attached with additional information such as a confidence value and
various attribute(s).
*/
export interface AnnotationsKeypoint {
    /** Additional attributes data for a compound. */
    attributes?: Record<string, AnnotationsBoolean | AnnotationsNumerical>;
    /**
     * The confidence score for the primitive. It should be between 0 and 1.
     * @min 0
     * @max 1
     */
    confidence?: number;
    /** The position of the keypoint */
    point: AnnotationsPoint;
}
/**
* Models a collection of keypoints represented by a label, a dictionary of
keypoints (mapping from a (unique) label name to a keypoint), and
optionally a confidence value and an attributes dictionary.
*/
export interface AnnotationsKeypointCollection {
    /** Additional attributes data for a compound. */
    attributes?: Record<string, AnnotationsBoolean | AnnotationsNumerical>;
    /**
     * The confidence score for the primitive. It should be between 0 and 1.
     * @min 0
     * @max 1
     */
    confidence?: number;
    /** The detected keypoints */
    keypoints: Record<string, AnnotationsKeypoint>;
    /** The label describing what type of object it is */
    label: string;
}
/**
 * The numerical value of something
 */
export interface AnnotationsNumerical {
    /** The description of a primitive */
    description?: string;
    type: "numerical";
    /** The numerical value */
    value: number | number;
}
/**
* Models an image object detection represented by a label, a geometry, and
optionally a confidence value.
*/
export interface AnnotationsObjectDetection {
    /** Additional attributes data for a compound. */
    attributes?: Record<string, AnnotationsBoolean | AnnotationsNumerical>;
    /** A plain rectangle */
    boundingBox?: AnnotationsBoundingBox;
    /**
     * The confidence score for the primitive. It should be between 0 and 1.
     * @min 0
     * @max 1
     */
    confidence?: number;
    /** The label describing what type of object it is */
    label: string;
    /**
     * A _closed_ polygon represented by _n_ vertices. In other words, we assume
     * that the first and last vertex are connected.
     */
    polygon?: AnnotationsPolygon;
    /** A polygonal chain consisting of _n_ vertices */
    polyline?: AnnotationsPolyLine;
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
 * Detect external ID or name of assets (from your CDF projects) in images. Usage of this feature requires `['assetsAcl:READ']` capability.
 */
export type AssetTagDetection = "AssetTagDetection";
/**
 * Parameters for asset tag detection.
 */
export interface AssetTagDetectionParameters {
    /**
     * Search for external ID or name of assets that are in a subtree rooted at one of
     * the assetSubtreeIds (including the roots given).
     *
     * @example [1,2]
     */
    assetSubtreeIds?: number[];
    /**
     * Allow partial (fuzzy) matching of detected external IDs in the file.
     * Will only match when it is possible to do so unambiguously.
     *
     * @example true
     */
    partialMatch?: boolean;
    /**
     * The confidence threshold returns predictions as positive if their confidence score is the selected value or higher.
     * A higher confidence threshold increases precision but lowers recall, and vice versa.
     *
     */
    threshold?: ThresholdParameter;
}
/**
 * Number of digits after comma in a digital gauge.
 * @example 3
 */
export type CommaPos = number;
/**
 * The angle between the start and end point on the bottom part of an analog gauge, measured in degrees.
 * @example 60
 */
export type DeadAngle = number;
/**
 * Detect and read value of dial gauges in images. In beta. Available only when the `cdf-version: beta` header is provided.
 */
export type DialGaugeDetection = "DialGaugeDetection";
/**
 * Parameters for dial gauge detection and reading. In beta. Available only when the `cdf-version: beta` header is provided.
 */
export interface DialGaugeDetectionParameters {
    /** The angle between the start and end point on the bottom part of an analog gauge, measured in degrees. */
    deadAngle?: DeadAngle;
    /** The max value of the gauge. */
    maxLevel?: MaxLevel;
    /** The min value of the gauge. */
    minLevel?: MinLevel;
    /** If the gauge is nonlinear, the non-linear angle from the metadata is used to part the scale in two separate linear scales. The first scale goes from min to 0. The second from 0 to max. The needle angle determines which scale is used. */
    nonLinAngle?: NonLinAngle;
    /**
     * The confidence threshold returns predictions as positive if their confidence score is the selected value or higher.
     * A higher confidence threshold increases precision but lowers recall, and vice versa.
     *
     */
    threshold?: ThresholdParameter;
}
/**
 * Detect and read value of digital gauges in images. In beta. Available only when the `cdf-version: beta` header is provided.
 */
export type DigitalGaugeDetection = "DigitalGaugeDetection";
/**
 * Parameters for digital gauge detection and reading. In beta. Available only when the `cdf-version: beta` header is provided.
 */
export interface DigitalGaugeDetectionParameters {
    /** Number of digits after comma in a digital gauge. */
    commaPos?: CommaPos;
    /** Maximum number of digits on a digital gauge. */
    maxNumDigits?: MaxNumDigits;
    /** Minimum number of digits on a digital gauge. */
    minNumDigits?: MinNumDigits;
    /**
     * The confidence threshold returns predictions as positive if their confidence score is the selected value or higher.
     * A higher confidence threshold increases precision but lowers recall, and vice versa.
     *
     */
    threshold?: ThresholdParameter;
}
/**
 * The number of milliseconds since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
 * @format int64
 * @min 0
 */
export type EpochTimestamp = number;
/**
 * List of the items and the corresponding error message(s) per failed batch.
 */
export interface FailedBatch {
    /** The error message(s) of the failed batch. */
    errorMessage?: string;
    /** List of the items in the failed batch. */
    items?: VisionAllOfFileId[];
}
/**
 * Feature-specific parameters. New feature extractor parameters may appear.
 * @example {"textDetectionParameters":{"threshold":0.8},"assetTagDetectionParameters":{"threshold":0.8,"partialMatch":true,"assetSubtreeIds":[1,2]},"peopleDetectionParameters":{"threshold":0.8}}
 */
export interface FeatureParameters {
    /** Parameters for asset tag detection. */
    assetTagDetectionParameters?: AssetTagDetectionParameters;
    /** Parameters for dial gauge detection and reading. In beta. Available only when the `cdf-version: beta` header is provided. */
    dialGaugeDetectionParameters?: DialGaugeDetectionParameters;
    /** Parameters for digital gauge detection and reading. In beta. Available only when the `cdf-version: beta` header is provided. */
    digitalGaugeDetectionParameters?: DigitalGaugeDetectionParameters;
    /** Parameters for industrial object detection. In beta. Available only when the `cdf-version: beta` header is provided. */
    industrialObjectDetectionParameters?: IndustrialObjectDetectionParameters;
    /** Parameters for level gauge detection and reading. In beta. Available only when the `cdf-version: beta` header is provided. */
    levelGaugeDetectionParameters?: LevelGaugeDetectionParameters;
    /** Parameters for people detection. */
    peopleDetectionParameters?: PeopleDetectionParameters;
    /** Parameters for industrial personal protective equipment detection. In beta. Available only when the `cdf-version: beta` header is provided. */
    personalProtectiveEquipmentDetectionParameters?: PersonalProtectiveEquipmentDetectionParameters;
    /** Parameters for text detection */
    textDetectionParameters?: TextDetectionParameters;
    /** Parameters for detecting and reading the state of a valve. In beta. Available only when the `cdf-version: beta` header is provided. */
    valveDetectionParameters?: ValveDetectionParameters;
}
/**
 * An object containing file (external) id.
 */
export type FileReference = {
    fileId: VisionFileId;
} | {
    fileExternalId: VisionFileExternalId;
};
/**
 * Detect industrial objects such as gauges and valves in images. In beta. Available only when the `cdf-version: beta` header is provided.
 */
export type IndustrialObjectDetection = "IndustrialObjectDetection";
/**
 * Parameters for industrial object detection. In beta. Available only when the `cdf-version: beta` header is provided.
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
 * Contextualization job ID.
 * @format int64
 * @example 123
 */
export type JobId = number;
/**
 * The status of the job.
 */
export type JobStatus = "Queued" | "Running" | "Completed" | "Failed";
/**
 * Detect and read value of level gauges in images. In beta. Available only when the `cdf-version: beta` header is provided.
 */
export type LevelGaugeDetection = "LevelGaugeDetection";
/**
 * Parameters for level gauge detection and reading. In beta. Available only when the `cdf-version: beta` header is provided.
 */
export interface LevelGaugeDetectionParameters {
    /** The max value of the gauge. */
    maxLevel?: MaxLevel;
    /** The min value of the gauge. */
    minLevel?: MinLevel;
    /**
     * The confidence threshold returns predictions as positive if their confidence score is the selected value or higher.
     * A higher confidence threshold increases precision but lowers recall, and vice versa.
     *
     */
    threshold?: ThresholdParameter;
}
/**
 * The max value of the gauge.
 * @example 100
 */
export type MaxLevel = number;
/**
 * Maximum number of digits on a digital gauge.
 * @example 5
 */
export type MaxNumDigits = number;
/**
 * The min value of the gauge.
 * @example 0
 */
export type MinLevel = number;
/**
 * Minimum number of digits on a digital gauge.
 * @example 2
 */
export type MinNumDigits = number;
/**
 * If the gauge is nonlinear, the non-linear angle from the metadata is used to part the scale in two separate linear scales. The first scale goes from min to 0. The second from 0 to max. The needle angle determines which scale is used.
 * @example 60
 */
export type NonLinAngle = number;
/**
 * Detect people in images.
 */
export type PeopleDetection = "PeopleDetection";
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
 * Detect personal protective equipment, such as helmet, protective eyewear, and mask in images. In beta. Available only when the `cdf-version: beta` header is provided.
 */
export type PersonalProtectiveEquipmentDetection = "PersonalProtectiveEquipmentDetection";
/**
 * Parameters for industrial personal protective equipment detection. In beta. Available only when the `cdf-version: beta` header is provided.
 */
export interface PersonalProtectiveEquipmentDetectionParameters {
    /**
     * The confidence threshold returns predictions as positive if their confidence score is the selected value or higher.
     * A higher confidence threshold increases precision but lowers recall, and vice versa.
     *
     */
    threshold?: ThresholdParameter;
}
export interface StatusSchema {
    /** The number of milliseconds since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds. */
    createdTime: EpochTimestamp;
    /** The number of milliseconds since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds. */
    startTime: EpochTimestamp;
    /** The status of the job. */
    status: JobStatus;
    /** The number of milliseconds since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds. */
    statusTime: EpochTimestamp;
}
/**
 * Detect text in images.
 */
export type TextDetection = "TextDetection";
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
* The confidence threshold returns predictions as positive if their confidence score is the selected value or higher.
A higher confidence threshold increases precision but lowers recall, and vice versa.
* @min 0
* @max 1
* @example 0.8
*/
export type ThresholdParameter = number;
/**
 * Detect and read state of a valve in an image. In beta. Available only when the `cdf-version: beta` header is provided.
 */
export type ValveDetection = "ValveDetection";
/**
 * Parameters for detecting and reading the state of a valve. In beta. Available only when the `cdf-version: beta` header is provided.
 */
export interface ValveDetectionParameters {
    /**
     * The confidence threshold returns predictions as positive if their confidence score is the selected value or higher.
     * A higher confidence threshold increases precision but lowers recall, and vice versa.
     *
     */
    threshold?: ThresholdParameter;
}
export interface VisionAllOfFileId {
    /** The external ID of a file in CDF. */
    fileExternalId?: VisionFileExternalId;
    /** The ID of a file in CDF. */
    fileId: VisionFileId;
}
export type VisionExtractFeature = TextDetection | AssetTagDetection | PeopleDetection | IndustrialObjectDetection | PersonalProtectiveEquipmentDetection | DialGaugeDetection | LevelGaugeDetection | DigitalGaugeDetection | ValveDetection;
export type VisionExtractGetResponse = StatusSchema & {
    jobId: JobId;
    items: VisionExtractItem[];
    failedItems?: FailedBatch[];
    parameters?: FeatureParameters;
};
export interface VisionExtractItem {
    /** The external ID of a file in CDF. */
    fileExternalId?: VisionFileExternalId;
    /** The ID of a file in CDF. */
    fileId: VisionFileId;
    /** Detected features in images. New fields may appear in case new feature extractors are add. */
    predictions: VisionExtractPredictions;
}
export type VisionExtractPostResponse = StatusSchema & {
    jobId: JobId;
    items: VisionAllOfFileId[];
    features: VisionExtractFeature[];
    parameters?: FeatureParameters;
};
/**
 * Detected features in images. New fields may appear in case new feature extractors are add.
 * @example {"textPredictions":[{"confidence":0.9,"text":"string","textRegion":{"xMin":0.5,"xMax":0.9,"yMin":0.5,"yMax":0.9}}],"assetTagPredictions":[{"confidence":0.9,"assetRef":{"id":1233},"text":"string","textRegion":{"xMin":0.5,"xMax":0.9,"yMin":0.5,"yMax":0.9}}],"peoplePredictions":[{"label":"person","confidence":0.8,"boundingBox":{"xMin":0.5,"xMax":0.9,"yMin":0.5,"yMax":0.9}}]}
 */
export interface VisionExtractPredictions {
    assetTagPredictions?: AnnotationsCogniteAnnotationTypesImagesAssetLink[];
    /** In beta. Available only when the `cdf-version: beta` header is provided. */
    dialGaugePredictions?: {
        objectDetection?: AnnotationsObjectDetection;
        keypointCollection?: AnnotationsKeypointCollection;
    }[];
    /** In beta. Available only when the `cdf-version: beta` header is provided. */
    digitalGaugePredictions?: AnnotationsObjectDetection[];
    /** In beta. Available only when the `cdf-version: beta` header is provided. */
    industrialObjectPredictions?: AnnotationsObjectDetection[];
    /** In beta. Available only when the `cdf-version: beta` header is provided. */
    levelGaugePredictions?: {
        objectDetection?: AnnotationsObjectDetection;
        keypointCollection?: AnnotationsKeypointCollection;
    }[];
    peoplePredictions?: AnnotationsObjectDetection[];
    /** In beta. Available only when the `cdf-version: beta` header is provided. */
    personalProtectiveEquipmentPredictions?: AnnotationsObjectDetection[];
    textPredictions?: AnnotationsTextRegion[];
    /** In beta. Available only when the `cdf-version: beta` header is provided. */
    valvePredictions?: {
        objectDetection?: AnnotationsObjectDetection;
        keypointCollection?: AnnotationsKeypointCollection;
    }[];
}
/**
 * The external ID of a file in CDF.
 * @example 1234
 */
export type VisionFileExternalId = string;
/**
 * The ID of a file in CDF.
 * @format int64
 * @example 1234
 */
export type VisionFileId = number;
