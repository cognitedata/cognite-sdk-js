// Do not modify this file!
// It was generated by the command "yarn codegen".
// Instead update the code generation logic or the OpenAPI document.

import { CursorAndAsyncIterator } from "@cognite/sdk-core";
export interface AllVersionsQueryParameter {
    allVersions?: boolean;
}
/**
* An external-id reference to an existing CDF resource type item, such as a time series.

An example could be that for an existing time series stored in the CDF time series resource type with the
external-id 21PT0293, then the value would be set to "21PT029", and the type would be set to "timeseries". There
are no referential integrity guarantees for this, and the client should handle if the time series has been removed
or the client may not have access to it.

Currently, time series, sequence and file references are supported.
*/
export interface CDFExternalIdReference {
    /**
     * Specifies that the data type is a list of values.
     *
     */
    list?: boolean;
    type: "timeseries" | "file" | "sequence";
}
export type ConnectionDefinition = EdgeConnection | ReverseDirectRelationConnection;
/**
 * Reference to an existing container
 */
export interface ContainerReference {
    /** External-id of the container */
    externalId: DMSExternalId;
    /** Id of the space hosting (containing) the container */
    space: SpaceSpecification;
    type: "container";
}
export interface ContainsAllFilterV3 {
    /** Matches items where the property contains all the given values. Only apply this filter to multivalued properties. */
    containsAll: {
        property: DMSFilterProperty;
        values: FilterValueList;
    };
}
export interface ContainsAnyFilterV3 {
    /** Matches items where the property contains one or more of the given values. Only apply this filter to multivalued properties. */
    containsAny: {
        property: DMSFilterProperty;
        values: FilterValueList;
    };
}
export interface CorePropertyDefinition {
    /** When set to ```true```, the API will increment the property based on its highest current value  (max value).  You can only use this functionality to increment properties of type `int32` or `int64`.  If the property has a different data type, the API will return an error. */
    autoIncrement?: boolean;
    /**
     * Default value to use when you do not specify a value for the property.  The default value must be of the same type as what you defined for the property itself.
     *
     * We do not currently support using default values for array/list types.
     */
    defaultValue?: string | number | boolean | object;
    /** Description of the content and suggested use for this property. */
    description?: string;
    /** Readable property name. */
    name?: string;
    /** Does this property need to be set to a value, or not? */
    nullable?: boolean;
}
export interface CreateViewProperty {
    /** Reference to an existing container */
    container: ContainerReference;
    /** The unique identifier for the property (Unique within the referenced container). */
    containerPropertyIdentifier: PropertyIdentifierV3;
    /** Description of the content and suggested use for this property. */
    description?: string;
    /** Readable property name. */
    name?: string;
    /** Indicates on what type a referenced direct relation is expected to be (although not required).  Only applicable for direct relation properties. */
    source?: ViewReference;
}
export interface CursorQueryParameter {
    /** @example 4zj0Vy2fo0NtNMb229mI9r1V3YG5NBL752kQz1cKtwo */
    cursor?: string;
}
export type DataModel = DataModelCore & {
    views?: DataModelProperty[];
    createdTime: EpochTimestamp;
    lastUpdatedTime: EpochTimestamp;
    isGlobal: boolean;
};
export interface DataModelCollectionResponse {
    /** List of data models */
    items: DataModel[];
}
export interface DataModelCollectionResponseWithCursorResponse extends CursorAndAsyncIterator<DataModel> {
}
export interface DataModelCore {
    /** Description of the content and intended use of the data model */
    description?: string;
    /** External id that uniquely identifies this data model */
    externalId: DMSExternalId;
    /** Readable name meant for use in UIs */
    name?: string;
    /** Id of the space that the data model belongs to */
    space: SpaceSpecification;
    /** Data model version (opaque string controlled by client applications) */
    version: DMSVersion;
}
export type DataModelCreate = DataModelCore & {
    views?: DataModelCreateProperty[];
};
export interface DataModelCreateCollection {
    /** List of data models to create/update */
    items: DataModelCreate[];
}
export type DataModelCreateProperty = ViewReference | ViewCreateDefinition | (ViewReference & ViewCreateDefinition);
export type DataModelProperty = ViewReference | ViewDefinition | (ViewReference & ViewDefinition);
/**
* Build a new query by combining other queries, using boolean operators. We support the `and`, `or`, and
`not` boolean operators.
*/
export type DataModelsBoolFilter = {
    and: FilterDefinition[];
} | {
    or: FilterDefinition[];
} | {
    not: FilterDefinition;
};
/**
 * Leaf filter
 */
