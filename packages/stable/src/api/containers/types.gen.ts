// Do not modify this file!
// It was generated by the command "yarn codegen".
// Instead update the code generation logic or the OpenAPI document.

import type { CursorAndAsyncIterator } from '@cognite/sdk-core';
export interface BtreeIndex {
  /** Whether the index can be used for cursor-based pagination */
  cursorable?: boolean;
  /**
   * The B-tree index supports the following operations;
   *
   *  * less than,
   *  * less than or equal,
   *  * equality (is equal),
   *  * larger than or equal, and
   *  * larger than.
   * By enabling the index to be cursorable, you can use it to efficiently query with custom sort options, and queries will emit cursors that can be used to paginate through the results.
   */
  indexType?: 'btree';
  /** List of properties to define the index across */
  properties: string[];
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
  type: 'timeseries' | 'file' | 'sequence';
}
/**
* Defines a constraint across the properties you include.


You can use constraints to enforce that;
 * Certain properties must be present,
 * A value must be unique across a single or several properties.

A 'uniqueness' constraint can only apply to properties that are in the same container. Up to 10 'uniqueness' constraints can be added per container.


A 'requires' constraint can reference other containers. As a result, the properties in those other containers must then also be set. Up to 25 'requires' constraints can be added per container.
*/
export type ConstraintDefinition =
  | RequiresConstraintDefinition
  | UniquenessConstraintDefinition;
export interface ContainerCollectionResponse {
  /** List of containers */
  items: ContainerDefinition[];
}
export interface ContainerCollectionResponseWithCursorResponse
  extends CursorAndAsyncIterator<ContainerDefinition> {}
export type ContainerCorePropertyDefinition = CorePropertyDefinition & {
  type:
    | TextProperty
    | PrimitiveProperty
    | CDFExternalIdReference
    | DirectNodeRelation;
};
export interface ContainerCreateCollection {
  /** List of containers to create/update */
  items: ContainerCreateDefinition[];
}
/**
 * Container for properties you can access through views.  Container specifications give details about storage  related details. For instance, how to index the data, and what constraints should be present.     You can  define a single container to only contain nodes (```node```), only contain edges (```edge```), or to  contain both (```all```).
 */
export interface ContainerCreateDefinition {
  /** Set of constraints to apply to the container */
  constraints?: Record<string, ConstraintDefinition>;
  /** Description of what the property contains, and how you intend to use it. */
  description?: string;
  /** External-id of the container. The values ```Query```, ```Mutation```, ```Subscription```, ```String```, ```Int32```, ```Int64```, ```Int```, ```Float32```, ```Float64```, ```Float```, ```Timestamp```, ```JSONObject```, ```Date```, ```Numeric```, ```Boolean```, ```PageInfo```, ```File```, ```Sequence``` and ```TimeSeries``` are reserved. */
  externalId: DMSExternalId;
  /** Set of indexes to apply to the container. Up to 10 indexes can be added on a container. */
  indexes?: Record<string, IndexDefinition>;
  /** Readable name for container meant for use in UIs */
  name?: string;
  /** We index the property by a local unique identifier. The identifier has to have a length of between 1 and 255 characters.  It must also match the pattern ```^[a-zA-Z0-9][a-zA-Z0-9_-]{0,253}[a-zA-Z0-9]?$``` , and it cannot be any of the following reserved identifiers: ```space```, ```externalId```, ```createdTime```, ```lastUpdatedTime```, ```deletedTime```, ```edge_id```, ```node_id```, ```project_id```, ```property_group```, ```seq```, ```tg_table_name```, and ```extensions```. The maximum number of properties depends on the project subscription and is by default 100. */
  properties: Record<string, ContainerPropertyDefinition>;
  /** Id of the space the container belongs to */
  space: SpaceSpecification;
  /** Should this operation apply to nodes, edges or both. */
  usedFor?: UsedFor;
}
export type ContainerDefinition = ContainerCreateDefinition & {
  createdTime?: EpochTimestamp;
  lastUpdatedTime?: EpochTimestamp;
  isGlobal?: boolean;
};
/**
 * Defines a property of a container.  You can reference this property in views.
 */
