// Copyright 2019 Cognite AS

import { API } from '../api';
import { Asset } from './asset';

export class AssetList extends Array<Asset> {
  private client: API;
  constructor(client: API, ...args: any) {
    super(...args);
    this.client = client;
  }

  public delete = () => {
    return this.client.assets.delete(this.map(asset => ({ id: asset.id })));
  }; 



}