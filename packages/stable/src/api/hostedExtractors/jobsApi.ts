// Copyright 2026 Cognite AS

import type {
  CursorAndAsyncIterator,
  CursorResponse,
  ExternalId,
} from '@cognite/sdk-core';
import type { IgnoreUnknownIds } from '../../types';
import { HostedExtractorResourceAPI } from './hostedExtractorResourceApi';
import type {
  HostedExtractorJob,
  HostedExtractorJobChange,
  HostedExtractorJobCreate,
  HostedExtractorJobDlqMessage,
  HostedExtractorJobDlqMessagesListQuery,
  HostedExtractorJobListQuery,
  HostedExtractorJobLog,
  HostedExtractorJobLogsListQuery,
  HostedExtractorJobMetric,
  HostedExtractorJobMetricsListQuery,
} from './jobsTypes';

export class HostedExtractorJobsAPI extends HostedExtractorResourceAPI<HostedExtractorJob> {
  /**
   * [Create jobs](https://api-docs.cognite.com/20230101/tag/Jobs/operation/create_jobs)
   *
   * ```js
   * const jobs = await client.hostedExtractors.jobs.create([
   *   {
   *     externalId: 'my-mqtt-job',
   *     sourceId: 'my-mqtt-broker',
   *     destinationId: 'my-destination',
   *     format: { type: 'value' },
   *     config: { topicFilter: 'sensors/#' },
   *   },
   * ]);
   * ```
   */
  public create = (
    items: HostedExtractorJobCreate[]
  ): Promise<HostedExtractorJob[]> => {
    return this.createInChunks(items);
  };

  /**
   * [List jobs](https://api-docs.cognite.com/20230101/tag/Jobs/operation/list_jobs)
   *
   * ```js
   * const jobs = await client.hostedExtractors.jobs
   *   .list({ source: 'my-mqtt-broker' })
   *   .autoPagingToArray({ limit: Infinity });
   * ```
   */
  public list = (
    query?: HostedExtractorJobListQuery
  ): CursorAndAsyncIterator<HostedExtractorJob> => {
    return this.listEndpoint(this.callListEndpointWithGet, query);
  };

  /**
   * [Retrieve jobs](https://api-docs.cognite.com/20230101/tag/Jobs/operation/retrieve_jobs)
   *
   * ```js
   * const jobs = await client.hostedExtractors.jobs.retrieve([
   *   { externalId: 'my-mqtt-job' },
   * ]);
   * ```
   */
  public retrieve = (
    ids: ExternalId[],
    params: IgnoreUnknownIds = {}
  ): Promise<HostedExtractorJob[]> => {
    return this.retrieveInChunks(ids, params);
  };

  /**
   * [Update jobs](https://api-docs.cognite.com/20230101/tag/Jobs/operation/update_jobs)
   *
   * ```js
   * const jobs = await client.hostedExtractors.jobs.update([
   *   {
   *     externalId: 'my-mqtt-job',
   *     update: { targetStatus: { set: 'paused' }, name: { setNull: true } },
   *   },
   * ]);
   * ```
   */
  public update = (
    changes: HostedExtractorJobChange[]
  ): Promise<HostedExtractorJob[]> => {
    return this.updateInChunks(changes);
  };

  /**
   * [Delete jobs](https://api-docs.cognite.com/20230101/tag/Jobs/operation/delete_jobs)
   *
   * ```js
   * await client.hostedExtractors.jobs.delete(
   *   [{ externalId: 'my-mqtt-job' }],
   *   { ignoreUnknownIds: true }
   * );
   * ```
   */
  public delete = (
    ids: ExternalId[],
    params: IgnoreUnknownIds = {}
  ): Promise<object> => {
    return this.deleteInChunks(ids, params);
  };

  /**
   * [Get job logs](https://api-docs.cognite.com/20230101/tag/Jobs/operation/get_job_logs)
   *
   * Logs are returned newest first.
   *
   * ```js
   * const logs = await client.hostedExtractors.jobs
   *   .listLogs({ job: 'my-mqtt-job' })
   *   .autoPagingToArray({ limit: 100 });
   * ```
   */
  public listLogs = (
    query?: HostedExtractorJobLogsListQuery
  ): CursorAndAsyncIterator<HostedExtractorJobLog> => {
    const path = this.url('logs');
    return this.cursorBasedEndpoint(
      (params) =>
        this.get<CursorResponse<HostedExtractorJobLog[]>>(path, { params }),
      query
    );
  };

  /**
   * [Get job metrics](https://api-docs.cognite.com/20230101/tag/Jobs/operation/get_job_metrics)
   *
   * ```js
   * const metrics = await client.hostedExtractors.jobs
   *   .listMetrics({ job: 'my-mqtt-job' })
   *   .autoPagingToArray({ limit: 100 });
   * ```
   */
  public listMetrics = (
    query?: HostedExtractorJobMetricsListQuery
  ): CursorAndAsyncIterator<HostedExtractorJobMetric> => {
    const path = this.url('metrics');
    return this.cursorBasedEndpoint(
      (params) =>
        this.get<CursorResponse<HostedExtractorJobMetric[]>>(path, { params }),
      query
    );
  };

  /**
   * [Get job DLQ messages](https://api-docs.cognite.com/20230101/tag/Jobs/operation/get_job_dlq_messages)
   *
   * Lists the messages the job failed to transform. The job must have
   * `dlqEnabled`, and the caller needs read access to CDF RAW.
   *
   * ```js
   * const messages = await client.hostedExtractors.jobs
   *   .listDlqMessages({ job: 'my-mqtt-job' })
   *   .autoPagingToArray({ limit: 100 });
   * ```
   */
  public listDlqMessages = (
    query: HostedExtractorJobDlqMessagesListQuery
  ): CursorAndAsyncIterator<HostedExtractorJobDlqMessage> => {
    const path = this.url('dlq');
    return this.cursorBasedEndpoint(
      (params) =>
        this.get<CursorResponse<HostedExtractorJobDlqMessage[]>>(path, {
          params,
        }),
      query
    );
  };
}
