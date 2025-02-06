// Do not modify this file!
// It was generated by the command "yarn codegen".
// Instead update the code generation logic or the OpenAPI document.

import { CursorAndAsyncIterator } from "@cognite/sdk-core";
/**
 * The external ID provided by the client. Must be unique for the resource type.
 * @maxLength 255
 * @example "my.known.id"
 */
export type CogniteExternalId = string;
/**
 * A server-generated ID for the object.
 * @format int64
 * @min 1
 * @max 9007199254740991
 */
export type CogniteInternalId = number;
/** A document */
export interface Document {
    /**
     * The ids of any assets referred to in the document
     * @example [42,101]
     */
    assetIds?: CogniteInternalId[];
    /**
     * The author of the document
     * @example "William Shakespeare"
     */
    author?: string;
    /**
     * When the document was created, measured in milliseconds since 00:00:00 Thursday, 1 January 1970. We do a best effort to determine the created time for the document, and it will be derived from either the document metadata, the user-specified created time provided when uploading the file or as a last resort the creation timestamp of the underlying file resource.
     * @example 1519862400000
     */
    createdTime: EpochTimestamp;
    /**
     * Extension of the file (always in lowercase)
     * @example "pdf"
     */
    extension?: string;
    /**
     * The external ID for the document. This field will be the same as the value set in the Files API.
     * @example "haml001"
     */
    externalId?: CogniteExternalId;
    /**
     * Geolocation derived for this document. Represented using a GeoJSON Geometry.
     *
     * The derived geolocation also includes geolocation information from a matched
     * asset (see assetIds property). For matched assets without geolocation information
     * the parent chain is followed until it finds an asset with geolocation information.
     */
    geoLocation?: DocumentGeoJsonGeometry;
    /**
     * The unique identifier for the document. This is automatically generated by CDF, and will be the same as the corresponding value in the Files API.
     * @example 2384
     */
    id: CogniteInternalId;
    labels?: LabelList;
    /**
     * The detected language used in the document
     * @example "en"
     */
    language?: string;
    /**
     * When the document was last indexed in the documents search engine, measured in milliseconds since 00:00:00 Thursday, 1 January 1970.
     * @example 1521062805000
     */
    lastIndexedTime?: EpochTimestamp;
    /**
     * Detected mime type for the document
     * @example "text/plain"
     */
    mimeType?: string;
    /**
     * When the document was last modified, measured in milliseconds since 00:00:00 Thursday, 1 January 1970. This holdes the user-specified modified time provided for the underlying file resource, but might in the future also be derived from document metadata.
     * @example 1519958703000
     */
    modifiedTime?: EpochTimestamp;
    /**
     * Number of pages for multi-page documents
     * @format int32
     * @example 2
     */
    pageCount?: number;
    /** The producer of the document. Many document types contain metadata indicating what software or system was used to create the document. */
    producer?: string;
    /** The source file that this document is derived from. */
    sourceFile: DocumentSourceFile;
    /**
     * The title of the document
     * @example "Hamlet"
     */
    title?: string;
    /**
     * The textual content of the document. Truncated to 155 characters but subject to change
     * @example "ACT I
     * SCENE I. Elsinore. A platform before the castle.
     *   FRANCISCO at his post. Enter to him BERNARDO
     * BERNARDO
     *   Who's there?
     * "
     */
    truncatedContent?: string;
    /**
     * Detected type of document
     * @example "Document"
     */
    type?: string;
}
/** A JSON based filtering language. See detailed documentation above. */
export type DocumentAggregateFilter = DocumentAggregateFilterBool | DocumentAggregateFilterLeaf;
/**
 * bool filters
 * A query that matches items matching boolean combinations of other queries.
 * It is built using one or more boolean clauses, which can be of types: `and`, `or` or `not`
 */
