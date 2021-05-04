import { HttpError } from '@cognite/sdk-core';
import { ConfigureAPI } from '../baseWellsClient';
import { Sequence, SequenceData, SequenceDataRequest } from '../model/Sequence';

export class CasingsAPI extends ConfigureAPI {
  public getByWellOrWellboreId = async (
    wellOrWellboreId: number
  ): Promise<Sequence[]> => {
    const path: string = this.getPath(`/wells/${wellOrWellboreId}/casings`);
    return await this.client
      .asyncGet<Sequence[]>(path)
      .then(casings =>
        casings.data.map((casing: Sequence) =>
          this.addLazyMethodsForCasing(casing)
        )
      )
      .catch(err => {
        throw new HttpError(err.status, err.data.error.message, {});
      });
  };

  public getByWellboreIds = async (
    wellboreIds: Array<number>
  ): Promise<Sequence[]> => {
    const path: string = this.getPath(`/casings/bywellboreids`);
    return await this.client
      .asyncPost<Sequence[]>(path, { data: { items: wellboreIds } })
      .then(casings =>
        casings.data.map((casing: Sequence) =>
          this.addLazyMethodsForCasing(casing)
        )
      )
      .catch(err => {
        throw new HttpError(err.status, err.data.error.message, {});
      });
  };

  private addLazyMethodsForCasing = (casing: Sequence): Sequence => {
    return <Sequence>{
      id: casing.id,
      columns: casing.columns,
      createdTime: casing.createdTime,
      lastUpdatedTime: casing.lastUpdatedTime,
      name: casing.name,
      description: casing.description,
      assetId: casing.assetId,
      externalId: casing.externalId,
      metadata: casing.metadata,
      dataSetId: casing.dataSetId,
      data: async (
        start?: number,
        end?: number,
        columns?: string[],
        cursor?: string,
        limit?: number
      ): Promise<SequenceData> => {
        return await this.getData(
          casing.id,
          start,
          end,
          columns,
          cursor,
          limit
        );
      },
    };
  };

  public getData = async (
    casingId: number,
    start?: number,
    end?: number,
    columns?: string[],
    cursor?: string,
    limit?: number
  ): Promise<SequenceData> => {
    const path: string = this.getPath(`/casings/data`);

    const request: SequenceDataRequest = {
      id: casingId,
      start: start,
      end: end,
      columns: columns,
      cursor: cursor,
      limit: limit,
    };

    return await this.client
      .asyncPost<SequenceData>(path, { data: request })
      .then(response => response.data)
      .catch(err => {
        throw new HttpError(err.status, err.data.error.message, {});
      });
  };
}
