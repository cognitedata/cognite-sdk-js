// Copyright 2021 Cognite AS
import {
  ICachePlugin,
  ISerializableTokenCache,
  TokenCacheContext,
} from '@azure/msal-common';
import fs from 'fs';
import path from 'path';

const cachePath = path.resolve('./file.json');

// Call back APIs which automatically write and read into a .json file - example implementation
const beforeCacheAccess = async (cacheContext: TokenCacheContext) => {
  await readFromCache(cacheContext.tokenCache);
};

export const readFromCache = async (tokenCache: ISerializableTokenCache) => {
  if (fs.existsSync(cachePath)) {
    tokenCache.deserialize(
      await fs.readFileSync(cachePath, { encoding: 'utf8' })
    );
  }
};

const afterCacheAccess = async (cacheContext: TokenCacheContext) => {
  if (cacheContext.cacheHasChanged) {
    fs.writeFileSync(cachePath, cacheContext.tokenCache.serialize());
  }
};

// Cache Plugin
export const cachePlugin: ICachePlugin = {
  beforeCacheAccess,
  afterCacheAccess,
};