export type DocumentAggregateFilterBool = {
    /**
     * All of the sub-clauses in the query must appear in matching items.
     * @minItems 1
     * @example [{"prefix":{"property":["name"],"value":"Report"}},{"equals":{"property":["type"],"value":"PDF"}}]
     */
    and: DocumentAggregateFilter[];
} | {
    /**
     * At least one of the sub-clauses in the query must appear in matching items.
     * @minItems 1
     * @example [{"prefix":{"property":["name"],"value":"Report"}},{"prefix":{"property":["name"],"value":"Summary"}}]
     */
    or: DocumentAggregateFilter[];
} | {
    /**
     * Filter
     * Sub-clauses in the query must not appear in matching items.
     * @example [{"equals":{"property":["type"],"value":"PDF"}}]
     */
    not: DocumentAggregateFilter;
};
/**
 * leaf filters
 * Leaf filter
 */
export type DocumentAggregateFilterLeaf = DocumentAggregateFilterPrefix;
/** prefix */
export interface DocumentAggregateFilterPrefix {
    /**
     * Matches items that contain a specific prefix in the provided property.
     * @example {"property":["name"],"value":"Report"}
     */
    prefix: {
        /** Value you wish to find in the provided property. */
        value: DocumentFilterValue;
    };
}
export type DocumentAggregateValue = string | number | Label;
export interface DocumentCursor {
    /** Cursor for paging through results. */
    cursor?: string;
}
/** A JSON based filtering language. See detailed documentation above. */
export type DocumentFilter = DocumentFilterBool | DocumentFilterLeaf;
/**
 * bool filters
 * A query that matches items matching boolean combinations of other queries.
 * It is built using one or more boolean clauses, which can be of types: `and`, `or` or `not`
 */
