// Copyright 2019 Cognite AS

import { ExternalFilesMetadata } from '../types/types';
import { randomInt } from './testUtils';

export const getFileCreateArgs = (
  additionalFields: Partial<ExternalFilesMetadata> = {}
) => {
  const postfix = randomInt();
  const fileContent = 'content_' + new Date();
  const sourceCreatedTime = new Date();
  const localFileMeta: ExternalFilesMetadata = {
    name: 'filename_0_' + postfix,
    mimeType: 'text/plain;charset=UTF-8',
    metadata: {
      key: 'value',
    },
    sourceCreatedTime,
    ...additionalFields,
  };

  return { postfix, fileContent, sourceCreatedTime, localFileMeta };
};
