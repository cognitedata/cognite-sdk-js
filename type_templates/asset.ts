// Copyright 2019 Cognite AS

// cog:StartDTO AssetV2
// cog:Description
export interface Asset {
  // cog:Insert id, description, path, depth, name, parentId, metadata, source, sourceId, createdTime, lastUpdatedTime
  // cog:Skip types
}
// cog:EndDTO AssetV2

// cog:StartDTO CreateAssetV2
// cog:Description
export interface CreateAsset {
  // cog:Insert name, description, refId, parentRefId, parentId, source, sourceId, metadata
  // cog:Skip parentName, types, createdTime, lastUpdatedTime
}
// cog:EndDTO CreateAssetV2

// cog:StartQuery getAssets
export interface ListAssetsParams {
  // cog:Insert name, depth, metadata, description
  // cog:Skip source, cursor, limit
}
// cog:EndQuery getAssets