export type DocumentFilterBool = {
    /**
     * All of the sub-clauses in the query must appear in matching items.
     * @minItems 1
     * @example [{"prefix":{"property":["name"],"value":"Report"}},{"equals":{"property":["type"],"value":"PDF"}}]
     */
    and: DocumentFilter[];
} | {
    /**
     * At least one of the sub-clauses in the query must appear in matching items.
     * @minItems 1
     * @example [{"prefix":{"property":["name"],"value":"Report"}},{"prefix":{"property":["name"],"value":"Summary"}}]
     */
    or: DocumentFilter[];
} | {
    /**
     * Filter
     * Sub-clauses in the query must not appear in matching items.
     * @example [{"equals":{"property":["type"],"value":"PDF"}}]
     */
    not: DocumentFilter;
};
/** containsAll */
export interface DocumentFilterContainsAll {
    /**
     * Matches items where the property contains all the given values
     * @example {"property":["assetIds"],"values":[51276,94287]}
     */
    containsAll: {
        /**
         * Property you wish to filter. It's a list of strings to allow specifying nested properties.
         * For example, If you have the object `{"foo": {"../bar": "baz"}, "bar": 123}`, you can refer to the nested property as `["foo", "../bar"]` and the un-nested one as `["bar"]`.
         */
        property: DocumentFilterProperty;
        /** One or more values you wish to find in the provided property. */
        values: DocumentFilterValueList;
    };
}
/** containsAny */
export interface DocumentFilterContainsAny {
    /**
     * Matches items where the property contains one or more of the given values
     * @example {"property":["assetIds"],"values":[51276,94287]}
     */
    containsAny: {
        /**
         * Property you wish to filter. It's a list of strings to allow specifying nested properties.
         * For example, If you have the object `{"foo": {"../bar": "baz"}, "bar": 123}`, you can refer to the nested property as `["foo", "../bar"]` and the un-nested one as `["bar"]`.
         */
        property: DocumentFilterProperty;
        /** One or more values you wish to find in the provided property. */
        values: DocumentFilterValueList;
    };
}
/** equals */
export interface DocumentFilterEquals {
    /**
     * Matches items that contain the exact value in the provided property.
     * @example {"property":["type"],"value":"PDF"}
     */
    equals: {
        /**
         * Property you wish to filter. It's a list of strings to allow specifying nested properties.
         * For example, If you have the object `{"foo": {"../bar": "baz"}, "bar": 123}`, you can refer to the nested property as `["foo", "../bar"]` and the un-nested one as `["bar"]`.
         */
        property: DocumentFilterProperty;
        /** Value you wish to find in the provided property. */
        value: DocumentFilterValue;
    };
}
/** exists */
export interface DocumentFilterExists {
    /**
     * Matches items that contain a value for the provided property.
     * @example {"property":["language"]}
     */
    exists: {
        /**
         * Property you wish to filter. It's a list of strings to allow specifying nested properties.
         * For example, If you have the object `{"foo": {"../bar": "baz"}, "bar": 123}`, you can refer to the nested property as `["foo", "../bar"]` and the un-nested one as `["bar"]`.
         */
        property: DocumentFilterProperty;
    };
}
/** geojsonDisjoint */
export interface DocumentFilterGeoJsonDisjoint {
    /** Matches items with geolocations that are disjoint from the provided geometry */
    geojsonDisjoint: {
        /**
         * Property you wish to filter. It's a list of strings to allow specifying nested properties.
         * For example, If you have the object `{"foo": {"../bar": "baz"}, "bar": 123}`, you can refer to the nested property as `["foo", "../bar"]` and the un-nested one as `["bar"]`.
         */
        property: DocumentFilterProperty;
        /** GeoJSON Geometry. */
        geometry: DocumentGeoJsonGeometry;
    };
}
/** geojsonIntersects */
export interface DocumentFilterGeoJsonIntersects {
    /** Matches items with geolocations that intersect the provided geometry */
    geojsonIntersects: {
        /**
         * Property you wish to filter. It's a list of strings to allow specifying nested properties.
         * For example, If you have the object `{"foo": {"../bar": "baz"}, "bar": 123}`, you can refer to the nested property as `["foo", "../bar"]` and the un-nested one as `["bar"]`.
         */
        property: DocumentFilterProperty;
        /** GeoJSON Geometry. */
        geometry: DocumentGeoJsonGeometry;
    };
}
/** geojsonWithin */
export interface DocumentFilterGeoJsonWithin {
    /** Matches items with geolocations that are within the provided geometry */
    geojsonWithin: {
        /**
         * Property you wish to filter. It's a list of strings to allow specifying nested properties.
         * For example, If you have the object `{"foo": {"../bar": "baz"}, "bar": 123}`, you can refer to the nested property as `["foo", "../bar"]` and the un-nested one as `["bar"]`.
         */
        property: DocumentFilterProperty;
        /** GeoJSON Geometry. */
        geometry: DocumentGeoJsonGeometry;
    };
}
/** in */
export interface DocumentFilterIn {
    /**
     * Matches items where the property matches one of the given values
     * @example {"property":["author"],"values":["Etiam Eget","Praesent Vestibulum"]}
     */
    in: {
        /**
         * Property you wish to filter. It's a list of strings to allow specifying nested properties.
         * For example, If you have the object `{"foo": {"../bar": "baz"}, "bar": 123}`, you can refer to the nested property as `["foo", "../bar"]` and the un-nested one as `["bar"]`.
         */
        property: DocumentFilterProperty;
        /** One or more values you wish to find in the provided property. */
        values: DocumentFilterValueList;
    };
}
/** inAssetSubtree */
export interface DocumentFilterInAssetSubtree {
    /**
     * Matches items where the property contains one or more assets in a subtree rooted at any of the given values
     * @example {"property":["assetIds"],"values":[51276,94287]}
     */
    inAssetSubtree: {
        /**
         * Property you wish to filter. It's a list of strings to allow specifying nested properties.
         * For example, If you have the object `{"foo": {"../bar": "baz"}, "bar": 123}`, you can refer to the nested property as `["foo", "../bar"]` and the un-nested one as `["bar"]`.
         */
        property: DocumentFilterProperty;
        /** One or more values you wish to find in the provided property. */
        values: DocumentFilterValueList;
    };
}
/**
 * leaf filters
 * Leaf filter
 */
