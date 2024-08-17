// Copyright 2020 Cognite AS
import { CogniteClient as CogniteClientStable } from '@cognite/sdk';
import { version } from '../package.json';

export default class CogniteClient extends CogniteClientStable {
  protected get version() {
    return `${version}-derived`;
  }
}
