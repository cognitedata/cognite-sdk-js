// Copyright 2020 Cognite AS

// @ts-ignore
import { headersWithDefaultField } from '../../httpClient/basicHttpClient';
import { HttpHeaders } from '../../httpClient/httpHeaders';

function lengthOfHttpHeaders(headers?: HttpHeaders): number {
  let counter = 0;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const _ in headers) {
    counter += 1;
  }
  return counter;
}

describe('basicHttpClient', () => {
  describe('headersWithDefaultField', () => {
    test('add missing', () => {
      const emptyHeaders: HttpHeaders = {};
      const alteredEmptyHeaders = headersWithDefaultField(
        emptyHeaders,
        'Accept',
        'application/json'
      );
      expect(lengthOfHttpHeaders(alteredEmptyHeaders)).toEqual(1);
      expect('Accept' in alteredEmptyHeaders).toBeTruthy();
    });
    test('not overwrite existing', () => {
      const mediaType = 'image/png';
      const emptyHeaders: HttpHeaders = {
        Accept: mediaType,
      };
      const alteredEmptyHeaders = headersWithDefaultField(
        emptyHeaders,
        'Accept',
        'application/json'
      );
      expect(lengthOfHttpHeaders(alteredEmptyHeaders)).toEqual(1);
      expect('Accept' in alteredEmptyHeaders).toBeTruthy();
      expect(alteredEmptyHeaders['Accept']).toEqual(mediaType);
    });
    test('to be case insensitive', () => {
      const mediaType = 'image/png';
      const emptyHeaders: HttpHeaders = {
        accept: mediaType,
      };
      const alteredEmptyHeaders = headersWithDefaultField(
        emptyHeaders,
        'Accept',
        'application/json'
      );
      expect(lengthOfHttpHeaders(alteredEmptyHeaders)).toEqual(1);
      expect('accept' in alteredEmptyHeaders).toBeTruthy();
      expect(alteredEmptyHeaders['accept']).toEqual(mediaType);
    });
  });
});
