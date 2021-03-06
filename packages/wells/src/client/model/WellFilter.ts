import { MeasurementType } from './MeasurementType';
import { GeoJson } from './GeoJson';
import { LengthRange } from './LengthRange';
import { DateRange } from './DateRange';
import { WellNPTFilter } from './WellNPTFilter';
import { WellNDSFilter } from './WellNDSFilter';

export interface WellFilter {
  /**
   * @type {string[]}
   * @memberof WellFilter
   */
  wellTypes?: string[];
  /**
   * @type {string}
   * @memberof WellFilter
   */
  stringMatching?: string;
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
   * @type {MeasurementFilters}
   * @memberof WellFilter
   */
  hasMeasurements?: MeasurementFilters;
  /**
   * @type {WellNPTFilter}
   * @memberof WellFilter
   */
  npt?: WellNPTFilter;
  /**
   * @type {WellNDSFilter}
   * @memberof WellFilter
   */
  nds?: WellNDSFilter;
  /**
   * @type {PolygonFilterAPI}
   * @memberof WellFilter
   */
  polygon?: PolygonFilter;
  /**
   * @type {string}
   * @memberof WellFilter
   */
  outputCrs?: string;
  /**
   * @type {string[]}
   * @memberof WellFilter
   */
  licenses?: string[];
  /**
   * @type {LengthRange}
   * @memberof WellFilter
   */
  waterDepth?: LengthRange;
  /**
   * @type {DateRange}
   * @memberof WellFilter
   */
  spudDate?: DateRange;
}

export interface WellFilterAPI {
  /**
   * @type {string[]}
   * @memberof WellFilterAPI
   */
  wellTypes?: string[];
  /**
   * @type {string}
   * @memberof WellFilter
   */
  stringMatching?: string;
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
   * @type {MeasurementFilters}
   * @memberof WellFilterAPI
   */
  hasMeasurements?: MeasurementFilters;
  /**
   * @type {WellNPTFilter}
   * @memberof WellFilterAPI
   */
  npt?: WellNPTFilter;
  /**
   * @type {WellNDSFilter}
   * @memberof WellFilter
   */
  nds?: WellNDSFilter;
  /**
   * @type {PolygonFilterAPI}
   * @memberof WellFilterAPI
   */
  polygon?: PolygonFilterAPI;
  /**
   * @type {string[]}
   * @memberof WellFilter
   */
  licenses?: string[];
  /**
   * @type {LengthRange}
   * @memberof WellFilter
   */
  waterDepth?: LengthRange;
  /**
   * @type {DateRange}
   * @memberof WellFilter
   */
  spudDate?: DateRange;
}

export interface TrajectoryFilter {
  /**
   * @type {LengthRange}
   * @memberof TrajectoryFilter
   */
  maxMeasuredDepth?: LengthRange;
  /**
   * @type {DoubleRange}
   * @memberof TrajectoryFilter
   */
  maxInclination?: DoubleRange;
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

export interface MeasurementFilters {
  /**
   * @type {MeasurementFilter[]}
   * @memberof MeasurementFilters
   */
  containsAll?: MeasurementFilter[];
  /**
   * @type {MeasurementFilter[]}
   * @memberof MeasurementFilters
   */
  containsAny?: MeasurementFilter[];
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
