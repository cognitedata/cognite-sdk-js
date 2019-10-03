// Copyright 2019 Cognite AS
import { CursorAndAsyncIterator } from '../../autoPagination';
import { MetadataMap } from '../../metadata';
import {
  ExternalSequence,
  IdEither,
  Sequence,
  SequenceChange,
  SequenceListScope,
  SequenceRowsDelete,
  SequenceRowsInsert,
  SequenceRowsRetrieve,
  SequenceSearchFilter,
} from '../../types/types';
import { CDFHttpClient } from '../../utils/http/cdfHttpClient';
import { BaseResourceAPI } from '../baseResourceApi';
import { SequenceRow } from '../classes/sequenceRow';
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
    this.sequenceRowsAPI = new SequenceRowsAPI(
      `${this.url()}data`,
      httpClient,
      map
    );
  }

  /**
   * [Create sequences](https://docs.cognite.com/api/v1/#operation/createSequence)
   *
   * ```js
   * const sequences = [
   *  {
   *   externalId: 'sequence_name',
   *   columns: [
   *    {
   *      externalId: 'one',
   *      valueType: SequenceValueType.LONG,
   *    },
   *    {
   *      externalId: 'two',
   *    },
   *    {
   *      externalId: 'three',
   *      valueType: SequenceValueType.STRING,
   *    }
   *   ]
   *  }
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
   * const sequences = await client.sequences.list({ filter: { name: 'sequence_name' } });
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
   * [Search sequences](https://docs.cognite.com/api/v1/#operation/searchSequences)
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
  public delete = (ids: IdEither[]): Promise<{}> => {
    return super.deleteEndpoint(ids);
  };

  /**
   * [Insert rows](https://docs.cognite.com/api/v1/#operation/postSequenceData)
   *
   * ```js
   *
   * const rows = [
   *  { rowNumber: 0, values: [1, 2.2, 'three'] },
   *  { rowNumber: 1, values: [4, 5, 'six'] }
   * ];
   * await client.sequences.insertRows([{ id: 123, rows, columns: ['one', 'two', 'three'] }]);
   * ```
   */
  public insertRows = (items: SequenceRowsInsert[]): Promise<{}> => {
    return this.sequenceRowsAPI.insert(items);
  };

  /**
   * [Retrieve rows](https://docs.cognite.com/api/v1/#operation/getSequenceData)
   *
   * ```js
   * const rows = await client.sequences.retrieveRows({ externalId: 'sequence1' }).autoPagingToArray({ limit: 100 });
   * ```
   */
  public retrieveRows = (
    query: SequenceRowsRetrieve
  ): CursorAndAsyncIterator<SequenceRow> => {
    return this.sequenceRowsAPI.retrieve(query);
  };

  /**
   * [Delete rows](https://docs.cognite.com/api/v1/#operation/deleteSequenceData)
   *
   * ```js
   * await client.sequences.deleteRows([{ id: 32423849, rows: [1,2,3] }]);
   * ```
   */
  public deleteRows = (query: SequenceRowsDelete[]): Promise<{}> => {
    return this.sequenceRowsAPI.delete(query);
  };
}