export type DataModelsLeafFilter = EqualsFilterV3 | InFilterV3 | RangeFilterV3 | PrefixFilterV3 | DMSExistsFilter | ContainsAnyFilterV3 | ContainsAllFilterV3 | MatchAllFilter | DataModelsNestedFilter | OverlapsFilterV3 | HasExistingDataFilterV3;
export interface DataModelsNestedFilter {
    /**
     * Use `nested` to apply the properties of the direct relation as the filter.  `scope` specifies the direct
     * relation property you want use as the filtering property.
     *
     * Example:
     * ```
     *   {
     *     "nested": {
     *       "scope": ["some", "direct_relation", "property"],
     *       "filter": {
     *         "equals": {
     *           "property": ["node", "name"],
     *           "value": "ACME"
     *         }
     *       }
     *     }
     *   }
     */
    nested: {
        scope: string[];
        filter: FilterDefinition;
    };
}
/**
 * Direct node relation
 */
export interface DirectNodeRelation {
    /** The (optional) required type for the node the direct relation points to. If specified, the node must exist before the direct relation is referenced and of the specified type. If no container specification is used, the node will be auto created with the built-in ```node``` container type, and it does not explicitly have to be created before the node that references it. */
    container?: ContainerReference;
    type: "direct";
}
/**
 * Reference to the node pointed to by the direct relation. The reference consists of a space and an external-id.
 */
export interface DirectRelationReference {
    externalId: NodeOrEdgeExternalId;
    space: SpaceSpecification;
}
export interface DMSExistsFilter {
    /**
     * Will match items that have a value in the specified property.
     *
     */
    exists: {
        property: DMSFilterProperty;
    };
}
/**
 * @pattern ^[a-zA-Z]([a-zA-Z0-9_]{0,253}[a-zA-Z0-9])?$
 */
export type DMSExternalId = string;
/**
* Property you want to filter. Use a list of strings to specify nested properties.

<u>Example:</u>

You have the object
```
{
  "room": {
    "id": "b53"
  },
  "roomId": "a23"
}
```

Use `["room", "id"]` to return the value in the nested `id` property, which is a part of the `room` object.

You can also read the value(s) in the standalone property `roomId` with `["roomId"]`.
*/
export type DMSFilterProperty = string[];
/**
 * @pattern ^[a-zA-Z0-9]([.a-zA-Z0-9_-]{0,41}[a-zA-Z0-9])?$
 */
export type DMSVersion = string;
/**
 * Describes the edge(s) that are likely to exist to aid in discovery and documentation of the view. A listed edge is not required. i.e. It does not have to exist when included in this list. A connection has a max distance of one hop.
 */
export interface EdgeConnection {
    /** The type of connection, either a single or multi edge connections are expected to exist. */
    connectionType?: "single_edge_connection" | "multi_edge_connection";
    /** Description of the content and suggested use for this property. */
    description?: string;
    direction?: "outwards" | "inwards";
    /** The edge(s) of this connection can be read through the view specified in 'edgeSource'. */
    edgeSource?: ViewReference;
    /** Readable property name. */
    name?: string;
    /** The target node(s) of this connection can be read through the view specified in 'source'. */
    source: ViewReference;
    /** Reference to the node pointed to by the direct relation. The reference consists of a space and an external-id. */
    type: DirectRelationReference;
}
/**
 * The number of milliseconds since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
 * @format int64
 * @min 0
 */