export type DocumentFilterLeaf = DocumentFilterEquals | DocumentFilterIn | DocumentFilterContainsAny | DocumentFilterContainsAll | DocumentFilterRange | DocumentFilterPrefix | DocumentFilterSearch | DocumentFilterExists | DocumentFilterGeoJsonIntersects | DocumentFilterGeoJsonDisjoint | DocumentFilterGeoJsonWithin | DocumentFilterInAssetSubtree;
/** prefix */
export interface DocumentFilterPrefix {
    /**
     * Matches items that contain a specific prefix in the provided property.
     * @example {"property":["name"],"value":"Report"}
     */
    prefix: {
        /**
         * Property you wish to filter. It's a list of strings to allow specifying nested properties.
         * For example, If you have the object `{"foo": {"../bar": "baz"}, "bar": 123}`, you can refer to the nested property as `["foo", "../bar"]` and the un-nested one as `["bar"]`.
         */
        property: DocumentFilterProperty;
        /** Value you wish to find in the provided property. */
        value: DocumentFilterValue;
    };
}
/**
 * Property you wish to filter. It's a list of strings to allow specifying nested properties.
 * For example, If you have the object `{"foo": {"../bar": "baz"}, "bar": 123}`, you can refer to the nested property as `["foo", "../bar"]` and the un-nested one as `["bar"]`.
 * @maxItems 3
 * @minItems 1
 * @example ["sourceFile","name"]
 */
export type DocumentFilterProperty = string[];
/** range */
export interface DocumentFilterRange {
    /**
     * Matches items that contain terms within the provided range.
     * Range must include both an upper and a lower bound. It is not allowed to specify both inclusive and exclusive
     * bounds (like `gte`, `gt`) together.
     * `gte`: Greater than or equal to.
     * `gt`: Greater than.
     * `lte`: Less than or equal to.
     * `lt`: Less than.
     * @example {"property":["createdTime"],"gte":1609459200000,"lt":1640995200000}
     */
    range: {
        /**
         * Property you wish to filter. It's a list of strings to allow specifying nested properties.
         * For example, If you have the object `{"foo": {"../bar": "baz"}, "bar": 123}`, you can refer to the nested property as `["foo", "../bar"]` and the un-nested one as `["bar"]`.
         */
        property: DocumentFilterProperty;
        /** Value you wish to find in the provided property using a range clause. */
        gte?: DocumentFilterRangeValue;
        /** Value you wish to find in the provided property using a range clause. */
        gt?: DocumentFilterRangeValue;
        /** Value you wish to find in the provided property using a range clause. */
        lte?: DocumentFilterRangeValue;
        /** Value you wish to find in the provided property using a range clause. */
        lt?: DocumentFilterRangeValue;
    };
}
/** Value you wish to find in the provided property using a range clause. */
export type DocumentFilterRangeValue = number;
/** search */
export interface DocumentFilterSearch {
    /**
     * Matches items that contains the search query.
     * @example {"property":["content"],"value":"Report"}
     */
    search: {
        /**
         * Property you wish to filter. It's a list of strings to allow specifying nested properties.
         * For example, If you have the object `{"foo": {"../bar": "baz"}, "bar": 123}`, you can refer to the nested property as `["foo", "../bar"]` and the un-nested one as `["bar"]`.
         */
        property: DocumentFilterProperty;
        value: string;
    };
}
/** Value you wish to find in the provided property. */
export type DocumentFilterValue = string | number | boolean | Label;
/**
 * One or more values you wish to find in the provided property.
 * @maxItems 100
 * @minItems 1
 */
export type DocumentFilterValueList = DocumentFilterValue[];
/**
 * GeoJSON Geometry.
 * @example {"type":"Point","coordinates":[10.74609,59.91273]}
 */
export interface DocumentGeoJsonGeometry {
    /** Coordinates of the geometry. */
    coordinates?: number[] | number[][] | number[][][];
    /** List of geometries for a GeometryCollection. Nested GeometryCollection is not supported */
    geometries?: DocumentGeoJsonGeometry[];
    /**
     * Type of the GeoJSON Geometry. When filtering there is a limit of specifying up to 100 positions in the data.
     * @example "Point"
     */
    type: string;
}
/**
 * Highlighted snippets from name and content fields which show where the query matches are. The matched terms will be placed inside <em> tags
 * @example {"name":["amet elit <em>non diam</em> aliquam suscipit"],"content":["Nunc <em>vulputate erat</em> ipsum, at aliquet ligula vestibulum at","<em>Quisque</em> lectus ex, fringilla aliquet <em>eleifend</em> nec, laoreet a velit.\n\nPhasellus <em>faucibus</em> risus arcu"]}
 */
