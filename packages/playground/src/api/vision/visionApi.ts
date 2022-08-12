// Copyright 2022 Cognite AS

import { BaseResourceAPI, sleepPromise } from '@cognite/sdk-core';
import { ContextJobId } from '@cognite/sdk';
import {
  ExtractGetResponse,
  ExtractPostResponse,
  Feature,
  FileIdEither,
  JobStatus,
} from './types';

const JOB_COMPLETE_STATES: JobStatus[] = ['Completed', 'Failed'];

export class VisionAPI extends BaseResourceAPI<ExtractGetResponse> {
  /**
   * [Extract features from image](https://docs.cognite.com/api/playground/#tag/Vision/operation/postVisionExtract)
   *
   * ```js
   * const response = await client.vision.extract(["TextDetection"], [{id: 1234}]);
   * ```
   */
  public extract = async (
    features: Feature[],
    ids: FileIdEither[]
  ): Promise<ExtractPostResponse> => {
    const path = this.url('extract');
    const response = await this.post<ExtractPostResponse>(path, {
      data: { features: features, items: ids },
    });
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [Retrieve extract job](https://docs.cognite.com/api/playground/#tag/Vision/operation/getVisionExtract)
   *
   * ```js
   * const job = await client.vision.getExtractJob(12345678);
   * ```
   */
  public getExtractJob = async (
    jobId: ContextJobId,
    waitForCompletion: boolean = true,
    pollingTimeMs: number = 1000,
    maxRetries: number = 600
  ): Promise<ExtractGetResponse> => {
    const path = this.url(`extract/${jobId}`);
    const getJobResult = async () => {
      const response = await this.get<ExtractGetResponse>(path);
      return this.addToMapAndReturn(response.data, response);
    };
    const isJobCompleted = (result: ExtractGetResponse) => {
      return JOB_COMPLETE_STATES.includes(result.status);
    };
    return waitForCompletion
      ? this.waitForJobToCompleteAndReturn(
          getJobResult,
          isJobCompleted,
          pollingTimeMs,
          maxRetries
        )
      : getJobResult();
  };

  private async waitForJobToCompleteAndReturn<T>(
    getJobResult: () => Promise<T>,
    isJobCompleted: (result: T) => boolean,
    pollingTimeMs: number,
    maxRetries: number
  ) {
    let retryCount = 0;
    do {
      // Get newest job result
      const result = await getJobResult();
      // Job is in a complete state. We can now exit this loop.
      if (isJobCompleted(result)) return result;
      // Wait a bit before retrying..
      await sleepPromise(pollingTimeMs);
      retryCount++;
    } while (retryCount < maxRetries);
    throw new Error(`Timed out while waiting for vision job to complete.`);
  }
}