export type EpochTimestamp = number;
export interface EqualsFilterV3 {
    /** Matches items that contain the exact value in the provided property. */
    equals: {
        property: DMSFilterProperty;
        value: FilterValue;
    };
}
/**
 * A filter Domain Specific Language (DSL) used to create advanced filter queries.
 * @example {"and":[{"in":{"property":["tag"],"values":[10011,10011]}},{"range":{"property":["weight"],"gte":0}}]}
 */
export type FilterDefinition = DataModelsBoolFilter | DataModelsLeafFilter;
export type FilterValue = RawPropertyValueV3 | ReferencedPropertyValueV3;
export type FilterValueList = RawPropertyValueListV3 | ReferencedPropertyValueV3;
export type FilterValueRange = RangeValue | ReferencedPropertyValueV3;
export interface HasExistingDataFilterV3 {
    /** Matches items where data is present in the referenced views, or containers. */
    hasData: SourceReference[];
}
export interface IncludeGlobalQueryParameter {
    includeGlobal?: boolean;
}
export interface InFilterV3 {
    /** Matches items where the property **exactly** matches one of the given values. You can only apply this  filter to properties containing a single value. */
    in: {
        property: DMSFilterProperty;
        values: FilterValueList;
    };
}
export interface InlineViewsQueryParameter {
    inlineViews?: boolean;
}
export interface ListOfAllVersionsReferences {
    items: {
        externalId: DMSExternalId;
        space: SpaceSpecification;
        version?: DMSVersion;
    }[];
}
export interface ListOfVersionReferences {
    items: {
        externalId: DMSExternalId;
        space: SpaceSpecification;
        version: DMSVersion;
    }[];
}
export interface MatchAllFilter {
    /** All the listed items must match the clause. */
    matchAll: object;
}
/**
 * The cursor value used to return (paginate to) the next page of results, when more data is available.
 */
export type NextCursorV3 = string;
/**
 * @pattern ^[^\\x00]{1,255}$
 */
export type NodeOrEdgeExternalId = string;
export interface OverlapsFilterV3 {
    /** Matches items where the range made up of the two properties overlap with the provided range. */
    overlaps: {
        startProperty: DMSFilterProperty;
        endProperty: DMSFilterProperty;
        gte?: FilterValueRange;
        gt?: FilterValueRange;
        lte?: FilterValueRange;
        lt?: FilterValueRange;
    };
}
/**
 * A parameterized value
 */
export interface ParameterizedPropertyValueV3 {
    parameter: string;
}
export interface PrefixFilterV3 {
    /** Matches items that have the prefix in the identified property. This filter is only supported for single value text properties. */
    prefix: {
        property: DMSFilterProperty;
        value: string | ParameterizedPropertyValueV3;
    };
}
/**
* Primitive types for the property.

We expect dates to be in the ISO-8601 format, while timestamps are expected to be an epoch value with
millisecond precision. JSON values have to be valid JSON fragments. The maximum allowed size for a JSON
object is 40960 bytes. The maximum allowed length of a key is 128, while the maximum allowed size of a value
is 10240 bytes and you can have up to 256 key-value pairs.
*/
export interface PrimitiveProperty {
    /**
     * Specifies that the data type is a list of values.
     *
     */
    list?: boolean;
    type: "boolean" | "float32" | "float64" | "int32" | "int64" | "timestamp" | "date" | "json";
}
/**
 * @pattern ^[a-zA-Z]([a-zA-Z0-9_]{0,253}[a-zA-Z0-9])?$
 */
export type PropertyIdentifierV3 = string;
export interface RangeFilterV3 {
    /**
     * Matches items that contain terms within the provided range.
     *
     * The range must include both an upper and a lower bound. It is not permitted to specify both inclusive
     * and exclusive bounds together.  E.g. `gte` and `gt`.
     *   `gte`: Greater than or equal to.
     *   `gt`: Greater than.
     *   `lte`: Less than or equal to.
     *   `lt`: Less than.
     */
    range: {
        property: DMSFilterProperty;
        gte?: FilterValueRange;
        gt?: FilterValueRange;
        lte?: FilterValueRange;
        lt?: FilterValueRange;
    };
}
/**
 * Value you wish to find in the provided property using a range clause.
 */
