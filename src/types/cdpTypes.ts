// Copyright 2019 Cognite AS

import { Components, Paths } from './cdp/index'; // cdp types auto-generated from OpenAPI spec
// to update the auto-generated OpenAPI spec run `yarn generate-cdp-types`

// assets
export type Asset = Components.Schemas.AssetV2;
export type CreateAsset = Components.Schemas.CreateAssetV2;
export type ListAssetsParams = Paths.GetAssets.QueryParameters;
export type SearchAssetsParams = Paths.SearchAssets.QueryParameters;
export type UpdateAsset = Components.Schemas.AssetChangeV2;

// asset - types
export type Type = Components.Schemas.GetTypeDTO;
export type CreateType = Components.Schemas.PostTypeDTO;
export type ListTypesParams = Paths.ListTypes.QueryParameters;
export type UpdateType = Components.Schemas.TypeChangeDTO;

// asset - field
export type Field = Components.Schemas.GetFieldDTO;
export type AddField = Components.Schemas.PostFieldDTO;
export type UpdateField = Components.Schemas.TypeFieldChangeDTO;