export interface DocumentHighlight {
    /** Matches in content. */
    content: string[];
    /** Matches in name. */
    name: string[];
}
/** Filter with exact match */
export interface DocumentListFilter {
    /** A JSON based filtering language. See detailed documentation above. */
    filter?: DocumentFilter;
}
export interface DocumentListLimit {
    /**
     * Maximum number of items per page. Use the cursor to get more pages.
     * @format int32
     * @min 1
     * @max 1000
     * @default 100
     */
    limit?: number;
}
export type DocumentListRequest = DocumentListFilter & DocumentSort & DocumentListLimit & DocumentCursor;
export interface DocumentListResponse extends CursorAndAsyncIterator<Document> {
}
export interface DocumentsAggregateAllUniquePropertiesItem {
    /**
     * Number of properties with this name
     * @format int64
     */
    count: number;
    /** A property name */
    values: string[];
}
/**
 * All unique properties
 * Find all metadata property names
 * @deprecated
 */
export type DocumentsAggregateAllUniquePropertiesRequest = DocumentSearchInAggregate & DocumentSearchFilter & {
    aggregate: "allUniqueProperties";
    /**
     * List of properties for which you want to get the nested property names. The only supported property is currently `["sourceFile", "metadata"]`.
     * @maxItems 1
     * @minItems 1
     */
    properties: {
        /** The property to list nested properties for */
        property: DocumentFilterProperty;
    }[];
    /**
     * Maximum number of items.
     * @format int32
     * @min 1
     * @max 10000
     * @default 100
     */
    limit?: number;
    /** Cursor for paging through results. */
    cursor?: string;
};
/**
 * All unique properties
 * Response for the allUniqueProperties aggregate.
 * @deprecated
 * @example {"items":[{"count":4,"values":["hello"]},{"count":33,"values":["world"]}]}
 */
export interface DocumentsAggregateAllUniquePropertiesResponse extends CursorAndAsyncIterator<DocumentsAggregateAllUniquePropertiesItem> {
}
export interface DocumentsAggregateAllUniqueValuesItem {
    /**
     * Number of items in this aggregation group.
     * @format int64
     */
    count: number;
    /** A unique value found in the specified properties. Each item is a value for the specified property with same index. */
    values: DocumentAggregateValue[];
}
/**
 * All unique values
 * Paginated list of all unique values for given properties.
 * @deprecated
 */
export type DocumentsAggregateAllUniqueValuesRequest = DocumentSearchInAggregate & DocumentSearchFilter & {
    aggregate: "allUniqueValues";
    /**
     * List of properties to group by. It is currently only possible to group by 1 property.
     * @maxItems 1
     * @minItems 1
     */
    properties: {
        /** A property to group by. */
        property: DocumentFilterProperty;
    }[];
    /**
     * Maximum number of items per page.
     * @format int32
     * @min 1
     * @max 10000
     * @default 100
     */
    limit?: number;
    /** Cursor for paging through results. */
    cursor?: string;
};
/**
 * All unique values
 * Response for allUniqueValues aggregate.
 * @deprecated
 * @example {"items":[{"count":4,"values":["hello"]},{"count":33,"values":["world"]}]}
 */
export interface DocumentsAggregateAllUniqueValuesResponse extends CursorAndAsyncIterator<DocumentsAggregateAllUniqueValuesItem> {
}
export interface DocumentsAggregateCardinalityPropertiesItem {
    /**
     * Number of items in this aggregation group.
     * @format int64
     */
    count: number;
}
/**
 * CardinalityProperties
 * Find approximate number of unique properties.
 */
