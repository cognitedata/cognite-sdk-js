// Copyright 2023 Cognite AS

import { mockBaseUrl } from '../../../core/src/__tests__/testUtils';
import CogniteClientAlpha from '../cogniteClient';
import { login } from './login';

export function setupLoggedInClient() {
  return new CogniteClientAlpha({
    appId: 'JS SDK integration tests (alpha)',
    baseUrl: process.env.COGNITE_BASE_URL,
    project: process.env.COGNITE_PROJECT as string,
    oidcTokenProvider: () =>
      login().then((account) => {
        return account.access_token;
      }),
  });
}

export function setupMockableClient() {
  return new CogniteClientAlpha({
    appId: 'JS SDK unit tests (alpha)',
    project: process.env.COGNITE_PROJECT || 'unit-test',
    baseUrl: mockBaseUrl,
    oidcTokenProvider: () => Promise.resolve('test accessToken'),
  });
}

export function randomInt() {
  return Math.floor(Math.random() * 10000000000);
}

export const DATA_PRODUCT_TEST_SPACE_PREFIX = 'sdk_js_alpha_dp';

export async function cleanupDataProductSchemaSpaces(
  client: CogniteClientAlpha,
  spaces: string[]
) {
  const dataProducts = await client.dataProducts
    .list({ limit: 100 })
    .autoPagingToArray({ limit: Number.POSITIVE_INFINITY });

  for (const space of spaces) {
    const productsInSpace = dataProducts.filter(
      (product) => product.schemaSpace === space
    );

    for (const product of productsInSpace) {
      // The product may already be gone: deleted by the test itself or by a
      // concurrent run, while still present in the (eventually consistent)
      // listing above. Cleanup must tolerate that rather than fail the suite.
      try {
        const versions = await client.dataProductVersions
          .list(product.externalId, { limit: 10 })
          .autoPagingToArray({ limit: Number.POSITIVE_INFINITY });

        if (versions.length > 0) {
          await client.dataProductVersions.delete(
            product.externalId,
            versions.map((version) => ({ version: version.version }))
          );
        }
      } catch {
        // ignore - fall through to the product delete, which is also tolerant
      }

      await client.dataProducts
        .delete([{ externalId: product.externalId }])
        .catch(() => {});
    }

    const views = await client.views
      .list({ limit: 1000, space, allVersions: true })
      .autoPagingToArray({ limit: Number.POSITIVE_INFINITY });

    if (views.length > 0) {
      await client.views
        .delete(
          views.map((view) => ({
            externalId: view.externalId,
            space: view.space,
            version: view.version,
          }))
        )
        .catch(() => {});
    }

    const containers = await client.containers
      .list({ limit: 100, space })
      .autoPagingToArray({ limit: Number.POSITIVE_INFINITY });

    if (containers.length > 0) {
      await client.containers
        .delete(
          containers.map((container) => ({
            externalId: container.externalId,
            space: container.space,
          }))
        )
        .catch(() => {});
    }

    await client.spaces.delete([space]).catch(() => {});
  }
}

/**
 * Only clean up test spaces that have been idle for at least this long.
 * Both suites in this package (and the same suites in the parallel CI matrix
 * job) run concurrently against the same project, and all of them create
 * spaces under DATA_PRODUCT_TEST_SPACE_PREFIX. Deleting a space that another
 * live run just created pulls its data products out from under it mid-test,
 * so only spaces old enough to be orphans from a crashed run are removed.
 * Mirrors deleteSpacesNotUpdatedSince in the stable package's testUtils.
 */
const ORPHAN_AGE_THRESHOLD_MS = 15 * 60 * 1000;

export async function cleanupOrphanedDataProductTestResources(
  client: CogniteClientAlpha
) {
  const cutoff = Date.now() - ORPHAN_AGE_THRESHOLD_MS;
  const spaces = (
    await client.spaces
      .list({ limit: 1000 })
      .autoPagingToArray({ limit: Number.POSITIVE_INFINITY })
  )
    .filter(
      (space) =>
        space.space.startsWith(DATA_PRODUCT_TEST_SPACE_PREFIX) &&
        space.lastUpdatedTime < cutoff
    )
    .map((space) => space.space);

  if (spaces.length > 0) {
    await cleanupDataProductSchemaSpaces(client, spaces);
  }
}

export async function getOrCreateFile(
  client: CogniteClientAlpha,
  dataSetId: number,
  fileExternalId = 'simulators-integration-test-file'
): Promise<number> {
  const files = await client.files.retrieve([{ externalId: fileExternalId }], {
    ignoreUnknownIds: true,
  });

  if (files.length === 0) {
    const fileInfo = await client.files.upload(
      {
        externalId: fileExternalId,
        name: `${fileExternalId}.yaml`,
        dataSetId: dataSetId,
      },
      'This is the content of the test file'
    );
    return fileInfo.id;
  }

  return files[0].id;
}

export async function getOrCreateDataSet(
  client: CogniteClientAlpha,
  datasetExternalId = 'simulators-integration-test-data-set'
): Promise<number> {
  const datasets = await client.datasets.retrieve(
    [{ externalId: datasetExternalId }],
    { ignoreUnknownIds: true }
  );
  if (datasets.length === 0) {
    const [dataset] = await client.datasets.create([
      {
        externalId: datasetExternalId,
        name: 'Test data set',
      },
    ]);
    return dataset.id;
  }
  return datasets[0].id;
}