export type RangeValue = string | number | number;
/**
 * A list of values
 */
export type RawPropertyValueListV3 = (string | number | boolean | object)[];
/**
 * A value matching the data type of the defined property
 */
export type RawPropertyValueV3 = string | number | boolean | object | string[] | boolean[] | number[] | object[];
export interface ReducedLimitQueryParameter {
    /**
     * @min 1
     * @max 1000
     */
    limit?: number;
}
/**
 * A property reference value
 */
export interface ReferencedPropertyValueV3 {
    property: string[];
}
/**
 * Describes the direct relation(s) pointing to instances read through this view. This connection type is used to aid in discovery and documentation of the view.
 */
export interface ReverseDirectRelationConnection {
    /** The type of connection. The ```single_reverse_direct_relation``` type is used to indicate that only a single direct relation is expected to exist. The ```multi_reverse_direct_relation``` type is used to indicate that multiple direct relations are expected to exist. */
    connectionType: "single_reverse_direct_relation" | "multi_reverse_direct_relation";
    /** Description of the content and suggested use for this property. */
    description?: string;
    /** Readable property name. */
    name?: string;
    /** The node(s) containing the direct relation property can be read through the view specified in 'source'. */
    source: ViewReference;
    /** The view or container of the node containing the direct relation property. */
    through: ThroughReference;
}
/**
 * Reference to a view, or a container
 */
export type SourceReference = ViewReference | ContainerReference;
export interface SpaceQueryParameter {
    /**
     * @pattern ^[a-zA-Z0-9][a-zA-Z0-9_-]{0,41}[a-zA-Z0-9]?$
     * @example timeseries
     */
    space?: string;
}
/**
 * @pattern ^[a-zA-Z][a-zA-Z0-9_-]{0,41}[a-zA-Z0-9]?$
 */
export type SpaceSpecification = string;
/**
 * Text type
 */
