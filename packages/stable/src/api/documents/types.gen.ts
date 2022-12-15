// Do not modify this file!
// It was generated by the command "yarn codegen".
// Instead update the code generation logic or the OpenAPI document.

import { CursorAndAsyncIterator } from "@cognite/sdk-core";
/**
 * The external ID provided by the client. Must be unique for the resource type.
 * @example my.known.id
 */
export type CogniteExternalId = string;
/**
 * A server-generated ID for the object.
 * @format int64
 * @min 1
 * @max 9007199254740991
 */
export type CogniteInternalId = number;
/**
 * A document
 */
export interface Document {
    /**
     * The ids of any assets referred to in the document
     * @example [42,101]
     */
    assetIds?: CogniteInternalId[];
    /**
     * The author of the document
     * @example William Shakespeare
     */
    author?: string;
    /**
     * When the document was created, measured in milliseconds since 00:00:00 Thursday, 1 January 1970. We do a best effort to determine the created time for the document, and it will be derived from either the document metadata, the user-specified created time provided when uploading the file or as a last resort the creation timestamp of the underlying file resource.
     * @example 1519862400000
     */
    createdTime: EpochTimestamp;
    /**
     * Extension of the file (always in lowercase)
     * @example pdf
     */
    extension?: string;
    /** @example haml001 */
    externalId?: CogniteExternalId;
    /**
     * Geolocation derived for this document. Represented using a GeoJSON Geometry.
     *
     * The derived geolocation also includes geolocation information from a matched
     * asset (see assetIds property). For matched assets without geolocation information
     * the parent chain is followed until it finds an asset with geolocation information.
     */
    geoLocation?: DocumentGeoJsonGeometry;
    /** @example 2384 */
    id: CogniteInternalId;
    labels?: LabelList;
    /**
     * The detected language used in the document
     * @example en
     */
    language?: string;
    /**
     * When the document was last indexed in the documents search engine, measured in milliseconds since 00:00:00 Thursday, 1 January 1970.
     * @example 1521062805000
     */
    lastIndexedTime?: EpochTimestamp;
    /**
     * Detected mime type for the document
     * @example text/plain
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
    /** The source file that this document is derived from. */
    sourceFile: DocumentSourceFile;
    /**
     * The title of the document
     * @example Hamlet
     */
    title?: string;
    /**
     * The textual content of the document. Truncated to 155 characters but subject to change
     * @example ACT I
     * SCENE I. Elsinore. A platform before the castle.
     *   FRANCISCO at his post. Enter to him BERNARDO
     * BERNARDO
     *   Who's there?
     *
     */
    truncatedContent?: string;
    /**
     * Detected type of document
     * @example Document
     */
    type?: string;
}
export interface DocumentCursor {
    /** Cursor for paging through results */
    cursor?: string;
}
/**
 * A JSON based filtering language. See detailed documentation above.
 */
export type DocumentFilter = DocumentFilterBool | DocumentFilterLeaf;
/**
* A query that matches items matching boolean combinations of other queries.
It is built using one or more boolean clauses, which can be of types: `and`, `or` or `not`
*/
export type DocumentFilterBool = {
    and: DocumentFilter[];
} | {
    or: DocumentFilter[];
} | {
    not: DocumentFilter;
};
export interface DocumentFilterContainsAll {
    /**
     * Matches items where the property contains all the given values
     * @example {"property":["assetIds"],"values":[51276,94287]}
     */
    containsAll: {
        property: DocumentFilterProperty;
        values: DocumentFilterValueList;
    };
}
export interface DocumentFilterContainsAny {
    /**
     * Matches items where the property contains one or more of the given values
     * @example {"property":["assetIds"],"values":[51276,94287]}
     */
    containsAny: {
        property: DocumentFilterProperty;
        values: DocumentFilterValueList;
    };
}
export interface DocumentFilterEquals {
    /**
     * Matches items that contain the exact value in the provided property.
     * @example {"property":["type"],"value":"PDF"}
     */
    equals: {
        property: DocumentFilterProperty;
        value: DocumentFilterValue;
    };
}
export interface DocumentFilterExists {
    /**
     * Matches items that contain a value for the provided property.
     * @example {"property":["language"]}
     */
    exists: {
        property: DocumentFilterProperty;
    };
}
export interface DocumentFilterGeoJsonDisjoint {
    /** Matches items with geolocations that are disjoint from the provided geometry */
    geojsonDisjoint: {
        property: DocumentFilterProperty;
        geometry: DocumentGeoJsonGeometry;
    };
}
export interface DocumentFilterGeoJsonIntersects {
    /** Matches items with geolocations that intersect the provided geometry */
    geojsonIntersects: {
        property: DocumentFilterProperty;
        geometry: DocumentGeoJsonGeometry;
    };
}
export interface DocumentFilterGeoJsonWithin {
    /** Matches items with geolocations that are within the provided geometry */
    geojsonWithin: {
        property: DocumentFilterProperty;
        geometry: DocumentGeoJsonGeometry;
    };
}
export interface DocumentFilterIn {
    /**
     * Matches items where the property matches one of the given values
     * @example {"property":["author"],"values":["Etiam Eget","Praesent Vestibulum"]}
     */
    in: {
        property: DocumentFilterProperty;
        values: DocumentFilterValueList;
    };
}
/**
 * Leaf filter
 */
