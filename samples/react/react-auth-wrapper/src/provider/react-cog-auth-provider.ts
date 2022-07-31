// Copyright 2022 Cognite AS

import { isObject } from "lodash";
import { AuthContextProps } from "react-oidc-context";
import { AuthMethod } from "../authentication/auth-types";
import PkceAuth from "../authentication/pkce";

export default class ReactCogniteAuthProvider {

  private constructor(public method: AuthMethod
    , public authContext: AuthContextProps) {

  }

  public static load(authMethod: AuthMethod, authContext: AuthContextProps) {
    return new this(authMethod, authContext);
  }

  async login() {
    if (this.method === 'pkce') {
      return await PkceAuth.load(this.authContext).login();
    }
  }

  public static requires(credentials: any) {
    console.log(`Checking if credentials is a valid object`)
    if (!isObject(credentials)) {
      console.log(`Credentials is not an object`);

      throw Error('credentials is required');
    }

    console.log(`Checking if credentials has a method property`);

    if (!credentials.method) {
      console.log(`Credentials does not have a method property`);
      throw Error(
        'options.credentials.method is required and must be of type string with one of this values: api, client_credentials, device, implicit, pkce'
      );
    }

    console.log(`Checks have passed!`);
  }

}
