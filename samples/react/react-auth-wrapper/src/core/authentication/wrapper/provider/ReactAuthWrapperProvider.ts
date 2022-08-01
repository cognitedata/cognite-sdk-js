// Copyright 2022 Cognite AS

import { isObject } from "lodash";
import { AuthContextProps } from "react-oidc-context";
import { AuthMethod } from "../../auth-types";
import PkceAuth from "../../pkce";

export default class ReactAuthWrapperProvider {

  private constructor(public method: AuthMethod
    , public authContext: AuthContextProps) {

  }

  public static load(authMethod: AuthMethod, authContext: AuthContextProps) {
    return new this(authMethod, authContext);
  }

  async login(refresh_token?: string) {
    if (this.method === 'pkce') {
      return await PkceAuth.load(this.authContext).login(refresh_token);
    }
  }

  public static requires(credentials: any) {
    if (!isObject(credentials)) {
      console.log(`Credentials is not an object`);

      throw Error('credentials is required');
    }

    if (!credentials.method) {
      console.log(`Credentials does not have a method property`);
      throw Error(
        'options.credentials.method is required and must be of type string with one of this values: api, client_credentials, device, implicit, pkce'
      );
    }

    console.log(`Checks have passed!`);
  }

}