export type DocumentFilterLeaf = DocumentFilterEquals | DocumentFilterIn | DocumentFilterContainsAny | DocumentFilterContainsAll | DocumentFilterRange | DocumentFilterPrefix | DocumentFilterExists | DocumentFilterGeoJsonIntersects | DocumentFilterGeoJsonDisjoint | DocumentFilterGeoJsonWithin;
export interface DocumentFilterPrefix {
    /**
     * Matches items that contain a specific prefix in the provided property.
     * @example {"property":["name"],"value":"Report"}
     */
    prefix: {
        property: DocumentFilterProperty;
        value: DocumentFilterValue;
    };
}
/**
* Property you wish to filter. It's a list of strings to allow specifying nested properties.
For example, If you have the object `{"foo": {"../bar": "baz"}, "bar": 123}`, you can refer to the nested property as `["foo", "../bar"]` and the un-nested one as `["bar"]`.
* @example ["sourceFile","name"]
*/
export type DocumentFilterProperty = string[];
export interface DocumentFilterRange {
    /**
     * Matches items that contain terms within the provided range.
     * Range must include both an upper and a lower bound. It is not allowed to specify both inclusive and exclusive
     * bounds (like `gte`, `gt`) together.
     * `gte`: Greater than or equal to.
     * `gt`: Greater than.
     * `lte`: Less than or equal to.
     * `lt`: Less than.
     *
     * @example {"property":["createdTime"],"gte":1609459200000,"lt":1640995200000}
     */
    range: {
        property: DocumentFilterProperty;
        gte?: DocumentFilterRangeValue;
        gt?: DocumentFilterRangeValue;
        lte?: DocumentFilterRangeValue;
        lt?: DocumentFilterRangeValue;
    };
}
/**
 * Value you wish to find in the provided property using a range clause.
 */
export type DocumentFilterRangeValue = number;
/**
 * Value you wish to find in the provided property.
 */
export type DocumentFilterValue = string | number | boolean | Label;
/**
 * One or more values you wish to find in the provided property.
 */
export type DocumentFilterValueList = DocumentFilterValue[];
/**
 * GeoJSON Geometry.
 * @example {"type":"Point","coordinates":[10.74609,59.91273]}
 */
