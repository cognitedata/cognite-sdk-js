import { InternalId, Limit, ExternalId } from '@cognite/sdk-core';

import { Geometry, GeoJSON } from 'geojson';

export { GeoJSON };

export type GeometryType = 'WKT' | 'GEOJSON';

type GeometryPropertyType =
  | 'GEOMETRY'
  | 'POINT'
  | 'LINESTRING'
  | 'POLYGON'
  | 'MULTIPOINT'
  | 'MULTILINESTRING'
  | 'MULTIPOLYGON'
  | 'GEOMETRYCOLLECTION'
  | 'GEOMETRYZ'
  | 'POINTZ'
  | 'LINESTRINGZ'
  | 'POLYGONZ'
  | 'MULTIPOINTZ'
  | 'MULTILINESTRINGZ'
  | 'MULTIPOLYGONZ'
  | 'GEOMETRYM'
  | 'POINTM'
  | 'LINESTRINGM'
  | 'POLYGONM'
  | 'MULTIPOINTM'
  | 'MULTILINESTRINGM'
  | 'MULTIPOLYGONM'
  | 'GEOMETRYCOLLECTIONM'
  | 'GEOMETRYZM'
  | 'POINTZM'
  | 'LINESTRINGZM'
  | 'POLYGONZM'
  | 'MULTIPOINTZM'
  | 'MULTILINESTRINGZM'
  | 'MULTIPOLYGONZM'
  | 'GEOMETRYCOLLECTIONZM';

export type GeospatialPropertyType =
  | 'STRING'
  | 'LONG'
  | 'DOUBLE'
  | 'BOOLEAN'
  | 'TIMESTAMP'
  | GeometryPropertyType;

export type GeospatialFeatureTypeProperty =
  | {
      type: Exclude<GeospatialPropertyType, GeometryPropertyType | 'STRING'>;
      description?: string;
      optional?: boolean;
    }
  | {
      type: GeometryPropertyType;
      srid?: number;
      description?: string;
      optional?: boolean;
    }
  | {
      type: 'STRING';
      size: number;
      description?: string;
      optional?: boolean;
    };

type Properties = Record<string, GeospatialFeatureTypeProperty>;

export interface Geospatial {
  featureType: unknown;
  feature: unknown;
}

export interface GeospatialFeature extends ExternalId {
  [property: string]:
    | string
    | number
    | boolean
    | Date
    | { wkt: string }
    | Geometry;
}

export interface GeospatialFeatureResponse extends GeospatialFeature {
  createdTime: Date;
  lastUpdatedTime: Date;
}

export interface FeatureType extends ExternalId, InternalId {
  properties: Properties & {
    _created_at: { type: 'LONG' };
    _updated_at: { type: 'LONG' };
    _external_id: { type: 'STRING'; size: 32 };
  };
  searchSpec?: {
    [indexName: string]: {
      properties:
        | string[]
        | ['_created_at']
        | ['_updated_at']
        | ['_external_id'];
    };
  };
}

type GeospatialIndexSpec = {
  properties: string[];
};

export interface GeospatialCreateFeatureType extends ExternalId {
  properties: Properties;
  searchSpec?: {
    [indexName: string]: GeospatialIndexSpec;
  };
}

export interface GeospatialUpdateFeatureType extends ExternalId {
  update:
    | {
        properties: { add: Properties } | { remove: string[] };
      }
    | {
        searchSpec:
          | {
              add: { [indexName: string]: { properties: string[] } };
            }
          | { remove: string[] };
      };
}

export interface GeospatialRecursiveDelete {
  recursive?: boolean;
}

export interface GeospatialOutput {
  output?:
    | {
        geometryFormat: GeometryType;
      }
    | {
        properties: Record<string, unknown>;
      };
}

interface GeospatialPropertyAndValue {
  property: string;
  value: unknown;
}

interface GeospatialPropertyAndPattern {
  property: string;
  pattern: string;
}

interface GeospatialAllowCrsTransformation {
  allowCrsTransformation?: boolean;
}

type GeospatialFeatureFilter =
  | {
      or: GeospatialFeatureFilter[];
    }
  | {
      and: GeospatialFeatureFilter[];
    }
  | {
      not: GeospatialFeatureFilter;
    }
  | {
      equals: GeospatialPropertyAndValue;
    }
  | {
      missing: { property: string };
    }
  | {
      like: GeospatialPropertyAndPattern;
    }
  | {
      regex: GeospatialPropertyAndPattern;
    }
  | {
      range:
        | { property: string; gt: string | number }
        | { property: string; lt: string | number }
        | { property: string; gte: string | number }
        | { property: string; lte: string | number };
    }
  | {
      stWithin: GeospatialPropertyAndValue;
    }
  | {
      stIntersects: GeospatialPropertyAndValue;
    }
  | {
      stContainsProperly: GeospatialPropertyAndValue;
    }
  | {
      stWithinDistance: GeospatialPropertyAndValue & { distance: number };
    };

export interface GeospatialFeatureSearchFilter
  extends GeospatialAllowCrsTransformation,
    Limit,
    GeospatialOutput {
  filter?: GeospatialFeatureFilter;
  sort?: string[];
}

export interface GeospatialFeatureSearchStreamFilter
  extends GeospatialAllowCrsTransformation,
    Limit {
  filter?: GeospatialFeatureFilter;
  output?:
    | GeospatialOutput['output']
    | {
        jsonStreamFormat:
          | 'LENGTH_PREFIXED'
          | 'NEW_LINE_DELIMITED'
          | 'CONCATENATED'
          | 'RECORD_SEPARATOR_DELIMITED';
      };
}

export interface FeatureAggregateParams {
  filter?: GeospatialFeatureFilter;
  aggregates: Aggregates[];
  property: string;
  outputSrid?: number;
  groupBy?: string[];
}

type Aggregates =
  | 'avg'
  | 'count'
  | 'max'
  | 'min'
  | 'stCentroid'
  | 'stCollect'
  | 'stConvexHull'
  | 'stIntersection'
  | 'stUnion'
  | 'sum'
  | 'variance';