export interface TextProperty {
    /** Collation - the set of language specific rules - used when sorting text fields */
    collation?: "ucs_basic" | "und" | "af" | "af-NA" | "af-ZA" | "agq" | "agq-CM" | "ak" | "ak-GH" | "am" | "am-ET" | "ar" | "ar-001" | "ar-AE" | "ar-BH" | "ar-DJ" | "ar-DZ" | "ar-EG" | "ar-EH" | "ar-ER" | "ar-IL" | "ar-IQ" | "ar-JO" | "ar-KM" | "ar-KW" | "ar-LB" | "ar-LY" | "ar-MA" | "ar-MR" | "ar-OM" | "ar-PS" | "ar-QA" | "ar-SA" | "ar-SD" | "ar-SO" | "ar-SS" | "ar-SY" | "ar-TD" | "ar-TN" | "ar-YE" | "as" | "as-IN" | "asa" | "asa-TZ" | "ast" | "ast-ES" | "az" | "az-Cyrl" | "az-Cyrl-AZ" | "az-Latn" | "az-Latn-AZ" | "bas" | "bas-CM" | "be" | "be-BY" | "bem" | "bem-ZM" | "bez" | "bez-TZ" | "bg" | "bg-BG" | "bm" | "bm-ML" | "bn" | "bn-BD" | "bn-IN" | "bo" | "bo-CN" | "bo-IN" | "br" | "br-FR" | "brx" | "brx-IN" | "bs" | "bs-Cyrl" | "bs-Cyrl-BA" | "bs-Latn" | "bs-Latn-BA" | "ca" | "ca-AD" | "ca-ES" | "ca-FR" | "ca-IT" | "ccp" | "ccp-BD" | "ccp-IN" | "ce" | "ce-RU" | "ceb" | "ceb-PH" | "cgg" | "cgg-UG" | "chr" | "chr-US" | "ckb" | "ckb-IQ" | "ckb-IR" | "cs" | "cs-CZ" | "cy" | "cy-GB" | "da" | "da-DK" | "da-GL" | "dav" | "dav-KE" | "de" | "de-AT" | "de-BE" | "de-CH" | "de-DE" | "de-IT" | "de-LI" | "de-LU" | "dje" | "dje-NE" | "dsb" | "dsb-DE" | "dua" | "dua-CM" | "dyo" | "dyo-SN" | "dz" | "dz-BT" | "ebu" | "ebu-KE" | "ee" | "ee-GH" | "ee-TG" | "el" | "el-CY" | "el-GR" | "en" | "en-001" | "en-150" | "en-AE" | "en-AG" | "en-AI" | "en-AS" | "en-AT" | "en-AU" | "en-BB" | "en-BE" | "en-BI" | "en-BM" | "en-BS" | "en-BW" | "en-BZ" | "en-CA" | "en-CC" | "en-CH" | "en-CK" | "en-CM" | "en-CX" | "en-CY" | "en-DE" | "en-DG" | "en-DK" | "en-DM" | "en-ER" | "en-FI" | "en-FJ" | "en-FK" | "en-FM" | "en-GB" | "en-GD" | "en-GG" | "en-GH" | "en-GI" | "en-GM" | "en-GU" | "en-GY" | "en-HK" | "en-IE" | "en-IL" | "en-IM" | "en-IN" | "en-IO" | "en-JE" | "en-JM" | "en-KE" | "en-KI" | "en-KN" | "en-KY" | "en-LC" | "en-LR" | "en-LS" | "en-MG" | "en-MH" | "en-MO" | "en-MP" | "en-MS" | "en-MT" | "en-MU" | "en-MW" | "en-MY" | "en-NA" | "en-NF" | "en-NG" | "en-NL" | "en-NR" | "en-NU" | "en-NZ" | "en-PG" | "en-PH" | "en-PK" | "en-PN" | "en-PR" | "en-PW" | "en-RW" | "en-SB" | "en-SC" | "en-SD" | "en-SE" | "en-SG" | "en-SH" | "en-SI" | "en-SL" | "en-SS" | "en-SX" | "en-SZ" | "en-TC" | "en-TK" | "en-TO" | "en-TT" | "en-TV" | "en-TZ" | "en-UG" | "en-UM" | "en-US" | "en-US-u-va-posix" | "en-VC" | "en-VG" | "en-VI" | "en-VU" | "en-WS" | "en-ZA" | "en-ZM" | "en-ZW" | "eo" | "eo-001" | "es" | "es-419" | "es-AR" | "es-BO" | "es-BR" | "es-BZ" | "es-CL" | "es-CO" | "es-CR" | "es-CU" | "es-DO" | "es-EA" | "es-EC" | "es-ES" | "es-GQ" | "es-GT" | "es-HN" | "es-IC" | "es-MX" | "es-NI" | "es-PA" | "es-PE" | "es-PH" | "es-PR" | "es-PY" | "es-SV" | "es-US" | "es-UY" | "es-VE" | "et" | "et-EE" | "eu" | "eu-ES" | "ewo" | "ewo-CM" | "fa" | "fa-AF" | "fa-IR" | "ff" | "ff-Adlm" | "ff-Adlm-BF" | "ff-Adlm-CM" | "ff-Adlm-GH" | "ff-Adlm-GM" | "ff-Adlm-GN" | "ff-Adlm-GW" | "ff-Adlm-LR" | "ff-Adlm-MR" | "ff-Adlm-NE" | "ff-Adlm-NG" | "ff-Adlm-SL" | "ff-Adlm-SN" | "ff-Latn" | "ff-Latn-BF" | "ff-Latn-CM" | "ff-Latn-GH" | "ff-Latn-GM" | "ff-Latn-GN" | "ff-Latn-GW" | "ff-Latn-LR" | "ff-Latn-MR" | "ff-Latn-NE" | "ff-Latn-NG" | "ff-Latn-SL" | "ff-Latn-SN" | "fi" | "fi-FI" | "fil" | "fil-PH" | "fo" | "fo-DK" | "fo-FO" | "fr" | "fr-BE" | "fr-BF" | "fr-BI" | "fr-BJ" | "fr-BL" | "fr-CA" | "fr-CD" | "fr-CF" | "fr-CG" | "fr-CH" | "fr-CI" | "fr-CM" | "fr-DJ" | "fr-DZ" | "fr-FR" | "fr-GA" | "fr-GF" | "fr-GN" | "fr-GP" | "fr-GQ" | "fr-HT" | "fr-KM" | "fr-LU" | "fr-MA" | "fr-MC" | "fr-MF" | "fr-MG" | "fr-ML" | "fr-MQ" | "fr-MR" | "fr-MU" | "fr-NC" | "fr-NE" | "fr-PF" | "fr-PM" | "fr-RE" | "fr-RW" | "fr-SC" | "fr-SN" | "fr-SY" | "fr-TD" | "fr-TG" | "fr-TN" | "fr-VU" | "fr-WF" | "fr-YT" | "fur" | "fur-IT" | "fy" | "fy-NL" | "ga" | "ga-GB" | "ga-IE" | "gd" | "gd-GB" | "gl" | "gl-ES" | "gsw" | "gsw-CH" | "gsw-FR" | "gsw-LI" | "gu" | "gu-IN" | "guz" | "guz-KE" | "gv" | "gv-IM" | "ha" | "ha-GH" | "ha-NE" | "ha-NG" | "haw" | "haw-US" | "he" | "he-IL" | "hi" | "hi-IN" | "hr" | "hr-BA" | "hr-HR" | "hsb" | "hsb-DE" | "hu" | "hu-HU" | "hy" | "hy-AM" | "ia" | "ia-001" | "id" | "id-ID" | "ig" | "ig-NG" | "ii" | "ii-CN" | "is" | "is-IS" | "it" | "it-CH" | "it-IT" | "it-SM" | "it-VA" | "ja" | "ja-JP" | "jgo" | "jgo-CM" | "jmc" | "jmc-TZ" | "jv" | "jv-ID" | "ka" | "ka-GE" | "kab" | "kab-DZ" | "kam" | "kam-KE" | "kde" | "kde-TZ" | "kea" | "kea-CV" | "khq" | "khq-ML" | "ki" | "ki-KE" | "kk" | "kk-KZ" | "kkj" | "kkj-CM" | "kl" | "kl-GL" | "kln" | "kln-KE" | "km" | "km-KH" | "kn" | "kn-IN" | "ko" | "ko-KP" | "ko-KR" | "kok" | "kok-IN" | "ks" | "ks-Arab" | "ks-Arab-IN" | "ksb" | "ksb-TZ" | "ksf" | "ksf-CM" | "ksh" | "ksh-DE" | "ku" | "ku-TR" | "kw" | "kw-GB" | "ky" | "ky-KG" | "lag" | "lag-TZ" | "lb" | "lb-LU" | "lg" | "lg-UG" | "lkt" | "lkt-US" | "ln" | "ln-AO" | "ln-CD" | "ln-CF" | "ln-CG" | "lo" | "lo-LA" | "lrc" | "lrc-IQ" | "lrc-IR" | "lt" | "lt-LT" | "lu" | "lu-CD" | "luo" | "luo-KE" | "luy" | "luy-KE" | "lv" | "lv-LV" | "mai" | "mai-IN" | "mas" | "mas-KE" | "mas-TZ" | "mer" | "mer-KE" | "mfe" | "mfe-MU" | "mg" | "mg-MG" | "mgh" | "mgh-MZ" | "mgo" | "mgo-CM" | "mi" | "mi-NZ" | "mk" | "mk-MK" | "ml" | "ml-IN" | "mn" | "mn-MN" | "mni" | "mni-Beng" | "mni-Beng-IN" | "mr" | "mr-IN" | "ms" | "ms-BN" | "ms-ID" | "ms-MY" | "ms-SG" | "mt" | "mt-MT" | "mua" | "mua-CM" | "my" | "my-MM" | "mzn" | "mzn-IR" | "naq" | "naq-NA" | "nb" | "nb-NO" | "nb-SJ" | "nd" | "nd-ZW" | "nds" | "nds-DE" | "nds-NL" | "ne" | "ne-IN" | "ne-NP" | "nl" | "nl-AW" | "nl-BE" | "nl-BQ" | "nl-CW" | "nl-NL" | "nl-SR" | "nl-SX" | "nmg" | "nmg-CM" | "nn" | "nn-NO" | "nnh" | "nnh-CM" | "nus" | "nus-SS" | "nyn" | "nyn-UG" | "om" | "om-ET" | "om-KE" | "or" | "or-IN" | "os" | "os-GE" | "os-RU" | "pa" | "pa-Arab" | "pa-Arab-PK" | "pa-Guru" | "pa-Guru-IN" | "pcm" | "pcm-NG" | "pl" | "pl-PL" | "ps" | "ps-AF" | "ps-PK" | "pt" | "pt-AO" | "pt-BR" | "pt-CH" | "pt-CV" | "pt-GQ" | "pt-GW" | "pt-LU" | "pt-MO" | "pt-MZ" | "pt-PT" | "pt-ST" | "pt-TL" | "qu" | "qu-BO" | "qu-EC" | "qu-PE" | "rm" | "rm-CH" | "rn" | "rn-BI" | "ro" | "ro-MD" | "ro-RO" | "rof" | "rof-TZ" | "ru" | "ru-BY" | "ru-KG" | "ru-KZ" | "ru-MD" | "ru-RU" | "ru-UA" | "rw" | "rw-RW" | "rwk" | "rwk-TZ" | "sah" | "sah-RU" | "saq" | "saq-KE" | "sat" | "sat-Olck" | "sat-Olck-IN" | "sbp" | "sbp-TZ" | "sd" | "sd-Arab" | "sd-Arab-PK" | "sd-Deva" | "sd-Deva-IN" | "se" | "se-FI" | "se-NO" | "se-SE" | "seh" | "seh-MZ" | "ses" | "ses-ML" | "sg" | "sg-CF" | "shi" | "shi-Latn" | "shi-Latn-MA" | "shi-Tfng" | "shi-Tfng-MA" | "si" | "si-LK" | "sk" | "sk-SK" | "sl" | "sl-SI" | "smn" | "smn-FI" | "sn" | "sn-ZW" | "so" | "so-DJ" | "so-ET" | "so-KE" | "so-SO" | "sq" | "sq-AL" | "sq-MK" | "sq-XK" | "sr" | "sr-Cyrl" | "sr-Cyrl-BA" | "sr-Cyrl-ME" | "sr-Cyrl-RS" | "sr-Cyrl-XK" | "sr-Latn" | "sr-Latn-BA" | "sr-Latn-ME" | "sr-Latn-RS" | "sr-Latn-XK" | "su" | "su-Latn" | "su-Latn-ID" | "sv" | "sv-AX" | "sv-FI" | "sv-SE" | "sw" | "sw-CD" | "sw-KE" | "sw-TZ" | "sw-UG" | "ta" | "ta-IN" | "ta-LK" | "ta-MY" | "ta-SG" | "te" | "te-IN" | "teo" | "teo-KE" | "teo-UG" | "tg" | "tg-TJ" | "th" | "th-TH" | "ti" | "ti-ER" | "ti-ET" | "tk" | "tk-TM" | "to" | "to-TO" | "tr" | "tr-CY" | "tr-TR" | "tt" | "tt-RU" | "twq" | "twq-NE" | "tzm" | "tzm-MA" | "ug" | "ug-CN" | "uk" | "uk-UA" | "ur" | "ur-IN" | "ur-PK" | "uz" | "uz-Arab" | "uz-Arab-AF" | "uz-Cyrl" | "uz-Cyrl-UZ" | "uz-Latn" | "uz-Latn-UZ" | "vai" | "vai-Latn" | "vai-Latn-LR" | "vai-Vaii" | "vai-Vaii-LR" | "vi" | "vi-VN" | "vun" | "vun-TZ" | "wae" | "wae-CH" | "wo" | "wo-SN" | "xh" | "xh-ZA" | "xog" | "xog-UG" | "yav" | "yav-CM" | "yi" | "yi-001" | "yo" | "yo-BJ" | "yo-NG" | "yue" | "yue-Hans" | "yue-Hans-CN" | "yue-Hant" | "yue-Hant-HK" | "zgh" | "zgh-MA" | "zh" | "zh-Hans" | "zh-Hans-CN" | "zh-Hans-HK" | "zh-Hans-MO" | "zh-Hans-SG" | "zh-Hant" | "zh-Hant-HK" | "zh-Hant-MO" | "zh-Hant-TW" | "zu" | "zu-ZA";
    /**
     * Specifies that the data type is a list of values.
     *
     */
    list?: boolean;
    type: "text";
}
export interface ThroughReference {
    identifier: PropertyIdentifierV3;
    /** Reference to a view, or a container */
    source: SourceReference;
}
export interface UpsertConflict {
    /** Details about the error caused by the upsert/update. */
    error: {
        code: number;
        message: string;
    };
}
/**
 * Should this operation apply to nodes, edges or both.
 */
