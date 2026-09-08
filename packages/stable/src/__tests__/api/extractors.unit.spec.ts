// Copyright 2026 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type {
  Artifact,
  Changelog,
  CogniteClient,
  Extractor,
  ExtractorSchema,
  Link,
  Release,
  Solution,
  SourceSystem,
} from '../..';
import { ArtifactPlatform, ExtractorType, ItemType, LinkType } from '../..';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

type ReleaseWire = Omit<Release, 'createdTime'> & {
  createdTime?: number;
};

type ItemsResponseWire<T> = {
  items: T[];
};

const mockLink: Link = {
  name: 'Documentation',
  type: LinkType.EXTERNAL_DOCUMENTATION,
  url: 'https://docs.cognite.com/industrial/pi',
};

const mockExtractor: Extractor = {
  externalId: 'cognite-pi',
  name: 'PI Extractor',
  description: 'Extracts data from PI',
  type: ExtractorType.GLOBAL,
  latestVersion: '1.2.3',
  links: [mockLink],
  tags: ['pi', 'industrial'],
};

const mockArtifact: Artifact = {
  name: 'pi-extractor.zip',
  displayName: 'PI Extractor for Windows',
  link: '/extractors/artifacts/pi-extractor.zip',
  platform: ArtifactPlatform.WINDOWS,
};

const mockChangelog: Changelog = {
  added: ['PI connectivity'],
  fixed: ['Connection timeout'],
};

const mockReleaseWire: ReleaseWire = {
  externalId: 'cognite-pi',
  version: '1.2.3',
  createdTime: 1700000000000,
  description: 'Initial release',
  artifacts: [mockArtifact],
  changelog: mockChangelog,
};

const mockRelease: Release = {
  ...mockReleaseWire,
  createdTime: new Date(1700000000000),
};

const mockSourceSystem: SourceSystem = {
  externalId: 'cognite-pi',
  name: 'OSIsoft PI',
  description: 'PI System',
  type: ItemType.GLOBAL,
};

const mockSolution: Solution = {
  externalId: 'cognite-pi-pi',
  name: 'PI to CDF',
  sourceSystemExternalId: 'cognite-pi',
  extractorExternalId: 'cognite-pi',
};

const mockSchema: ExtractorSchema = {
  type: 'object',
  properties: {
    host: { type: 'string' },
  },
};

const mockExtractorItemsResponse: ItemsResponseWire<Extractor> = {
  items: [mockExtractor],
};

const mockReleaseItemsResponse: ItemsResponseWire<ReleaseWire> = {
  items: [mockReleaseWire],
};

const mockSourceSystemItemsResponse: ItemsResponseWire<SourceSystem> = {
  items: [mockSourceSystem],
};

const mockSolutionItemsResponse: ItemsResponseWire<Solution> = {
  items: [mockSolution],
};

