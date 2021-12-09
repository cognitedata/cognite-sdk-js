import { InternalId, Limit, ExternalId } from '@cognite/sdk-core';

export type GeometryType = 'wkt' | 'geojson';

export type AttributeType =
  | 'STRING'
  | 'LONG'
  | 'DOUBLE'
  | 'BOOLEAN'
  | 'TIMESTAMP'
  | 'GEOMETRY'
  | 'POINT'
  | 'LINESTRING'
  | 'POLYGON'
  | 'MULTIPOINT'
  | 'MULTILINESTRING'
  | 'MULTIPOLYGON'
  | 'GEOMETRYZ'
  | 'POINTZ'
  | 'LINESTRINGZ'
  | 'POLYGONZ'
  | 'MULTIPOINTZ'
  | 'MULTILINESTRINGZ'
  | 'MULTIPOLYGONZ'
  | 'GEOMETRYCOLLECTION';

export interface Attributes {
  [attribute: string]: {
    type: AttributeType;
    description?: string;
    srid?: number;
    size?: number;
    optional?: boolean;
  };
}

export interface Spatial {
  [id: string]: unknown;
}

export interface FeatureCreateItem extends ExternalId {
  [attribute: string]:
    | string
    | number
    | boolean
    | Date
    | { wkt: string }
    | { geojson: object };
}

export interface Feature extends FeatureCreateItem {
  createdTime: Date;
  lastUpdatedTime: Date;
}

export interface FeatureType extends ExternalId, InternalId {
  attributes: Attributes & {
    _created_at: { type: 'LONG' };
    _updated_at: { type: 'LONG' };
    _external_id: { type: 'STRING'; size: 32 };
  };
  searchSpec?: {
    [indexName: string]: {
      attributes:
        | Array<keyof FeatureTypeCreateItem['attributes']>
        | ['_created_at']
        | ['_updated_at']
        | ['_external_id'];
    };
  };
}

export interface FeatureTypeCreateItem extends ExternalId {
  attributes: Attributes;
  searchSpec?: {
    [indexName: string]: {
      attributes: Array<keyof FeatureTypeCreateItem['attributes']>;
    };
  };
}

export interface FeatureTypePatch extends ExternalId {
  update:
    | {
        attributes: { add: Attributes };
      }
    | {
        searchSpec: {
          add: { [indexName: string]: { attributes: Array<keyof Attributes> } };
        };
      };
}

export interface FeatureSearchFilter extends Limit {
  filter: OrFilter & AndFilter & NotFilter & AllFilters;
}

interface AttributeValue {
  attribute: string;
  value: unknown;
}

interface AllFilters
  extends EqualsFilter,
    WithinFilter,
    IntersectsFilter,
    CompletelyWithinFilter,
    WithinDistanceFilter,
    RangeFilter {}

interface EqualsFilter {
  equals?: AttributeValue;
}

interface WithinFilter {
  within?: AttributeValue;
}

interface IntersectsFilter {
  intersects?: AttributeValue;
}

interface CompletelyWithinFilter {
  completelyWithin?: AttributeValue;
}

interface WithinDistanceFilter {
  withinDistance?: AttributeValue & { distance: number };
}

interface RangeFilter {
  range?:
    | { attribute: string; gt: unknown }
    | { attribute: string; lt: unknown }
    | { attribute: string; ge: unknown }
    | { attribute: string; le: string };
}

interface OrFilter {
  or: AllFilters[];
}

interface AndFilter {
  and: AllFilters[];
}

interface NotFilter {
  not: AllFilters;
}