export type UsedFor = "node" | "edge" | "all";
export interface VersionReferencesCollectionResponse {
    items: {
        externalId: DMSExternalId;
        space: SpaceSpecification;
        version: DMSVersion;
    }[];
}
export interface ViewCommon {
    /** Description. Intended to describe the content, and use, of this view. */
    description?: string;
    /** A filter Domain Specific Language (DSL) used to create advanced filter queries. */
    filter?: FilterDefinition;
    /**
     * References to the views from where this view will inherit properties and edges.
     *
     * Note: The order you list the views in is significant. We use this order to deduce the priority when we encounter duplicate property references.
     * If you do not specify a view version, we will use the most recent version available at the time of creation.
     */
    implements?: ViewReference[];
    /** Readable name, meant for use in UIs */
    name?: string;
    /** Id of the space that the view belongs to */
    space: SpaceSpecification;
    version: DMSVersion;
}
export type ViewCorePropertyDefinition = CorePropertyDefinition & {
    type: TextProperty | PrimitiveProperty | CDFExternalIdReference | ViewDirectNodeRelation;
};
export type ViewCreateDefinition = {
    externalId: DMSExternalId;
} & ViewCommon & {
    properties?: Record<string, ViewCreateDefinitionProperty>;
};
/**
* A reference to a container property (ViewProperty) or a connection describing edges that are expected to
exist (ConnectionDefinition).

If the referenced container property is a direct relation, a view of the node can be specified. The view is
a hint to the consumer on what type of data is expected to be of interest in the context of this view.

A connection describes the edges that are likely to exist to aid in discovery and documentation of the view.
A listed edge is not required. i.e. It does not have to exist when included in this list. The target nodes of
this connection will match the view specified in the source property. A connection has a max distance of one hop
in the underlying graph.
*/
export type ViewCreateDefinitionProperty = CreateViewProperty | ConnectionDefinition;
export type ViewDefinition = {
    externalId: DMSExternalId;
} & ViewCommon & {
    createdTime: EpochTimestamp;
    lastUpdatedTime: EpochTimestamp;
    writable: boolean;
    usedFor: UsedFor;
    isGlobal: boolean;
    properties: Record<string, ViewDefinitionProperty>;
};
export type ViewDefinitionProperty = ViewPropertyDefinition | ConnectionDefinition;
/**
 * Direct node relation. Can include a hint to specify the view that this direct relation points to. This hint is optional.
 */
export type ViewDirectNodeRelation = DirectNodeRelation & {
    source?: ViewReference;
};
/**
 * Property definition
 */
export type ViewPropertyDefinition = ViewCorePropertyDefinition & {
    name?: string;
    description?: string;
    container: ContainerReference;
    containerPropertyIdentifier: DMSExternalId;
};
/**
 * Reference to a view
 */
export interface ViewReference {
    /** External-id of the view */
    externalId: DMSExternalId;
    /** Id of the space that the view belongs to */
    space: SpaceSpecification;
    type: "view";
    /** Version of the view */
    version: DMSVersion;
}
