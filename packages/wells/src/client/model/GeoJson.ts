// Type definitions for wkt
// Project: https://github.com/benrei/wkt
// Definitions by: Adam Tombleson rekarnar@gmail.com
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
const { stringify } = require('wkt');
const { parse } = require('wkt');

const geometry = {
  type: 'Point',
  coordinates: [125.6, 10.1, 54.2],
};

//  See return values in output section
const wkt = stringify(geometry);
parse(wkt);

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
