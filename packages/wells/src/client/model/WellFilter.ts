import { MeasurementType } from './MeasurementType';
import { WellType } from './WellType';

export interface WellFilter {
  /**
   * @type {WellType}
   * @memberof WellFilter
   */
  wellType?: WellType;
  /**
   * @type {string[]}
   * @memberof WellFilter
   */
  quadrants?: string[];
  /**
   * @type {string[]}
   * @memberof WellFilter
   */
  blocks?: string[];
  /**
   * @type {string[]}
   * @memberof WellFilter
   */
  fields?: string[];
  /**
   * @type {string[]}
   * @memberof WellFilter
   */
  operators?: string[];
  /**
   * @type {string[]}
   * @memberof WellFilter
   */
  sources?: string[];
  /**
   * @type {string[]}
   * @memberof WellFilter
   */
  hasTrajectory?: string[];
  /**
   * @type {string[]}
   * @memberof WellFilter
   */
  hasMeasurements?: string[];
  /**
   * @type {string[]}
   * @memberof WellFilter
   */
  polygon?: string[];
}

export interface TrajectoryFilter {
  /**
   * @type {number}
   * @memberof TrajectoryFilter
   */
  minDepth?: number;
  /**
   * @type {number}
   * @memberof TrajectoryFilter
   */
  maxDepth?: number;
  /**
   * @type {string[]}
   * @memberof TrajectoryFilter
   */
  crossesFormations?: string[];
}

export interface MeasurementFilter {
  /**
   * @type {MeasurementType}
   * @memberof TrajectoryFilter
   */
  measurementType?: MeasurementType;
  /**
   * @type {number}
   * @memberof TrajectoryFilter
   */
  minDepth?: number;
  /**
   * @type {number}
   * @memberof TrajectoryFilter
   */
  maxDepth?: number;
}

export interface PolygonFilter {
  /**
   * @type {string}
   * @memberof PolygonFilter
   */
  geometry: string;
  /**
   * @type {string}
   * @memberof PolygonFilter
   * @default "epsg:4326"
   */
  crs: string;
  /**
   * @type {string}
   * @memberof PolygonFilter
   */
  geometryType?: string;
}
