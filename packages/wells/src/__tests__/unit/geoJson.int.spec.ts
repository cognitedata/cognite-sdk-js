import {
  stringify as convertGeoJsonToWKT,
  parse as convertWKTToGeoJson,
} from 'wkt';
import { GeoJson, Polygon } from 'wells/src/client/model/GeoJson';

describe('GeoJson unit tests', () => {
  test('convert GeoJson to WKT (well-known text)', () => {
    const polygon = <GeoJson>{
      type: 'Polygon',
      coordinates: [[[30, 10], [40, 40], [20, 40], [10, 20], [30, 10]]],
    };

    const originalGeometry = {
      type: 'wellmodel',
      geometry: <GeoJson>polygon,
    };

    const originalWkt = <string>convertGeoJsonToWKT(originalGeometry.geometry);
    const reproducedGeoJson = <Polygon>convertWKTToGeoJson(originalWkt);

    const poly1 = <GeoJson>originalGeometry.geometry;
    const poly2 = <GeoJson>reproducedGeoJson;

    expect(poly1.type).toBe(poly2.type);
    expect(poly2.coordinates.pop.length).toBe(poly1.coordinates.pop.length);
  });
});
