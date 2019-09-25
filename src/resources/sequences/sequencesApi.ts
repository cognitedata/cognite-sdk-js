// Copyright 2019 Cognite AS
import { CursorAndAsyncIterator } from '../../autoPagination';
import { MetadataMap } from '../../metadata';
import {
  ExternalSequence,
  IdEither,
  Sequence,
  SequenceChange,
  SequenceSearchFilter,
  SequenceRowsInsert,
  SequenceRetrieveRows,
  SequenceListScope,
  SequenceRow,
} from '../../types/types';
import { CDFHttpClient } from '../../utils/http/cdfHttpClient';
import { BaseResourceAPI } from '../baseResourceApi';
import { SequenceRowsAPI } from './sequenceRowsApi';

export class SequencesAPI extends BaseResourceAPI<Sequence> {
  private sequenceRowsAPI: SequenceRowsAPI;
  
  /** @hidden */
  constructor(
    resourcePath: string,
    httpClient: CDFHttpClient,
    map: MetadataMap
  ) {
    super(resourcePath, httpClient, map);
    this.sequenceRowsAPI = new SequenceRowsAPI(`${this.url()}data`, httpClient, map);
  }

  /**
   * [Create sequences](https://docs.cognite.com/api/v1/#operation/createSequence)
   *
   * ```js
   * const sequences = [
   * ];
   * const [sequence] = await client.sequences.create(sequences);
   * ```
   */
  public create = (items: ExternalSequence[]): Promise<Sequence[]> => {
    return super.createEndpoint(items);
  };

  /**
   * [List sequences](https://docs.cognite.com/api/v1/#operation/advancedListSequences)
   * <!-- or [similar](https://docs.cognite.com/api/v1/#operation/listSequences) -->
   *
   * ```js
   * const sequences = await client.sequences.list({ filter: { name: 'sequence1' } });
   * ```
   */
  public list = (
    scope?: SequenceListScope
  ): CursorAndAsyncIterator<Sequence> => {
    return super.listEndpoint(this.callListEndpointWithPost, scope);
  };

  /**
   * [Retrieve sequences](https://docs.cognite.com/api/v1/#operation/getSequenceById)
   *
   * ```js
   * const [sequence1, sequence2] = await client.sequences.retrieve([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public retrieve = (ids: IdEither[]): Promise<Sequence[]> => {
    return super.retrieveEndpoint(ids);
  };

  /**
   * [Update sequences](https://docs.cognite.com/api/v1/#operation/updateSequences)
   *
   * ```js
   * const [updatedSequence] = await client.sequences.update([{id: 123, update: {name: {set: 'New name'}}}]);
   * ```
   */
  public update = (changes: SequenceChange[]): Promise<Sequence[]> => {
    return super.updateEndpoint(changes);
  };

  /**
   * [Search sequences](https://doc.cognitedata.com/api/v1/#operation/searchAssets)
   *
   * ```js
   * const sequences = await client.sequences.search({
   *   filter: {
   *     assetIds: [1, 2]
   *   },
   *   search: {
   *     query: 'n*m* desc*ion'
   *   }
   * });
   * ```
   */
  public search = (query: SequenceSearchFilter): Promise<Sequence[]> => {
    return super.searchEndpoint(query);
  };

  /**
   * [Delete sequences](https://docs.cognite.com/api/v1/#operation/deleteSequences)
   *
   * ```js
   * await client.sequences.delete([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public delete = (ids: IdEither[]) => {
    return super.deleteEndpoint(ids);
  };

  /**
   * [Insert rows](https://docs.cognite.com/api/v1/#operation/postSequenceData)
   *
   * ```js
   * // todo: fix this
   * await client.sequences.insertRows('My company', 'Customers', [{ key: 'customer1', columns: { 'First name': 'Steve', 'Last name': 'Jobs' } }]);
   * ```
   */
  public insertRows = (
    items: SequenceRowsInsert[]
  ): Promise<{}> => {
    return this.sequenceRowsAPI.insert(items);
  };

  /**
   * [Insert rows](https://docs.cognite.com/api/v1/#operation/getSequenceData)
   *
   * ```js
   * // todo: fix this
   * await client.sequences.retrieveRows('My company', 'Customers', [{ key: 'customer1', columns: { 'First name': 'Steve', 'Last name': 'Jobs' } }]);
   * ```
   */
  public retrieveRows = (
    query: SequenceRetrieveRows
  ): CursorAndAsyncIterator<SequenceRow> => {
    return this.sequenceRowsAPI.retrieve(query);
  };
}
