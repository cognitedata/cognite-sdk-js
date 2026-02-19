// Copyright 2026 Cognite AS

import { beforeEach, describe, expect, test, vi } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import { setupMockableClient } from '../testUtils';

describe('Vision API unit test', () => {
  let client: CogniteClient;

  beforeEach(() => {
    client = setupMockableClient();
  });

  test('call anything prints warning', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    try {
      client.vision.extract;
      client.vision.getExtractJob;

      expect(warnSpy).toHaveBeenCalledTimes(2);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('The Vision API is deprecated')
      );
    } finally {
      warnSpy.mockRestore();
    }
  });
});