export type DocumentsAggregateCardinalityPropertiesRequest = DocumentSearchInAggregate & DocumentSearchFilter & {
    aggregate: "cardinalityProperties";
    /** A JSON based filtering language. See detailed documentation above. */
    aggregateFilter?: DocumentAggregateFilter;
    /**
     * The scope within which properties should be aggregated. The only value that is currently allowed is `["metadata"]`, which will aggregate metadata keys.
     * @maxItems 1
     * @minItems 1
     */
    path: "metadata"[];
};
/**
 * CardinalityProperties
 * Response for cardinalityProperties aggregate.
 * @example {"items":[{"count":10}]}
 */
export interface DocumentsAggregateCardinalityPropertiesResponse {
    /**
     * @maxItems 1
     * @minItems 1
     */
    items: DocumentsAggregateCardinalityPropertiesItem[];
}
export interface DocumentsAggregateCardinalityValuesItem {
    /**
     * Number of items in this aggregation group.
     * @format int64
     */
    count: number;
}
/**
 * CardinalityValues
 * Find approximate number of unique values.
 */
export type DocumentsAggregateCardinalityValuesRequest = DocumentSearchInAggregate & DocumentSearchFilter & {
    aggregate: "cardinalityValues";
    /** A JSON based filtering language. See detailed documentation above. */
    aggregateFilter?: DocumentAggregateFilter;
    /**
     * List of properties for which you want to get the approximate number of unique values.
     * @maxItems 1
     * @minItems 1
     */
    properties: {
        /** The property to get the approximate number of unique values for */
        property: DocumentFilterProperty;
    }[];
};
/**
 * CardinalityValues
 * Response for cardinalityValues aggregate.
 * @example {"items":[{"count":10}]}
 */
export interface DocumentsAggregateCardinalityValuesResponse {
    /**
     * @maxItems 1
     * @minItems 1
     */
    items: DocumentsAggregateCardinalityValuesItem[];
}
export interface DocumentsAggregateCountItem {
    /**
     * Number of items in this aggregation group.
     * @format int64
     */
    count: number;
}
/**
 * Count
 * Count of documents.
 */
export type DocumentsAggregateCountRequest = DocumentSearchInAggregate & DocumentSearchFilter & {
    /**
     * Count of documents matching the specified filters and search.
     * @default "count"
     */
    aggregate?: "count";
};
/**
 * Count
 * Response for count aggregate.
 * @example {"items":[{"count":10}]}
 */
export interface DocumentsAggregateCountResponse {
    /**
     * @maxItems 1
     * @minItems 1
     */
    items: DocumentsAggregateCountItem[];
}
export type DocumentsAggregateRequest = DocumentsAggregateCountRequest | DocumentsAggregateCardinalityValuesRequest | DocumentsAggregateCardinalityPropertiesRequest | DocumentsAggregateUniqueValuesRequest | DocumentsAggregateUniquePropertiesRequest | DocumentsAggregateAllUniquePropertiesRequest | DocumentsAggregateAllUniqueValuesRequest;
export type DocumentsAggregateResponse = DocumentsAggregateCountResponse | DocumentsAggregateCardinalityValuesResponse | DocumentsAggregateCardinalityPropertiesResponse | DocumentsAggregateUniqueValuesResponse | DocumentsAggregateUniquePropertiesResponse | DocumentsAggregateAllUniquePropertiesResponse | DocumentsAggregateAllUniqueValuesResponse;
export interface DocumentsAggregateUniquePropertiesItem {
    /**
     * Number of properties with this name
     * @format int64
     */
    count: number;
    /** A property name */
    values: string[];
}
/**
 * UniqueProperties
 * Top unique metadata property names
 */
export type DocumentsAggregateUniquePropertiesRequest = DocumentSearchInAggregate & DocumentSearchFilter & {
    aggregate: "uniqueProperties";
    /** A JSON based filtering language. See detailed documentation above. */
    aggregateFilter?: DocumentAggregateFilter;
    /**
     * List of properties for which you want to get the nested property names. The only supported property is currently `["sourceFile", "metadata"]`.
     * @maxItems 1
     * @minItems 1
     */
    properties: {
        /** The property to list nested properties for */
        property: DocumentFilterProperty;
    }[];
    /**
     * Maximum number of items.
     * @format int32
     * @min 1
     * @max 10000
     * @default 100
     */
    limit?: number;
};
/**
 * UniqueProperties
 * Response for the uniqueProperties aggregate.
 * @example {"items":[{"count":4,"values":["hello"]},{"count":33,"values":["world"]}]}
 */
