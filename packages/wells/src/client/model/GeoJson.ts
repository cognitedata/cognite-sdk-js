/* Types */

export type Point2D = [number, number];

export type GeoJson = Point | Polygon;

/* Interfaces */

export interface Geometry {
  /**
   * @type {string}
   * @memberof Geometry
   */
  id?: string;
  /**
   * @type {string}
   * @memberof Geometry
   */
  type?: string;
  /**
   * @type {any}
   * @memberof Geometry
   */
  properties?: any;
  /**
   * @type {Geometry}
   * @memberof Geometry
   */
  geometry: GeoJson;
}

export interface Point {
  /**
   * @type {string}
   * @memberof Point
   */
  type: 'Point';
  /**
   * @type {Point2D}
   * @memberof Point
   */
  coordinates: Point2D;
}

export interface Polygon {
  /**
   * @type {string}
   * @memberof Polygon
   */
  type: 'Polygon';
  /**
   * @type {GeometryPoint[]}
   * @memberof Geometry
   */
  coordinates: Point2D[][];
}
