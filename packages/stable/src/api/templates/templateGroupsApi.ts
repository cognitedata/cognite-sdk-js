// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
  type ExternalId,
} from '@cognite/sdk-core';
import type {
  ExternalTemplateGroup,
  TemplateGroup,
  TemplateGroupFilterQuery,
} from '../../types';

export class TemplateGroupsApi extends BaseResourceAPI<TemplateGroup> {
  /**
   * [Create Template Groups](https://pr-1202.specs.preview.cogniteapp.com/v1.json.html#operation/postApiV1ProjectsProjectTemplategroups)
   *
   * ```js
   * const templateGroups = [
   *   { externalId: 'Wells', description: 'Models a Well system', owners: ['user.name@example.com'] },
   * ];
   * const createdTemplateGroups = await client.templates.groups.create(templateGroups);
   * ```
   */
  public create = (
    items: ExternalTemplateGroup[]
  ): Promise<TemplateGroup[]> => {
    return super.createEndpoint(items);
  };

  /**
   * [Upsert Template Groups](https://pr-1202.specs.preview.cogniteapp.com/v1.json.html#operation/postApiV1ProjectsProjectTemplategroupsUpsert)
   *
   * ```js
   * const templateGroups = [
   *   { externalId: 'Wells', description: 'Models a Well system', owners: ['user.name@example.com'] },
   * ];
   * const upsertedTemplateGroups = await client.templates.groups.upsert(templateGroups);
   * ```
   */
  public upsert = (
    items: ExternalTemplateGroup[]
  ): Promise<TemplateGroup[]> => {
    return super.createEndpoint(items, this.url('upsert'));
  };

  /**
   * [Retrieve Template Groups](https://pr-1202.specs.preview.cogniteapp.com/v1.json.html#operation/postApiV1ProjectsProjectTemplategroupsByids)
   *
   * ```js
   * const templateGroups = await client.templates.groups.retrieve([{externalId: 'abc'}]);
   * ```
   */
  public retrieve = (
    ids: ExternalId[],
    options?: { ignoreUnknownIds: boolean }
  ) => {
    return super.retrieveEndpoint(ids, options || { ignoreUnknownIds: false });
  };

  /**
   * [List Template Groups](https://pr-1202.specs.preview.cogniteapp.com/v1.json.html#operation/postApiV1ProjectsProjectTemplategroupsList)
   *
   * ```js
   * const templateGroups = await client.templates.groups.list({ filter: { owners: ["user.name@example.com"] } });
   * ```
   */
  public list = (
    query?: TemplateGroupFilterQuery
  ): CursorAndAsyncIterator<TemplateGroup> => {
    return super.listEndpoint(this.callListEndpointWithPost, query);
  };

  /**
   * [Delete Template Groups](https://pr-1202.specs.preview.cogniteapp.com/v1.json.html#operation/postApiV1ProjectsProjectTemplategroupsDelete)
   *
   * ```js
   * await client.templates.groups.delete([{ externalId: "Wells" }]);
   * ```
   */
  public delete = (
    ids: ExternalId[],
    options?: { ignoreUnknownIds: boolean }
  ) => {
    return super.deleteEndpoint(
      ids,
      options || {
        ignoreUnknownIds: false,
      }
    );
  };
}
