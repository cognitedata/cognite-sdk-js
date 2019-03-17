export namespace Components {
    export namespace Schemas {
        export interface ApiKeyRequest {
            userId: number; // int64
        }
        export interface ApiKeyResponse {
            data?: DataApiKeyResponseDTO;
        }
        export interface ApiKeyResponseDTO {
            id?: number; // int64
            userId?: number; // int64
            createdTime?: number; // int64
            status?: "ACTIVE" | "DELETED";
        }
        /**
         * Change that will be applied to securityCategories.
         */
        export interface ArrayPatchLong {
            add?: number /* int64 */ [];
            remove?: number /* int64 */ [];
            set?: number /* int64 */ [];
        }
        /**
         * Representation of a physical asset, e.g plant or piece of equipment
         */
        export interface Asset {
            /**
             * ID of the asset.
             */
            id?: number; // int64
            /**
             * IDs of assets on the path to the asset.
             */
            path?: number /* int64 */ [];
            /**
             * Asset path depth (number of levels below root node).
             */
            depth?: number; // int32
            /**
             * Name of asset. Often referred to as tag.
             */
            name?: string;
            /**
             * ID of parent asset, if any
             */
            parentId?: number; // int64
            /**
             * Description of asset.
             */
            description?: string;
            /**
             * Custom, application specific metadata. String key -> String value
             */
            metadata?: {
            };
            /**
             * The source of this asset
             */
            source?: string;
            /**
             * ID of the asset in the source. Only applicable if source is specified. The combination of source and sourceId must be unique.
             */
            sourceId?: string;
            /**
             * Time when this asset was created in CDP in milliseconds since Jan 1, 1970.
             */
            createdTime?: number; // int64
            /**
             * The last time this asset was updated in CDP, in milliseconds since Jan 1, 1970.
             */
            lastUpdatedTime?: number; // int64
        }
        /**
         * Changes will be applied to asset.
         */
        export interface AssetChangeV2 {
            /**
             * ID given by the API to the asset.
             */
            id: number; // int64
            name?: SinglePatchString;
            description?: SinglePatchString;
            types?: UpdateTypeFieldValuesDTO;
            metadata?: SinglePatch;
            source?: SinglePatchString;
            sourceId?: SinglePatchString;
        }
        export interface AssetDataResponse {
            data?: DataAsset;
        }
        export interface AssetDataV2Response {
            data?: DataAssetV2;
        }
        export interface AssetDataV2WithCursorResponse {
            data?: DataWithCursorAssetV2;
        }
        /**
         * Filter on assets
         */
        export interface AssetFilterDTO {
            metadata?: {
                [name: string]: string;
            };
            types?: TypeFilter[];
            assetSubtrees?: number /* int64 */ [];
            createdTime?: LongRangeDTO;
            lastUpdatedTime?: LongRangeDTO;
        }
        export interface AssetMappingListCursorResponse {
            data?: DataWithCursorGetAssetMappingV2DTO;
        }
        export interface AssetMappingListResponse {
            data?: DataGetAssetMappingV2DTO;
        }
        export interface AssetMappingV2DTO {
            /**
             * The ID of the node.
             * example:
             * 1003
             */
            nodeId?: number; // int64
            /**
             * The ID of the associated asset (Cognite's Assets API).
             * example:
             * 3001
             */
            assetId?: number; // int64
        }
        /**
         * Search on assets
         */
        export interface AssetSearchDTO {
            name?: string;
            description?: string;
            query?: string;
        }
        /**
         * Search and Filter on assets
         */
        export interface AssetSearchQuery {
            search?: AssetSearchDTO;
            filter?: AssetFilterDTO;
            limit?: number; // int32
            offset?: number; // int32
        }
        /**
         * Representation of a physical asset, e.g plant or piece of equipment
         */
        export interface AssetV2 {
            /**
             * ID of the asset.
             */
            id?: number; // int64
            /**
             * IDs of assets on the path to the asset.
             */
            path?: number /* int64 */ [];
            /**
             * Asset path depth (number of levels below root node).
             */
            depth?: number; // int32
            /**
             * Name of asset. Often referred to as tag.
             */
            name?: string;
            /**
             * ID of parent asset, if any
             */
            parentId?: number; // int64
            /**
             * Description of asset.
             */
            description?: string;
            /**
             * The field specific values of the asset.
             */
            types?: GetFieldValuesDTO[];
            /**
             * Custom, application specific metadata. String key -> String value
             */
            metadata?: {
            };
            /**
             * The source of this asset
             */
            source?: string;
            /**
             * ID of the asset in the source. Only applicable if source is specified. The combination of source and sourceId must be unique.
             */
            sourceId?: string;
            /**
             * Time when this asset was created in CDP in milliseconds since Jan 1, 1970.
             */
            createdTime?: number; // int64
            /**
             * The last time this asset was updated in CDP, in milliseconds since Jan 1, 1970.
             */
            lastUpdatedTime?: number; // int64
        }
        /**
         * Data specific to Azure AD authentication
         */
        export interface AzureADConfigurationDTO {
            /**
             * Azure application ID. You get this when creating the Azure app.
             */
            appId?: string;
            /**
             * Azure application secret. You get this when creating the Azure app.
             */
            appSecret?: string;
            /**
             * Azure tenant ID.
             */
            tenantId?: string;
            /**
             * Resource to grant access to. This is usually (always?) 00000002-0000-0000-c000-000000000000
             */
            appResourceId?: string;
        }
        /**
         * The bounding box of the subtree with this sector as the root sector. Is null if there are no geometries in the subtree.
         */
        export interface BoundingBoxV2DTO {
            max?: number /* double */ [];
            min?: number /* double */ [];
        }
        /**
         * Basic description of the layout of the csv file (return will be csv, not this format)
         */
        export interface CSVSequenceDataResponse {
            /**
             * Headers for the different columns in the response (Format might change!).
             * example:
             * rowNumber(134),temperature-b(445)
             */
            columnHeaders?: string[];
            /**
             * example:
             * 1,302.8,2,305
             */
            rows?: {
            }[][];
        }
        export interface CreateAssetMappingV2DTO {
            /**
             * The ID of the node.
             * example:
             * 1003
             */
            nodeId?: number; // int64
            /**
             * The ID of the associated asset (Cognite's Assets API).
             * example:
             * 3001
             */
            assetId?: number; // int64
        }
        /**
         * Representation of a physical asset, e.g plant or piece of equipment
         */
        export interface CreateAssetV2 {
            /**
             * Reference ID used only in post request to disambiguate references to duplicate names.
             */
            refId?: string;
            /**
             * Name of parent. This parent must exist in the same POST request.
             */
            parentName?: string;
            /**
             * Reference ID of parent, to disambiguate if multiple nodes have the same name.
             */
            parentRefId?: string;
            /**
             * Name of asset. Often referred to as tag.
             */
            name?: string;
            /**
             * ID of parent asset in CDP, if any. If parentName or parentRefId are also specified, this will be ignored.
             */
            parentId?: number; // int64
            /**
             * Description of asset.
             */
            description?: string;
            /**
             * The field specific values of the asset.
             */
            types?: PostFieldValuesDTO[];
            /**
             * Custom, application specific metadata. String key -> String value
             */
            metadata?: {
            };
            /**
             * The source of this asset
             */
            source?: string;
            /**
             * ID of the asset in the source. Only applicable if source is specified. The combination of source and sourceId must be unique.
             */
            sourceId?: string;
            /**
             * Time when this asset was created in CDP in milliseconds since Jan 1, 1970.
             */
            createdTime?: number; // int64
            /**
             * The last time this asset was updated in CDP, in milliseconds since Jan 1, 1970.
             */
            lastUpdatedTime?: number; // int64
        }
        export interface CreateModelV2DTO {
            /**
             * The name of the model.
             * example:
             * My Model
             */
            name?: string;
        }
        export interface CreateRevisionV2DTO {
            /**
             * True if the revision is marked as published.
             */
            published?: boolean;
            rotation?: number /* double */ [];
            camera?: RevisionCameraProperties;
            /**
             * The file id to a file uploaded to Cognite's Files API. Can only be set on revision creation, and can never be updated. _Only FBX files are supported_.
             */
            fileId: number; // int64
        }
        export interface DataApiKeyRequest {
            items?: ApiKeyRequest[];
        }
        export interface DataApiKeyResponseDTO {
            items?: ApiKeyResponseDTO[];
        }
        export interface DataAsset {
            items?: Asset[];
        }
        export interface DataAssetChangeV2 {
            items?: AssetChangeV2[];
        }
        export interface DataAssetMappingV2DTO {
            items?: AssetMappingV2DTO[];
        }
        export interface DataAssetV2 {
            items?: AssetV2[];
        }
        export interface DataCreateAssetMappingV2DTO {
            items?: CreateAssetMappingV2DTO[];
        }
        export interface DataCreateAssetV2 {
            items?: CreateAssetV2[];
        }
        export interface DataCreateModelV2DTO {
            items?: CreateModelV2DTO[];
        }
        export interface DataCreateRevisionV2DTO {
            items?: CreateRevisionV2DTO[];
        }
        export interface DataDatapointsGetDatapoint {
            items?: DatapointsGetDatapoint[];
        }
        export interface DataDatapointsPostDatapoint {
            items?: DatapointsPostDatapoint[];
        }
        export interface DataEvent {
            items?: Event[];
        }
        export interface DataEventChange {
            items?: EventChange[];
        }
        export interface DataFileChange {
            items?: FileChange[];
        }
        export interface DataFileInfo {
            items?: FileInfo[];
        }
        export interface DataGetAssetMappingV2DTO {
            items?: GetAssetMappingV2DTO[];
        }
        export interface DataGetDatapoint {
            items?: GetDatapoint[];
        }
        export interface DataGetModelV2DTO {
            items?: GetModelV2DTO[];
        }
        export interface DataGetMultiTimeSeriesDTO {
            items?: GetMultiTimeSeriesDTO[];
        }
        export interface DataGetRevisionV2DTO {
            items?: GetRevisionV2DTO[];
        }
        export interface DataGetSequence {
            items?: GetSequence[];
        }
        export interface DataGetSequenceResponse {
            data?: DataGetSequence;
        }
        export interface DataGetTimeSeriesV2DTO {
            items?: GetTimeSeriesV2DTO[];
        }
        export interface DataGetTypeDTO {
            items?: GetTypeDTO[];
        }
        export interface DataGroup {
            items?: Group[];
        }
        export interface DataGroupSpec {
            items?: GroupSpec[];
        }
        export interface DataLong {
            items?: number /* int64 */ [];
        }
        export interface DataMultiTimeSeriesChange {
            items?: MultiTimeSeriesChange[];
        }
        export interface DataMultivalueDatapointsGetMultivalueDatapoint {
            items?: MultivalueDatapointsGetMultivalueDatapoint[];
        }
        export interface DataMultivalueDatapointsPostMultivalueDatapoint {
            items?: MultivalueDatapointsPostMultivalueDatapoint[];
        }
        export interface DataNewApiKeyResponseDTO {
            items?: NewApiKeyResponseDTO[];
        }
        export interface DataPostColumn {
            items?: PostColumn[];
        }
        export interface DataPostDatapoint {
            items?: PostDatapoint[];
        }
        export interface DataPostFieldDTO {
            items?: PostFieldDTO[];
        }
        export interface DataPostMultiTimeSeriesDTO {
            items?: PostMultiTimeSeriesDTO[];
        }
        export interface DataPostSequence {
            items?: PostSequence[];
        }
        export interface DataPostTimeSeriesV2DTO {
            items?: PostTimeSeriesV2DTO[];
        }
        export interface DataPostTypeDTO {
            items?: PostTypeDTO[];
        }
        export interface DataProject {
            items?: Project[];
        }
        export interface DataRawDB {
            items?: RawDB[];
        }
        export interface DataRawDBRow {
            items?: RawDBRow[];
        }
        export interface DataRawDBTable {
            items?: RawDBTable[];
        }
        export interface DataRetrieveMultivalueDatapoints {
            items?: RetrieveMultivalueDatapoints[];
        }
        export interface DataSecurityCategoryDTO {
            items?: SecurityCategoryDTO[];
        }
        export interface DataSecurityCategorySpecDTO {
            items?: SecurityCategorySpecDTO[];
        }
        export interface DataSequenceChange {
            items?: SequenceChange[];
        }
        export interface DataSequenceColumnChange {
            items?: SequenceColumnChange[];
        }
        export interface DataSequenceDataRequest {
            items?: SequenceDataRequest[];
        }
        export interface DataSequenceDataResponse {
            data?: DataSequenceDataResponse;
        }
        export interface DataSequenceRows {
            items?: SequenceRows[];
        }
        export interface DataTimeSeriesChange {
            items?: TimeSeriesChange[];
        }
        export interface DataTypeChangeDTO {
            items?: TypeChangeDTO[];
        }
        export interface DataTypeFieldChangeDTO {
            items?: TypeFieldChangeDTO[];
        }
        export interface DataUpdateModelV2DTO {
            items?: UpdateModelV2DTO[];
        }
        export interface DataUpdateRevisionV2DTO {
            items?: UpdateRevisionV2DTO[];
        }
        export interface DataUser {
            items?: User[];
        }
        export interface DataUserSpec {
            items?: UserSpec[];
        }
        /**
         * A list of objects along with possible cursors to get the next, or previous, page of results
         */
        export interface DataWithCursorAssetV2 {
            items?: AssetV2[];
            /**
             * Cursor to get the previous page of results (if available).
             */
            previousCursor?: string;
            /**
             * Cursor to get the next page of results (if available).
             */
            nextCursor?: string;
        }
        /**
         * A list of objects along with possible cursors to get the next, or previous, page of results
         */
        export interface DataWithCursorEvent {
            items?: Event[];
            /**
             * Cursor to get the previous page of results (if available).
             */
            previousCursor?: string;
            /**
             * Cursor to get the next page of results (if available).
             */
            nextCursor?: string;
        }
        /**
         * A list of objects along with possible cursors to get the next, or previous, page of results
         */
        export interface DataWithCursorFileInfo {
            items?: FileInfo[];
            /**
             * Cursor to get the previous page of results (if available).
             */
            previousCursor?: string;
            /**
             * Cursor to get the next page of results (if available).
             */
            nextCursor?: string;
        }
        /**
         * A list of objects along with possible cursors to get the next, or previous, page of results
         */
        export interface DataWithCursorGetAssetMappingV2DTO {
            items?: GetAssetMappingV2DTO[];
            /**
             * Cursor to get the previous page of results (if available).
             */
            previousCursor?: string;
            /**
             * Cursor to get the next page of results (if available).
             */
            nextCursor?: string;
        }
        /**
         * A list of objects along with possible cursors to get the next, or previous, page of results
         */
        export interface DataWithCursorGetModelV2DTO {
            items?: GetModelV2DTO[];
            /**
             * Cursor to get the previous page of results (if available).
             */
            previousCursor?: string;
            /**
             * Cursor to get the next page of results (if available).
             */
            nextCursor?: string;
        }
        /**
         * A list of objects along with possible cursors to get the next, or previous, page of results
         */
        export interface DataWithCursorGetMultiTimeSeriesDTO {
            items?: GetMultiTimeSeriesDTO[];
            /**
             * Cursor to get the previous page of results (if available).
             */
            previousCursor?: string;
            /**
             * Cursor to get the next page of results (if available).
             */
            nextCursor?: string;
        }
        /**
         * A list of objects along with possible cursors to get the next, or previous, page of results
         */
        export interface DataWithCursorGetNodeV2DTO {
            items?: GetNodeV2DTO[];
            /**
             * Cursor to get the previous page of results (if available).
             */
            previousCursor?: string;
            /**
             * Cursor to get the next page of results (if available).
             */
            nextCursor?: string;
        }
        /**
         * A list of objects along with possible cursors to get the next, or previous, page of results
         */
        export interface DataWithCursorGetRevisionV2DTO {
            items?: GetRevisionV2DTO[];
            /**
             * Cursor to get the previous page of results (if available).
             */
            previousCursor?: string;
            /**
             * Cursor to get the next page of results (if available).
             */
            nextCursor?: string;
        }
        /**
         * A list of objects along with possible cursors to get the next, or previous, page of results
         */
        export interface DataWithCursorGetSectorV2DTO {
            items?: GetSectorV2DTO[];
            /**
             * Cursor to get the previous page of results (if available).
             */
            previousCursor?: string;
            /**
             * Cursor to get the next page of results (if available).
             */
            nextCursor?: string;
        }
        /**
         * A list of objects along with possible cursors to get the next, or previous, page of results
         */
        export interface DataWithCursorGetSequence {
            items?: GetSequence[];
            /**
             * Cursor to get the previous page of results (if available).
             */
            previousCursor?: string;
            /**
             * Cursor to get the next page of results (if available).
             */
            nextCursor?: string;
        }
        /**
         * A list of objects along with possible cursors to get the next, or previous, page of results
         */
        export interface DataWithCursorGetTimeSeriesV2DTO {
            items?: GetTimeSeriesV2DTO[];
            /**
             * Cursor to get the previous page of results (if available).
             */
            previousCursor?: string;
            /**
             * Cursor to get the next page of results (if available).
             */
            nextCursor?: string;
        }
        /**
         * A list of objects along with possible cursors to get the next, or previous, page of results
         */
        export interface DataWithCursorGetTypeDTO {
            items?: GetTypeDTO[];
            /**
             * Cursor to get the previous page of results (if available).
             */
            previousCursor?: string;
            /**
             * Cursor to get the next page of results (if available).
             */
            nextCursor?: string;
        }
        /**
         * A list of objects along with possible cursors to get the next, or previous, page of results
         */
        export interface DataWithCursorRawDB {
            items?: RawDB[];
            /**
             * Cursor to get the previous page of results (if available).
             */
            previousCursor?: string;
            /**
             * Cursor to get the next page of results (if available).
             */
            nextCursor?: string;
        }
        /**
         * A list of objects along with possible cursors to get the next, or previous, page of results
         */
        export interface DataWithCursorRawDBRow {
            items?: RawDBRow[];
            /**
             * Cursor to get the previous page of results (if available).
             */
            previousCursor?: string;
            /**
             * Cursor to get the next page of results (if available).
             */
            nextCursor?: string;
        }
        /**
         * A list of objects along with possible cursors to get the next, or previous, page of results
         */
        export interface DataWithCursorRawDBTable {
            items?: RawDBTable[];
            /**
             * Cursor to get the previous page of results (if available).
             */
            previousCursor?: string;
            /**
             * Cursor to get the next page of results (if available).
             */
            nextCursor?: string;
        }
        /**
         * A list of objects along with possible cursors to get the next, or previous, page of results
         */
        export interface DataWithCursorSecurityCategoryDTO {
            items?: SecurityCategoryDTO[];
            /**
             * Cursor to get the previous page of results (if available).
             */
            previousCursor?: string;
            /**
             * Cursor to get the next page of results (if available).
             */
            nextCursor?: string;
        }
        /**
         * Parameters describing a query for multiple datapoints.
         */
        export interface DatapointsFrameMultiQuery {
            items?: DatapointsFrameQuery[];
            /**
             * Get datapoints after this time. Format is N[timeunit]-ago where timeunit is w,d,h,m,s. Example: '2d-ago' will get everything that is up to 2 days old. Can also send time in ms since epoch.
             */
            start?: string;
            /**
             * Get datapoints up to this time. The format is the same as for start.
             */
            end?: string;
            /**
             * Return up to this number of timestamp-values rows in the CSV table.
             */
            limit?: number; // int32
            /**
             * Get these aggregates for this time series by default.
             */
            aggregates?: string[];
            /**
             * The granularity of the aggregate values. Valid entries are: 'day/d, hour/h, minute/m, second/s', or a multiple of these indicated by a number as a prefix. Example: 12hour
             */
            granularity?: string;
        }
        /**
         * Parameters describing a query for datapoints.
         */
        export interface DatapointsFrameQuery {
            /**
             * Unique name of time series.
             */
            name: string;
            /**
             * Get these aggregates for this time series
             */
            aggregates?: string[];
        }
        /**
         * Response to a datapoints frame query in a table format.
         */
        export interface DatapointsFrameResponse {
            /**
             * Headers for the different columns in the response.
             */
            columnHeaders?: string[];
            /**
             * The aggregate datapoint values row by row.
             */
            rows?: {
            }[][];
        }
        export interface DatapointsGetDatapoint {
            /**
             * Unique name of the time series the datapoints belong to
             */
            name: string;
            /**
             * The list of datapoints
             */
            datapoints: GetDatapoint[];
        }
        /**
         * Parameters describing a query for multiple datapoints. If fields in individual datapoint query items are omitted, values from the multiquery are used instead. For example, you can provide a default limit for all items (that do not have a limit set) by setting the limit field in the multiquery.
         */
        export interface DatapointsMultiQuery {
            items?: DatapointsQuery[];
            /**
             * Get datapoints after this time. Format is N[timeunit]-ago where timeunit is w,d,h,m,s. Example: '2d-ago' will get everything that is up to 2 days old. Can also send time in ms since epoch. Default '0'.
             */
            start?: string;
            /**
             * Get datapoints up to this time. Same format as for start. Default 'now'.
             */
            end?: string;
            /**
             * Return up to this number of datapoints. Default 100.
             */
            limit?: number; // int32
            /**
             * The aggregates to be applied. If both this field and the a query item aggregate field is left blank, un-aggregated data will be returned for that query.
             */
            aggregates?: string[];
            /**
             * The time granularity size and unit to aggregate over. For example '1h' for one hour.
             */
            granularity?: string;
            /**
             * Whether to include the last datapoint before the requested time period,and the first one after the requested period. This can be useful for interpolating data. Not available for aggregates.
             */
            includeOutsidePoints?: boolean;
        }
        export interface DatapointsPostDatapoint {
            /**
             * Unique name of the time series the datapoints belong to
             */
            name: string;
            /**
             * The list of datapoints
             */
            datapoints: PostDatapoint[];
        }
        /**
         * Parameters describing a query for datapoints.
         */
        export interface DatapointsQuery {
            /**
             * Experimental: Function expression to evaluate for this response. E.g '[23] + [45]' will give you the sum of timeseries with id=23 and timeseries with id=45. This feature is experimental, and may be changed in breaking ways.
             */
            function?: string;
            /**
             * Unique name of time series.
             */
            name: string;
            /**
             * Get datapoints after this time. Format is N[timeunit]-ago where timeunit is w,d,h,m,s. Example: '2d-ago' will get everything that is up to 2 days old. Can also send time in ms since epoch.
             */
            start?: string;
            /**
             * Get datapoints up to this time. The format is the same as for start.
             */
            end?: string;
            /**
             * Return up to this number of datapoints.
             */
            limit?: number; // int32
            /**
             * The aggregates to be returned.  Use default if null. An empty string must be sent to get raw data if the default is a set of aggregates.
             */
            aggregates?: string[];
            /**
             * The granularity size and granularity of the aggregates.
             */
            granularity?: string;
            /**
             * Whether to include the last datapoint before the requested time period,and the first one after the requested period. This can be useful for interpolating data. Not available for aggregates.
             */
            includeOutsidePoints?: boolean;
            /**
             * List of input alias for the function query. Only relevant when specifying the 'function' property
             */
            aliases?: FunctionInputAlias[];
        }
        export interface DatapointsResponse {
            data?: DataGetDatapoint;
        }
        export interface DeleteFilesResponse {
            data?: {
                [name: string]: number /* int64 */ [];
            };
        }
        export interface DuplicateResourceExceptionError {
            /**
             * HTTP status code
             */
            code?: number; // int32
            /**
             * Error message
             */
            message?: string;
            /**
             * Additional data
             */
            extra?: {
            };
            /**
             * duplicate items
             */
            duplicates?: SourceWithResourceId[];
        }
        export interface EmptyResponse {
        }
        export interface Error {
            /**
             * HTTP status code
             */
            code?: number; // int32
            /**
             * Error message
             */
            message?: string;
            /**
             * Additional data
             */
            extra?: {
            };
        }
        export interface ErrorResponse {
            error?: Error;
        }
        /**
         * An event represents something that happened at a given interval in time, e.g a failure, a work order etc.
         */
        export interface Event {
            /**
             * ID given by the API to the event.
             */
            id?: number; // int64
            /**
             * Start time of the event in milliseconds since Jan 1, 1970.
             */
            startTime?: number; // int64
            /**
             * End time of the event in milliseconds since Jan 1, 1970.
             */
            endTime?: number; // int64
            /**
             * Textual description of the event.
             */
            description?: string;
            /**
             * Type of the event, e.g 'failure'.
             */
            type?: string;
            /**
             * Subtype of the event, e.g 'electrical'.
             */
            subtype?: string;
            /**
             * Customizable extra data about the event. String key -> String value.
             */
            metadata?: {
            };
            /**
             * Asset IDs of related equipments that this event relates to.
             */
            assetIds?: number /* int64 */ [];
            /**
             * The source of this event.
             */
            source?: string;
            /**
             * Unique identification of the event in the source. Only applicable if source is specified. The combination of source and sourceId must be unique.
             */
            sourceId?: string;
            /**
             * Time when this event is created in CDP in milliseconds since Jan 1, 1970.
             */
            createdTime?: number; // int64
            /**
             * The latest time when this event is updated in CDP in milliseconds since Jan 1, 1970.
             */
            lastUpdatedTime?: number; // int64
        }
        /**
         * Changes will be applied to event.
         */
        export interface EventChange {
            /**
             * ID given by the API to the event.
             */
            id: number; // int64
            startTime?: SinglePatchLong;
            endTime?: SinglePatchLong;
            description?: SinglePatchString;
            type?: SinglePatchString;
            subType?: SinglePatchString;
            metadata?: SinglePatch;
            assetIds?: ArrayPatchLong;
            source?: SinglePatchString;
            sourceId?: SinglePatchString;
        }
        export interface EventDataResponse {
            data?: DataEvent;
        }
        export interface EventDataWithCursorResponse {
            data?: DataWithCursorEvent;
        }
        /**
         * Changes will be applied to file.
         */
        export interface FileChange {
            /**
             * ID given by the API to the file.
             */
            id?: number; // int64
            fileName?: SinglePatchString;
            directory?: SinglePatchString;
            fileType?: SinglePatchString;
            source?: SinglePatchString;
            sourceId?: SinglePatchString;
            metadata?: SinglePatch;
            assetIds?: ArrayPatchLong;
        }
        /**
         * information about file
         */
        export interface FileInfo {
            /**
             * ID given by the API to the file.
             */
            id?: number; // int64
            /**
             * File name. Max length is 256.
             */
            fileName: string;
            /**
             * Directory containing the file. Max length is 512.
             */
            directory?: string;
            /**
             * The source of this file. Max length is 128.
             */
            source?: string;
            /**
             * Unique identification of the file in the source. Only applicable if source is specified. The combination of source and sourceId must be unique. Max length is 128.
             */
            sourceId?: string;
            /**
             * File type. E.g. pdf, css, spreadsheet, .. Max length is 64.
             */
            fileType?: string;
            /**
             * Customized data about the file. String key -> String value.
             */
            metadata?: {
            };
            /**
             * IDs (assetIds) of equipment related to this file.
             */
            assetIds?: number /* int64 */ [];
            /**
             * Whether or not the actual file is uploaded. This field is returned only by the  API, it has no effect in a post body.
             */
            uploaded?: boolean;
            /**
             * Epoch time (ms) when file was uploaded successfully.
             */
            uploadedAt?: number; // int64
            /**
             * Time when this event is created in CDP in milliseconds since Jan 1, 1970.
             */
            createdTime?: number; // int64
            /**
             * The latest time when this event is updated in CDP in milliseconds since Jan 1, 1970.
             */
            lastUpdatedTime?: number; // int64
        }
        export interface FileNotFoundResponse {
            /**
             * HTTP status code
             */
            code?: number; // int32
            /**
             * Error message
             */
            message?: string;
            /**
             * Additional data
             */
            extra?: {
            };
        }
        export interface FileResponse {
            data?: DataFileInfo;
        }
        export interface FileWithCursorResponse {
            data?: DataWithCursorFileInfo;
        }
        /**
         * List of input alias for the function query. Only relevant when specifying the 'function' property
         */
        export interface FunctionInputAlias {
            /**
             * The id of the timeseries that this alias references
             */
            id: number; // int64
            /**
             * The string value that is referenced in the function expression
             */
            alias: string;
            /**
             * The aggregate to fetch for this alias, empty means fetch non-aggregated data. Aggregate values will be interpolated for periods with no ground data. There are known inaccuracies in how the average value is interpolated.
             */
            aggregate?: string;
            /**
             * The granularity of the aggregates, only relevant if property 'aggregate' is specified
             */
            granularity?: string;
        }
        export interface GetAssetMappingV2DTO {
            /**
             * The ID of the node.
             * example:
             * 1003
             */
            nodeId?: number; // int64
            /**
             * The ID of the associated asset (Cognite's Assets API).
             * example:
             * 3001
             */
            assetId?: number; // int64
            /**
             * A number describing the position of this node in the 3D hierarchy, starting from 0. The tree is traversed in a depth-first order.
             * example:
             * 5
             */
            treeIndex?: number; // int64
            /**
             * The number of nodes in the subtree of this node (this number included the node itself).
             * example:
             * 7
             */
            subtreeSize?: number; // int64
        }
        /**
         * Information about a column stored in the database
         */
        export interface GetColumn {
            /**
             * Unique cognite-provided identifier for the column
             * example:
             * 12912381
             */
            id?: number; // int64
            /**
             * Human readable name of the column
             * example:
             * depth
             */
            name?: string;
            /**
             * User provided column identifier (Unique for a given sequence)
             * example:
             * DPS1
             */
            externalId?: string;
            /**
             * Description of the column
             * example:
             * Optional description
             */
            description?: string;
            valueType?: "STRING" | "DOUBLE" | "LONG";
            /**
             * Custom, application specific metadata. String key -> String value
             * example:
             * [object Object]
             */
            metadata?: {
                [name: string]: string;
            };
            /**
             * Time when this asset was created in CDP in milliseconds since Jan 1, 1970.
             * example:
             * 100000000000
             */
            createdTime?: number; // int64
            /**
             * The last time this asset was updated in CDP, in milliseconds since Jan 1, 1970.
             * example:
             * 100000000000
             */
            lastUpdatedTime?: number; // int64
        }
        /**
         * The list of datapoints
         */
        export interface GetDatapoint {
            /**
             * The data timestamp in milliseconds since the epoch (Jan 1, 1970).
             */
            timestamp: number; // int64
            /**
             * The data value. Can be String or numeric depending on the metric
             */
            value: string;
            /**
             * The integral average value in the aggregate period
             */
            average?: number; // double
            /**
             * The maximum value in the aggregate period
             */
            max?: number; // double
            /**
             * The minimum value in the aggregate period
             */
            min?: number; // double
            /**
             * The number of datapoints in the aggregate period
             */
            count?: number; // int32
            /**
             * The sum of the datapoints in the aggregate period
             */
            sum?: number; // double
            /**
             * The interpolated value of the series in the beginning of the aggregate
             */
            interpolation?: number; // double
            /**
             * The last value before or at the beginning of the aggregate.
             */
            stepInterpolation?: number; // double
            /**
             * The variance of the interpolated underlying function.
             */
            continuousVariance?: number; // double
            /**
             * The variance of the datapoint values.
             */
            discreteVariance?: number; // double
            /**
             * The total variation of the interpolated underlying function.
             */
            totalVariation?: number; // double
        }
        export interface GetFieldDTO {
            id?: number; // int64
            name?: string;
            description?: string;
            valueType?: string;
        }
        export interface GetFieldValueDTO {
            id?: number; // int64
            name?: string;
            valueType?: string;
            value?: JsonElement;
        }
        /**
         * The field specific values of the asset.
         */
        export interface GetFieldValuesDTO {
            id?: number; // int64
            name?: string;
            fields?: GetFieldValueDTO[];
        }
        export interface GetModelV2DTO {
            /**
             * The name of the model.
             * example:
             * My Model
             */
            name?: string;
            /**
             * The id of the model.
             * example:
             * 1000
             */
            id?: number; // int64
            /**
             * The creation time of the model.
             * example:
             * 0
             */
            createdTime?: number; // int64
        }
        export interface GetMultiTimeSeriesDTO {
            /**
             * Name of time series
             */
            name?: string;
            /**
             * Additional metadata. String key -> String value.
             */
            metadata?: {
            };
            /**
             * Asset that this time series belongs to.
             */
            assetId?: number; // int64
            /**
             * Description of the time series.
             */
            description?: string;
            /**
             * Security categories required in order to access this time series.
             */
            securityCategories?: number /* int64 */ [];
            /**
             * Unique external ID
             */
            externalId?: string;
            /**
             * Generated id of the time series
             */
            id?: number; // int64
            /**
             * Time when this time series is created in CDP in milliseconds since Jan 1, 1970.
             */
            createdTime?: number; // int64
            /**
             * The latest time when this time series is updated in CDP in milliseconds since Jan 1, 1970.
             */
            lastUpdatedTime?: number; // int64
            /**
             * Column definitions
             */
            columns?: GetTSColumn[];
        }
        /**
         * The list of datapoints
         */
        export interface GetMultivalueDatapoint {
            /**
             * The data timestamp in milliseconds since the epoch (Jan 1, 1970).
             */
            timestamp: number; // int64
            values?: JsonPrimitive[];
            average?: JsonPrimitive[];
            max?: JsonPrimitive[];
            min?: JsonPrimitive[];
            count?: JsonPrimitive[];
            sum?: JsonPrimitive[];
            interpolation?: JsonPrimitive[];
            stepinterpolation?: JsonPrimitive[];
            totalvariation?: JsonPrimitive[];
            continuousvariance?: JsonPrimitive[];
            discretevariance?: JsonPrimitive[];
        }
        export interface GetNodeV2DTO {
            /**
             * The ID of the node.
             * example:
             * 1000
             */
            id?: number; // int64
            /**
             * The index of the node in the 3D model hierarchy, starting from 0. The tree is traversed in a depth-first order.
             * example:
             * 3
             */
            treeIndex?: number; // int64
            /**
             * The parent of the node, null if it is the root node.
             * example:
             * 2
             */
            parentId?: number; // int64
            /**
             * The depth of the node in the tree, starting from 0 at the root node.
             * example:
             * 2
             */
            depth?: number; // int64
            /**
             * The name of the node.
             * example:
             * Node name
             */
            name?: string;
            /**
             * The number of descendants of the node, plus one (counting itself).
             * example:
             * 4
             */
            subtreeSize?: number; // int64
            /**
             * Metadata fields for the node.
             */
            metadata?: {
                [name: string]: string;
            };
            boundingBox?: BoundingBoxV2DTO;
            /**
             * The sector the node is contained in.
             * example:
             * 1000
             */
            sectorId?: number; // int64
        }
        export interface GetRevisionV2DTO {
            /**
             * True if the revision is marked as published.
             */
            published?: boolean;
            rotation?: number /* double */ [];
            camera?: RevisionCameraProperties;
            /**
             * The ID of the revision.
             * example:
             * 1000
             */
            id?: number; // int64
            /**
             * The file id.
             * example:
             * 1000
             */
            fileId?: number; // int64
            /**
             * The status of the revision, one of Done, Failed, Queued and Processing.
             * example:
             * Done
             */
            status?: string;
            /**
             * The threed file ID of a thumbnail for the revision. Use /3d/files/{id} to retrieve the file.
             * example:
             * 1000
             */
            thumbnailThreedFileId?: number; // int64
            /**
             * The URL of a thumbnail for the revision.
             * example:
             * https://api.cognitedata.com/api/0.6/project/myproject/3d/files/1000
             */
            thumbnailURL?: string;
            /**
             * The threed file ID of the web scene file. Use /3d/files/{id} to retrieve the file. Reading `sceneThreedFiles` instead is recommended.
             * example:
             * 1000
             */
            sceneThreedFileId?: number; // int64
            /**
             * The threed file IDs of the web scene file, with multiple versions supported. Use /3d/files/{id} to retrieve the file.
             */
            sceneThreedFiles?: VersionedThreedFileV2DTO[];
            /**
             * The number of asset mappings for this revision.
             * example:
             * 0
             */
            assetMappingCount?: number; // int64
            /**
             * The creation time of the revision.
             * example:
             * 0
             */
            createdTime?: number; // int64
        }
        export interface GetSectorV2DTO {
            /**
             * The id of the sector.
             * example:
             * 1000
             */
            id?: number; // int64
            /**
             * The parent of the sector, null if it is the root sector.
             * example:
             * 900
             */
            parentId?: number; // int64
            /**
             * String representing the path to the sector: 0/2/6/ etc.
             * example:
             * 0/100/500/900/1000
             */
            path?: string;
            /**
             * The depth of the sector in the sector tree, starting from 0 at the root sector.
             * example:
             * 4
             */
            depth?: number; // int64
            boundingBox?: BoundingBoxV2DTO;
            /**
             * The file ID of the data file for this sector. Use /3d/files/{id} to retrieve the file. Reading `threedFiles` instead is recommended.
             * example:
             * 1000
             */
            threedFileId?: number; // int64
            /**
             * The file ID of the data file for this sector, with multiple versions supported. Use /3d/files/{id} to retrieve the file.
             */
            threedFiles?: VersionedThreedFileV2DTO[];
        }
        /**
         * Information about the sequence stored in the database
         */
        export interface GetSequence {
            /**
             * Unique cognite-provided identifier for the sequence
             * example:
             * 1
             */
            id?: number; // int64
            /**
             * Name of the sequence
             * example:
             * Any relevant name
             */
            name?: string;
            /**
             * Description of the sequence
             * example:
             * Optional description
             */
            description?: string;
            /**
             * Optional asset this sequence is associated with
             * example:
             * 1221123111
             */
            assetId?: number; // int64
            /**
             * Projectwide unique identifier for the sequence
             * example:
             * TRAJ/W1234/WB8821/123123AB
             */
            externalId?: string;
            /**
             * Custom, application specific metadata. String key -> String value
             * example:
             * [object Object]
             */
            metadata?: {
                [name: string]: string;
            };
            /**
             * List of column definitions
             */
            columns?: GetColumn[];
            /**
             * Time when this asset was created in CDP in milliseconds since Jan 1, 1970.
             * example:
             * 100000000000
             */
            createdTime?: number; // int64
            /**
             * The last time this asset was updated in CDP, in milliseconds since Jan 1, 1970.
             * example:
             * 100000000000
             */
            lastUpdatedTime?: number; // int64
        }
        /**
         * Information about a time series column stored in the database
         */
        export interface GetTSColumn {
            /**
             * Unique cognite-provided identifier for the column
             * example:
             * 12912381
             */
            id?: number; // int64
            /**
             * Human readable name of the column
             * example:
             * depth
             */
            name?: string;
            /**
             * User provided column identifier (Unique for a given time series)
             * example:
             * DPS1
             */
            externalId?: string;
            /**
             * Description of the column
             * example:
             * Optional description
             */
            description?: string;
            valueType?: "STRING" | "DOUBLE";
            /**
             * Custom, application specific metadata. String key -> String value
             * example:
             * [object Object]
             */
            metadata?: {
                [name: string]: string;
            };
            /**
             * Human readable unit
             * example:
             * m/s
             */
            unit?: string;
            /**
             * Time when this column was created in CDP in milliseconds since Jan 1, 1970.
             * example:
             * 100000000000
             */
            createdTime?: number; // int64
            /**
             * The last time this column was updated in CDP, in milliseconds since Jan 1, 1970.
             * example:
             * 100000000000
             */
            lastUpdatedTime?: number; // int64
            /**
             * For non-string timeseries: Use step interpolation or not?
             */
            isStep?: boolean;
        }
        export interface GetTimeSeriesV2DTO {
            /**
             * Unique name of time series
             */
            name: string;
            /**
             * Whether the time series is string valued or not.
             */
            isString?: boolean;
            /**
             * Additional metadata. String key -> String value.
             */
            metadata?: {
            };
            /**
             * The physical unit of the time series.
             */
            unit?: string;
            /**
             * Asset that this time series belongs to.
             */
            assetId?: number; // int64
            /**
             * Whether the time series is a step series or not.
             */
            isStep?: boolean;
            /**
             * Description of the time series.
             */
            description?: string;
            /**
             * Security categories required in order to access this time series.
             */
            securityCategories?: number /* int64 */ [];
            /**
             * Generated id of the time series
             */
            id?: number; // int64
            /**
             * Time when this time-series is created in CDP in milliseconds since Jan 1, 1970.
             */
            createdTime?: number; // int64
            /**
             * The latest time when this time-series is updated in CDP in milliseconds since Jan 1, 1970.
             */
            lastUpdatedTime?: number; // int64
        }
        export interface GetTypeDTO {
            id?: number; // int64
            name?: string;
            description?: string;
            fields?: GetFieldDTO[];
        }
        /**
         * A specification for creating a new group
         */
        export interface Group {
            name?: string;
            /**
             * The source of this group
             */
            source?: string;
            /**
             * ID of the group in the source. Only applicable if source is specified. The combination of source and sourceId must be unique.
             */
            sourceId?: string;
            permissions?: PermissionsDTO;
            capabilities?: Group.Properties.Capabilities;
            id?: number; // int64
            isDeleted?: boolean;
            deletedTime?: number; // int64
        }
        export namespace Group {
            export namespace Properties {
                /**
                 * Capability
                 */
                export type Capabilities = ({
                    /**
                     * Acl:Group
                     */
                    groupsAcl?: {
                        actions?: ("LIST" | "READ" | "CREATE" | "UPDATE" | "DELETE")[];
                        /**
                         * Group:Scope
                         */
                        scope?: {
                            /**
                             * all groups
                             */
                            all?: Capabilities.Items.OneOf.$7.Properties.RawAcl.Properties.Scope.Properties.All;
                        } | {
                            /**
                             * groups the current user is in
                             */
                            currentuserscope?: Capabilities.Items.OneOf.$4.Properties.UsersAcl.Properties.Scope.OneOf.$1.Properties.Currentuserscope;
                        };
                    };
                } | {
                    /**
                     * Acl:Asset
                     */
                    assetsAcl?: {
                        actions?: ("READ" | "WRITE")[];
                        /**
                         * Asset:Scope
                         */
                        scope?: {
                            all?: Capabilities.Items.OneOf.$7.Properties.RawAcl.Properties.Scope.Properties.All;
                        };
                    };
                } | {
                    /**
                     * Acl:Event
                     */
                    eventsAcl?: {
                        actions?: ("READ" | "WRITE")[];
                        /**
                         * Event:Scope
                         */
                        scope?: {
                            all?: Capabilities.Items.OneOf.$7.Properties.RawAcl.Properties.Scope.Properties.All;
                        };
                    };
                } | {
                    /**
                     * Acl:File
                     */
                    filesAcl?: {
                        actions?: ("READ" | "WRITE")[];
                        /**
                         * File:Scope
                         */
                        scope?: {
                            all?: Capabilities.Items.OneOf.$7.Properties.RawAcl.Properties.Scope.Properties.All;
                        };
                    };
                } | {
                    /**
                     * Acl:User
                     */
                    usersAcl?: {
                        actions?: ("LIST" | "CREATE" | "DELETE")[];
                        /**
                         * User:Scope
                         */
                        scope?: {
                            /**
                             * all users
                             */
                            all?: Capabilities.Items.OneOf.$7.Properties.RawAcl.Properties.Scope.Properties.All;
                        } | {
                            /**
                             * the current user making the request
                             */
                            currentuserscope?: {
                            };
                        };
                    };
                } | {
                    /**
                     * Acl:Project
                     */
                    projectsAcl?: {
                        actions?: ("LIST" | "READ" | "CREATE" | "UPDATE")[];
                        /**
                         * Project:Scope
                         */
                        scope?: {
                            all?: Capabilities.Items.OneOf.$7.Properties.RawAcl.Properties.Scope.Properties.All;
                        };
                    };
                } | {
                    /**
                     * Acl:SecurityCategory
                     */
                    securityCategoriesAcl?: {
                        actions?: ("MEMBEROF" | "LIST" | "CREATE" | "DELETE")[];
                        /**
                         * SecurityCategory:Scope
                         */
                        scope?: {
                            all?: Capabilities.Items.OneOf.$7.Properties.RawAcl.Properties.Scope.Properties.All;
                        };
                    };
                } | {
                    /**
                     * Acl:Raw
                     */
                    rawAcl?: {
                        actions?: ("READ" | "WRITE" | "LIST")[];
                        /**
                         * Raw:Scope
                         */
                        scope?: {
                            /**
                             * Scope:All
                             */
                            all?: {
                            };
                        };
                    };
                } | {
                    /**
                     * Acl:Timeseries
                     */
                    timeSeriesAcl?: {
                        actions?: ("READ" | "WRITE")[];
                        /**
                         * Timeseries:Scope
                         */
                        scope?: {
                            all?: Capabilities.Items.OneOf.$7.Properties.RawAcl.Properties.Scope.Properties.All;
                        } | {
                            /**
                             * Scope:AssetIdScope
                             */
                            assetIdScope?: {
                                /**
                                 * root asset id (subtrees)
                                 */
                                subtreeIds?: string /* uint64 */ [];
                            };
                        };
                    };
                } | {
                    /**
                     * Acl:Apikey
                     */
                    apikeysAcl?: {
                        actions?: ("LIST" | "CREATE" | "DELETE")[];
                        /**
                         * Apikey:Scope
                         */
                        scope?: {
                            all?: Capabilities.Items.OneOf.$7.Properties.RawAcl.Properties.Scope.Properties.All;
                        } | {
                            /**
                             * apikeys the user making the request has
                             */
                            currentuserscope?: Capabilities.Items.OneOf.$4.Properties.UsersAcl.Properties.Scope.OneOf.$1.Properties.Currentuserscope;
                        };
                    };
                } | {
                    /**
                     * Acl:Threed
                     */
                    threedAcl?: {
                        actions?: ("READ" | "CREATE" | "UPDATE" | "DELETE")[];
                        /**
                         * Threed:Scope
                         */
                        scope?: {
                            all?: Capabilities.Items.OneOf.$7.Properties.RawAcl.Properties.Scope.Properties.All;
                        };
                    };
                } | {
                    /**
                     * Acl:Sequences
                     */
                    sequencesAcl?: {
                        actions?: ("READ" | "WRITE")[];
                        /**
                         * Sequences:Scope
                         */
                        scope?: {
                            all?: Capabilities.Items.OneOf.$7.Properties.RawAcl.Properties.Scope.Properties.All;
                        };
                    };
                } | {
                    /**
                     * Acl:Analytics
                     */
                    analyticsAcl?: {
                        actions?: ("READ" | "EXECUTE" | "LIST")[];
                        /**
                         * Analytics:Scope
                         */
                        scope?: {
                            all?: Capabilities.Items.OneOf.$7.Properties.RawAcl.Properties.Scope.Properties.All;
                        };
                    };
                })[];
                export namespace Capabilities {
                    export namespace Items {
                        export namespace OneOf {
                            export namespace $4 {
                                export namespace Properties {
                                    export namespace UsersAcl {
                                        export namespace Properties {
                                            export namespace Scope {
                                                export namespace OneOf {
                                                    export namespace $1 {
                                                        export namespace Properties {
                                                            /**
                                                             * the current user making the request
                                                             */
                                                            export interface Currentuserscope {
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            export namespace $7 {
                                export namespace Properties {
                                    export namespace RawAcl {
                                        export namespace Properties {
                                            export namespace Scope {
                                                export namespace Properties {
                                                    /**
                                                     * Scope:All
                                                     */
                                                    export interface All {
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        export interface GroupResponse {
            data?: DataGroup;
        }
        /**
         * A specification for creating a new group
         */
        export interface GroupSpec {
            name?: string;
            /**
             * The source of this group
             */
            source?: string;
            /**
             * ID of the group in the source. Only applicable if source is specified. The combination of source and sourceId must be unique.
             */
            sourceId?: string;
            permissions?: PermissionsDTO;
            capabilities?: Group.Properties.Capabilities;
        }
        export interface IdsNotFoundResponse {
            /**
             * HTTP status code
             */
            code?: number; // int32
            /**
             * Error message
             */
            message?: string;
            /**
             * Additional data
             */
            extra?: {
            };
            /**
             * Items which are not  found
             */
            notFound?: number /* int64 */ [];
        }
        export interface JsonArray {
            asBoolean?: boolean;
            asNumber?: {
            };
            asDouble?: number; // double
            asFloat?: number; // float
            asLong?: number; // int64
            asInt?: number; // int32
            asByte?: string; // byte
            asCharacter?: string;
            asBigDecimal?: number;
            asBigInteger?: number;
            asShort?: number; // int32
            asString?: string;
            jsonArray?: boolean;
            jsonObject?: boolean;
            jsonPrimitive?: boolean;
            jsonNull?: boolean;
            asJsonObject?: JsonObject;
            asJsonArray?: JsonArray;
            asJsonPrimitive?: JsonPrimitive;
            asJsonNull?: JsonNull;
        }
        /**
         * Adds these key-value pairs, modifying/overwriting existing keys
         */
        export interface JsonElement {
            jsonArray?: boolean;
            jsonObject?: boolean;
            jsonPrimitive?: boolean;
            jsonNull?: boolean;
            asJsonObject?: JsonObject;
            asJsonArray?: JsonArray;
            asJsonPrimitive?: JsonPrimitive;
            asJsonNull?: JsonNull;
            asBoolean?: boolean;
            asNumber?: {
            };
            asDouble?: number; // double
            asFloat?: number; // float
            asLong?: number; // int64
            asInt?: number; // int32
            asByte?: string; // byte
            asCharacter?: string;
            asBigDecimal?: number;
            asBigInteger?: number;
            asShort?: number; // int32
            asString?: string;
        }
        export interface JsonNull {
            jsonArray?: boolean;
            jsonObject?: boolean;
            jsonPrimitive?: boolean;
            jsonNull?: boolean;
            asJsonObject?: JsonObject;
            asJsonArray?: JsonArray;
            asJsonPrimitive?: JsonPrimitive;
            asJsonNull?: JsonNull;
            asBoolean?: boolean;
            asNumber?: {
            };
            asDouble?: number; // double
            asFloat?: number; // float
            asLong?: number; // int64
            asInt?: number; // int32
            asByte?: string; // byte
            asCharacter?: string;
            asBigDecimal?: number;
            asBigInteger?: number;
            asShort?: number; // int32
            asString?: string;
        }
        export interface JsonObject {
            jsonArray?: boolean;
            jsonObject?: boolean;
            jsonPrimitive?: boolean;
            jsonNull?: boolean;
            asJsonObject?: JsonObject;
            asJsonArray?: JsonArray;
            asJsonPrimitive?: JsonPrimitive;
            asJsonNull?: JsonNull;
            asBoolean?: boolean;
            asNumber?: {
            };
            asDouble?: number; // double
            asFloat?: number; // float
            asLong?: number; // int64
            asInt?: number; // int32
            asByte?: string; // byte
            asCharacter?: string;
            asBigDecimal?: number;
            asBigInteger?: number;
            asShort?: number; // int32
            asString?: string;
        }
        export interface JsonPrimitive {
            value?: {
            };
            string?: boolean;
            asBoolean?: boolean;
            asNumber?: {
            };
            asDouble?: number; // double
            asFloat?: number; // float
            asLong?: number; // int64
            asInt?: number; // int32
            asByte?: string; // byte
            asCharacter?: string;
            asBigDecimal?: number;
            asBigInteger?: number;
            asShort?: number; // int32
            boolean?: boolean;
            asString?: string;
            number?: boolean;
            jsonArray?: boolean;
            jsonObject?: boolean;
            jsonPrimitive?: boolean;
            jsonNull?: boolean;
            asJsonObject?: JsonObject;
            asJsonArray?: JsonArray;
            asJsonPrimitive?: JsonPrimitive;
            asJsonNull?: JsonNull;
        }
        /**
         * Represents the current authentication status of the given user.
         */
        export interface LoginStatusDTO {
            /**
             * The user principal, e.g john.doe@corporation.com.
             */
            user?: string;
            /**
             * Whether the user is logged in or not.
             */
            loggedIn?: boolean;
            /**
             * Name of project user belongs to
             */
            project?: string;
            /**
             * Internal project id of the project
             */
            projectId?: number; // int64
        }
        export interface LoginStatusResponse {
            data?: LoginStatusDTO;
        }
        /**
         * Represents an url where the user can be redirected to sign in.
         */
        export interface LoginUrlDTO {
            /**
             * The url where the user can be redirected to sign in.
             */
            url?: string;
        }
        export interface LoginUrlResponse {
            data?: LoginUrlDTO;
        }
        /**
         * Range query on Long values
         */
        export interface LongRangeDTO {
            min?: number; // int64
            max?: number; // int64
        }
        export interface MissingFieldError {
            /**
             * HTTP status code
             */
            code?: number; // int32
            /**
             * Error message
             */
            message?: string;
            /**
             * Additional data
             */
            extra?: {
            };
            /**
             * Fields that are missing.
             */
            missingFields?: {
            }[];
        }
        export interface ModelListCursorResponse {
            data?: DataWithCursorGetModelV2DTO;
        }
        export interface ModelListResponse {
            data?: DataGetModelV2DTO;
        }
        export interface ModelResponse {
            data?: GetModelV2DTO;
        }
        export interface MultiDatapointsResponse {
            data?: DataDatapointsGetDatapoint;
        }
        /**
         * Changes will be applied to time series.
         */
        export interface MultiTimeSeriesChange {
            id?: number; // int64
            name?: SinglePatchString;
            metadata?: SinglePatch;
            externalId?: SinglePatchString;
            assetId?: SinglePatchLong;
            description?: SinglePatchString;
            securityCategories?: ArrayPatchLong;
        }
        export interface MultiTimeSeriesCursorResponse {
            data?: DataWithCursorGetMultiTimeSeriesDTO;
        }
        export interface MultiTimeSeriesResponse {
            data?: DataGetMultiTimeSeriesDTO;
        }
        /**
         * The list of columns to which datapoints will be inserted
         * example:
         * [object Object],[object Object]
         */
        export interface MultivalueDatapointColumn {
            /**
             * Unique id of the time series' column
             */
            id?: number; // int64
            /**
             * Unique external id of the time series' column
             */
            externalId?: string;
        }
        export interface MultivalueDatapointsGetMultivalueDatapoint {
            /**
             * Unique id of the time series the datapoints belong to
             */
            id?: number; // int64
            /**
             * Unique external id of the time series the datapoints belong to
             */
            externalId?: string;
            /**
             * The list of columns to which datapoints will be inserted
             * example:
             * [object Object],[object Object]
             */
            columns: MultivalueDatapointColumn[];
            /**
             * The list of datapoints
             */
            datapoints: GetMultivalueDatapoint[];
            printableId?: string;
        }
        export interface MultivalueDatapointsPostMultivalueDatapoint {
            /**
             * Unique id of the time series the datapoints belong to
             */
            id?: number; // int64
            /**
             * Unique external id of the time series the datapoints belong to
             */
            externalId?: string;
            /**
             * The list of columns to which datapoints will be inserted
             * example:
             * [object Object],[object Object]
             */
            columns: MultivalueDatapointColumn[];
            /**
             * The list of datapoints
             */
            datapoints: PostMultivalueDatapoint[];
            printableId?: string;
        }
        export interface MultivalueDatapointsResponse {
            data?: DataMultivalueDatapointsGetMultivalueDatapoint;
        }
        export interface NamesNotFoundResponse {
            /**
             * HTTP status code
             */
            code?: number; // int32
            /**
             * Error message
             */
            message?: string;
            /**
             * Additional data
             */
            extra?: {
            };
            /**
             * Items which are not  found
             */
            notFound?: string[];
        }
        export interface NewApiKeyResponse {
            data?: DataNewApiKeyResponseDTO;
        }
        export interface NewApiKeyResponseDTO {
            id?: number; // int64
            userId?: number; // int64
            createdTime?: number; // int64
            status?: "ACTIVE" | "DELETED";
            value?: string;
        }
        export interface NodeListCursorResponse {
            data?: DataWithCursorGetNodeV2DTO;
        }
        /**
         * Data related to generic OAuth2 authentication. Not used for Azure AD.
         */
        export interface OAuth2ConfigurationDTO {
            /**
             * Login URL of OAuth2 provider. E.g https://accounts.google.com/o/oauth2/v2/auth.
             */
            loginUrl?: string;
            /**
             * Logout URL of OAuth2 provider. E.g https://accounts.google.com/Logout.
             */
            logoutUrl?: string;
            /**
             * URL to get access token from OAuth2 provider. E.g https://www.googleapis.com/oauth2/v4/token.
             */
            tokenUrl?: string;
            /**
             * Client ID. You probably get this when registering your client with the OAuth2 provider.
             */
            clientId?: string;
            /**
             * Client secret. You probably get this when registering your client with the OAuth2 provider.
             */
            clientSecret?: string;
        }
        /**
         * Permissions determine the access types of a group, and alternatively also the assets a group has access to.
         */
        export interface PermissionsDTO {
            /**
             * READ, WRITE, RAW_READ or ADMIN.
             */
            accessTypes?: ("READ" | "WRITE" | "ADMIN" | "RAW_READ")[];
            /**
             * List of IDs of assets the group should have access to.
             */
            assetIds?: number /* int64 */ [];
            securityCategoryIds?: number /* int64 */ [];
        }
        /**
         * Describes a new column
         */
        export interface PostColumn {
            /**
             * Human readable name of the column
             * example:
             * depth
             */
            name?: string;
            /**
             * User provided column identifier (Unique for a given sequence)
             * example:
             * DPS1
             */
            externalId?: string;
            /**
             * Description of the column
             * example:
             * Optional description
             */
            description?: string;
            valueType: "STRING" | "DOUBLE" | "LONG";
            /**
             * Custom, application specific metadata. String key -> String value
             * example:
             * [object Object]
             */
            metadata?: {
                [name: string]: string;
            };
        }
        export interface PostDatapoint {
            /**
             * The data timestamp in milliseconds since the epoch (Jan 1, 1970).
             */
            timestamp: number; // int64
            /**
             * The data value. Can be String or numeric depending on the metric
             */
            value: string;
        }
        export interface PostFieldDTO {
            name?: string;
            description?: string;
            valueType?: string;
        }
        export interface PostFieldValueDTO {
            id?: number; // int64
            value?: JsonElement;
        }
        export interface PostFieldValuesDTO {
            id?: number; // int64
            fields?: PostFieldValueDTO[];
        }
        export interface PostMultiTimeSeriesDTO {
            /**
             * Name of time series
             */
            name?: string;
            /**
             * Additional metadata. String key -> String value.
             */
            metadata?: {
            };
            /**
             * Asset that this time series belongs to.
             */
            assetId?: number; // int64
            /**
             * Description of the time series.
             */
            description?: string;
            /**
             * Security categories required in order to access this time series.
             */
            securityCategories?: number /* int64 */ [];
            /**
             * Unique external ID
             */
            externalId?: string;
            /**
             * List of column definitions
             */
            columns: PostTSColumn[];
        }
        /**
         * The list of datapoints
         */
        export interface PostMultivalueDatapoint {
            /**
             * The data timestamp in milliseconds since the epoch (Jan 1, 1970).
             */
            timestamp: number; // int64
            /**
             * The list of values,. Can be String, numeric or null, depending on the column type
             */
            values: string;
        }
        /**
         * Describes a new sequence
         */
        export interface PostSequence {
            /**
             * Human readable name of the sequence
             * example:
             * Any relevant name
             */
            name?: string;
            /**
             * Description of the sequence
             * example:
             * Optional description
             */
            description?: string;
            /**
             * Optional asset this sequence is associated with
             * example:
             * 1221123111
             */
            assetId?: number; // int64
            /**
             * Project wide unique identifier for the sequence
             * example:
             * TRAJ/W1234/WB8821/123123AB
             */
            externalId?: string;
            /**
             * Custom, application specific metadata. String key -> String value
             * example:
             * [object Object]
             */
            metadata?: {
                [name: string]: string;
            };
            /**
             * List of column definitions
             */
            columns: PostColumn[];
        }
        /**
         * Describes a new time series column
         */
        export interface PostTSColumn {
            /**
             * Human readable name of the column
             * example:
             * depth
             */
            name?: string;
            /**
             * User provided column identifier (Unique for a given time series)
             * example:
             * DPS1
             */
            externalId?: string;
            /**
             * Description of the column
             * example:
             * Optional description
             */
            description?: string;
            valueType: "STRING" | "DOUBLE";
            /**
             * Custom, application specific metadata. String key -> String value
             * example:
             * [object Object]
             */
            metadata?: {
                [name: string]: string;
            };
            /**
             * Optional human readable unit
             * example:
             * m/s
             */
            unit?: string;
            /**
             * Whether this is a step series
             * example:
             * false
             */
            isStep?: boolean;
        }
        export interface PostTimeSeriesV2DTO {
            /**
             * Unique name of time series
             */
            name: string;
            /**
             * Whether the time series is string valued or not.
             */
            isString?: boolean;
            /**
             * Additional metadata. String key -> String value.
             */
            metadata?: {
            };
            /**
             * The physical unit of the time series.
             */
            unit?: string;
            /**
             * Asset that this time series belongs to.
             */
            assetId?: number; // int64
            /**
             * Whether the time series is a step series or not.
             */
            isStep?: boolean;
            /**
             * Description of the time series.
             */
            description?: string;
            /**
             * Security categories required in order to access this time series.
             */
            securityCategories?: number /* int64 */ [];
        }
        export interface PostTypeDTO {
            name?: string;
            description?: string;
            fields?: PostFieldDTO[];
        }
        /**
         * A customer usually has only one project. The project contains info about identity and authorization authority for its associated resources.
         */
        export interface Project {
            /**
             * The display name of the project.
             */
            name: string;
            /**
             * The url name of the project. This is used as part of API calls. It should only contain letters, digits and hyphens, as long as the hyphens are not at the start or end.
             */
            urlName: string;
            /**
             * A default group for all project users. Can be used to establish default permissions.WARNING: this group may be logically deleted
             */
            defaultGroupId?: number; // int64
            authentication?: ProjectAuthenticationDTO;
        }
        /**
         * Data about how to authenticate and authorize users
         */
        export interface ProjectAuthenticationDTO {
            /**
             * The type of authority
             */
            type?: "AzureAD";
            /**
             * The authentication protocol
             */
            protocol?: "oauth2";
            azureADConfiguration?: AzureADConfigurationDTO;
            /**
             * List of valid domains. If left empty, any user registered with the OAuth2 provider will get access. E.g ["cognite.com", "cognitedata.com", "akerbp.com"]
             */
            validDomains?: string[];
            oAuth2Configuration?: OAuth2ConfigurationDTO;
        }
        export interface ProjectsResponse {
            data?: DataProject;
        }
        /**
         * A NoSQL database to store customer data.
         */
        export interface RawDB {
            /**
             * Unique name of a database.
             */
            dbName?: string;
        }
        /**
         * A row to store in the Raw DB.
         */
        export interface RawDBRow {
            /**
             * Unique row key
             */
            key: string;
            /**
             * Row data stored as a JSON object.
             */
            columns: {
            };
        }
        export interface RawDBRowsResponse {
            data?: DataRawDBRow;
        }
        export interface RawDBRowsWithCursorResponse {
            data?: DataWithCursorRawDBRow;
        }
        /**
         * A NoSQL database table to store customer data
         */
        export interface RawDBTable {
            /**
             * Unique name of the table
             */
            tableName: string;
        }
        export interface RawDBTablesResponse {
            data?: DataRawDBTable;
        }
        export interface RawDBTablesWithCursorResponse {
            data?: DataWithCursorRawDBTable;
        }
        export interface RawDBsResponse {
            data?: DataRawDB;
        }
        export interface RawDBsWithCursorResponse {
            data?: DataWithCursorRawDB;
        }
        /**
         * Raw row result written in CSV format, with column columnHeaders.
         */
        export interface RawRowCSV {
            /**
             * Headers for the different columns in the response.
             */
            columnHeaders?: string[];
            /**
             * Rows of column values, in same order as columnHeaders.
             */
            rows?: {
            }[][];
        }
        export interface RetrieveMultivalueDatapoints {
            /**
             * Unique id of the time series the datapoints belong to.
             */
            id?: number; // int64
            /**
             * Unique external id of the time series the datapoints belong to.
             */
            externalId?: string;
            /**
             * Get datapoints after this time. Format is N[timeunit]-ago where timeunit is w,d,h,m,s. Example: '2d-ago' will get everything that is up to 2 days old. Can also send time in ms since epoch. Default '0'.
             */
            start?: string;
            /**
             * Get datapoints up to this time. Same format as for start. Default 'now'.
             */
            end?: string;
            /**
             * Return up to this number of datapoints.
             */
            limit?: number; // int32
            /**
             * The list of columns from which datapoints will be retrieved.
             * example:
             * [object Object],[object Object]
             */
            columns?: MultivalueDatapointColumn[];
            /**
             * Get aggregate values for this interval. The format is 'f1,f2,f3' where each entry is an aggregate function. Valid aggregate functions: 'average/avg, max, min, count, sum, interpolation/int, stepinterpolation/step, continuousvariance/cv, discretevariance/dv, totalvariation/tv'. The query parameter 'granularity' must also be specified. Max limit for aggregates is 10000.
             */
            aggregates?: string[];
            /**
             * The granularity of the aggregate values. Valid entries are: 'day/d,  hour/h, minute/m, second/s', or a multiple of these indicated by a number as a  prefix. Example: 12hour.
             */
            granularity?: string;
        }
        /**
         * Initial camera position and target.
         */
        export interface RevisionCameraProperties {
            /**
             * Initial camera target.
             */
            target?: number /* double */ [];
            /**
             * Initial camera position.
             */
            position?: number /* double */ [];
        }
        export interface RevisionListCursorResponse {
            data?: DataWithCursorGetRevisionV2DTO;
        }
        export interface RevisionListResponse {
            data?: DataGetRevisionV2DTO;
        }
        export interface RevisionResponse {
            data?: GetRevisionV2DTO;
        }
        /**
         * Request body for the updateModelRevisionThumbnail endpoint.
         */
        export interface RevisionThumbnailRequestBody {
            /**
             * File ID of thumbnail file in Files API. _Only JPEG and PNG files are supported_.
             */
            fileId?: number; // int64
        }
        export interface SectorListCursorResponse {
            data?: DataWithCursorGetSectorV2DTO;
        }
        export interface SecurityCategoryDTO {
            /**
             * Name of the security category
             */
            name: string;
            /**
             * Id of the security category
             */
            id?: number; // int64
        }
        export interface SecurityCategoryResponse {
            data?: DataSecurityCategoryDTO;
        }
        export interface SecurityCategorySpecDTO {
            /**
             * Name of the security category
             */
            name: string;
        }
        export interface SecurityCategoryWithCursorResponse {
            data?: DataWithCursorSecurityCategoryDTO;
        }
        /**
         * A description of changes that should be done to the sequence
         */
        export interface SequenceChange {
            /**
             * Id of the sequences to change. If id is also given in the url, this is optional. If id is given and this is not matching the url, then a Bad Request response will be returned.
             */
            id?: number; // int64
            name?: SinglePatchString;
            description?: SinglePatchString;
            assetId?: SinglePatchLong;
            externalId?: SinglePatchString;
            metadata?: SinglePatchObjects;
        }
        /**
         * A description of changes that should be done to a column
         */
        export interface SequenceColumnChange {
            /**
             * Id of the column to change
             * example:
             * 12912381
             */
            id?: number; // int64
            name?: SinglePatchString;
            description?: SinglePatchString;
            externalId?: SinglePatchString;
            metadata?: SinglePatchObjects;
        }
        /**
         * A request for datapoints stored
         */
        export interface SequenceDataRequest {
            /**
             * Lowest row number included.
             */
            inclusiveFrom?: number; // int64
            /**
             * Highest row number included. Default: No limit
             * example:
             * 1
             */
            exclusiveTo?: number; // int64
            /**
             * Maximum number of rows returned
             * example:
             * 1
             */
            limit?: number; // int32
            /**
             * Columns to be included. Default: All columns in the sequence
             */
            columns?: SequenceIdForRequest[];
        }
        /**
         * Sequence data
         */
        export interface SequenceDataResponse {
            /**
             * Ids and names for the different columns in the response
             */
            columns?: SequenceIdForResponse[];
            /**
             * List of row data, each represented as a list where each entry is the value of the corresponding column indicated in columns
             * example:
             * [[5.1,"a"],[2.3,null], [5.5,"b"]
             */
            rows?: SequenceGetRow[];
        }
        /**
         * A single row of datapoints
         */
        export interface SequenceGetRow {
            /**
             * The row number for this row
             * example:
             * 1
             */
            rowNumber?: number; // int64
            /**
             * List of items in the row
             */
            values?: SequenceItem[];
        }
        /**
         * Identifying a single sequence/column. Only one field should be set
         */
        export interface SequenceIdForRequest {
            /**
             * The id requested
             * example:
             * 12912381
             */
            id?: number; // int64
            /**
             * The external id requested
             * example:
             * B2D/ATTA/SIMP
             */
            externalId?: string;
        }
        /**
         * Identifying information about a single sequence/column
         */
        export interface SequenceIdForResponse {
            /**
             * The id of the item
             * example:
             * 12912381
             */
            id?: number; // int64
            /**
             * The external id of the item
             * example:
             * B2D/ATTA/SIMP
             */
            externalId?: string;
            /**
             * The name of the item
             * example:
             * Temperature1
             */
            name?: string;
        }
        /**
         * A single datapoint in a given row
         */
        export interface SequenceItem {
            /**
             * The column id for this item
             * example:
             * 12912381
             */
            columnId?: number; // int64
            value?: JsonElement;
        }
        /**
         * A set of rows of datapoints
         */
        export interface SequenceRows {
            rows?: SequenceGetRow[];
        }
        export interface SequenceWithCursorResponse {
            data?: DataWithCursorGetSequence;
        }
        /**
         * Change that will be applied to metadata. String key -> String value.
         */
        export interface SinglePatch {
            set?: {
            };
            setNull?: boolean;
        }
        /**
         * Has no effect as step is immutable (present for backward compatibility)
         */
        export interface SinglePatchBoolean {
            set?: boolean;
            setNull?: boolean;
        }
        /**
         * Change that will be applied to assetId.
         */
        export interface SinglePatchLong {
            set?: number; // int64
            setNull?: boolean;
        }
        /**
         * Changes done to the object map. The order of operations is set, add, remove. The values will generally be validated against any relevant schema (string for metadata, type specified for typeFields)
         */
        export interface SinglePatchObjects {
            /**
             * Changes the entire set of objects to this set of key-value pairs
             */
            set?: {
                [name: string]: JsonElement;
            };
            /**
             * Adds these key-value pairs, modifying/overwriting existing keys
             */
            add?: {
                [name: string]: JsonElement;
            };
            /**
             * Removes these keys
             */
            remove?: string[];
        }
        /**
         * Change that will be applied to description.
         */
        export interface SinglePatchString {
            set?: string;
            setNull?: boolean;
        }
        export interface SingleStringResponse {
            data?: string;
        }
        export interface SingleTokenStatusDTOResponse {
            data?: TokenStatusDTO;
        }
        /**
         * duplicate items
         */
        export interface SourceWithResourceId {
            source?: string;
            sourceId?: string;
            id?: number; // int64
        }
        /**
         * Changes will be applied to time series.
         */
        export interface TimeSeriesChange {
            id?: number; // int64
            name?: SinglePatchString;
            metadata?: SinglePatch;
            unit?: SinglePatchString;
            assetId?: SinglePatchLong;
            description?: SinglePatchString;
            securityCategories?: ArrayPatchLong;
            isString?: SinglePatchBoolean;
            isStep?: SinglePatchBoolean;
        }
        export interface TimeSeriesCursorResponse {
            data?: DataWithCursorGetTimeSeriesV2DTO;
        }
        export interface TimeSeriesResponse {
            data?: DataGetTimeSeriesV2DTO;
        }
        export interface TokenStatusDTO {
            token?: string;
            valid?: boolean;
            expired?: boolean;
        }
        export interface TypeChangeDTO {
            /**
             * Id of the type to change.
             */
            id?: number; // int64
            name?: SinglePatchString;
            description?: SinglePatchString;
        }
        export interface TypeDataResponse {
            data?: DataGetTypeDTO;
        }
        export interface TypeDataResponseWithCursor {
            data?: DataWithCursorGetTypeDTO;
        }
        export interface TypeFieldChangeDTO {
            /**
             * Id of the field to change.
             */
            id?: number; // int64
            name?: SinglePatchString;
            description?: SinglePatchString;
        }
        /**
         * Filter on type fields
         */
        export interface TypeFieldFilter {
            id?: number; // int64
            value?: JsonElement;
            min?: JsonElement;
            max?: JsonElement;
        }
        /**
         * Filter on types
         */
        export interface TypeFilter {
            id?: number; // int64
            fields?: TypeFieldFilter[];
        }
        export interface TypedResponseAssetMappingListCursorResponse {
            statusInfo?: {
                statusCode?: number; // int32
                reasonPhrase?: string;
                family?: "INFORMATIONAL" | "SUCCESSFUL" | "REDIRECTION" | "CLIENT_ERROR" | "SERVER_ERROR" | "OTHER";
            };
            mediaType?: {
                type?: string;
                subtype?: string;
                parameters?: {
                    [name: string]: string;
                };
                wildcardType?: boolean;
                wildcardSubtype?: boolean;
            };
            allowedMethods?: string[];
            entityTag?: {
                value?: string;
                weak?: boolean;
            };
            stringHeaders?: {
                [name: string]: string[];
                
            };
            lastModified?: string; // date-time
            date?: string; // date-time
            headers?: {
                [name: string]: {
                }[];
                
            };
            entity?: AssetMappingListCursorResponse;
            status?: number; // int32
            cookies?: {
                [name: string]: {
                    name?: string;
                    value?: string;
                    version?: number; // int32
                    path?: string;
                    domain?: string;
                    comment?: string;
                    maxAge?: number; // int32
                    expiry?: string; // date-time
                    secure?: boolean;
                    httpOnly?: boolean;
                };
            };
            links?: {
                uriBuilder?: {
                };
                rel?: string;
                rels?: string[];
                params?: {
                    [name: string]: string;
                };
                uri?: string; // uri
                title?: string;
                type?: string;
            }[];
            length?: number; // int32
            language?: {
                language?: string;
                script?: string;
                country?: string;
                variant?: string;
                extensionKeys?: string[];
                unicodeLocaleAttributes?: string[];
                unicodeLocaleKeys?: string[];
                iso3Language?: string;
                iso3Country?: string;
                displayLanguage?: string;
                displayScript?: string;
                displayCountry?: string;
                displayVariant?: string;
                displayName?: string;
            };
            location?: string; // uri
        }
        export interface TypedResponseDataGetSequenceResponse {
            statusInfo?: {
                statusCode?: number; // int32
                reasonPhrase?: string;
                family?: "INFORMATIONAL" | "SUCCESSFUL" | "REDIRECTION" | "CLIENT_ERROR" | "SERVER_ERROR" | "OTHER";
            };
            mediaType?: {
                type?: string;
                subtype?: string;
                parameters?: {
                    [name: string]: string;
                };
                wildcardType?: boolean;
                wildcardSubtype?: boolean;
            };
            allowedMethods?: string[];
            entityTag?: {
                value?: string;
                weak?: boolean;
            };
            stringHeaders?: {
                [name: string]: string[];
                
            };
            lastModified?: string; // date-time
            date?: string; // date-time
            headers?: {
                [name: string]: {
                }[];
                
            };
            entity?: DataGetSequenceResponse;
            status?: number; // int32
            cookies?: {
                [name: string]: {
                    name?: string;
                    value?: string;
                    version?: number; // int32
                    path?: string;
                    domain?: string;
                    comment?: string;
                    maxAge?: number; // int32
                    expiry?: string; // date-time
                    secure?: boolean;
                    httpOnly?: boolean;
                };
            };
            links?: {
                uriBuilder?: {
                };
                rel?: string;
                rels?: string[];
                params?: {
                    [name: string]: string;
                };
                uri?: string; // uri
                title?: string;
                type?: string;
            }[];
            length?: number; // int32
            language?: {
                language?: string;
                script?: string;
                country?: string;
                variant?: string;
                extensionKeys?: string[];
                unicodeLocaleAttributes?: string[];
                unicodeLocaleKeys?: string[];
                iso3Language?: string;
                iso3Country?: string;
                displayLanguage?: string;
                displayScript?: string;
                displayCountry?: string;
                displayVariant?: string;
                displayName?: string;
            };
            location?: string; // uri
        }
        export interface TypedResponseDatapointsFrameResponse {
            statusInfo?: {
                statusCode?: number; // int32
                reasonPhrase?: string;
                family?: "INFORMATIONAL" | "SUCCESSFUL" | "REDIRECTION" | "CLIENT_ERROR" | "SERVER_ERROR" | "OTHER";
            };
            mediaType?: {
                type?: string;
                subtype?: string;
                parameters?: {
                    [name: string]: string;
                };
                wildcardType?: boolean;
                wildcardSubtype?: boolean;
            };
            allowedMethods?: string[];
            entityTag?: {
                value?: string;
                weak?: boolean;
            };
            stringHeaders?: {
                [name: string]: string[];
                
            };
            lastModified?: string; // date-time
            date?: string; // date-time
            headers?: {
                [name: string]: {
                }[];
                
            };
            DatapointsFrameResponse?: DatapointsFrameResponse;
            status?: number; // int32
            cookies?: {
                [name: string]: {
                    name?: string;
                    value?: string;
                    version?: number; // int32
                    path?: string;
                    domain?: string;
                    comment?: string;
                    maxAge?: number; // int32
                    expiry?: string; // date-time
                    secure?: boolean;
                    httpOnly?: boolean;
                };
            };
            links?: {
                uriBuilder?: {
                };
                rel?: string;
                rels?: string[];
                params?: {
                    [name: string]: string;
                };
                uri?: string; // uri
                title?: string;
                type?: string;
            }[];
            length?: number; // int32
            language?: {
                language?: string;
                script?: string;
                country?: string;
                variant?: string;
                extensionKeys?: string[];
                unicodeLocaleAttributes?: string[];
                unicodeLocaleKeys?: string[];
                iso3Language?: string;
                iso3Country?: string;
                displayLanguage?: string;
                displayScript?: string;
                displayCountry?: string;
                displayVariant?: string;
                displayName?: string;
            };
            location?: string; // uri
        }
        export interface TypedResponseDatapointsResponse {
            statusInfo?: {
                statusCode?: number; // int32
                reasonPhrase?: string;
                family?: "INFORMATIONAL" | "SUCCESSFUL" | "REDIRECTION" | "CLIENT_ERROR" | "SERVER_ERROR" | "OTHER";
            };
            mediaType?: {
                type?: string;
                subtype?: string;
                parameters?: {
                    [name: string]: string;
                };
                wildcardType?: boolean;
                wildcardSubtype?: boolean;
            };
            allowedMethods?: string[];
            entityTag?: {
                value?: string;
                weak?: boolean;
            };
            stringHeaders?: {
                [name: string]: string[];
                
            };
            lastModified?: string; // date-time
            date?: string; // date-time
            headers?: {
                [name: string]: {
                }[];
                
            };
            entity?: DatapointsResponse;
            status?: number; // int32
            cookies?: {
                [name: string]: {
                    name?: string;
                    value?: string;
                    version?: number; // int32
                    path?: string;
                    domain?: string;
                    comment?: string;
                    maxAge?: number; // int32
                    expiry?: string; // date-time
                    secure?: boolean;
                    httpOnly?: boolean;
                };
            };
            links?: {
                uriBuilder?: {
                };
                rel?: string;
                rels?: string[];
                params?: {
                    [name: string]: string;
                };
                uri?: string; // uri
                title?: string;
                type?: string;
            }[];
            length?: number; // int32
            language?: {
                language?: string;
                script?: string;
                country?: string;
                variant?: string;
                extensionKeys?: string[];
                unicodeLocaleAttributes?: string[];
                unicodeLocaleKeys?: string[];
                iso3Language?: string;
                iso3Country?: string;
                displayLanguage?: string;
                displayScript?: string;
                displayCountry?: string;
                displayVariant?: string;
                displayName?: string;
            };
            location?: string; // uri
        }
        export interface TypedResponseEmptyResponse {
            statusInfo?: {
                statusCode?: number; // int32
                reasonPhrase?: string;
                family?: "INFORMATIONAL" | "SUCCESSFUL" | "REDIRECTION" | "CLIENT_ERROR" | "SERVER_ERROR" | "OTHER";
            };
            mediaType?: {
                type?: string;
                subtype?: string;
                parameters?: {
                    [name: string]: string;
                };
                wildcardType?: boolean;
                wildcardSubtype?: boolean;
            };
            allowedMethods?: string[];
            entityTag?: {
                value?: string;
                weak?: boolean;
            };
            stringHeaders?: {
                [name: string]: string[];
                
            };
            lastModified?: string; // date-time
            date?: string; // date-time
            headers?: {
                [name: string]: {
                }[];
                
            };
            EmptyResponse?: EmptyResponse;
            status?: number; // int32
            cookies?: {
                [name: string]: {
                    name?: string;
                    value?: string;
                    version?: number; // int32
                    path?: string;
                    domain?: string;
                    comment?: string;
                    maxAge?: number; // int32
                    expiry?: string; // date-time
                    secure?: boolean;
                    httpOnly?: boolean;
                };
            };
            links?: {
                uriBuilder?: {
                };
                rel?: string;
                rels?: string[];
                params?: {
                    [name: string]: string;
                };
                uri?: string; // uri
                title?: string;
                type?: string;
            }[];
            length?: number; // int32
            language?: {
                language?: string;
                script?: string;
                country?: string;
                variant?: string;
                extensionKeys?: string[];
                unicodeLocaleAttributes?: string[];
                unicodeLocaleKeys?: string[];
                iso3Language?: string;
                iso3Country?: string;
                displayLanguage?: string;
                displayScript?: string;
                displayCountry?: string;
                displayVariant?: string;
                displayName?: string;
            };
            location?: string; // uri
        }
        export interface TypedResponseModelListCursorResponse {
            statusInfo?: {
                statusCode?: number; // int32
                reasonPhrase?: string;
                family?: "INFORMATIONAL" | "SUCCESSFUL" | "REDIRECTION" | "CLIENT_ERROR" | "SERVER_ERROR" | "OTHER";
            };
            mediaType?: {
                type?: string;
                subtype?: string;
                parameters?: {
                    [name: string]: string;
                };
                wildcardType?: boolean;
                wildcardSubtype?: boolean;
            };
            allowedMethods?: string[];
            entityTag?: {
                value?: string;
                weak?: boolean;
            };
            stringHeaders?: {
                [name: string]: string[];
                
            };
            lastModified?: string; // date-time
            date?: string; // date-time
            headers?: {
                [name: string]: {
                }[];
                
            };
            entity?: ModelListCursorResponse;
            status?: number; // int32
            cookies?: {
                [name: string]: {
                    name?: string;
                    value?: string;
                    version?: number; // int32
                    path?: string;
                    domain?: string;
                    comment?: string;
                    maxAge?: number; // int32
                    expiry?: string; // date-time
                    secure?: boolean;
                    httpOnly?: boolean;
                };
            };
            links?: {
                uriBuilder?: {
                };
                rel?: string;
                rels?: string[];
                params?: {
                    [name: string]: string;
                };
                uri?: string; // uri
                title?: string;
                type?: string;
            }[];
            length?: number; // int32
            language?: {
                language?: string;
                script?: string;
                country?: string;
                variant?: string;
                extensionKeys?: string[];
                unicodeLocaleAttributes?: string[];
                unicodeLocaleKeys?: string[];
                iso3Language?: string;
                iso3Country?: string;
                displayLanguage?: string;
                displayScript?: string;
                displayCountry?: string;
                displayVariant?: string;
                displayName?: string;
            };
            location?: string; // uri
        }
        export interface TypedResponseModelListResponse {
            statusInfo?: {
                statusCode?: number; // int32
                reasonPhrase?: string;
                family?: "INFORMATIONAL" | "SUCCESSFUL" | "REDIRECTION" | "CLIENT_ERROR" | "SERVER_ERROR" | "OTHER";
            };
            mediaType?: {
                type?: string;
                subtype?: string;
                parameters?: {
                    [name: string]: string;
                };
                wildcardType?: boolean;
                wildcardSubtype?: boolean;
            };
            allowedMethods?: string[];
            entityTag?: {
                value?: string;
                weak?: boolean;
            };
            stringHeaders?: {
                [name: string]: string[];
                
            };
            lastModified?: string; // date-time
            date?: string; // date-time
            headers?: {
                [name: string]: {
                }[];
                
            };
            entity?: ModelListResponse;
            status?: number; // int32
            cookies?: {
                [name: string]: {
                    name?: string;
                    value?: string;
                    version?: number; // int32
                    path?: string;
                    domain?: string;
                    comment?: string;
                    maxAge?: number; // int32
                    expiry?: string; // date-time
                    secure?: boolean;
                    httpOnly?: boolean;
                };
            };
            links?: {
                uriBuilder?: {
                };
                rel?: string;
                rels?: string[];
                params?: {
                    [name: string]: string;
                };
                uri?: string; // uri
                title?: string;
                type?: string;
            }[];
            length?: number; // int32
            language?: {
                language?: string;
                script?: string;
                country?: string;
                variant?: string;
                extensionKeys?: string[];
                unicodeLocaleAttributes?: string[];
                unicodeLocaleKeys?: string[];
                iso3Language?: string;
                iso3Country?: string;
                displayLanguage?: string;
                displayScript?: string;
                displayCountry?: string;
                displayVariant?: string;
                displayName?: string;
            };
            location?: string; // uri
        }
        export interface TypedResponseModelResponse {
            statusInfo?: {
                statusCode?: number; // int32
                reasonPhrase?: string;
                family?: "INFORMATIONAL" | "SUCCESSFUL" | "REDIRECTION" | "CLIENT_ERROR" | "SERVER_ERROR" | "OTHER";
            };
            mediaType?: {
                type?: string;
                subtype?: string;
                parameters?: {
                    [name: string]: string;
                };
                wildcardType?: boolean;
                wildcardSubtype?: boolean;
            };
            allowedMethods?: string[];
            entityTag?: {
                value?: string;
                weak?: boolean;
            };
            stringHeaders?: {
                [name: string]: string[];
                
            };
            lastModified?: string; // date-time
            date?: string; // date-time
            headers?: {
                [name: string]: {
                }[];
                
            };
            entity?: ModelResponse;
            status?: number; // int32
            cookies?: {
                [name: string]: {
                    name?: string;
                    value?: string;
                    version?: number; // int32
                    path?: string;
                    domain?: string;
                    comment?: string;
                    maxAge?: number; // int32
                    expiry?: string; // date-time
                    secure?: boolean;
                    httpOnly?: boolean;
                };
            };
            links?: {
                uriBuilder?: {
                };
                rel?: string;
                rels?: string[];
                params?: {
                    [name: string]: string;
                };
                uri?: string; // uri
                title?: string;
                type?: string;
            }[];
            length?: number; // int32
            language?: {
                language?: string;
                script?: string;
                country?: string;
                variant?: string;
                extensionKeys?: string[];
                unicodeLocaleAttributes?: string[];
                unicodeLocaleKeys?: string[];
                iso3Language?: string;
                iso3Country?: string;
                displayLanguage?: string;
                displayScript?: string;
                displayCountry?: string;
                displayVariant?: string;
                displayName?: string;
            };
            location?: string; // uri
        }
        export interface TypedResponseMultiDatapointsResponse {
            statusInfo?: {
                statusCode?: number; // int32
                reasonPhrase?: string;
                family?: "INFORMATIONAL" | "SUCCESSFUL" | "REDIRECTION" | "CLIENT_ERROR" | "SERVER_ERROR" | "OTHER";
            };
            mediaType?: {
                type?: string;
                subtype?: string;
                parameters?: {
                    [name: string]: string;
                };
                wildcardType?: boolean;
                wildcardSubtype?: boolean;
            };
            allowedMethods?: string[];
            entityTag?: {
                value?: string;
                weak?: boolean;
            };
            stringHeaders?: {
                [name: string]: string[];
                
            };
            lastModified?: string; // date-time
            date?: string; // date-time
            headers?: {
                [name: string]: {
                }[];
                
            };
            entity?: MultiDatapointsResponse;
            status?: number; // int32
            cookies?: {
                [name: string]: {
                    name?: string;
                    value?: string;
                    version?: number; // int32
                    path?: string;
                    domain?: string;
                    comment?: string;
                    maxAge?: number; // int32
                    expiry?: string; // date-time
                    secure?: boolean;
                    httpOnly?: boolean;
                };
            };
            links?: {
                uriBuilder?: {
                };
                rel?: string;
                rels?: string[];
                params?: {
                    [name: string]: string;
                };
                uri?: string; // uri
                title?: string;
                type?: string;
            }[];
            length?: number; // int32
            language?: {
                language?: string;
                script?: string;
                country?: string;
                variant?: string;
                extensionKeys?: string[];
                unicodeLocaleAttributes?: string[];
                unicodeLocaleKeys?: string[];
                iso3Language?: string;
                iso3Country?: string;
                displayLanguage?: string;
                displayScript?: string;
                displayCountry?: string;
                displayVariant?: string;
                displayName?: string;
            };
            location?: string; // uri
        }
        export interface TypedResponseMultiTimeSeriesCursorResponse {
            statusInfo?: {
                statusCode?: number; // int32
                reasonPhrase?: string;
                family?: "INFORMATIONAL" | "SUCCESSFUL" | "REDIRECTION" | "CLIENT_ERROR" | "SERVER_ERROR" | "OTHER";
            };
            mediaType?: {
                type?: string;
                subtype?: string;
                parameters?: {
                    [name: string]: string;
                };
                wildcardType?: boolean;
                wildcardSubtype?: boolean;
            };
            allowedMethods?: string[];
            entityTag?: {
                value?: string;
                weak?: boolean;
            };
            stringHeaders?: {
                [name: string]: string[];
                
            };
            lastModified?: string; // date-time
            date?: string; // date-time
            headers?: {
                [name: string]: {
                }[];
                
            };
            entity?: MultiTimeSeriesCursorResponse;
            status?: number; // int32
            cookies?: {
                [name: string]: {
                    name?: string;
                    value?: string;
                    version?: number; // int32
                    path?: string;
                    domain?: string;
                    comment?: string;
                    maxAge?: number; // int32
                    expiry?: string; // date-time
                    secure?: boolean;
                    httpOnly?: boolean;
                };
            };
            links?: {
                uriBuilder?: {
                };
                rel?: string;
                rels?: string[];
                params?: {
                    [name: string]: string;
                };
                uri?: string; // uri
                title?: string;
                type?: string;
            }[];
            length?: number; // int32
            language?: {
                language?: string;
                script?: string;
                country?: string;
                variant?: string;
                extensionKeys?: string[];
                unicodeLocaleAttributes?: string[];
                unicodeLocaleKeys?: string[];
                iso3Language?: string;
                iso3Country?: string;
                displayLanguage?: string;
                displayScript?: string;
                displayCountry?: string;
                displayVariant?: string;
                displayName?: string;
            };
            location?: string; // uri
        }
        export interface TypedResponseMultiTimeSeriesResponse {
            statusInfo?: {
                statusCode?: number; // int32
                reasonPhrase?: string;
                family?: "INFORMATIONAL" | "SUCCESSFUL" | "REDIRECTION" | "CLIENT_ERROR" | "SERVER_ERROR" | "OTHER";
            };
            mediaType?: {
                type?: string;
                subtype?: string;
                parameters?: {
                    [name: string]: string;
                };
                wildcardType?: boolean;
                wildcardSubtype?: boolean;
            };
            allowedMethods?: string[];
            entityTag?: {
                value?: string;
                weak?: boolean;
            };
            stringHeaders?: {
                [name: string]: string[];
                
            };
            lastModified?: string; // date-time
            date?: string; // date-time
            headers?: {
                [name: string]: {
                }[];
                
            };
            entity?: MultiTimeSeriesResponse;
            status?: number; // int32
            cookies?: {
                [name: string]: {
                    name?: string;
                    value?: string;
                    version?: number; // int32
                    path?: string;
                    domain?: string;
                    comment?: string;
                    maxAge?: number; // int32
                    expiry?: string; // date-time
                    secure?: boolean;
                    httpOnly?: boolean;
                };
            };
            links?: {
                uriBuilder?: {
                };
                rel?: string;
                rels?: string[];
                params?: {
                    [name: string]: string;
                };
                uri?: string; // uri
                title?: string;
                type?: string;
            }[];
            length?: number; // int32
            language?: {
                language?: string;
                script?: string;
                country?: string;
                variant?: string;
                extensionKeys?: string[];
                unicodeLocaleAttributes?: string[];
                unicodeLocaleKeys?: string[];
                iso3Language?: string;
                iso3Country?: string;
                displayLanguage?: string;
                displayScript?: string;
                displayCountry?: string;
                displayVariant?: string;
                displayName?: string;
            };
            location?: string; // uri
        }
        export interface TypedResponseMultivalueDatapointsResponse {
            statusInfo?: {
                statusCode?: number; // int32
                reasonPhrase?: string;
                family?: "INFORMATIONAL" | "SUCCESSFUL" | "REDIRECTION" | "CLIENT_ERROR" | "SERVER_ERROR" | "OTHER";
            };
            mediaType?: {
                type?: string;
                subtype?: string;
                parameters?: {
                    [name: string]: string;
                };
                wildcardType?: boolean;
                wildcardSubtype?: boolean;
            };
            allowedMethods?: string[];
            entityTag?: {
                value?: string;
                weak?: boolean;
            };
            stringHeaders?: {
                [name: string]: string[];
                
            };
            lastModified?: string; // date-time
            date?: string; // date-time
            headers?: {
                [name: string]: {
                }[];
                
            };
            entity?: MultivalueDatapointsResponse;
            status?: number; // int32
            cookies?: {
                [name: string]: {
                    name?: string;
                    value?: string;
                    version?: number; // int32
                    path?: string;
                    domain?: string;
                    comment?: string;
                    maxAge?: number; // int32
                    expiry?: string; // date-time
                    secure?: boolean;
                    httpOnly?: boolean;
                };
            };
            links?: {
                uriBuilder?: {
                };
                rel?: string;
                rels?: string[];
                params?: {
                    [name: string]: string;
                };
                uri?: string; // uri
                title?: string;
                type?: string;
            }[];
            length?: number; // int32
            language?: {
                language?: string;
                script?: string;
                country?: string;
                variant?: string;
                extensionKeys?: string[];
                unicodeLocaleAttributes?: string[];
                unicodeLocaleKeys?: string[];
                iso3Language?: string;
                iso3Country?: string;
                displayLanguage?: string;
                displayScript?: string;
                displayCountry?: string;
                displayVariant?: string;
                displayName?: string;
            };
            location?: string; // uri
        }
        export interface TypedResponseNodeListCursorResponse {
            statusInfo?: {
                statusCode?: number; // int32
                reasonPhrase?: string;
                family?: "INFORMATIONAL" | "SUCCESSFUL" | "REDIRECTION" | "CLIENT_ERROR" | "SERVER_ERROR" | "OTHER";
            };
            mediaType?: {
                type?: string;
                subtype?: string;
                parameters?: {
                    [name: string]: string;
                };
                wildcardType?: boolean;
                wildcardSubtype?: boolean;
            };
            allowedMethods?: string[];
            entityTag?: {
                value?: string;
                weak?: boolean;
            };
            stringHeaders?: {
                [name: string]: string[];
                
            };
            lastModified?: string; // date-time
            date?: string; // date-time
            headers?: {
                [name: string]: {
                }[];
                
            };
            entity?: NodeListCursorResponse;
            status?: number; // int32
            cookies?: {
                [name: string]: {
                    name?: string;
                    value?: string;
                    version?: number; // int32
                    path?: string;
                    domain?: string;
                    comment?: string;
                    maxAge?: number; // int32
                    expiry?: string; // date-time
                    secure?: boolean;
                    httpOnly?: boolean;
                };
            };
            links?: {
                uriBuilder?: {
                };
                rel?: string;
                rels?: string[];
                params?: {
                    [name: string]: string;
                };
                uri?: string; // uri
                title?: string;
                type?: string;
            }[];
            length?: number; // int32
            language?: {
                language?: string;
                script?: string;
                country?: string;
                variant?: string;
                extensionKeys?: string[];
                unicodeLocaleAttributes?: string[];
                unicodeLocaleKeys?: string[];
                iso3Language?: string;
                iso3Country?: string;
                displayLanguage?: string;
                displayScript?: string;
                displayCountry?: string;
                displayVariant?: string;
                displayName?: string;
            };
            location?: string; // uri
        }
        export interface TypedResponseRevisionListCursorResponse {
            statusInfo?: {
                statusCode?: number; // int32
                reasonPhrase?: string;
                family?: "INFORMATIONAL" | "SUCCESSFUL" | "REDIRECTION" | "CLIENT_ERROR" | "SERVER_ERROR" | "OTHER";
            };
            mediaType?: {
                type?: string;
                subtype?: string;
                parameters?: {
                    [name: string]: string;
                };
                wildcardType?: boolean;
                wildcardSubtype?: boolean;
            };
            allowedMethods?: string[];
            entityTag?: {
                value?: string;
                weak?: boolean;
            };
            stringHeaders?: {
                [name: string]: string[];
                
            };
            lastModified?: string; // date-time
            date?: string; // date-time
            headers?: {
                [name: string]: {
                }[];
                
            };
            entity?: RevisionListCursorResponse;
            status?: number; // int32
            cookies?: {
                [name: string]: {
                    name?: string;
                    value?: string;
                    version?: number; // int32
                    path?: string;
                    domain?: string;
                    comment?: string;
                    maxAge?: number; // int32
                    expiry?: string; // date-time
                    secure?: boolean;
                    httpOnly?: boolean;
                };
            };
            links?: {
                uriBuilder?: {
                };
                rel?: string;
                rels?: string[];
                params?: {
                    [name: string]: string;
                };
                uri?: string; // uri
                title?: string;
                type?: string;
            }[];
            length?: number; // int32
            language?: {
                language?: string;
                script?: string;
                country?: string;
                variant?: string;
                extensionKeys?: string[];
                unicodeLocaleAttributes?: string[];
                unicodeLocaleKeys?: string[];
                iso3Language?: string;
                iso3Country?: string;
                displayLanguage?: string;
                displayScript?: string;
                displayCountry?: string;
                displayVariant?: string;
                displayName?: string;
            };
            location?: string; // uri
        }
        export interface TypedResponseRevisionListResponse {
            statusInfo?: {
                statusCode?: number; // int32
                reasonPhrase?: string;
                family?: "INFORMATIONAL" | "SUCCESSFUL" | "REDIRECTION" | "CLIENT_ERROR" | "SERVER_ERROR" | "OTHER";
            };
            mediaType?: {
                type?: string;
                subtype?: string;
                parameters?: {
                    [name: string]: string;
                };
                wildcardType?: boolean;
                wildcardSubtype?: boolean;
            };
            allowedMethods?: string[];
            entityTag?: {
                value?: string;
                weak?: boolean;
            };
            stringHeaders?: {
                [name: string]: string[];
                
            };
            lastModified?: string; // date-time
            date?: string; // date-time
            headers?: {
                [name: string]: {
                }[];
                
            };
            entity?: RevisionListResponse;
            status?: number; // int32
            cookies?: {
                [name: string]: {
                    name?: string;
                    value?: string;
                    version?: number; // int32
                    path?: string;
                    domain?: string;
                    comment?: string;
                    maxAge?: number; // int32
                    expiry?: string; // date-time
                    secure?: boolean;
                    httpOnly?: boolean;
                };
            };
            links?: {
                uriBuilder?: {
                };
                rel?: string;
                rels?: string[];
                params?: {
                    [name: string]: string;
                };
                uri?: string; // uri
                title?: string;
                type?: string;
            }[];
            length?: number; // int32
            language?: {
                language?: string;
                script?: string;
                country?: string;
                variant?: string;
                extensionKeys?: string[];
                unicodeLocaleAttributes?: string[];
                unicodeLocaleKeys?: string[];
                iso3Language?: string;
                iso3Country?: string;
                displayLanguage?: string;
                displayScript?: string;
                displayCountry?: string;
                displayVariant?: string;
                displayName?: string;
            };
            location?: string; // uri
        }
        export interface TypedResponseRevisionResponse {
            statusInfo?: {
                statusCode?: number; // int32
                reasonPhrase?: string;
                family?: "INFORMATIONAL" | "SUCCESSFUL" | "REDIRECTION" | "CLIENT_ERROR" | "SERVER_ERROR" | "OTHER";
            };
            mediaType?: {
                type?: string;
                subtype?: string;
                parameters?: {
                    [name: string]: string;
                };
                wildcardType?: boolean;
                wildcardSubtype?: boolean;
            };
            allowedMethods?: string[];
            entityTag?: {
                value?: string;
                weak?: boolean;
            };
            stringHeaders?: {
                [name: string]: string[];
                
            };
            lastModified?: string; // date-time
            date?: string; // date-time
            headers?: {
                [name: string]: {
                }[];
                
            };
            entity?: RevisionResponse;
            status?: number; // int32
            cookies?: {
                [name: string]: {
                    name?: string;
                    value?: string;
                    version?: number; // int32
                    path?: string;
                    domain?: string;
                    comment?: string;
                    maxAge?: number; // int32
                    expiry?: string; // date-time
                    secure?: boolean;
                    httpOnly?: boolean;
                };
            };
            links?: {
                uriBuilder?: {
                };
                rel?: string;
                rels?: string[];
                params?: {
                    [name: string]: string;
                };
                uri?: string; // uri
                title?: string;
                type?: string;
            }[];
            length?: number; // int32
            language?: {
                language?: string;
                script?: string;
                country?: string;
                variant?: string;
                extensionKeys?: string[];
                unicodeLocaleAttributes?: string[];
                unicodeLocaleKeys?: string[];
                iso3Language?: string;
                iso3Country?: string;
                displayLanguage?: string;
                displayScript?: string;
                displayCountry?: string;
                displayVariant?: string;
                displayName?: string;
            };
            location?: string; // uri
        }
        export interface TypedResponseSectorListCursorResponse {
            statusInfo?: {
                statusCode?: number; // int32
                reasonPhrase?: string;
                family?: "INFORMATIONAL" | "SUCCESSFUL" | "REDIRECTION" | "CLIENT_ERROR" | "SERVER_ERROR" | "OTHER";
            };
            mediaType?: {
                type?: string;
                subtype?: string;
                parameters?: {
                    [name: string]: string;
                };
                wildcardType?: boolean;
                wildcardSubtype?: boolean;
            };
            allowedMethods?: string[];
            entityTag?: {
                value?: string;
                weak?: boolean;
            };
            stringHeaders?: {
                [name: string]: string[];
                
            };
            lastModified?: string; // date-time
            date?: string; // date-time
            headers?: {
                [name: string]: {
                }[];
                
            };
            entity?: SectorListCursorResponse;
            status?: number; // int32
            cookies?: {
                [name: string]: {
                    name?: string;
                    value?: string;
                    version?: number; // int32
                    path?: string;
                    domain?: string;
                    comment?: string;
                    maxAge?: number; // int32
                    expiry?: string; // date-time
                    secure?: boolean;
                    httpOnly?: boolean;
                };
            };
            links?: {
                uriBuilder?: {
                };
                rel?: string;
                rels?: string[];
                params?: {
                    [name: string]: string;
                };
                uri?: string; // uri
                title?: string;
                type?: string;
            }[];
            length?: number; // int32
            language?: {
                language?: string;
                script?: string;
                country?: string;
                variant?: string;
                extensionKeys?: string[];
                unicodeLocaleAttributes?: string[];
                unicodeLocaleKeys?: string[];
                iso3Language?: string;
                iso3Country?: string;
                displayLanguage?: string;
                displayScript?: string;
                displayCountry?: string;
                displayVariant?: string;
                displayName?: string;
            };
            location?: string; // uri
        }
        export interface TypedResponseTimeSeriesCursorResponse {
            statusInfo?: {
                statusCode?: number; // int32
                reasonPhrase?: string;
                family?: "INFORMATIONAL" | "SUCCESSFUL" | "REDIRECTION" | "CLIENT_ERROR" | "SERVER_ERROR" | "OTHER";
            };
            mediaType?: {
                type?: string;
                subtype?: string;
                parameters?: {
                    [name: string]: string;
                };
                wildcardType?: boolean;
                wildcardSubtype?: boolean;
            };
            allowedMethods?: string[];
            entityTag?: {
                value?: string;
                weak?: boolean;
            };
            stringHeaders?: {
                [name: string]: string[];
                
            };
            lastModified?: string; // date-time
            date?: string; // date-time
            headers?: {
                [name: string]: {
                }[];
                
            };
            entity?: TimeSeriesCursorResponse;
            status?: number; // int32
            cookies?: {
                [name: string]: {
                    name?: string;
                    value?: string;
                    version?: number; // int32
                    path?: string;
                    domain?: string;
                    comment?: string;
                    maxAge?: number; // int32
                    expiry?: string; // date-time
                    secure?: boolean;
                    httpOnly?: boolean;
                };
            };
            links?: {
                uriBuilder?: {
                };
                rel?: string;
                rels?: string[];
                params?: {
                    [name: string]: string;
                };
                uri?: string; // uri
                title?: string;
                type?: string;
            }[];
            length?: number; // int32
            language?: {
                language?: string;
                script?: string;
                country?: string;
                variant?: string;
                extensionKeys?: string[];
                unicodeLocaleAttributes?: string[];
                unicodeLocaleKeys?: string[];
                iso3Language?: string;
                iso3Country?: string;
                displayLanguage?: string;
                displayScript?: string;
                displayCountry?: string;
                displayVariant?: string;
                displayName?: string;
            };
            location?: string; // uri
        }
        export interface TypedResponseTimeSeriesResponse {
            statusInfo?: {
                statusCode?: number; // int32
                reasonPhrase?: string;
                family?: "INFORMATIONAL" | "SUCCESSFUL" | "REDIRECTION" | "CLIENT_ERROR" | "SERVER_ERROR" | "OTHER";
            };
            mediaType?: {
                type?: string;
                subtype?: string;
                parameters?: {
                    [name: string]: string;
                };
                wildcardType?: boolean;
                wildcardSubtype?: boolean;
            };
            allowedMethods?: string[];
            entityTag?: {
                value?: string;
                weak?: boolean;
            };
            stringHeaders?: {
                [name: string]: string[];
                
            };
            lastModified?: string; // date-time
            date?: string; // date-time
            headers?: {
                [name: string]: {
                }[];
                
            };
            entity?: TimeSeriesResponse;
            status?: number; // int32
            cookies?: {
                [name: string]: {
                    name?: string;
                    value?: string;
                    version?: number; // int32
                    path?: string;
                    domain?: string;
                    comment?: string;
                    maxAge?: number; // int32
                    expiry?: string; // date-time
                    secure?: boolean;
                    httpOnly?: boolean;
                };
            };
            links?: {
                uriBuilder?: {
                };
                rel?: string;
                rels?: string[];
                params?: {
                    [name: string]: string;
                };
                uri?: string; // uri
                title?: string;
                type?: string;
            }[];
            length?: number; // int32
            language?: {
                language?: string;
                script?: string;
                country?: string;
                variant?: string;
                extensionKeys?: string[];
                unicodeLocaleAttributes?: string[];
                unicodeLocaleKeys?: string[];
                iso3Language?: string;
                iso3Country?: string;
                displayLanguage?: string;
                displayScript?: string;
                displayCountry?: string;
                displayVariant?: string;
                displayName?: string;
            };
            location?: string; // uri
        }
        export interface URLData {
            fileId?: number; // int64
            uploadURL?: string;
        }
        export interface URLResponse {
            data?: URLData;
        }
        export interface UpdateFieldValuesDTO {
            id?: number; // int64
            add?: PostFieldValueDTO[];
            remove?: number /* int64 */ [];
            set?: PostFieldValueDTO[];
        }
        export interface UpdateModelV2DTO {
            /**
             * The name of the model.
             * example:
             * My Model
             */
            name?: string;
            /**
             * The id of the model.
             * example:
             * 1000
             */
            id?: number; // int64
        }
        export interface UpdateRevisionV2DTO {
            /**
             * True if the revision is marked as published.
             */
            published?: boolean;
            rotation?: number /* double */ [];
            camera?: RevisionCameraProperties;
            /**
             * The ID of the revision.
             * example:
             * 1000
             */
            id?: number; // int64
            /**
             * The file id. Can only be set on revision creation, and can never be updated.
             */
            fileId?: number; // int64
        }
        /**
         * Change that will be applied to type values.
         */
        export interface UpdateTypeFieldValuesDTO {
            add?: PostFieldValuesDTO[];
            remove?: number /* int64 */ [];
            set?: PostFieldValuesDTO[];
            edit?: UpdateFieldValuesDTO[];
        }
        export interface User {
            uniqueName: string;
            groups?: number /* int64 */ [];
            id?: number; // int64
            isDeleted?: boolean;
            deletedTime?: number; // int64
        }
        export interface UserResponse {
            data?: DataUser;
        }
        /**
         * A specification for a new user to be created
         */
        export interface UserSpec {
            uniqueName: string;
            groups?: number /* int64 */ [];
        }
        /**
         * The file ID of the data file for this sector, with multiple versions supported. Use /3d/files/{id} to retrieve the file.
         */
        export interface VersionedThreedFileV2DTO {
            /**
             * Version of the file format.
             * example:
             * 1
             */
            version?: number; // int64
            /**
             * File ID. Use /3d/files/{id} to retrieve the file.
             * example:
             * 1000
             */
            fileId?: number; // int64
        }
    }
}
export namespace Paths {
    export namespace AddColumns {
        export namespace Parameters {
            export type Id = number; // int64
        }
        export interface PathParameters {
            id: Parameters.Id; // int64
        }
        export type RequestBody = Components.Schemas.DataPostColumn;
        export namespace Responses {
            export type $200 = Components.Schemas.DataGetSequenceResponse;
        }
    }
    export namespace AddFields {
        export namespace Parameters {
            export type Id = number; // int64
            export type Project = string;
        }
        export interface PathParameters {
            id: Parameters.Id; // int64
            project: Parameters.Project;
        }
    }
    export namespace AddUsersToGroup {
        export namespace Parameters {
            export type GroupId = number; // int64
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
            groupId: Parameters.GroupId; // int64
        }
        export type RequestBody = Components.Schemas.DataLong;
        export namespace Responses {
            export type $400 = Components.Schemas.MissingFieldError;
        }
    }
    export namespace AlterAsset {
        export namespace Parameters {
            export type Id = number; // int64
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
            id: Parameters.Id; // int64
        }
        export type RequestBody = Components.Schemas.AssetChangeV2;
        export namespace Responses {
            export type $200 = Components.Schemas.AssetDataV2Response;
        }
    }
    export namespace AlterAssets {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataAssetChangeV2;
        export namespace Responses {
            export type $200 = Components.Schemas.AssetDataV2Response;
        }
    }
    export namespace AlterEvent {
        export namespace Parameters {
            export type Id = number; // int64
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
            id: Parameters.Id; // int64
        }
        export type RequestBody = Components.Schemas.EventChange;
        export namespace Responses {
            export type $200 = Components.Schemas.EventDataResponse;
            export type $400 = Components.Schemas.ErrorResponse;
        }
    }
    export namespace AlterEvents {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataEventChange;
        export namespace Responses {
            export type $200 = Components.Schemas.EventDataResponse;
            export type $400 = Components.Schemas.ErrorResponse;
        }
    }
    export namespace AlterFile {
        export namespace Parameters {
            export type Id = number; // int64
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
            id: Parameters.Id; // int64
        }
        export type RequestBody = Components.Schemas.FileChange;
        export namespace Responses {
            export type $200 = Components.Schemas.FileResponse;
            export type $400 = Components.Schemas.ErrorResponse;
            export type $404 = Components.Schemas.IdsNotFoundResponse;
        }
    }
    export namespace AlterFiles {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataFileChange;
        export namespace Responses {
            export type $200 = Components.Schemas.EmptyResponse;
            export type $400 = Components.Schemas.ErrorResponse;
        }
    }
    export namespace AlterMultivalueTimeSeries {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataMultiTimeSeriesChange;
        export namespace Responses {
            export type $200 = Components.Schemas.MultiTimeSeriesResponse;
            export type $400 = Components.Schemas.ErrorResponse;
        }
    }
    export namespace AlterMultivalueTimeSeriesSingle {
        export namespace Parameters {
            export type Id = number; // int64
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
            id: Parameters.Id; // int64
        }
        export type RequestBody = Components.Schemas.MultiTimeSeriesChange;
        export namespace Responses {
            export type $200 = Components.Schemas.MultiTimeSeriesResponse;
            export type $400 = Components.Schemas.ErrorResponse;
        }
    }
    export namespace AlterTimeSeries {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataTimeSeriesChange;
        export namespace Responses {
            export type $200 = Components.Schemas.TimeSeriesResponse;
            export type $400 = Components.Schemas.ErrorResponse;
        }
    }
    export namespace AlterTimeSeriesSingle {
        export namespace Parameters {
            export type Id = number; // int64
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
            id: Parameters.Id; // int64
        }
        export type RequestBody = Components.Schemas.TimeSeriesChange;
        export namespace Responses {
            export type $200 = Components.Schemas.TimeSeriesResponse;
            export type $400 = Components.Schemas.ErrorResponse;
        }
    }
    export namespace CreateApiKeys {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataApiKeyRequest;
        export namespace Responses {
            export type $201 = Components.Schemas.NewApiKeyResponse;
            export type $400 = Components.Schemas.MissingFieldError;
        }
    }
    export namespace CreateDBs {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataRawDB;
        export namespace Responses {
            export type $201 = Components.Schemas.RawDBsResponse;
        }
    }
    export namespace CreateGroups {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataGroupSpec;
        export namespace Responses {
            export type $201 = Components.Schemas.GroupResponse;
            export type $400 = Components.Schemas.MissingFieldError;
        }
    }
    export namespace CreateSecurityCategories {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataSecurityCategorySpecDTO;
        export namespace Responses {
            export type $201 = Components.Schemas.SecurityCategoryResponse;
        }
    }
    export namespace CreateSequence {
        export type RequestBody = Components.Schemas.DataPostSequence;
        export namespace Responses {
            export type $200 = Components.Schemas.DataGetSequenceResponse;
            export type $400 = Components.Schemas.ErrorResponse;
        }
    }
    export namespace CreateTables {
        export namespace Parameters {
            export type DbName = string;
            export type EnsureParent = boolean;
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
            dbName: Parameters.DbName;
        }
        export interface QueryParameters {
            ensureParent?: Parameters.EnsureParent;
        }
        export type RequestBody = Components.Schemas.DataRawDBTable;
        export namespace Responses {
            export type $201 = Components.Schemas.RawDBTablesResponse;
            export type $400 = Components.Schemas.MissingFieldError;
        }
    }
    export namespace CreateUsers {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataUserSpec;
        export namespace Responses {
            export type $201 = Components.Schemas.UserResponse;
            export type $400 = Components.Schemas.MissingFieldError;
        }
    }
    export namespace DeleteApiKeys {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataLong;
        export namespace Responses {
            export type $200 = Components.Schemas.EmptyResponse;
        }
    }
    export namespace DeleteAssets {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataLong;
        export namespace Responses {
            export type $200 = Components.Schemas.EmptyResponse;
            export type $400 = Components.Schemas.ErrorResponse;
        }
    }
    export namespace DeleteColumns {
        export namespace Parameters {
            export type Id = number; // int64
        }
        export interface PathParameters {
            id: Parameters.Id; // int64
        }
        export type RequestBody = Components.Schemas.DataLong;
        export namespace Responses {
            export type $200 = Components.Schemas.DataGetSequenceResponse;
        }
    }
    export namespace DeleteDBs {
        export namespace Parameters {
            export type Project = string;
            export type Recursive = boolean;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export interface QueryParameters {
            recursive?: Parameters.Recursive;
        }
        export type RequestBody = Components.Schemas.DataRawDB;
        export namespace Responses {
            export type $200 = Components.Schemas.EmptyResponse;
        }
    }
    export namespace DeleteDatapointsRange {
        export namespace Parameters {
            export type Id = number; // int64
            export type Project = string;
            export type TimestampExclusiveEnd = number; // int64
            export type TimestampInclusiveBegin = number; // int64
        }
        export interface PathParameters {
            project: Parameters.Project;
            id: Parameters.Id; // int64
        }
        export interface QueryParameters {
            timestampInclusiveBegin: Parameters.TimestampInclusiveBegin; // int64
            timestampExclusiveEnd: Parameters.TimestampExclusiveEnd; // int64
        }
        export namespace Responses {
            export type $200 = Components.Schemas.EmptyResponse;
            export type $403 = Components.Schemas.ErrorResponse;
            export type $404 = Components.Schemas.IdsNotFoundResponse;
        }
    }
    export namespace DeleteDatapointsSingle {
        export namespace Parameters {
            export type Id = number; // int64
            export type Project = string;
            export type Timestamp = number; // int64
        }
        export interface PathParameters {
            project: Parameters.Project;
            id: Parameters.Id; // int64
        }
        export interface QueryParameters {
            timestamp: Parameters.Timestamp; // int64
        }
        export namespace Responses {
            export type $200 = Components.Schemas.EmptyResponse;
            export type $403 = Components.Schemas.ErrorResponse;
            export type $404 = Components.Schemas.IdsNotFoundResponse;
        }
    }
    export namespace DeleteEvents {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataLong;
        export namespace Responses {
            export type $200 = Components.Schemas.EmptyResponse;
            export type $400 = Components.Schemas.ErrorResponse;
        }
    }
    export namespace DeleteFiles {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataLong;
        export namespace Responses {
            export type $200 = Components.Schemas.DeleteFilesResponse;
            export type $400 = Components.Schemas.ErrorResponse;
        }
    }
    export namespace DeleteGroups {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataLong;
        export namespace Responses {
            export type $200 = Components.Schemas.EmptyResponse;
        }
    }
    export namespace DeleteMappings {
        export namespace Parameters {
            export type ModelId = number; // int64
            export type Project = string;
            export type RevisionId = number; // int64
        }
        export interface PathParameters {
            project: Parameters.Project;
            modelId: Parameters.ModelId; // int64
            revisionId: Parameters.RevisionId; // int64
        }
        export type RequestBody = Components.Schemas.DataAssetMappingV2DTO;
        export namespace Responses {
            export type $200 = Components.Schemas.EmptyResponse;
        }
    }
    export namespace DeleteModels {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataLong;
        export namespace Responses {
            export type $200 = Components.Schemas.EmptyResponse;
        }
    }
    export namespace DeleteMultivalueTimeSeries {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataLong;
        export namespace Responses {
            export type $200 = Components.Schemas.EmptyResponse;
            export type $403 = Components.Schemas.ErrorResponse;
            export type $404 = Components.Schemas.IdsNotFoundResponse;
        }
    }
    export namespace DeleteRevisions {
        export namespace Parameters {
            export type ModelId = number; // int64
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
            modelId: Parameters.ModelId; // int64
        }
        export type RequestBody = Components.Schemas.DataLong;
        export namespace Responses {
            export type $200 = Components.Schemas.EmptyResponse;
        }
    }
    export namespace DeleteRows {
        export namespace Parameters {
            export type DbName = string;
            export type Project = string;
            export type TableName = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
            dbName: Parameters.DbName;
            tableName: Parameters.TableName;
        }
        export type RequestBody = Components.Schemas.DataRawDBRow;
        export namespace Responses {
            export type $200 = Components.Schemas.EmptyResponse;
        }
    }
    export namespace DeleteSecurityCategories {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataLong;
        export namespace Responses {
            export type $200 = Components.Schemas.EmptyResponse;
            export type $400 = Components.Schemas.ErrorResponse;
        }
    }
    export namespace DeleteSequence {
        export namespace Parameters {
            export type Id = number; // int64
        }
        export interface PathParameters {
            id: Parameters.Id; // int64
        }
        export namespace Responses {
            export type $200 = Components.Schemas.EmptyResponse;
        }
    }
    export namespace DeleteSequences {
        export type RequestBody = Components.Schemas.DataLong;
        export namespace Responses {
            export type $200 = Components.Schemas.EmptyResponse;
        }
    }
    export namespace DeleteTables {
        export namespace Parameters {
            export type DbName = string;
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
            dbName: Parameters.DbName;
        }
        export type RequestBody = Components.Schemas.DataRawDBTable;
        export namespace Responses {
            export type $200 = Components.Schemas.EmptyResponse;
            export type $400 = Components.Schemas.MissingFieldError;
        }
    }
    export namespace DeleteTimeSeries {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataLong;
        export namespace Responses {
            export type $200 = Components.Schemas.EmptyResponse;
            export type $403 = Components.Schemas.ErrorResponse;
            export type $404 = Components.Schemas.IdsNotFoundResponse;
        }
    }
    export namespace DeleteTypes {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
    }
    export namespace DeleteUsers {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataLong;
        export namespace Responses {
            export type $200 = Components.Schemas.EmptyResponse;
        }
    }
    export namespace GetApiKeys {
        export namespace Parameters {
            export type All = boolean;
            export type IncludeDeleted = boolean;
            export type Project = string;
            export type UserId = number; // int64
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export interface QueryParameters {
            all?: Parameters.All;
            userId?: Parameters.UserId; // int64
            includeDeleted?: Parameters.IncludeDeleted;
        }
        export namespace Responses {
            export type $200 = Components.Schemas.ApiKeyResponse;
        }
    }
    export namespace GetAsset {
        export namespace Parameters {
            export type AssetId = number; // int64
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
            assetId: Parameters.AssetId; // int64
        }
        export namespace Responses {
            export type $200 = Components.Schemas.AssetDataV2Response;
        }
    }
    export namespace GetAssets {
        export namespace Parameters {
            export type Cursor = string;
            export type Depth = number; // int32
            export type Description = string;
            export type Limit = number; // int32
            export type Metadata = string;
            export type Name = string;
            export type Project = string;
            export type Source = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export interface QueryParameters {
            name?: Parameters.Name;
            depth?: Parameters.Depth; // int32
            metadata?: Parameters.Metadata;
            description?: Parameters.Description;
            source?: Parameters.Source;
            cursor?: Parameters.Cursor;
            limit?: Parameters.Limit; // int32
        }
        export namespace Responses {
            export type $200 = Components.Schemas.AssetDataV2WithCursorResponse;
        }
    }
    export namespace GetAssetsByIds {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataLong;
        export namespace Responses {
            export type $200 = Components.Schemas.AssetDataV2Response;
            export type $400 = Components.Schemas.ErrorResponse;
        }
    }
    export namespace GetDBs {
        export namespace Parameters {
            export type Cursor = string;
            export type Limit = number; // int32
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export interface QueryParameters {
            limit?: Parameters.Limit; // int32
            cursor?: Parameters.Cursor;
        }
        export namespace Responses {
            export type $200 = Components.Schemas.RawDBsWithCursorResponse;
        }
    }
    export namespace GetDatapoints {
        export namespace Parameters {
            export type Aggregates = string;
            export type End = number; // int64
            export type Granularity = string;
            export type Id = number; // int64
            export type IncludeOutsidePoints = boolean;
            export type Limit = number; // int32
            export type Project = string;
            export type Start = number; // int64
        }
        export interface PathParameters {
            project: Parameters.Project;
            id: Parameters.Id; // int64
        }
        export interface QueryParameters {
            start?: Parameters.Start; // int64
            end?: Parameters.End; // int64
            aggregates?: Parameters.Aggregates;
            granularity?: Parameters.Granularity;
            limit?: Parameters.Limit; // int32
            includeOutsidePoints?: Parameters.IncludeOutsidePoints;
        }
        export namespace Responses {
            export type $200 = Components.Schemas.MultiDatapointsResponse;
            export type $400 = Components.Schemas.ErrorResponse;
            export type $403 = Components.Schemas.ErrorResponse;
            export type $404 = Components.Schemas.IdsNotFoundResponse;
        }
    }
    export namespace GetDatapointsFrame {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DatapointsFrameMultiQuery;
    }
    export namespace GetDownloadLink {
        export namespace Parameters {
            export type Id = number; // int64
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
            id: Parameters.Id; // int64
        }
        export namespace Responses {
            export type $200 = Components.Schemas.SingleStringResponse;
            export type $404 = Components.Schemas.FileNotFoundResponse;
        }
    }
    export namespace GetEvent {
        export namespace Parameters {
            export type EventId = number; // int64
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
            eventId: Parameters.EventId; // int64
        }
        export namespace Responses {
            export type $200 = Components.Schemas.EventDataResponse;
        }
    }
    export namespace GetEvents {
        export namespace Parameters {
            export type AssetId = number; // int64
            export type Cursor = string;
            export type Limit = number; // int32
            export type MaxStartTime = number; // int64
            export type MinStartTime = number; // int64
            export type Project = string;
            export type Source = string;
            export type Subtype = string;
            export type Type = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export interface QueryParameters {
            type?: Parameters.Type;
            subtype?: Parameters.Subtype;
            assetId?: Parameters.AssetId; // int64
            cursor?: Parameters.Cursor;
            limit?: Parameters.Limit; // int32
            minStartTime?: Parameters.MinStartTime; // int64
            maxStartTime?: Parameters.MaxStartTime; // int64
            source?: Parameters.Source;
        }
        export namespace Responses {
            export type $200 = Components.Schemas.EventDataWithCursorResponse;
        }
    }
    export namespace GetEventsByIds {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataLong;
        export namespace Responses {
            export type $200 = Components.Schemas.EventDataResponse;
            export type $400 = Components.Schemas.ErrorResponse;
        }
    }
    export namespace GetFile {
        export namespace Parameters {
            export type Id = number; // int64
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
            id: Parameters.Id; // int64
        }
        export namespace Responses {
            export type $200 = Components.Schemas.FileResponse;
        }
    }
    export namespace GetFiles {
        export namespace Parameters {
            export type AssetId = number; // int64
            export type Cursor = string;
            export type Dir = string;
            export type FileType = string;
            export type IsUploaded = boolean;
            export type Limit = number; // int32
            export type Name = string;
            export type Project = string;
            export type Sort = "ASC" | "DESC";
            export type Source = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export interface QueryParameters {
            assetId?: Parameters.AssetId; // int64
            dir?: Parameters.Dir;
            name?: Parameters.Name;
            fileType?: Parameters.FileType;
            source?: Parameters.Source;
            isUploaded?: Parameters.IsUploaded;
            limit?: Parameters.Limit; // int32
            sort?: Parameters.Sort;
            cursor?: Parameters.Cursor;
        }
        export namespace Responses {
            export type $200 = Components.Schemas.FileWithCursorResponse;
        }
    }
    export namespace GetFilesByIds {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataLong;
        export namespace Responses {
            export type $200 = Components.Schemas.FileResponse;
            export type $400 = Components.Schemas.ErrorResponse;
        }
    }
    export namespace GetGroupsV06 {
        export namespace Parameters {
            export type All = boolean;
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export interface QueryParameters {
            all?: Parameters.All;
        }
        export namespace Responses {
            export type $200 = Components.Schemas.GroupResponse;
        }
    }
    export namespace GetLatest {
        export namespace Parameters {
            export type Before = string;
            export type Id = number; // int64
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
            id: Parameters.Id; // int64
        }
        export interface QueryParameters {
            before?: Parameters.Before;
        }
        export namespace Responses {
            export type $200 = Components.Schemas.DatapointsResponse;
            export type $403 = Components.Schemas.ErrorResponse;
            export type $404 = Components.Schemas.ErrorResponse;
        }
    }
    export namespace GetMappings {
        export namespace Parameters {
            export type AssetId = number; // int64
            export type Cursor = string;
            export type Limit = number; // int32
            export type ModelId = number; // int64
            export type NodeId = number; // int64
            export type Project = string;
            export type RevisionId = number; // int64
        }
        export interface PathParameters {
            project: Parameters.Project;
            modelId: Parameters.ModelId; // int64
            revisionId: Parameters.RevisionId; // int64
        }
        export interface QueryParameters {
            cursor?: Parameters.Cursor;
            limit?: Parameters.Limit; // int32
            nodeId?: Parameters.NodeId; // int64
            assetId?: Parameters.AssetId; // int64
        }
        export namespace Responses {
            export type $200 = Components.Schemas.AssetMappingListCursorResponse;
        }
    }
    export namespace GetModel {
        export namespace Parameters {
            export type ModelId = number; // int64
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
            modelId: Parameters.ModelId; // int64
        }
        export namespace Responses {
            export type $200 = Components.Schemas.ModelResponse;
        }
    }
    export namespace GetModels {
        export namespace Parameters {
            export type Cursor = string;
            export type Limit = number; // int32
            export type Project = string;
            export type Published = boolean;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export interface QueryParameters {
            cursor?: Parameters.Cursor;
            limit?: Parameters.Limit; // int32
            published?: Parameters.Published;
        }
        export namespace Responses {
            export type $200 = Components.Schemas.ModelListCursorResponse;
        }
    }
    export namespace GetMultiTimeSeriesDatapoints {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DatapointsMultiQuery;
        export namespace Responses {
            export type $200 = Components.Schemas.MultiDatapointsResponse;
            export type $400 = Components.Schemas.ErrorResponse;
            export type $403 = Components.Schemas.ErrorResponse;
            export type $404 = Components.Schemas.NamesNotFoundResponse;
        }
    }
    export namespace GetMultivalueTimeSeries {
        export namespace Parameters {
            export type AssetId = number; // int64
            export type Cursor = string;
            export type Description = string;
            export type IncludeMetadata = boolean;
            export type Limit = number; // int32
            export type Name = string;
            export type OmitColumns = boolean;
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export interface QueryParameters {
            name?: Parameters.Name;
            description?: Parameters.Description;
            limit?: Parameters.Limit; // int32
            includeMetadata?: Parameters.IncludeMetadata;
            cursor?: Parameters.Cursor;
            assetId?: Parameters.AssetId; // int64
            omitColumns?: Parameters.OmitColumns;
        }
        export namespace Responses {
            export type $200 = Components.Schemas.MultiTimeSeriesCursorResponse;
        }
    }
    export namespace GetMultivalueTimeSeriesById {
        export namespace Parameters {
            export type Id = number; // int64
            export type IncludeMetadata = boolean;
            export type OmitColumns = boolean;
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
            id: Parameters.Id; // int64
        }
        export interface QueryParameters {
            includeMetadata?: Parameters.IncludeMetadata;
            omitColumns?: Parameters.OmitColumns;
        }
        export namespace Responses {
            export type $200 = Components.Schemas.MultiTimeSeriesResponse;
        }
    }
    export namespace GetMultivalueTimeSeriesDatapoints {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataRetrieveMultivalueDatapoints;
        export namespace Responses {
            export type $200 = Components.Schemas.MultivalueDatapointsResponse;
            export type $400 = Components.Schemas.ErrorResponse;
            export type $403 = Components.Schemas.ErrorResponse;
            export type $404 = Components.Schemas.IdsNotFoundResponse;
        }
    }
    export namespace GetNodeAncestors {
        export namespace Parameters {
            export type Cursor = string;
            export type Limit = number; // int32
            export type ModelId = number; // int64
            export type NodeId = number; // int64
            export type Project = string;
            export type RevisionId = number; // int64
        }
        export interface PathParameters {
            project: Parameters.Project;
            modelId: Parameters.ModelId; // int64
            revisionId: Parameters.RevisionId; // int64
        }
        export interface QueryParameters {
            cursor?: Parameters.Cursor;
            limit?: Parameters.Limit; // int32
            nodeId: Parameters.NodeId; // int64
        }
        export namespace Responses {
            export type $200 = Components.Schemas.NodeListCursorResponse;
        }
    }
    export namespace GetNodes {
        export namespace Parameters {
            export type Cursor = string;
            export type Depth = number; // int32
            export type Limit = number; // int32
            export type Metadata = string;
            export type ModelId = number; // int64
            export type NodeId = number; // int64
            export type Project = string;
            export type RevisionId = number; // int64
        }
        export interface PathParameters {
            project: Parameters.Project;
            modelId: Parameters.ModelId; // int64
            revisionId: Parameters.RevisionId; // int64
        }
        export interface QueryParameters {
            cursor?: Parameters.Cursor;
            limit?: Parameters.Limit; // int32
            depth?: Parameters.Depth; // int32
            nodeId?: Parameters.NodeId; // int64
            metadata?: Parameters.Metadata;
        }
        export namespace Responses {
            export type $200 = Components.Schemas.NodeListCursorResponse;
        }
    }
    export namespace GetProject {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export namespace Responses {
            export type $200 = Components.Schemas.ProjectsResponse;
        }
    }
    export namespace GetRevision {
        export namespace Parameters {
            export type ModelId = number; // int64
            export type Project = string;
            export type RevisionId = number; // int64
        }
        export interface PathParameters {
            project: Parameters.Project;
            modelId: Parameters.ModelId; // int64
            revisionId: Parameters.RevisionId; // int64
        }
        export namespace Responses {
            export type $200 = Components.Schemas.RevisionResponse;
        }
    }
    export namespace GetRevisions {
        export namespace Parameters {
            export type Cursor = string;
            export type Limit = number; // int32
            export type ModelId = number; // int64
            export type Project = string;
            export type Published = boolean;
        }
        export interface PathParameters {
            project: Parameters.Project;
            modelId: Parameters.ModelId; // int64
        }
        export interface QueryParameters {
            cursor?: Parameters.Cursor;
            limit?: Parameters.Limit; // int32
            published?: Parameters.Published;
        }
        export namespace Responses {
            export type $200 = Components.Schemas.RevisionListCursorResponse;
        }
    }
    export namespace GetRow {
        export namespace Parameters {
            export type DbName = string;
            export type Project = string;
            export type RowKey = string;
            export type TableName = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
            dbName: Parameters.DbName;
            tableName: Parameters.TableName;
            rowKey: Parameters.RowKey;
        }
        export namespace Responses {
            export type $200 = Components.Schemas.RawDBRowsResponse;
        }
    }
    export namespace GetRowsCSV {
        export namespace Parameters {
            export type Columns = string;
            export type Cursor = string;
            export type DbName = string;
            export type Limit = number; // int32
            export type Project = string;
            export type TableName = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
            dbName: Parameters.DbName;
            tableName: Parameters.TableName;
        }
        export interface QueryParameters {
            limit?: Parameters.Limit; // int32
            columns?: Parameters.Columns;
            cursor?: Parameters.Cursor;
        }
    }
    export namespace GetSectors {
        export namespace Parameters {
            export type BoundingBox = string;
            export type Cursor = string;
            export type Limit = number; // int32
            export type ModelId = number; // int64
            export type Project = string;
            export type RevisionId = number; // int64
        }
        export interface PathParameters {
            project: Parameters.Project;
            modelId: Parameters.ModelId; // int64
            revisionId: Parameters.RevisionId; // int64
        }
        export interface QueryParameters {
            boundingBox?: Parameters.BoundingBox;
            cursor?: Parameters.Cursor;
            limit?: Parameters.Limit; // int32
        }
        export namespace Responses {
            export type $200 = Components.Schemas.SectorListCursorResponse;
        }
    }
    export namespace GetSecurityCategories {
        export namespace Parameters {
            export type Cursor = string;
            export type Limit = number; // int32
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export interface QueryParameters {
            cursor?: Parameters.Cursor;
            limit?: Parameters.Limit; // int32
        }
        export namespace Responses {
            export type $200 = Components.Schemas.SecurityCategoryWithCursorResponse;
        }
    }
    export namespace GetSequence {
        export namespace Parameters {
            export type Cursor = string;
            export type ExternalId = string;
            export type Limit = number; // int32
        }
        export interface QueryParameters {
            externalId?: Parameters.ExternalId;
            limit?: Parameters.Limit; // int32
            cursor?: Parameters.Cursor;
        }
        export namespace Responses {
            export type $200 = Components.Schemas.SequenceWithCursorResponse;
        }
    }
    export namespace GetSequenceById {
        export namespace Parameters {
            export type Id = number; // int64
        }
        export interface PathParameters {
            id: Parameters.Id; // int64
        }
        export namespace Responses {
            export type $200 = Components.Schemas.DataGetSequenceResponse;
        }
    }
    export namespace GetSequenceCSVData {
        export namespace Parameters {
            export type Id = number; // int64
        }
        export interface PathParameters {
            id: Parameters.Id; // int64
        }
        export type RequestBody = Components.Schemas.DataSequenceDataRequest;
    }
    export namespace GetSequenceData {
        export namespace Parameters {
            export type Id = number; // int64
        }
        export interface PathParameters {
            id: Parameters.Id; // int64
        }
        export type RequestBody = Components.Schemas.DataSequenceDataRequest;
        export namespace Responses {
            export type $200 = Components.Schemas.DataSequenceDataResponse;
        }
    }
    export namespace GetSequencesByIds {
        export type RequestBody = Components.Schemas.DataLong;
        export namespace Responses {
            export type $200 = Components.Schemas.DataGetSequenceResponse;
            export type $400 = Components.Schemas.ErrorResponse;
        }
    }
    export namespace GetTables {
        export namespace Parameters {
            export type Cursor = string;
            export type DbName = string;
            export type Limit = number; // int32
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
            dbName: Parameters.DbName;
        }
        export interface QueryParameters {
            limit?: Parameters.Limit; // int32
            cursor?: Parameters.Cursor;
        }
        export namespace Responses {
            export type $200 = Components.Schemas.RawDBTablesWithCursorResponse;
        }
    }
    export namespace GetThreedFile {
        export namespace Parameters {
            export type Project = string;
            export type ThreedFileId = number; // int64
        }
        export interface PathParameters {
            project: Parameters.Project;
            threedFileId: Parameters.ThreedFileId; // int64
        }
    }
    export namespace GetTimeSeries {
        export namespace Parameters {
            export type AssetId = number; // int64
            export type Cursor = string;
            export type Description = string;
            export type IncludeMetadata = boolean;
            export type Limit = number; // int32
            export type Name = string;
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export interface QueryParameters {
            name?: Parameters.Name;
            description?: Parameters.Description;
            limit?: Parameters.Limit; // int32
            includeMetadata?: Parameters.IncludeMetadata;
            cursor?: Parameters.Cursor;
            assetId?: Parameters.AssetId; // int64
        }
        export namespace Responses {
            export type $200 = Components.Schemas.TimeSeriesCursorResponse;
        }
    }
    export namespace GetTimeSeriesById {
        export namespace Parameters {
            export type Id = number; // int64
            export type IncludeMetadata = boolean;
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
            id: Parameters.Id; // int64
        }
        export interface QueryParameters {
            includeMetadata?: Parameters.IncludeMetadata;
        }
        export namespace Responses {
            export type $200 = Components.Schemas.TimeSeriesResponse;
        }
    }
    export namespace GetTimeSeriesByIds {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataLong;
        export namespace Responses {
            export type $200 = Components.Schemas.TimeSeriesResponse;
            export type $400 = Components.Schemas.ErrorResponse;
        }
    }
    export namespace GetTokenStatus {
        export namespace Parameters {
            export type Token = string;
        }
        export interface QueryParameters {
            token: Parameters.Token;
        }
        export namespace Responses {
            export type $200 = Components.Schemas.SingleTokenStatusDTOResponse;
        }
    }
    export namespace GetType {
        export namespace Parameters {
            export type Id = number; // int64
            export type Project = string;
        }
        export interface PathParameters {
            id: Parameters.Id; // int64
            project: Parameters.Project;
        }
    }
    export namespace GetUsers {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export namespace Responses {
            export type $200 = Components.Schemas.UserResponse;
        }
    }
    export namespace GetUsersForGroup {
        export namespace Parameters {
            export type GroupId = number; // int64
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
            groupId: Parameters.GroupId; // int64
        }
        export namespace Responses {
            export type $200 = Components.Schemas.UserResponse;
        }
    }
    export namespace InitiateUploadSession {
        export interface HeaderParameters {
            Origin?: Parameters.Origin;
        }
        export namespace Parameters {
            export type Origin = string;
            export type Project = string;
            export type Resumable = boolean;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export interface QueryParameters {
            resumable?: Parameters.Resumable;
        }
        export type RequestBody = Components.Schemas.FileInfo;
        export namespace Responses {
            export type $200 = Components.Schemas.URLResponse;
            export type $400 = Components.Schemas.MissingFieldError;
        }
    }
    export namespace ListTypes {
        export namespace Parameters {
            export type Cursor = string;
            export type Limit = number; // int32
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export interface QueryParameters {
            cursor?: Parameters.Cursor;
            limit?: Parameters.Limit; // int32
        }
    }
    export namespace Logout {
        export namespace Responses {
            export type $200 = Components.Schemas.LoginStatusResponse;
        }
    }
    export namespace LogoutUrl {
        export namespace Parameters {
            export type RedirectUrl = string;
        }
        export interface QueryParameters {
            redirectUrl?: Parameters.RedirectUrl;
        }
        export namespace Responses {
            export type $200 = Components.Schemas.LoginUrlResponse;
        }
    }
    export namespace PostAssets {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataCreateAssetV2;
        export namespace Responses {
            export type $201 = Components.Schemas.AssetDataV2Response;
        }
    }
    export namespace PostCsv {
        export namespace Parameters {
            export type DbName = string;
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
            dbName: Parameters.DbName;
        }
        export namespace Responses {
            export type $200 = Components.Schemas.EmptyResponse;
            export type $400 = Components.Schemas.MissingFieldError;
        }
    }
    export namespace PostDatapoints {
        export namespace Parameters {
            export type Id = number; // int64
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
            id: Parameters.Id; // int64
        }
        export type RequestBody = Components.Schemas.DataPostDatapoint;
        export namespace Responses {
            export type $200 = Components.Schemas.EmptyResponse;
            export type $400 = Components.Schemas.ErrorResponse;
            export type $403 = Components.Schemas.ErrorResponse;
            export type $404 = Components.Schemas.IdsNotFoundResponse;
        }
    }
    export namespace PostEvents {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataEvent;
        export namespace Responses {
            export type $201 = Components.Schemas.EventDataResponse;
            export type $400 = Components.Schemas.MissingFieldError;
            export type $409 = Components.Schemas.DuplicateResourceExceptionError;
        }
    }
    export namespace PostMappings {
        export namespace Parameters {
            export type ModelId = number; // int64
            export type Project = string;
            export type RevisionId = number; // int64
        }
        export interface PathParameters {
            project: Parameters.Project;
            modelId: Parameters.ModelId; // int64
            revisionId: Parameters.RevisionId; // int64
        }
        export type RequestBody = Components.Schemas.DataCreateAssetMappingV2DTO;
        export namespace Responses {
            export type $200 = Components.Schemas.AssetMappingListResponse;
        }
    }
    export namespace PostModels {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataCreateModelV2DTO;
        export namespace Responses {
            export type $200 = Components.Schemas.ModelListResponse;
        }
    }
    export namespace PostMultiTimeSeriesDatapoints {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataDatapointsPostDatapoint;
        export namespace Responses {
            export type $200 = Components.Schemas.EmptyResponse;
            export type $400 = Components.Schemas.ErrorResponse;
            export type $403 = Components.Schemas.ErrorResponse;
            export type $404 = Components.Schemas.NamesNotFoundResponse;
        }
    }
    export namespace PostMultivalueTimeSeries {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataPostMultiTimeSeriesDTO;
        export namespace Responses {
            export type $200 = Components.Schemas.MultiTimeSeriesResponse;
            export type $400 = Components.Schemas.MissingFieldError;
        }
    }
    export namespace PostMultivalueTimeSeriesDatapoints {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataMultivalueDatapointsPostMultivalueDatapoint;
        export namespace Responses {
            export type $200 = Components.Schemas.EmptyResponse;
            export type $400 = Components.Schemas.ErrorResponse;
            export type $403 = Components.Schemas.ErrorResponse;
            export type $404 = Components.Schemas.IdsNotFoundResponse;
        }
    }
    export namespace PostRevisions {
        export interface HeaderParameters {
            "Api-Key"?: Parameters.ApiKey;
            Authorization?: Parameters.Authorization;
        }
        export namespace Parameters {
            export type ApiKey = string;
            export type Authorization = string;
            export type ModelId = number; // int64
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
            modelId: Parameters.ModelId; // int64
        }
        export type RequestBody = Components.Schemas.DataCreateRevisionV2DTO;
        export namespace Responses {
            export type $200 = Components.Schemas.RevisionListResponse;
        }
    }
    export namespace PostRows {
        export namespace Parameters {
            export type DbName = string;
            export type EnsureParent = boolean;
            export type Project = string;
            export type TableName = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
            dbName: Parameters.DbName;
            tableName: Parameters.TableName;
        }
        export interface QueryParameters {
            ensureParent?: Parameters.EnsureParent;
        }
        export type RequestBody = Components.Schemas.DataRawDBRow;
        export namespace Responses {
            export type $200 = Components.Schemas.EmptyResponse;
            export type $400 = Components.Schemas.MissingFieldError;
        }
    }
    export namespace PostSearchAssets {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.AssetSearchQuery;
        export namespace Responses {
            export type $200 = Components.Schemas.AssetDataV2Response;
        }
    }
    export namespace PostSequenceData {
        export namespace Parameters {
            export type Id = number; // int64
        }
        export interface PathParameters {
            id: Parameters.Id; // int64
        }
        export type RequestBody = Components.Schemas.DataSequenceRows;
        export namespace Responses {
            export type $200 = Components.Schemas.EmptyResponse;
        }
    }
    export namespace PostThumbnail {
        export namespace Parameters {
            export type ModelId = number; // int64
            export type Project = string;
            export type RevisionId = number; // int64
        }
        export interface PathParameters {
            project: Parameters.Project;
            modelId: Parameters.ModelId; // int64
            revisionId: Parameters.RevisionId; // int64
        }
        export type RequestBody = Components.Schemas.RevisionThumbnailRequestBody;
        export namespace Responses {
            export type $200 = Components.Schemas.EmptyResponse;
        }
    }
    export namespace PostTimeSeries {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataPostTimeSeriesV2DTO;
        export namespace Responses {
            export type $200 = Components.Schemas.TimeSeriesResponse;
            export type $400 = Components.Schemas.MissingFieldError;
        }
    }
    export namespace PostTypes {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
    }
    export namespace PutDefaultGroup {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataLong;
        export namespace Responses {
            export type $200 = Components.Schemas.ProjectsResponse;
        }
    }
    export namespace PutModels {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataUpdateModelV2DTO;
        export namespace Responses {
            export type $200 = Components.Schemas.ModelListResponse;
        }
    }
    export namespace PutProject {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataProject;
        export namespace Responses {
            export type $200 = Components.Schemas.ProjectsResponse;
        }
    }
    export namespace PutRevisions {
        export namespace Parameters {
            export type ModelId = number; // int64
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
            modelId: Parameters.ModelId; // int64
        }
        export type RequestBody = Components.Schemas.DataUpdateRevisionV2DTO;
        export namespace Responses {
            export type $200 = Components.Schemas.RevisionListResponse;
        }
    }
    export namespace RedirectUrl {
        export namespace Parameters {
            export type ErrorRedirectUrl = string;
            export type Project = string;
            export type RedirectUrl = string;
        }
        export interface QueryParameters {
            project: Parameters.Project;
            redirectUrl: Parameters.RedirectUrl;
            errorRedirectUrl?: Parameters.ErrorRedirectUrl;
        }
    }
    export namespace RemoveFields {
        export namespace Parameters {
            export type Id = number; // int64
            export type Project = string;
        }
        export interface PathParameters {
            id: Parameters.Id; // int64
            project: Parameters.Project;
        }
    }
    export namespace RemoveUsersFromGroup {
        export namespace Parameters {
            export type GroupId = number; // int64
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
            groupId: Parameters.GroupId; // int64
        }
        export type RequestBody = Components.Schemas.DataLong;
    }
    export namespace RetrieveTypesByIds {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
    }
    export namespace SearchAssets {
        export namespace Parameters {
            export type AssetSubtrees = string;
            export type BoostName = boolean;
            export type Description = string;
            export type Limit = number; // int32
            export type MaxCreatedTime = number; // int64
            export type MaxLastUpdatedTime = number; // int64
            export type Metadata = string;
            export type MinCreatedTime = number; // int64
            export type MinLastUpdatedTime = number; // int64
            export type Name = string;
            export type Offset = number; // int32
            export type Project = string;
            export type Query = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export interface QueryParameters {
            name?: Parameters.Name;
            description?: Parameters.Description;
            query?: Parameters.Query;
            metadata?: Parameters.Metadata;
            assetSubtrees?: Parameters.AssetSubtrees;
            minCreatedTime?: Parameters.MinCreatedTime; // int64
            maxCreatedTime?: Parameters.MaxCreatedTime; // int64
            minLastUpdatedTime?: Parameters.MinLastUpdatedTime; // int64
            maxLastUpdatedTime?: Parameters.MaxLastUpdatedTime; // int64
            limit?: Parameters.Limit; // int32
            offset?: Parameters.Offset; // int32
            boostName?: Parameters.BoostName;
        }
        export namespace Responses {
            export type $200 = Components.Schemas.AssetDataResponse;
        }
    }
    export namespace SearchEvents {
        export namespace Parameters {
            export type AssetIds = string;
            export type AssetSubtrees = string;
            export type Description = string;
            export type Dir = "asc" | "desc";
            export type Limit = number; // int32
            export type MaxCreatedTime = number; // int64
            export type MaxEndTime = number; // int64
            export type MaxLastUpdatedTime = number; // int64
            export type MaxStartTime = number; // int64
            export type Metadata = string;
            export type MinCreatedTime = number; // int64
            export type MinEndTime = number; // int64
            export type MinLastUpdatedTime = number; // int64
            export type MinStartTime = number; // int64
            export type Offset = number; // int32
            export type Project = string;
            export type Sort = "startTime" | "endTime" | "createdTime" | "lastUpdatedTime";
            export type Subtype = string;
            export type Type = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export interface QueryParameters {
            description?: Parameters.Description;
            type?: Parameters.Type;
            subtype?: Parameters.Subtype;
            minStartTime?: Parameters.MinStartTime; // int64
            maxStartTime?: Parameters.MaxStartTime; // int64
            minEndTime?: Parameters.MinEndTime; // int64
            maxEndTime?: Parameters.MaxEndTime; // int64
            minCreatedTime?: Parameters.MinCreatedTime; // int64
            maxCreatedTime?: Parameters.MaxCreatedTime; // int64
            minLastUpdatedTime?: Parameters.MinLastUpdatedTime; // int64
            maxLastUpdatedTime?: Parameters.MaxLastUpdatedTime; // int64
            metadata?: Parameters.Metadata;
            assetIds?: Parameters.AssetIds;
            assetSubtrees?: Parameters.AssetSubtrees;
            sort?: Parameters.Sort;
            dir?: Parameters.Dir;
            limit?: Parameters.Limit; // int32
            offset?: Parameters.Offset; // int32
        }
        export namespace Responses {
            export type $200 = Components.Schemas.EventDataResponse;
        }
    }
    export namespace SearchFiles {
        export namespace Parameters {
            export type AssetIds = string;
            export type AssetSubtrees = string;
            export type Dir = "asc" | "desc";
            export type Directory = string;
            export type FileType = string;
            export type Limit = number; // int32
            export type MaxCreatedTime = number; // int64
            export type MaxLastUpdatedTime = number; // int64
            export type MaxUploadedAt = number; // int64
            export type Metadata = string;
            export type MinCreatedTime = number; // int64
            export type MinLastUpdatedTime = number; // int64
            export type MinUploadedAt = number; // int64
            export type Name = string;
            export type Offset = number; // int32
            export type Project = string;
            export type Sort = "createdTime" | "lastUpdatedTime";
            export type Uploaded = boolean;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export interface QueryParameters {
            name?: Parameters.Name;
            directory?: Parameters.Directory;
            fileType?: Parameters.FileType;
            uploaded?: Parameters.Uploaded;
            minUploadedAt?: Parameters.MinUploadedAt; // int64
            maxUploadedAt?: Parameters.MaxUploadedAt; // int64
            minCreatedTime?: Parameters.MinCreatedTime; // int64
            maxCreatedTime?: Parameters.MaxCreatedTime; // int64
            minLastUpdatedTime?: Parameters.MinLastUpdatedTime; // int64
            maxLastUpdatedTime?: Parameters.MaxLastUpdatedTime; // int64
            metadata?: Parameters.Metadata;
            assetIds?: Parameters.AssetIds;
            assetSubtrees?: Parameters.AssetSubtrees;
            sort?: Parameters.Sort;
            dir?: Parameters.Dir;
            limit?: Parameters.Limit; // int32
            offset?: Parameters.Offset; // int32
        }
        export namespace Responses {
            export type $200 = Components.Schemas.FileResponse;
        }
    }
    export namespace SearchSequences {
        export namespace Parameters {
            export type AssetIds = string;
            export type AssetSubtrees = string;
            export type BoostName = boolean;
            export type Description = string;
            export type Dir = "asc" | "desc";
            export type Limit = number; // int32
            export type MaxCreatedTime = number; // int64
            export type MaxLastUpdatedTime = number; // int64
            export type Metadata = string;
            export type MinCreatedTime = number; // int64
            export type MinLastUpdatedTime = number; // int64
            export type Name = string;
            export type Offset = number; // int32
            export type Query = string;
            export type Sort = "createdTime" | "lastUpdatedTime";
        }
        export interface QueryParameters {
            name?: Parameters.Name;
            description?: Parameters.Description;
            query?: Parameters.Query;
            metadata?: Parameters.Metadata;
            assetIds?: Parameters.AssetIds;
            assetSubtrees?: Parameters.AssetSubtrees;
            minCreatedTime?: Parameters.MinCreatedTime; // int64
            maxCreatedTime?: Parameters.MaxCreatedTime; // int64
            minLastUpdatedTime?: Parameters.MinLastUpdatedTime; // int64
            maxLastUpdatedTime?: Parameters.MaxLastUpdatedTime; // int64
            sort?: Parameters.Sort;
            dir?: Parameters.Dir;
            limit?: Parameters.Limit; // int32
            offset?: Parameters.Offset; // int32
            boostName?: Parameters.BoostName;
        }
    }
    export namespace SearchTimeSeries {
        export namespace Parameters {
            export type AssetIds = string;
            export type AssetSubtrees = string;
            export type BoostName = boolean;
            export type Description = string;
            export type Dir = "asc" | "desc";
            export type IsStep = boolean;
            export type IsString = boolean;
            export type Limit = number; // int32
            export type MaxCreatedTime = number; // int64
            export type MaxLastUpdatedTime = number; // int64
            export type Metadata = string;
            export type MinCreatedTime = number; // int64
            export type MinLastUpdatedTime = number; // int64
            export type Name = string;
            export type Offset = number; // int32
            export type Project = string;
            export type Query = string;
            export type Sort = "createdTime" | "lastUpdatedTime";
            export type Unit = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export interface QueryParameters {
            name?: Parameters.Name;
            description?: Parameters.Description;
            query?: Parameters.Query;
            unit?: Parameters.Unit;
            isString?: Parameters.IsString;
            isStep?: Parameters.IsStep;
            metadata?: Parameters.Metadata;
            assetIds?: Parameters.AssetIds;
            assetSubtrees?: Parameters.AssetSubtrees;
            minCreatedTime?: Parameters.MinCreatedTime; // int64
            maxCreatedTime?: Parameters.MaxCreatedTime; // int64
            minLastUpdatedTime?: Parameters.MinLastUpdatedTime; // int64
            maxLastUpdatedTime?: Parameters.MaxLastUpdatedTime; // int64
            sort?: Parameters.Sort;
            dir?: Parameters.Dir;
            limit?: Parameters.Limit; // int32
            offset?: Parameters.Offset; // int32
            boostName?: Parameters.BoostName;
        }
        export namespace Responses {
            export type $200 = Components.Schemas.TimeSeriesResponse;
        }
    }
    export namespace Status {
        export namespace Responses {
            export type $200 = Components.Schemas.LoginStatusResponse;
        }
    }
    export namespace UpdateColumns {
        export namespace Parameters {
            export type Id = number; // int64
        }
        export interface PathParameters {
            id: Parameters.Id; // int64
        }
        export type RequestBody = Components.Schemas.DataSequenceColumnChange;
        export namespace Responses {
            export type $200 = Components.Schemas.DataGetSequenceResponse;
        }
    }
    export namespace UpdateFields {
        export namespace Parameters {
            export type Id = number; // int64
            export type Project = string;
        }
        export interface PathParameters {
            id: Parameters.Id; // int64
            project: Parameters.Project;
        }
    }
    export namespace UpdateFiles {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
        export type RequestBody = Components.Schemas.DataFileInfo;
        export namespace Responses {
            export type $200 = Components.Schemas.EmptyResponse;
            export type $400 = Components.Schemas.ErrorResponse;
        }
    }
    export namespace UpdateSequence {
        export namespace Parameters {
            export type Id = number; // int64
        }
        export interface PathParameters {
            id: Parameters.Id; // int64
        }
        export type RequestBody = Components.Schemas.SequenceChange;
        export namespace Responses {
            export type $200 = Components.Schemas.DataGetSequenceResponse;
        }
    }
    export namespace UpdateSequences {
        export type RequestBody = Components.Schemas.DataSequenceChange;
        export namespace Responses {
            export type $200 = Components.Schemas.DataGetSequenceResponse;
        }
    }
    export namespace UpdateTypes {
        export namespace Parameters {
            export type Project = string;
        }
        export interface PathParameters {
            project: Parameters.Project;
        }
    }
}