describe('Extractors unit test', () => {
  let client: CogniteClient;

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('list extractors', async () => {
    nock(mockBaseUrl)
      .get(/\/extractors\/?$/)
      .once()
      .reply(200, mockExtractorItemsResponse);

    const response = await client.extractors.list();
    expect(response.items).toHaveLength(1);
    expect(response.items[0].externalId).toBe('cognite-pi');
  });

  test('list extractors maps nested links and tags', async () => {
    nock(mockBaseUrl)
      .get(/\/extractors\/?$/)
      .once()
      .reply(200, mockExtractorItemsResponse);

    const response = await client.extractors.list();
    const extractor = response.items[0];

    expect(extractor.latestVersion).toBe('1.2.3');
    expect(extractor.tags).toEqual(['pi', 'industrial']);
    expect(extractor.links).toHaveLength(1);
    expect(extractor.links?.[0]).toEqual(mockLink);
  });

  test('retrieve extractors', async () => {
    nock(mockBaseUrl)
      .post(/\/extractors\/byids$/, {
        items: [{ externalId: 'cognite-pi' }],
      })
      .once()
      .reply(200, mockExtractorItemsResponse);

    const result = await client.extractors.retrieve([
      { externalId: 'cognite-pi' },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('PI Extractor');
  });

  test('retrieve extractors with ignoreUnknownIds', async () => {
    nock(mockBaseUrl)
      .post(/\/extractors\/byids$/, (body) => {
        return (
          body.items?.length === 1 &&
          body.items[0].externalId === 'cognite-pi' &&
          body.ignoreUnknownIds === true
        );
      })
      .once()
      .reply(200, mockExtractorItemsResponse);

    const result = await client.extractors.retrieve(
      [{ externalId: 'cognite-pi' }],
      { ignoreUnknownIds: true }
    );
    expect(result).toHaveLength(1);
  });

  test('list releases', async () => {
    nock(mockBaseUrl)
      .get(/\/extractors\/releases\/?$/)
      .once()
      .reply(200, mockReleaseItemsResponse);

    const response = await client.extractors.releases.list();
    expect(response.items).toHaveLength(1);
    expect(response.items[0].version).toBe('1.2.3');
  });

  test('list releases parses createdTime and maps nested fields', async () => {
    nock(mockBaseUrl)
      .get(/\/extractors\/releases\/?$/)
      .once()
      .reply(200, mockReleaseItemsResponse);

    const response = await client.extractors.releases.list();
    expect(response.items[0]).toEqual(mockRelease);
  });

  test('list releases filtered by externalId', async () => {
    nock(mockBaseUrl)
      .get(/\/extractors\/releases\/?$/)
      .query({ externalId: 'cognite-pi' })
      .once()
      .reply(200, mockReleaseItemsResponse);

    const response = await client.extractors.releases.list({
      externalId: 'cognite-pi',
    });
    expect(response.items).toHaveLength(1);
    expect(response.items[0].externalId).toBe('cognite-pi');
  });

  test('retrieve releases', async () => {
    nock(mockBaseUrl)
      .post(/\/extractors\/releases\/byids$/, {
        items: [{ externalId: 'cognite-pi', version: '1.2.3' }],
      })
      .once()
      .reply(200, mockReleaseItemsResponse);

    const result = await client.extractors.releases.retrieve([
      { externalId: 'cognite-pi', version: '1.2.3' },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockRelease);
  });

  test('retrieve releases with ignoreUnknownIds', async () => {
    nock(mockBaseUrl)
      .post(/\/extractors\/releases\/byids$/, (body) => {
        return (
          body.items?.length === 1 &&
          body.items[0].externalId === 'cognite-pi' &&
          body.items[0].version === '1.2.3' &&
          body.ignoreUnknownIds === true
        );
      })
      .once()
      .reply(200, mockReleaseItemsResponse);

    const result = await client.extractors.releases.retrieve(
      [{ externalId: 'cognite-pi', version: '1.2.3' }],
      { ignoreUnknownIds: true }
    );
    expect(result).toHaveLength(1);
  });

  test('list source systems', async () => {
    nock(mockBaseUrl)
      .get(/\/extractors\/sources\/?$/)
      .once()
      .reply(200, mockSourceSystemItemsResponse);

    const response = await client.extractors.sourceSystems.list();
    expect(response.items).toHaveLength(1);
    expect(response.items[0]).toEqual(mockSourceSystem);
  });

  test('retrieve source systems', async () => {
    nock(mockBaseUrl)
      .post(/\/extractors\/sources\/byids$/, {
        items: [{ externalId: 'cognite-pi' }],
      })
      .once()
      .reply(200, mockSourceSystemItemsResponse);

    const result = await client.extractors.sourceSystems.retrieve([
      { externalId: 'cognite-pi' },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockSourceSystem);
  });

  test('list solutions', async () => {
    nock(mockBaseUrl)
      .get(/\/extractors\/solutions\/?$/)
      .once()
      .reply(200, mockSolutionItemsResponse);

    const response = await client.extractors.solutions.list();
    expect(response.items).toHaveLength(1);
    expect(response.items[0]).toEqual(mockSolution);
  });

  test('retrieve solutions', async () => {
    nock(mockBaseUrl)
      .post(/\/extractors\/solutions\/byids$/, {
        items: [{ externalId: 'cognite-pi-pi' }],
      })
      .once()
      .reply(200, mockSolutionItemsResponse);

    const result = await client.extractors.solutions.retrieve([
      { externalId: 'cognite-pi-pi' },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockSolution);
  });

  test('getSchema encodes path segments', async () => {
    nock(mockBaseUrl)
      .get(/\/extractors\/schemas\/cognite-pi\/1\.2\.3$/)
      .once()
      .reply(200, mockSchema);

    const schema = await client.extractors.getSchema('cognite-pi', '1.2.3');
    expect(schema).toEqual(mockSchema);
  });
});
