// Copyright 2022 Cognite AS

import nock from 'nock';
import { promises as fs } from 'fs';

import CogniteClientAlpha from '../../cogniteClient';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('Documents unit test', () => {
  const testFolder = __dirname;
  let client: CogniteClientAlpha;
  let elements: string;

  beforeAll(async () => {
    elements = (
      await fs.readFile(testFolder + '/testdata/elements.json')
    ).toString();
  });

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('get raw elements', async () => {
    nock(mockBaseUrl)
      .get(new RegExp('/documents/123/elements'))
      .once()
      .reply(200, elements);

    const response = await client.documentsAlpha.elements(123);
    expect(response.elements.map((e) => e.type)).toEqual([
      'title',
      'paragraph',
      'paragraph',
      'table',
    ]);
  });

  test('get elements', async () => {
    nock(mockBaseUrl)
      .get(new RegExp('/documents/123/elements'))
      .once()
      .reply(200, elements);

    const response = await client.documentsAlpha.elements(123);
    const elementTexts = Array.from(response.getElements()).map((e) => e.text);
    expect(elementTexts.length).toEqual(4);
    expect(elementTexts[0]).toEqual('Simple title');
    expect(elementTexts[1]).toContain('Paragraph number 1');
    expect(elementTexts[2]).toEqual('Paragraph number 2');
    expect(elementTexts[3]).toContain('Change');
  });

  test('get words', async () => {
    nock(mockBaseUrl)
      .get(new RegExp('/documents/123/elements'))
      .once()
      .reply(200, elements);

    const response = await client.documentsAlpha.elements(123);
    expect(Array.from(response.getWords(1, 1)).map((w) => w.text)).toEqual([
      'Simple',
      'title',
      'Paragraph',
      'number',
      '1',
      'The',
      'first',
      'paragraph',
      'has',
      '2',
      'lines',
      'Paragraph',
      'number',
      '2',
    ]);
  });

  test('get lines', async () => {
    nock(mockBaseUrl)
      .get(new RegExp('/documents/123/elements'))
      .once()
      .reply(200, elements);

    const response = await client.documentsAlpha.elements(123);
    expect(Array.from(response.getLines(1, 1)).map((l) => l.text)).toEqual([
      'Simple title',
      'Paragraph number 1',
      'The first paragraph has 2 lines',
      'Paragraph number 2',
    ]);
  });
});
