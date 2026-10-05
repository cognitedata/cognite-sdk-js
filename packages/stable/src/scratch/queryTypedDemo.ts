// Type-check-only demo comparing client.instances.query vs queryTyped.
// Never executed. Meant to be opened in an IDE: hover identifiers and look at
// the squiggles. Every probe line is annotated with what you should see.
//
// SEE THE RAW ERRORS: `@ts-expect-error` hides squiggles. In the IDE, run
// Find & Replace (Cmd/Ctrl+Alt+F), replace `@ts-expect-error` with `@ts-off`
// in this file, and the squiggles appear. Undo (Cmd/Ctrl+Z) to restore.
// CLI check (must exit 0 as committed): `yarn run -T tsc --noEmit -p tsconfig.json` in packages/stable.
//
// Do not merge: this PR is for review/testing only.
import type { CogniteClient, QueryRequest } from '@cognite/sdk';

declare const client: CogniteClient;

const CogniteAssetView = {
  type: 'view',
  space: 'cdf_cdm',
  externalId: 'CogniteAsset',
  version: 'v1',
} as const;

const query = {
  with: {
    assets: {
      nodes: { filter: { hasData: [CogniteAssetView] } },
      limit: 10,
    },
  },
  select: {
    assets: {
      sources: [
        { source: CogniteAssetView, properties: ['name', 'description'] },
      ],
    },
  },
} as const satisfies QueryRequest;

// ---------------------------------------------------------------------------
// (1) plain query()
// Hover `res`  -> QueryResponse
// Hover `view` -> { [x: string]: RawPropertyValueV3 }
// ---------------------------------------------------------------------------
export async function plainQuery() {
  const res = await client.instances.query(query);
  // EXPECT: squiggle (TS2532 'possibly undefined'); NodeDefinition.properties is optional
  // @ts-expect-error
  const view = res.items.assets[0].properties.cdf_cdm['CogniteAsset/v1'];
  // EXPECT: no squiggle. Hover `nameValid` -> RawPropertyValueV3 (string | number | boolean | object | ...[])
  const nameValid = view.name;
  // EXPECT: NO squiggle (any string key is accepted) <- the gap vs queryTyped
  const nameTypo = view.nmae;
  // EXPECT: NO squiggle (any result key is accepted). Hover -> NodeOrEdge[]
  const resultKeyTypo = res.items.assetz;
  // EXPECT: squiggle on `trim` (TS2339): not on RawPropertyValueV3
  // @ts-expect-error
  const trimmed = view.name.trim();
  return { nameValid, nameTypo, resultKeyTypo, trimmed };
}

// ---------------------------------------------------------------------------
// (2) queryTyped without generics
// Hover `res.items`  -> only `assets` key
// Hover `view`       -> { name: RawPropertyValueV3; description: RawPropertyValueV3 }
// ---------------------------------------------------------------------------
export async function typedNoGenerics() {
  const res = await client.instances.queryTyped(query);
  // EXPECT: no squiggle. Autocomplete after `properties.` offers only `cdf_cdm`, then only 'CogniteAsset/v1'
  const view = res.items.assets[0].properties.cdf_cdm['CogniteAsset/v1'];
  // EXPECT: no squiggle. Hover `nameValid` -> RawPropertyValueV3 (values are NOT narrowed without generics)
  const nameValid = view.name;
  // EXPECT: squiggle on `nmae` (TS2339)
  // @ts-expect-error
  const nameTypo = view.nmae;
  // EXPECT: squiggle on `assetz` (TS2551 'Did you mean assets?')
  // @ts-expect-error
  const resultKeyTypo = res.items.assetz;
  // EXPECT: squiggle on `trim` (TS2339): value is still RawPropertyValueV3
  // @ts-expect-error
  const trimmed = view.name.trim();
  return { nameValid, nameTypo, resultKeyTypo, trimmed };
}

// ---------------------------------------------------------------------------
// (3) queryTyped with explicit generics
// Hover `view` -> { name: string; description: string }
// ---------------------------------------------------------------------------
export async function typedWithGenerics() {
  const res = await client.instances.queryTyped<
    typeof query,
    [
      {
        source: typeof CogniteAssetView;
        properties: { name: string; description: string };
      },
    ]
  >(query);
  const view = res.items.assets[0].properties.cdf_cdm['CogniteAsset/v1'];
  // EXPECT: no squiggle. Hover `nameValid` -> string
  const nameValid = view.name;
  // EXPECT: squiggle on `nmae` (TS2339)
  // @ts-expect-error
  const nameTypo = view.nmae;
  // EXPECT: squiggle on `assetz` (TS2551)
  // @ts-expect-error
  const resultKeyTypo = res.items.assetz;
  // EXPECT: NO squiggle. Hover `trimmed` -> string
  const trimmed = view.name.trim();
  return { nameValid, nameTypo, resultKeyTypo, trimmed };
}