export interface DocumentsAggregateUniquePropertiesResponse {
    /**
     * @maxItems 10000
     * @minItems 0
     */
    items: DocumentsAggregateUniquePropertiesItem[];
}
export interface DocumentsAggregateUniqueValuesItem {
    /**
     * Number of items in this aggregation group.
     * @format int64
     */
    count: number;
    /** A unique value found in the specified properties. Each item is a value for the specified property with same index. */
    values: DocumentAggregateValue[];
}
/**
 * UniqueValues
 * Top unique values for given properties.
 */
export type DocumentsAggregateUniqueValuesRequest = DocumentSearchInAggregate & DocumentSearchFilter & {
    aggregate: "uniqueValues";
    /** A JSON based filtering language. See detailed documentation above. */
    aggregateFilter?: DocumentAggregateFilter;
    /**
     * List of properties to group by. It is currently only possible to group by 1 property.
     * @maxItems 1
     * @minItems 1
     */
    properties: {
        /** A property to group by. */
        property: DocumentFilterProperty;
    }[];
    /**
     * Maximum number of items.
     * @format int32
     * @min 1
     * @max 10000
     * @default 100
     */
    limit?: number;
};
/**
 * UniqueValues
 * Response for uniqueValues aggregate.
 * @example {"items":[{"count":4,"values":["hello"]},{"count":33,"values":["world"]}]}
 */