export type ContainerPropertyDefinition = ContainerCorePropertyDefinition;
/**
 * Reference to an existing container
 */
export interface ContainerReference {
  /** External-id of the container */
  externalId: DMSExternalId;
  /** Id of the space hosting (containing) the container */
  space: SpaceSpecification;
  type: 'container';
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
export interface CursorQueryParameter {
  /** @example 4zj0Vy2fo0NtNMb229mI9r1V3YG5NBL752kQz1cKtwo */
  cursor?: string;
}
/**
 * Direct node relation
 */
export interface DirectNodeRelation {
  /** The (optional) required type for the node the direct relation points to. If specified, the node must exist before the direct relation is referenced and of the specified type. If no container specification is used, the node will be auto created with the built-in ```node``` container type, and it does not explicitly have to be created before the node that references it. */
  container?: ContainerReference;
  type: 'direct';
}
/**
 * @pattern ^[a-zA-Z]([a-zA-Z0-9_]{0,253}[a-zA-Z0-9])?$
 */
export type DMSExternalId = string;
/**
 * The number of milliseconds since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
 * @format int64
 * @min 0
 */
export type EpochTimestamp = number;
export interface IncludeGlobalQueryParameter {
  includeGlobal?: boolean;
}
/**
* You can optimize query performance by defining an index to apply to a container.  You can only create an index across properties belonging to the same container.


Ordering of the properties included in the index definition list is significant.  The order should match the queries you expect.  Once we create an index, you may only change its description.  We do not currently support removal of an index.


Indexes have different requirements for the different property data types.  As a result, the create index operation will fail if you specify an invalid combination.


Up to 10 indexes can be added on a container.'
*/
export type IndexDefinition = BtreeIndex | InvertedIndex;
export interface InvertedIndex {
  /** An inverted index can be used to index composite values, and the queries to be handled by the index need to search for element values that appear within the composite items. So if for example you have a property X of type `int[]` and you want to efficiently query for all instances where X contains some value Y, you can create an inverted index on X.  */
  indexType?: 'inverted';
  /** List of properties to define the index across */
  properties: string[];
}
export interface ListOfContainerSubObjectIdentifierRequest {
  items: {
    space: SpaceSpecification;
    containerExternalId: DMSExternalId;
    identifier: string;
  }[];
}
export interface ListOfContainerSubObjectIdentifierResponse {
  items: {
    space: SpaceSpecification;
    containerExternalId: DMSExternalId;
    identifier: string;
  }[];
}
export interface ListOfSpaceExternalIdsRequest {
  items: {
    externalId: DMSExternalId;
    space: SpaceSpecification;
  }[];
}
export interface ListOfSpaceExternalIdsResponse {
  items: {
    externalId: DMSExternalId;
    space: SpaceSpecification;
  }[];
}
/**
 * The cursor value used to return (paginate to) the next page of results, when more data is available.
 */
export type NextCursorV3 = string;
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
  type:
    | 'boolean'
    | 'float32'
    | 'float64'
    | 'int32'
    | 'int64'
    | 'timestamp'
    | 'date'
    | 'json';
}
export interface ReducedLimitQueryParameter {
  /**
   * @min 1
   * @max 1000
   */
  limit?: number;
}
export interface RequiresConstraintDefinition {
  constraintType?: 'requires';
  /** Reference to an existing container */
  require: ContainerReference;
}
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
  collation?:
    | 'ucs_basic'
    | 'und'
    | 'af'
    | 'af-NA'
    | 'af-ZA'
    | 'agq'
    | 'agq-CM'
    | 'ak'
    | 'ak-GH'
    | 'am'
    | 'am-ET'
    | 'ar'
    | 'ar-001'
    | 'ar-AE'
    | 'ar-BH'
    | 'ar-DJ'
    | 'ar-DZ'
    | 'ar-EG'
    | 'ar-EH'
    | 'ar-ER'
    | 'ar-IL'
    | 'ar-IQ'
    | 'ar-JO'
    | 'ar-KM'
    | 'ar-KW'
    | 'ar-LB'
    | 'ar-LY'
    | 'ar-MA'
    | 'ar-MR'
    | 'ar-OM'
    | 'ar-PS'
    | 'ar-QA'
    | 'ar-SA'
    | 'ar-SD'
    | 'ar-SO'
    | 'ar-SS'
    | 'ar-SY'
    | 'ar-TD'
    | 'ar-TN'
    | 'ar-YE'
    | 'as'
    | 'as-IN'
    | 'asa'
    | 'asa-TZ'
    | 'ast'
    | 'ast-ES'
    | 'az'
    | 'az-Cyrl'
    | 'az-Cyrl-AZ'
    | 'az-Latn'
    | 'az-Latn-AZ'
    | 'bas'
    | 'bas-CM'
    | 'be'
    | 'be-BY'
    | 'bem'
    | 'bem-ZM'
    | 'bez'
    | 'bez-TZ'
    | 'bg'
    | 'bg-BG'
    | 'bm'
    | 'bm-ML'
    | 'bn'
    | 'bn-BD'
    | 'bn-IN'
    | 'bo'
    | 'bo-CN'
    | 'bo-IN'
    | 'br'
    | 'br-FR'
    | 'brx'
    | 'brx-IN'
    | 'bs'
    | 'bs-Cyrl'
    | 'bs-Cyrl-BA'
    | 'bs-Latn'
    | 'bs-Latn-BA'
    | 'ca'
    | 'ca-AD'
    | 'ca-ES'
    | 'ca-FR'
    | 'ca-IT'
    | 'ccp'
    | 'ccp-BD'
    | 'ccp-IN'
    | 'ce'
    | 'ce-RU'
    | 'ceb'
    | 'ceb-PH'
    | 'cgg'
    | 'cgg-UG'
    | 'chr'
    | 'chr-US'
    | 'ckb'
    | 'ckb-IQ'
    | 'ckb-IR'
    | 'cs'
    | 'cs-CZ'
    | 'cy'
    | 'cy-GB'
    | 'da'
    | 'da-DK'
    | 'da-GL'
    | 'dav'
    | 'dav-KE'
    | 'de'
    | 'de-AT'
    | 'de-BE'
    | 'de-CH'
    | 'de-DE'
    | 'de-IT'
    | 'de-LI'
    | 'de-LU'
    | 'dje'
    | 'dje-NE'
    | 'dsb'
    | 'dsb-DE'
    | 'dua'
    | 'dua-CM'
    | 'dyo'
    | 'dyo-SN'
    | 'dz'
    | 'dz-BT'
    | 'ebu'
    | 'ebu-KE'
    | 'ee'
    | 'ee-GH'
    | 'ee-TG'
    | 'el'
    | 'el-CY'
    | 'el-GR'
    | 'en'
    | 'en-001'
    | 'en-150'
    | 'en-AE'
    | 'en-AG'
    | 'en-AI'
    | 'en-AS'
    | 'en-AT'
    | 'en-AU'
    | 'en-BB'
    | 'en-BE'
    | 'en-BI'
    | 'en-BM'
    | 'en-BS'
    | 'en-BW'
    | 'en-BZ'
    | 'en-CA'
    | 'en-CC'
    | 'en-CH'
    | 'en-CK'
    | 'en-CM'
    | 'en-CX'
    | 'en-CY'
    | 'en-DE'
    | 'en-DG'
    | 'en-DK'
    | 'en-DM'
    | 'en-ER'
    | 'en-FI'
    | 'en-FJ'
    | 'en-FK'
    | 'en-FM'
    | 'en-GB'
    | 'en-GD'
    | 'en-GG'
    | 'en-GH'
    | 'en-GI'
    | 'en-GM'
    | 'en-GU'
    | 'en-GY'
    | 'en-HK'
    | 'en-IE'
    | 'en-IL'
    | 'en-IM'
    | 'en-IN'
    | 'en-IO'
    | 'en-JE'
    | 'en-JM'
    | 'en-KE'
    | 'en-KI'
    | 'en-KN'
    | 'en-KY'
    | 'en-LC'
    | 'en-LR'
    | 'en-LS'
    | 'en-MG'
    | 'en-MH'
    | 'en-MO'
    | 'en-MP'
    | 'en-MS'
    | 'en-MT'
    | 'en-MU'
    | 'en-MW'
    | 'en-MY'
    | 'en-NA'
    | 'en-NF'
    | 'en-NG'
    | 'en-NL'
    | 'en-NR'
    | 'en-NU'
    | 'en-NZ'
    | 'en-PG'
    | 'en-PH'
    | 'en-PK'
    | 'en-PN'
    | 'en-PR'
    | 'en-PW'
    | 'en-RW'
    | 'en-SB'
    | 'en-SC'
    | 'en-SD'
    | 'en-SE'
    | 'en-SG'
    | 'en-SH'
    | 'en-SI'
    | 'en-SL'
    | 'en-SS'
    | 'en-SX'
    | 'en-SZ'
    | 'en-TC'
    | 'en-TK'
    | 'en-TO'
    | 'en-TT'
    | 'en-TV'
    | 'en-TZ'
    | 'en-UG'
    | 'en-UM'
    | 'en-US'
    | 'en-US-u-va-posix'
    | 'en-VC'
    | 'en-VG'
    | 'en-VI'
    | 'en-VU'
    | 'en-WS'
    | 'en-ZA'
    | 'en-ZM'
    | 'en-ZW'
    | 'eo'
    | 'eo-001'
    | 'es'
    | 'es-419'
    | 'es-AR'
    | 'es-BO'
    | 'es-BR'
    | 'es-BZ'
    | 'es-CL'
    | 'es-CO'
    | 'es-CR'
    | 'es-CU'
    | 'es-DO'
    | 'es-EA'
    | 'es-EC'
    | 'es-ES'
    | 'es-GQ'
    | 'es-GT'
    | 'es-HN'
    | 'es-IC'
    | 'es-MX'
    | 'es-NI'
    | 'es-PA'
    | 'es-PE'
    | 'es-PH'
    | 'es-PR'
    | 'es-PY'
    | 'es-SV'
    | 'es-US'
    | 'es-UY'
    | 'es-VE'
    | 'et'
    | 'et-EE'
    | 'eu'
    | 'eu-ES'
    | 'ewo'
    | 'ewo-CM'
    | 'fa'
    | 'fa-AF'
    | 'fa-IR'
    | 'ff'
    | 'ff-Adlm'
    | 'ff-Adlm-BF'
    | 'ff-Adlm-CM'
    | 'ff-Adlm-GH'
    | 'ff-Adlm-GM'
    | 'ff-Adlm-GN'
    | 'ff-Adlm-GW'
    | 'ff-Adlm-LR'
    | 'ff-Adlm-MR'
    | 'ff-Adlm-NE'
    | 'ff-Adlm-NG'
    | 'ff-Adlm-SL'
    | 'ff-Adlm-SN'
    | 'ff-Latn'
    | 'ff-Latn-BF'
    | 'ff-Latn-CM'
    | 'ff-Latn-GH'
    | 'ff-Latn-GM'
    | 'ff-Latn-GN'
    | 'ff-Latn-GW'
    | 'ff-Latn-LR'
    | 'ff-Latn-MR'
    | 'ff-Latn-NE'
    | 'ff-Latn-NG'
    | 'ff-Latn-SL'
    | 'ff-Latn-SN'
    | 'fi'
    | 'fi-FI'
    | 'fil'
    | 'fil-PH'
    | 'fo'
    | 'fo-DK'
    | 'fo-FO'
    | 'fr'
    | 'fr-BE'
    | 'fr-BF'
    | 'fr-BI'
    | 'fr-BJ'
    | 'fr-BL'
    | 'fr-CA'
    | 'fr-CD'
    | 'fr-CF'
    | 'fr-CG'
    | 'fr-CH'
    | 'fr-CI'
    | 'fr-CM'
    | 'fr-DJ'
    | 'fr-DZ'
    | 'fr-FR'
    | 'fr-GA'
    | 'fr-GF'
    | 'fr-GN'
    | 'fr-GP'
    | 'fr-GQ'
    | 'fr-HT'
    | 'fr-KM'
    | 'fr-LU'
    | 'fr-MA'
    | 'fr-MC'
    | 'fr-MF'
    | 'fr-MG'
    | 'fr-ML'
    | 'fr-MQ'
    | 'fr-MR'
    | 'fr-MU'
    | 'fr-NC'
    | 'fr-NE'
    | 'fr-PF'
    | 'fr-PM'
    | 'fr-RE'
    | 'fr-RW'
    | 'fr-SC'
    | 'fr-SN'
    | 'fr-SY'
    | 'fr-TD'
    | 'fr-TG'
    | 'fr-TN'
    | 'fr-VU'
    | 'fr-WF'
    | 'fr-YT'
    | 'fur'
    | 'fur-IT'
    | 'fy'
    | 'fy-NL'
    | 'ga'
    | 'ga-GB'
    | 'ga-IE'
    | 'gd'
    | 'gd-GB'
    | 'gl'
    | 'gl-ES'
    | 'gsw'
    | 'gsw-CH'
    | 'gsw-FR'
    | 'gsw-LI'
    | 'gu'
    | 'gu-IN'
    | 'guz'
    | 'guz-KE'
    | 'gv'
    | 'gv-IM'
    | 'ha'
    | 'ha-GH'
    | 'ha-NE'
    | 'ha-NG'
    | 'haw'
    | 'haw-US'
    | 'he'
    | 'he-IL'
    | 'hi'
    | 'hi-IN'
    | 'hr'
    | 'hr-BA'
    | 'hr-HR'
    | 'hsb'
    | 'hsb-DE'
    | 'hu'
    | 'hu-HU'
    | 'hy'
    | 'hy-AM'
    | 'ia'
    | 'ia-001'
    | 'id'
    | 'id-ID'
    | 'ig'
    | 'ig-NG'
    | 'ii'
    | 'ii-CN'
    | 'is'
    | 'is-IS'
    | 'it'
    | 'it-CH'
    | 'it-IT'
    | 'it-SM'
    | 'it-VA'
    | 'ja'
    | 'ja-JP'
    | 'jgo'
    | 'jgo-CM'
    | 'jmc'
    | 'jmc-TZ'
    | 'jv'
    | 'jv-ID'
    | 'ka'
    | 'ka-GE'
    | 'kab'
    | 'kab-DZ'
    | 'kam'
    | 'kam-KE'
    | 'kde'
    | 'kde-TZ'
    | 'kea'
    | 'kea-CV'
    | 'khq'
    | 'khq-ML'
    | 'ki'
    | 'ki-KE'
    | 'kk'
    | 'kk-KZ'
    | 'kkj'
    | 'kkj-CM'
    | 'kl'
    | 'kl-GL'
    | 'kln'
    | 'kln-KE'
    | 'km'
    | 'km-KH'
    | 'kn'
    | 'kn-IN'
    | 'ko'
    | 'ko-KP'
    | 'ko-KR'
    | 'kok'
    | 'kok-IN'
    | 'ks'
    | 'ks-Arab'
    | 'ks-Arab-IN'
    | 'ksb'
    | 'ksb-TZ'
    | 'ksf'
    | 'ksf-CM'
    | 'ksh'
    | 'ksh-DE'
    | 'ku'
    | 'ku-TR'
    | 'kw'
    | 'kw-GB'
    | 'ky'
    | 'ky-KG'
    | 'lag'
    | 'lag-TZ'
    | 'lb'
    | 'lb-LU'
    | 'lg'
    | 'lg-UG'
    | 'lkt'
    | 'lkt-US'
    | 'ln'
    | 'ln-AO'
    | 'ln-CD'
    | 'ln-CF'
    | 'ln-CG'
    | 'lo'
    | 'lo-LA'
    | 'lrc'
    | 'lrc-IQ'
    | 'lrc-IR'
    | 'lt'
    | 'lt-LT'
    | 'lu'
    | 'lu-CD'
    | 'luo'
    | 'luo-KE'
    | 'luy'
    | 'luy-KE'
    | 'lv'
    | 'lv-LV'
    | 'mai'
    | 'mai-IN'
    | 'mas'
    | 'mas-KE'
    | 'mas-TZ'
    | 'mer'
    | 'mer-KE'
    | 'mfe'
    | 'mfe-MU'
    | 'mg'
    | 'mg-MG'
    | 'mgh'
    | 'mgh-MZ'
    | 'mgo'
    | 'mgo-CM'
    | 'mi'
    | 'mi-NZ'
    | 'mk'
    | 'mk-MK'
    | 'ml'
    | 'ml-IN'
    | 'mn'
    | 'mn-MN'
    | 'mni'
    | 'mni-Beng'
    | 'mni-Beng-IN'
    | 'mr'
    | 'mr-IN'
    | 'ms'
    | 'ms-BN'
    | 'ms-ID'
    | 'ms-MY'
    | 'ms-SG'
    | 'mt'
    | 'mt-MT'
    | 'mua'
    | 'mua-CM'
    | 'my'
    | 'my-MM'
    | 'mzn'
    | 'mzn-IR'
    | 'naq'
    | 'naq-NA'
    | 'nb'
    | 'nb-NO'
    | 'nb-SJ'
    | 'nd'
    | 'nd-ZW'
    | 'nds'
    | 'nds-DE'
    | 'nds-NL'
    | 'ne'
    | 'ne-IN'
    | 'ne-NP'
    | 'nl'
    | 'nl-AW'
    | 'nl-BE'
    | 'nl-BQ'
    | 'nl-CW'
    | 'nl-NL'
    | 'nl-SR'
    | 'nl-SX'
    | 'nmg'
    | 'nmg-CM'
    | 'nn'
    | 'nn-NO'
    | 'nnh'
    | 'nnh-CM'
    | 'nus'
    | 'nus-SS'
    | 'nyn'
    | 'nyn-UG'
    | 'om'
    | 'om-ET'
    | 'om-KE'
    | 'or'
    | 'or-IN'
    | 'os'
    | 'os-GE'
    | 'os-RU'
    | 'pa'
    | 'pa-Arab'
    | 'pa-Arab-PK'
    | 'pa-Guru'
    | 'pa-Guru-IN'
    | 'pcm'
    | 'pcm-NG'
    | 'pl'
    | 'pl-PL'
    | 'ps'
    | 'ps-AF'
    | 'ps-PK'
    | 'pt'
    | 'pt-AO'
    | 'pt-BR'
    | 'pt-CH'
    | 'pt-CV'
    | 'pt-GQ'
    | 'pt-GW'
    | 'pt-LU'
    | 'pt-MO'
    | 'pt-MZ'
    | 'pt-PT'
    | 'pt-ST'
    | 'pt-TL'
    | 'qu'
    | 'qu-BO'
    | 'qu-EC'
    | 'qu-PE'
    | 'rm'
    | 'rm-CH'
    | 'rn'
    | 'rn-BI'
    | 'ro'
    | 'ro-MD'
    | 'ro-RO'
    | 'rof'
    | 'rof-TZ'
    | 'ru'
    | 'ru-BY'
    | 'ru-KG'
    | 'ru-KZ'
    | 'ru-MD'
    | 'ru-RU'
    | 'ru-UA'
    | 'rw'
    | 'rw-RW'
    | 'rwk'
    | 'rwk-TZ'
    | 'sah'
    | 'sah-RU'
    | 'saq'
    | 'saq-KE'
    | 'sat'
    | 'sat-Olck'
    | 'sat-Olck-IN'
    | 'sbp'
    | 'sbp-TZ'
    | 'sd'
    | 'sd-Arab'
    | 'sd-Arab-PK'
    | 'sd-Deva'
    | 'sd-Deva-IN'
    | 'se'
    | 'se-FI'
    | 'se-NO'
    | 'se-SE'
    | 'seh'
    | 'seh-MZ'
    | 'ses'
    | 'ses-ML'
    | 'sg'
    | 'sg-CF'
    | 'shi'
    | 'shi-Latn'
    | 'shi-Latn-MA'
    | 'shi-Tfng'
    | 'shi-Tfng-MA'
    | 'si'
    | 'si-LK'
    | 'sk'
    | 'sk-SK'
    | 'sl'
    | 'sl-SI'
    | 'smn'
    | 'smn-FI'
    | 'sn'
    | 'sn-ZW'
    | 'so'
    | 'so-DJ'
    | 'so-ET'
    | 'so-KE'
    | 'so-SO'
    | 'sq'
    | 'sq-AL'
    | 'sq-MK'
    | 'sq-XK'
    | 'sr'
    | 'sr-Cyrl'
    | 'sr-Cyrl-BA'
    | 'sr-Cyrl-ME'
    | 'sr-Cyrl-RS'
    | 'sr-Cyrl-XK'
    | 'sr-Latn'
    | 'sr-Latn-BA'
    | 'sr-Latn-ME'
    | 'sr-Latn-RS'
    | 'sr-Latn-XK'
    | 'su'
    | 'su-Latn'
    | 'su-Latn-ID'
    | 'sv'
    | 'sv-AX'
    | 'sv-FI'
    | 'sv-SE'
    | 'sw'
    | 'sw-CD'
    | 'sw-KE'
    | 'sw-TZ'
    | 'sw-UG'
    | 'ta'
    | 'ta-IN'
    | 'ta-LK'
    | 'ta-MY'
    | 'ta-SG'
    | 'te'
    | 'te-IN'
    | 'teo'
    | 'teo-KE'
    | 'teo-UG'
    | 'tg'
    | 'tg-TJ'
    | 'th'
    | 'th-TH'
    | 'ti'
    | 'ti-ER'
    | 'ti-ET'
    | 'tk'
    | 'tk-TM'
    | 'to'
    | 'to-TO'
    | 'tr'
    | 'tr-CY'
    | 'tr-TR'
    | 'tt'
    | 'tt-RU'
    | 'twq'
    | 'twq-NE'
    | 'tzm'
    | 'tzm-MA'
    | 'ug'
    | 'ug-CN'
    | 'uk'
    | 'uk-UA'
    | 'ur'
    | 'ur-IN'
    | 'ur-PK'
    | 'uz'
    | 'uz-Arab'
    | 'uz-Arab-AF'
    | 'uz-Cyrl'
    | 'uz-Cyrl-UZ'
    | 'uz-Latn'
    | 'uz-Latn-UZ'
    | 'vai'
    | 'vai-Latn'
    | 'vai-Latn-LR'
    | 'vai-Vaii'
    | 'vai-Vaii-LR'
    | 'vi'
    | 'vi-VN'
    | 'vun'
    | 'vun-TZ'
    | 'wae'
    | 'wae-CH'
    | 'wo'
    | 'wo-SN'
    | 'xh'
    | 'xh-ZA'
    | 'xog'
    | 'xog-UG'
    | 'yav'
    | 'yav-CM'
    | 'yi'
    | 'yi-001'
    | 'yo'
    | 'yo-BJ'
    | 'yo-NG'
    | 'yue'
    | 'yue-Hans'
    | 'yue-Hans-CN'
    | 'yue-Hant'
    | 'yue-Hant-HK'
    | 'zgh'
    | 'zgh-MA'
    | 'zh'
    | 'zh-Hans'
    | 'zh-Hans-CN'
    | 'zh-Hans-HK'
    | 'zh-Hans-MO'
    | 'zh-Hans-SG'
    | 'zh-Hant'
    | 'zh-Hant-HK'
    | 'zh-Hant-MO'
    | 'zh-Hant-TW'
    | 'zu'
    | 'zu-ZA';
  /**
   * Specifies that the data type is a list of values.
   *
   */
  list?: boolean;
  type: 'text';
}
export interface UniquenessConstraintDefinition {
  constraintType?: 'uniqueness';
  /** List of properties included in the constraint. The order you list the properties in is significant. */
  properties: string[];
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
export type UsedFor = 'node' | 'edge' | 'all';
