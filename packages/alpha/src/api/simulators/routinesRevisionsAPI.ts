// Copyright 2024 Cognite AS

import { BaseResourceAPI, type IdEither } from '@cognite/sdk-core';
import type {
  CursorAndAsyncIterator,
  CursorResponse,
  HttpResponse,
  SimulatorRoutineRevision,
  SimulatorRoutineRevisionBase,
  SimulatorRoutineRevisionCreate,
  SimulatorRoutineRevisionView,
  SimulatorRoutineRevisionsFilterQuery,
} from '../../types';

export class RoutineRevisionsAPI extends BaseResourceAPI<SimulatorRoutineRevision> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['createdTime']);
  }

  public create = async (items: SimulatorRoutineRevisionCreate[]) => {
    return this.createEndpoint(items);
  };

  private callRevisionListEndpoint = async <
    RevisionResponseType extends SimulatorRoutineRevisionBase,
  >(
    query?: SimulatorRoutineRevisionsFilterQuery
  ): Promise<HttpResponse<CursorResponse<RevisionResponseType[]>>> => {
    const response = await this.post<CursorResponse<RevisionResponseType[]>>(
      this.listPostUrl,
      {
        data: query || {},
      }
    );
    return response;
  };

  public list = <
    RevisionResponseType extends
      SimulatorRoutineRevisionBase = SimulatorRoutineRevisionView,
  >(
    query?: SimulatorRoutineRevisionsFilterQuery
  ): CursorAndAsyncIterator<RevisionResponseType> => {
    return this.cursorBasedEndpoint<
      SimulatorRoutineRevisionsFilterQuery,
      RevisionResponseType
    >(this.callRevisionListEndpoint, query);
  };

  public retrieve(items: IdEither[]) {
    return this.retrieveEndpoint(items);
  }

  public delete = async (ids: IdEither[]) => {
    return this.deleteEndpoint(ids);
  };
}