export interface DocumentsAggregateUniqueValuesResponse {
    /**
     * @maxItems 10000
     * @minItems 0
     */
    items: DocumentsAggregateUniqueValuesItem[];
}
export interface DocumentSearch {
    search?: {
        /**
         * The free text search query as described in detail above.
         * @maxLength 1000
         * @example "cognite "lorem ipsum""
         */
        query: string;
        /**
         * Whether or not matches in search results should be highlighted.
         * @deprecated
         * @default false
         */
        highlight?: boolean;
    };
}
export interface DocumentSearchAggregate {
    groups: DocumentSearchAggregateGroup[];
    /** User defined name for this aggregate */
    name: string;
    /**
     * Total number of results for this aggregate
     * @format int32
     */
    total: number;
}
export interface DocumentSearchAggregateGroup {
    /**
     * The number of documents in this group.
     * @format int32
     */
    count: number;
    group: DocumentSearchAggregateGroupIdentifier[];
}
export interface DocumentSearchAggregateGroupIdentifier {
    /** The property that is being aggregated on. */
    property: DocumentFilterProperty;
    /** The value of the property for this group. */
    value: DocumentFilterValue;
}
export interface DocumentSearchAggregates {
    /**
     * @deprecated
     * @maxItems 5
     * @minItems 1
     * @example [{"name":"countOfTypes","aggregate":"count","groupBy":[{"property":["type"]}]}]
     */
    aggregates?: DocumentSearchCountAggregate[];
}
/** @example {"name":"countOfTypes","aggregate":"count","groupBy":[{"property":["type"]}]} */
export interface DocumentSearchCountAggregate {
    /**
     * count
     * @example "count"
     */
    aggregate: "count";
    /**
     * List of properties to group the count by. It's currently only possible to group by 0 or 1 properties. If grouping by 0 properties, the aggregate value is the total count of all documents.
     * @maxItems 1
     * @minItems 0
     */
    groupBy?: DocumentSearchCountAggregatesGroup[];
    /** User defined name for this aggregate */
    name: string;
}
export interface DocumentSearchCountAggregatesGroup {
    /**
     * A property to group by.
     * @example ["type"]
     */
    property: DocumentFilterProperty;
}
/** Filter with exact match */
export interface DocumentSearchFilter {
    /** A JSON based filtering language. See detailed documentation above. */
    filter?: DocumentFilter;
}
export interface DocumentSearchHighlight {
    /** Whether or not matches in search results should be highlighted. */
    highlight?: boolean;
}
export interface DocumentSearchInAggregate {
    search?: {
        /**
         * The free text search query as described in detail above.
         * @maxLength 1000
         * @example "cognite "lorem ipsum""
         */
        query: string;
    };
}
export interface DocumentSearchItem {
    /** Highlighted snippets from name and content fields which show where the query matches are. The matched terms will be placed inside <em> tags */
    highlight?: DocumentHighlight;
    /** A document */
    item: Document;
}
export interface DocumentSearchLimit {
    /**
     * Maximum number of items. When using highlights the maximum value is reduced to 20.
     * @format int32
     * @min 0
     * @max 1000
     * @default 100
     */
    limit?: number;
}
export type DocumentSearchRequest = DocumentSearch & DocumentSearchFilter & DocumentSearchAggregates & DocumentSort & DocumentSearchLimit & DocumentCursor & DocumentSearchHighlight;
export interface DocumentSearchResponse {
    /** @deprecated */
    aggregates?: DocumentSearchAggregate[];
    items: DocumentSearchItem[];
    /** The cursor to get the next page of results (if available). The search endpoint only gives a limited number of results. A missing nextCursor does not imply there are no more results for the provided search. */
    nextCursor?: string;
}
export interface DocumentSort {
    /**
     * List of properties to sort by. Currently only supports 1 property.
     * @maxItems 1
     * @minItems 1
     */
    sort?: DocumentSortItem[];
}
export interface DocumentSortItem {
    /** @default "asc" */
    order?: "asc" | "desc";
    /**
     * Property you wish to filter. It's a list of strings to allow specifying nested properties.
     * For example, If you have the object `{"foo": {"../bar": "baz"}, "bar": 123}`, you can refer to the nested property as `["foo", "../bar"]` and the un-nested one as `["bar"]`.
     */
    property: DocumentFilterProperty;
}
/** The source file that this document is derived from. */
export interface DocumentSourceFile {
    /**
     * The ids of the assets related to this file
     * @example []
     */
    assetIds?: CogniteInternalId[];
    /** The id if the dataset this file belongs to, if any */
    datasetId?: CogniteInternalId;
    /**
     * The directory the file can be found in
     * @example "plays/shakespeare"
     */
    directory?: string;
    /** GeoJSON Geometry. */
    geoLocation?: DocumentGeoJsonGeometry;
    /**
     * The hash of the source file. This is a SHA256 hash of the original file. The hash only covers the file content, and not other CDF metadata.
     * @example "23203f9264161714cdb8d2f474b9b641e6a735f8cea4098c40a3cab8743bd749"
     */
    hash?: string;
    /** A list of labels associated with this document's source file in CDF. */
    labels?: LabelList;
    metadata?: Record<string, string>;
    /**
     * The mime type of the file
     * @example "application/octet-stream"
     */
    mimeType?: string;
    /**
     * Name of the file.
     * @example "hamlet.txt"
     */
    name: string;
    /**
     * The security category IDs required to access this file
     * @example []
     */
    securityCategories?: number[];
    /**
     * The size of the source file in bytes
     * @format int64
     * @example 1000
     */
    size?: number;
    /**
     * The source of the file
     * @example "SubsurfaceConnectors"
     */
    source?: string;
}
/** A temporary link to download a preview of the document. The link is reachable without additional authentication details for a limited time. */
export interface DocumentsPreviewTemporaryLinkResponse {
    /** @example 1519862400000 */
    expirationTime: EpochTimestamp;
    temporaryLink: string;
}
/**
 * The number of milliseconds since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
 * @format int64
 * @min 0
 */
export type EpochTimestamp = number;
/**
 * Label
 * A label assigned to a resource.
 */
export interface Label {
    /** An external ID to a predefined label definition. */
    externalId: CogniteExternalId;
}
/**
 * A list of the labels associated with this resource item.
 * @maxItems 10
 * @minItems 0
 * @uniqueItems true
 */
export type LabelList = Label[];
