// Type-check-only demo comparing client.instances.query vs queryTyped.
// Never executed: verify with `yarn tsc --noEmit -p packages/stable/tsconfig.json`.
// Each `@ts-expect-error` marks a line that is expected to fail; if the types
// change, tsc reports TS2578 (unused directive) or a new error.
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

// (1) plain query()
export async function plainQuery() {
  const res = await client.instances.query(query);
  // @ts-expect-error TS2532: NodeDefinition.properties is optional -> 'possibly undefined'
  const view = res.items.assets[0].properties.cdf_cdm['CogniteAsset/v1'];
  const nameValid = view.name;
  const nameTypo = view.nmae;
  const resultKeyTypo = res.items.assetz;
  // @ts-expect-error TS2339: 'trim' does not exist on RawPropertyValueV3
  const trimmed = view.name.trim();
  return { nameValid, nameTypo, resultKeyTypo, trimmed };
}

// (2) queryTyped without generics
export async function typedNoGenerics() {
  const res = await client.instances.queryTyped(query);
  const view = res.items.assets[0].properties.cdf_cdm['CogniteAsset/v1'];
  const nameValid = view.name;
  // @ts-expect-error TS2339: typo'd property
  const nameTypo = view.nmae;
  // @ts-expect-error TS2551: typo'd result key
  const resultKeyTypo = res.items.assetz;
  // @ts-expect-error TS2339: 'trim' does not exist on RawPropertyValueV3
  const trimmed = view.name.trim();
  return { nameValid, nameTypo, resultKeyTypo, trimmed };
}

// (3) queryTyped with explicit generics
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
  const nameValid = view.name;
  // @ts-expect-error TS2339: typo'd property
  const nameTypo = view.nmae;
  // @ts-expect-error TS2551: typo'd result key
  const resultKeyTypo = res.items.assetz;
  const trimmed = view.name.trim();
  return { nameValid, nameTypo, resultKeyTypo, trimmed };
}
