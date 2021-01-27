import { MeasurementType } from './MeasurementType';
import { WellType } from './WellType';
import { GeoJson } from './GeoJson';

export interface WellFilter {
  /**
   * @type {WellType}
   * @memberof WellFilter
   */
  wellType?: WellType;
  /**
   * @type {string}
   * @memberof WellFilter
   */
  description?: string;
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
  hasTrajectory?: TrajectoryFilter;
  /**
   * @type {string[]}
   * @memberof WellFilter
   */
  hasMeasurements?: string[];
  /**
   * @type {PolygonFilter}
   * @memberof WellFilter
   */
  polygon?: PolygonFilter;
  /**
   * @type {string}
   * @memberof WellFilter
   */
  outputCrs?: string;
}

export interface WellFilterAPI {
  /**
   * @type {WellType}
   * @memberof WellFilterAPI
   */
  wellType?: WellType;
  /**
   * @type {string}
   * @memberof WellFilter
   */
  description?: string;
  /**
   * @type {string[]}
   * @memberof WellFilterAPI
   */
  quadrants?: string[];
  /**
   * @type {string[]}
   * @memberof WellFilterAPI
   */
  blocks?: string[];
  /**
   * @type {string[]}
   * @memberof WellFilterAPI
   */
  fields?: string[];
  /**
   * @type {string[]}
   * @memberof WellFilterAPI
   */
  operators?: string[];
  /**
   * @type {string[]}
   * @memberof WellFilterAPI
   */
  sources?: string[];
  /**
   * @type {string[]}
   * @memberof WellFilterAPI
   */
  hasTrajectory?: TrajectoryFilter;
  /**
   * @type {string[]}
   * @memberof WellFilterAPI
   */
  hasMeasurements?: string[];
  /**
   * @type {PolygonFilterAPI}
   * @memberof WellFilterAPI
   */
  polygon?: PolygonFilterAPI;
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
   * @memberof MeasurementFilter
   */
  measurementType?: MeasurementType;
  /**
   * @type {number}
   * @memberof MeasurementFilter
   */
  minDepth?: number;
  /**
   * @type {number}
   * @memberof MeasurementFilter
   */
  maxDepth?: number;
}

export interface PolygonFilter {
  /**
   * @type {string}
   * @memberof PolygonFilter
   */
  wktGeometry?: string;
  /**
   * @type {string}
   * @memberof PolygonFilter
   */
  geoJsonGeometry?: GeoJson;
  /**
   * @type {string}
   * @memberof PolygonFilterAPI
   * @default "epsg:4326"
   */
  crs: string;
}

export interface PolygonFilterAPI {
  /**
   * @type {string}
   * @memberof PolygonFilterAPI
   */
  geometry: string;
  /**
   * @type {string}
   * @memberof PolygonFilterAPI
   * @default "epsg:4326"
   */
  crs: string;
  /**
   * @type {string}
   * @memberof PolygonFilterAPI
   * @default "wkt"
   */
  geometryType?: string;
}
