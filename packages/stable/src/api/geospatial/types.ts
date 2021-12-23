import { InternalId, Limit, ExternalId } from '@cognite/sdk-core';

import { Geometry } from 'geojson';

export * from 'geojson';

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

export type PropertyType =
  | 'STRING'
  | 'LONG'
  | 'DOUBLE'
  | 'BOOLEAN'
  | 'TIMESTAMP'
  | GeometryPropertyType;

export type Property =
  | {
      type: GeometryPropertyType;
      srid?: number;
      description?: string;
      optional?: boolean;
    }
  | {
      type: Exclude<PropertyType, GeometryPropertyType | 'STRING'>;
      description?: string;
      optional?: boolean;
    }
  | {
      type: 'STRING';
      size: number;
      description?: string;
      optional?: boolean;
    };

export interface Properties {
  [property: string]: Property;
}

export interface Geospatial {
  [id: string]: unknown;
}

export interface FeatureCreateItem extends ExternalId {
  [property: string]:
    | string
    | number
    | boolean
    | Date
    | { wkt: string }
    | Geometry;
}

export interface Feature extends FeatureCreateItem {
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
        | Array<keyof Properties>
        | ['_created_at']
        | ['_updated_at']
        | ['_external_id'];
    };
  };
}

export interface FeatureTypeCreateItem extends ExternalId {
  properties: Properties;
  searchSpec?: {
    [indexName: string]: {
      properties: Array<keyof Properties>;
    };
  };
}

export interface FeatureTypePatch extends ExternalId {
  update:
    | {
        properties: { add: Properties };
      }
    | {
        searchSpec: {
          add: { [indexName: string]: { properties: Array<keyof Properties> } };
        };
      };
}

export interface FeatureTypeDeleteParams {
  recursive?: boolean;
}

export interface FeatureOutputParams {
  output?:
    | {
        geometryFormat: GeometryType;
      }
    | {
        properties: Record<string, unknown>;
      };
}

interface AttributeValue {
  property: string;
  value: unknown;
}

interface EqualsFilter {
  equals: AttributeValue;
}

interface WithinFilter {
  within: AttributeValue;
}

interface IntersectsFilter {
  intersects: AttributeValue;
}

interface CompletelyWithinFilter {
  completelyWithin: AttributeValue;
}

interface WithinDistanceFilter {
  withinDistance: AttributeValue & { distance: number };
}

interface RangeFilter {
  range:
    | { property: string; gt: string | number }
    | { property: string; lt: string | number }
    | { property: string; gte: string | number }
    | { property: string; lte: string | number };
}

interface MissingFilter {
  missing: { property: string };
}

interface LikeFilter {
  like: { property: string; pattern: string };
}

interface RegexFilter {
  regex: { property: string; pattern: string | RegExp };
}

interface OrFilter {
  or?: NonRecursiveFilters[];
}

interface AndFilter {
  and?: NonRecursiveFilters[];
}

interface NotFilter {
  not?: NonRecursiveFilters;
}

interface SortFilter {
  sort?: string[];
}

interface AllowCrsTransformationFilter {
  allowCrsTransformation?: boolean;
}

interface RecursiveFilters extends OrFilter, AndFilter, NotFilter {}

type NonRecursiveFilters =
  | EqualsFilter
  | MissingFilter
  | LikeFilter
  | RegexFilter
  | RangeFilter
  | WithinFilter
  | IntersectsFilter
  | CompletelyWithinFilter
  | WithinDistanceFilter;

type FilterParams = {
  filter?: RecursiveFilters | NonRecursiveFilters;
};

export interface FeatureSearchFilter
  extends AllowCrsTransformationFilter,
    FilterParams,
    Limit,
    FeatureOutputParams,
    SortFilter {}

export interface FeatureSearchStreamFilter
  extends AllowCrsTransformationFilter,
    FilterParams,
    Limit {
  output?:
    | FeatureOutputParams['output']
    | {
        jsonStreamFormat:
          | 'LENGTH_PREFIXED'
          | 'NEW_LINE_DELIMITED'
          | 'CONCATENATED'
          | 'RECORD_SEPARATOR_DELIMITED';
      };
}

type Aggregates =
  | 'areaOfUnion'
  | 'avg'
  | 'centroid'
  | 'collect'
  | 'convexHull'
  | 'count'
  | 'intersection'
  | 'max'
  | 'min'
  | 'sum'
  | 'union'
  | 'variance';

export interface FeatureAggregateParams extends FilterParams {
  aggregates: Aggregates[];
  property: keyof Properties;
  outputSrid?: number;
  groupBy?: Array<keyof Properties>;
}
