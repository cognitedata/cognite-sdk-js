/* Types */

export type GEOJSONPoint = [number, number]; // DEPRECATED <- use LngLatLike instead

/* Interfaces */

export interface GeoJson {
  /**
   * @type {string}
   * @memberof GeoJson
   */
  id?: string;
  /**
   * @type {string}
   * @memberof GeoJson
   */
  type?: string;
  /**
   * @type {any}
   * @memberof GeoJson
   */
  properties?: any;
  /**
   * @type {Geometry}
   * @memberof GeoJson
   */
  geometry: Geometry;
}

export interface GeometryPoint {
  /**
   * @type {string}
   * @memberof GeometryPoint
   */
  type: string;

  /**
   * @type {GEOJSONPoint}
   * @memberof GeometryPoint
   */
  coordinates: GEOJSONPoint;
}

export interface Geometry {
  /**
   * @type {string}
   * @memberof Geometry
   */
  type: string;
  /**
   * @type {GeometryPoint[]}
   * @memberof Geometry
   */
  coordinates: GEOJSONPoint[];
}
