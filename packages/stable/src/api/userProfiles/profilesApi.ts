// Copyright 2023 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import {
  UserProfileItem,
  UserIdentifier,
  UserProfilesSearchRequest,
  UserProfilesListResponse,
} from '../../types';

export class ProfilesAPI extends BaseResourceAPI<UserProfileItem> {
  /**
   * [Get the user profile of the principal issuing the request](https://developer.cognite.com/api#tag/User-profiles/operation/getRequesterUserProfile)
   *
   * ```js
   * const response = await client.profiles.me();
   * ```
   */
  public me = async (): Promise<UserProfileItem> => {
    const path = this.url('me');

    const response = await this.get<UserProfileItem>(path);
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [List all user profiles](https://developer.cognite.com/api#tag/User-profiles/operation/listUserProfiles)
   *
   * ```js
   * const response = await client.profiles.list({ limit: 1000, nextCursor: 'abc' });
   * ```
   */
  public list = (scope?: {
    limit?: number;
    cursor?: string;
  }): UserProfilesListResponse => {
    return super.listEndpoint(this.callListEndpointWithGet, scope);
  };

  /**
   * [Retrieve one or more user profiles by ID](https://developer.cognite.com/api#tag/User-profiles/operation/getUserProfilesByIds)
   *
   * ```js
   * const response = await client.profiles.retrieve([{ userIdentifier: 'abcd' }]);
   * ```
   */
  public retrieve = async (
    userIdentifiers: UserIdentifier[]
  ): Promise<UserProfileItem[]> => {
    return super.retrieveEndpoint(userIdentifiers);
  };
  /**
   * [Search user profiles](https://developer.cognite.com/api#tag/User-profiles/operation/userProfilesSearch)
   *
   * ```js
   * const response = await client.profiles.search({ search: { name: 'John' } });
   * ```
   */
  public search = async (
    query: UserProfilesSearchRequest
  ): Promise<UserProfileItem[]> => {
    return super.searchEndpoint(query);
  };
}