export interface DocumentGeoJsonGeometry {
    /**
     * Coordinates of the geometry.
     * @example [10.74609,59.91273]
     */
    coordinates?: any[];
    /** List of geometries for a GeometryCollection. Nested GeometryCollection is not supported */
    geometries?: DocumentGeoJsonGeometry[];
    /**
     * Type of the GeoJSON Geometry. When filtering there is a limit of specifying up to 100 positions in the data.
     * @example Point
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
/**
 * Filter with exact match
 */
export interface DocumentListFilter {
    /**
     * A JSON based filtering language. See detailed documentation above.
     *
     */
    filter?: DocumentFilter;
}
export interface DocumentListLimit {
    /**
     * Maximum number of items per page. Use the cursor to get more pages.
     * @format int32
     * @min 1
     * @max 1000
     */
    limit?: number;
}
export type DocumentListRequest = DocumentListFilter & DocumentListLimit & DocumentCursor;
export interface DocumentListResponse extends CursorAndAsyncIterator<Document> {
}
export interface DocumentsAggregateAllUniqueValuesItem {
    /**
     * Number of items in this aggregation group.
     * @format int64
     */
    count: number;
    /** A unique value found in the specified properties. Each item is a value for the specified property with same index. */
    values: DocumentFilterValue[];
}
/**
 * Paginated list of all unique values for given properties.
 */
export type DocumentsAggregateAllUniqueValuesRequest = {
    search?: {
        query: string;
    };
} & DocumentSearchFilter & {
    aggregate?: "allUniqueValues";
    properties?: {
        property: DocumentFilterProperty;
    }[];
    limit?: number;
    cursor?: string;
};
/**
 * Response for allUniqueValues aggregate.
 * @example {"items":[{"count":4,"values":["hello"]},{"count":33,"values":["world"]}]}
 */
export interface DocumentsAggregateAllUniqueValuesResponse extends CursorAndAsyncIterator<DocumentsAggregateAllUniqueValuesItem> {
}
export interface DocumentsAggregateCountItem {
    /**
     * Number of items in this aggregation group.
     * @format int64
     */
    count: number;
}
/**
 * Count of documents.
 */
export type DocumentsAggregateCountRequest = {
    search?: {
        query: string;
    };
} & DocumentSearchFilter & {
    aggregate?: "count";
};
/**
 * Response for count aggregate.
 * @example {"items":[{"count":10}]}
 */
export interface DocumentsAggregateCountResponse {
    items: DocumentsAggregateCountItem[];
}
export type DocumentsAggregateRequest = DocumentsAggregateCountRequest | DocumentsAggregateUniqueValuesRequest | DocumentsAggregateAllUniqueValuesRequest;
export type DocumentsAggregateResponse = DocumentsAggregateCountResponse | DocumentsAggregateUniqueValuesResponse | DocumentsAggregateAllUniqueValuesResponse;
export interface DocumentsAggregateUniqueValuesItem {
    /**
     * Number of items in this aggregation group.
     * @format int64
     */
    count: number;
    /** A unique value found in the specified properties. Each item is a value for the specified property with same index. */
    values: DocumentFilterValue[];
}
/**
 * Top unique values for given properties.
 */
export type DocumentsAggregateUniqueValuesRequest = {
    search?: {
        query: string;
    };
} & DocumentSearchFilter & {
    aggregate?: "uniqueValues";
    properties?: {
        property: DocumentFilterProperty;
    }[];
    limit?: number;
};
/**
 * Response for uniqueValues aggregate.
 * @example {"items":[{"count":4,"values":["hello"]},{"count":33,"values":["world"]}]}
 */
export interface DocumentsAggregateUniqueValuesResponse {
    items: DocumentsAggregateUniqueValuesItem[];
}
export interface DocumentSearch {
    search?: {
        query: string;
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
    /** @example [{"name":"countOfTypes","aggregate":"count","groupBy":[{"property":["type"]}]}] */
    aggregates?: DocumentSearchCountAggregate[];
}
/**
 * @example {"name":"countOfTypes","aggregate":"count","groupBy":[{"property":["type"]}]}
 */
export interface DocumentSearchCountAggregate {
    /**
     * count
     * @example count
     */
    aggregate: "count";
    /** List of properties to group the count by. It is currently only possible to group by 0 or 1 properties. If grouping by 0 properties, the aggregate value is the total count of all documents. */
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
/**
 * Filter with exact match
 */
export interface DocumentSearchFilter {
    /**
     * A JSON based filtering language. See detailed documentation above.
     *
     */
    filter?: DocumentFilter;
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
     */
    limit?: number;
}
export type DocumentSearchRequest = DocumentSearch & DocumentSearchFilter & DocumentSearchAggregates & DocumentSort & DocumentSearchLimit & DocumentCursor;
export interface DocumentSearchResponse {
    aggregates?: DocumentSearchAggregate[];
    items: DocumentSearchItem[];
    /** The cursor to get the next page of results (if available). The search endpoint only gives a limited number of results. A missing nextCursor does not imply there are no more results for the provided search. */
    nextCursor?: string;
}
export interface DocumentSort {
    /** List of properties to sort by. Currently only supports 1 property. */
    sort?: DocumentSortItem[];
}
export interface DocumentSortItem {
    order?: "asc" | "desc";
    /**
     * Property you wish to filter. It's a list of strings to allow specifying nested properties.
     * For example, If you have the object `{"foo": {"../bar": "baz"}, "bar": 123}`, you can refer to the nested property as `["foo", "../bar"]` and the un-nested one as `["bar"]`.
     *
     */
    property: DocumentFilterProperty;
}
/**
 * The source file that this document is derived from.
 */
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
     * @example plays/shakespeare
     */
    directory?: string;
    /** GeoJSON Geometry. */
    geoLocation?: DocumentGeoJsonGeometry;
    /** A list of labels associated with this document's source file in CDF. */
    labels?: LabelList;
    metadata?: Record<string, string>;
    /**
     * The mime type of the file
     * @example application/octet-stream
     */
    mimeType?: string;
    /**
     * Name of the file.
     * @example hamlet.txt
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
     * @example SubsurfaceConnectors
     */
    source?: string;
}
/**
 * A temporary link to download a preview of the document. The link is reachable without additional authentication details for a limited time.
 */
export interface DocumentsPreviewTemporaryLinkResponse {
    /** @example 1519862400000 */
    expirationTime?: EpochTimestamp;
    temporaryLink?: string;
}
/**
 * The number of milliseconds since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
 * @format int64
 * @min 0
 */
export type EpochTimestamp = number;
/**
 * A label assigned to a resource.
 */
export interface Label {
    /** An external ID to a predefined label definition. */
    externalId: CogniteExternalId;
}
/**
 * A list of the labels associated with this resource item.
 */
export type LabelList = Label[];
